import React, { useState, useRef, useEffect } from 'react';
import { Shield, ShieldCheck, LogIn, LogOut, Settings, Download, CloudUpload } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLifeOS } from '../../context/LifeOSContext';
import { exportBackupJSON } from '../../services/storage';

interface UserNavPillProps {
  onOpenAuth: () => void;
  onOpenMigration?: () => void;
}

export const UserNavPill: React.FC<UserNavPillProps> = ({ onOpenAuth, onOpenMigration }) => {
  const { user, mode, isAuthenticated, logout } = useAuth();
  const { openSettings } = useLifeOS();
  const [isOpen, setIsOpen] = useState(false);
  const pillRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pillRef.current && !pillRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleExportBackup = () => {
    const jsonString = exportBackupJSON();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yester-chronicle-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsOpen(false);
  };

  const getInitials = () => {
    if (user?.displayName) {
      return user.displayName.slice(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'YC';
  };

  return (
    <div className="relative" ref={pillRef}>
      {isAuthenticated && user ? (
        // Authenticated Sovereign Mode Pill
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#161B22] border border-[#2B3242] hover:border-[#FF7138]/50 text-neutral-300 hover:text-white transition-all cursor-pointer group"
          title={`Sovereign Vault: ${user.email}`}
          aria-label="User account menu"
        >
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#FF7138] to-[#FF8555] flex items-center justify-center text-white font-mono font-bold text-[10px] select-none">
            {getInitials()}
          </div>
          <span className="text-xs font-sans max-w-[120px] truncate">
            {user.displayName || user.email.split('@')[0]}
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 group-hover:scale-110 transition-transform" />
        </button>
      ) : (
        // Personal Mode Pill (Guest)
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#161B22]/60 border border-[#232934] hover:border-neutral-500 text-neutral-400 hover:text-white transition-all cursor-pointer"
          title="Personal Local Mode — Click for options or to connect cloud vault"
          aria-label="Account status menu"
        >
          <Shield className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-xs font-sans">Local Vault</span>
        </button>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-64 rounded-2xl bg-[#0F1216] border border-[#232934] shadow-2xl p-3 space-y-3 z-50 animate-fade-in select-none">
          {/* Header */}
          <div className="px-2 py-1.5 border-b border-[#1A1F26]">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF7138] to-[#FF8555] flex items-center justify-center text-white font-mono font-bold text-xs">
                  {getInitials()}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-serif text-white font-medium truncate">
                    {user.displayName || 'Sovereign Chronicler'}
                  </h4>
                  <p className="text-[10px] font-mono text-neutral-400 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#181D26] flex items-center justify-center text-[#FF7138]">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-serif text-white font-medium">
                    Personal Mode
                  </h4>
                  <p className="text-[10px] font-mono text-neutral-400">
                    Stored locally in browser
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Items */}
          <div className="space-y-1">
            {!isAuthenticated ? (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenAuth();
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-sans text-white bg-[#FF7138]/20 hover:bg-[#FF7138]/30 border border-[#FF7138]/40 text-left transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-[#FF7138]" />
                <span className="font-medium text-[#FF7138]">Sign In / Connect Cloud Vault</span>
              </button>
            ) : (
              onOpenMigration && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onOpenMigration();
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-sans text-neutral-300 hover:text-white hover:bg-white/5 transition-colors text-left cursor-pointer"
                >
                  <CloudUpload className="w-3.5 h-3.5 text-[#FF7138]" />
                  <span>Migrate Local Data to Cloud</span>
                </button>
              )
            )}

            <button
              onClick={() => {
                setIsOpen(false);
                openSettings();
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-sans text-neutral-300 hover:text-white hover:bg-white/5 transition-colors text-left cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-neutral-400" />
              <span>Preferences & Settings</span>
            </button>

            <button
              onClick={handleExportBackup}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-sans text-neutral-300 hover:text-white hover:bg-white/5 transition-colors text-left cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-neutral-400" />
              <span>Export JSON Chronicle</span>
            </button>

            {isAuthenticated && (
              <button
                onClick={async () => {
                  setIsOpen(false);
                  await logout();
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-sans text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors text-left cursor-pointer pt-2 border-t border-[#1A1F26]"
              >
                <LogOut className="w-3.5 h-3.5 text-red-400" />
                <span>Sign Out of Vault</span>
              </button>
            )}
          </div>

          {/* Footer Badge */}
          <div className="pt-2 border-t border-[#1A1F26] px-2 flex items-center justify-between text-[10px] font-mono text-neutral-500">
            <span>{mode === 'sovereign' ? 'Sovereign Cloud' : 'Local Archive'}</span>
            <span className={mode === 'sovereign' ? 'text-emerald-400 flex items-center gap-1' : 'text-neutral-400'}>
              {mode === 'sovereign' ? (
                <>
                  <ShieldCheck className="w-3 h-3 inline" />
                  <span>Encrypted</span>
                </>
              ) : (
                'Offline Ready'
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
