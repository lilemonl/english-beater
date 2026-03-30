import { NextFunction, Request, Response } from 'express';

export const ok = (res: Response, data: unknown, message = 'ok') => {
  return res.json({ message, data });
};

export const fail = (res: Response, status: number, message: string) => {
  return res.status(status).json({ message });
};

export const notFound = (req: Request, res: Response) => {
  return fail(res, 404, 'Not Found');
};

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  const message = err?.message || 'Internal Server Error';
  console.error('[error]', err);
  return fail(res, 500, message);
};
