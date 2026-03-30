import { Router } from 'express';
import { queryWords } from '../../services/dictionary.service';
import { ok } from '../../utils/response';

export const dictionaryRouter = Router();

dictionaryRouter.get('/', (req, res) => {
  const { level, pos, sentiment, theme, q, page, pageSize } = req.query;

  const result = queryWords({
    level: level as string | undefined,
    pos: pos as string | undefined,
    sentiment: sentiment as string | undefined,
    theme: theme as string | undefined,
    q: q as string | undefined,
    page: page ? Number(page) : undefined,
    pageSize: pageSize ? Number(pageSize) : undefined
  });

  return ok(res, result);
});
