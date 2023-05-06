import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TimeoutMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const timeoutMs = 3000; // Set the timeout in milliseconds
    req.setTimeout(timeoutMs, () => {
      const error = new Error('Request Timeout');
      error.name = 'TimeoutError';
      next(error);
    });
    next();
  }
}
