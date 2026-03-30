import { Router, Request } from 'express';
import { AuthPayload, requireAuth } from '../../utils/auth';
import { getProgress, saveProgress } from '../../services/progress.service';
import { ok } from '../../utils/response';

export const progressRouter = Router();

type AuthedRequest = Request & { user?: AuthPayload };

progressRouter.get('/progress', requireAuth, (req, res) => {
  const userId = (req as AuthedRequest).user?.openid || '';
  const progress = getProgress(userId);
  return ok(res, progress);
});

progressRouter.post('/progress', requireAuth, (req, res) => {
  const userId = (req as AuthedRequest).user?.openid || '';
  const { starred, favourites, notes } = req.body || {};

  const updated = saveProgress(userId, {
    starred,
    favourites,
    notes
  });

  return ok(res, updated);
});
