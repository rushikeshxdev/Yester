import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  code?: string;
  errors?: unknown[];
  timestamp: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let title = 'Internal Server Error';
    let detail = 'An unexpected error occurred. Please try again later.';
    let code = 'INTERNAL_ERROR';
    let errors: unknown[] | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        detail = exceptionResponse;
        title = exception.name;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, unknown>;
        title = (resp.error as string) || exception.name;
        
        if (Array.isArray(resp.message)) {
          detail = 'One or more validation constraints failed.';
          errors = resp.message;
          code = 'VALIDATION_FAILED';
        } else if (typeof resp.message === 'string') {
          detail = resp.message;
        }

        if (resp.code && typeof resp.code === 'string') {
          code = resp.code;
        }
      }
    } else if (exception instanceof Error) {
      this.logger.error(`Unhandled error on ${request.method} ${request.url}: ${exception.message}`, exception.stack);
      // In non-production, provide the error message for easier debugging
      if (process.env.NODE_ENV !== 'production') {
        detail = exception.message;
      }
    }

    const problem: ProblemDetails = {
      type: `https://yester.app/errors/${code.toLowerCase().replace(/_/g, '-')}`,
      title,
      status,
      detail,
      instance: request.url,
      code,
      ...(errors ? { errors } : {}),
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(problem);
  }
}
