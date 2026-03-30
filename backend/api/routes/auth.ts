import { Router } from 'express';
import { loginWithCode } from '../../services/auth.service';
import { fail, ok } from '../../utils/response';

export const authRouter = Router();

authRouter.post('/login', async (req, res) => {
  const { code } = req.body as { code?: string };

  if (!code) {
    return fail(res, 400, 'code is required');
  }

  try {
    const result = await loginWithCode(code);
    return ok(res, result);
  } catch (err) {
    return fail(res, 500, (err as Error).message);
  }
});
