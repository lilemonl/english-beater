import { Router } from 'express';
import { generateQuestions } from '../../services/question.service';
import { ok } from '../../utils/response';

export const questionsRouter = Router();

questionsRouter.get('/questions', (req, res) => {
  const { level, round } = req.query;
  const questions = generateQuestions(level as string | undefined);

  return ok(res, {
    round: round ? Number(round) : 1,
    questions
  });
});
