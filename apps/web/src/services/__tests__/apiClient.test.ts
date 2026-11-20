/**
 * In-Memory API Client & Refresh Queue Tests
 */

import {
  setAccessToken,
  getAccessToken,
  clearAccessToken,
  onAuthExpired,
  apiRequest,
  refreshAccessToken,
} from '../../api/client';

// Simple polyfill for localStorage in test runner
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (key: string) => store.get(key) || null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
    key: (index: number) => Array.from(store.keys())[index] || null,
    length: store.size,
  } as any;
}

async function runTests() {
  console.log('Running In-Memory API Client & Refresh Queue Tests...');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      passed++;
      console.log(`  ✓ ${message}`);
    } else {
      failed++;
      console.error(`  ✗ FAIL: ${message}`);
    }
  }

  // Save original fetch
  const originalFetch = globalThis.fetch;

  try {
    // ----------------------------------------------------
    // Test 1: In-Memory Token Isolation
    // ----------------------------------------------------
    setAccessToken('mock-access-token-123');
    assert(getAccessToken() === 'mock-access-token-123', 'Access token held in memory');
    assert(
      localStorage.getItem('token') === null &&
      localStorage.getItem('accessToken') === null,
      'Access token is NEVER stored in localStorage'
    );

    clearAccessToken();
    assert(getAccessToken() === null, 'clearAccessToken resets token to null');

    // ----------------------------------------------------
    // Test 2: Concurrent 401s share single refresh promise
    // ----------------------------------------------------
    let refreshCount = 0;
    let dataFetchCount = 0;

    globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (url.includes('/auth/refresh')) {
        refreshCount++;
        // Simulate network delay
        await new Promise((r) => setTimeout(r, 20));
        return {
          ok: true,
          status: 200,
          json: async () => ({ accessToken: 'new-minted-token-456' }),
        } as any;
      }

      if (url.includes('/test-resource')) {
        dataFetchCount++;
        const authHeader = (init?.headers as any)?.Authorization || (init?.headers as any)?.get?.('Authorization');
        if (!authHeader || !authHeader.includes('new-minted-token-456')) {
          // First attempt without new token fails with 401
          return {
            ok: false,
            status: 401,
            json: async () => ({ statusCode: 401, message: 'Unauthorized' }),
          } as any;
        }

        return {
          ok: true,
          status: 200,
          json: async () => ({ success: true }),
        } as any;
      }

      return {
        ok: true,
        status: 200,
        json: async () => ({}),
      } as any;
    };

    clearAccessToken();

    // Fire 3 concurrent requests that all get 401 initially
    const [res1, res2, res3] = await Promise.all([
      apiRequest<{ success: boolean }>('/test-resource'),
      apiRequest<{ success: boolean }>('/test-resource'),
      apiRequest<{ success: boolean }>('/test-resource'),
    ]);

    assert(res1.success && res2.success && res3.success, 'All 3 concurrent requests succeeded after refresh');
    assert(refreshCount === 1, `Exactly ONE refresh request was made (got ${refreshCount})`);
    assert(getAccessToken() === 'new-minted-token-456', 'New access token stored in memory');

    // ----------------------------------------------------
    // Test 3: Retry once limitation (no infinite loop on 401)
    // ----------------------------------------------------
    let loopAttempts = 0;
    globalThis.fetch = async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/auth/refresh')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ accessToken: 'perpetual-token' }),
        } as any;
      }

      loopAttempts++;
      return {
        ok: false,
        status: 401,
        json: async () => ({ statusCode: 401, message: 'Always unauthorized' }),
      } as any;
    };

    let caughtError: any = null;
    try {
      await apiRequest('/resource-always-401');
    } catch (e) {
      caughtError = e;
    }

    assert(caughtError !== null, 'Request threw error after retry failure');
    assert(loopAttempts === 2, `Request retried exactly once (total attempts = ${loopAttempts})`);

    // ----------------------------------------------------
    // Test 4: 403 Forbidden does NOT trigger refresh
    // ----------------------------------------------------
    let refreshTriggeredOn403 = false;
    globalThis.fetch = async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/auth/refresh')) {
        refreshTriggeredOn403 = true;
        return { ok: true, status: 200, json: async () => ({}) } as any;
      }
      return {
        ok: false,
        status: 403,
        json: async () => ({ statusCode: 403, message: 'Forbidden' }),
      } as any;
    };

    try {
      await apiRequest('/forbidden-resource');
    } catch (e: any) {
      assert(e.statusCode === 403, '403 Forbidden correctly thrown');
    }
    assert(!refreshTriggeredOn403, '403 Forbidden did NOT trigger refresh token call');

    // ----------------------------------------------------
    // Test 5: Session expiry notifications on refresh failure
    // ----------------------------------------------------
    let expiredListenerNotified = false;
    const unsub = onAuthExpired(() => {
      expiredListenerNotified = true;
    });

    globalThis.fetch = async () => {
      return {
        ok: false,
        status: 401,
        json: async () => ({ statusCode: 401, message: 'Session Revoked' }),
      } as any;
    };

    const refreshed = await refreshAccessToken();
    assert(refreshed === null, 'refreshAccessToken returns null on failure');
    assert(getAccessToken() === null, 'Access token cleared on refresh failure');

    // Trigger an unauthenticated call to fire the expiry notification
    try {
      await apiRequest('/some-endpoint');
    } catch {
      // expected
    }

    assert(expiredListenerNotified, 'onAuthExpired subscriber notified when session revoked');
    unsub();

    console.log(`\nClient Tests Finished: ${passed} passed, ${failed} failed.`);
    if (failed > 0) {
      process.exit(1);
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
}

runTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
