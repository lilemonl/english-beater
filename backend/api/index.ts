import express from 'express';
import cors from 'cors';
import { env } from '../config/env';
import { authRouter } from './routes/auth';
import { dictionaryRouter } from './routes/dictionary';
import { questionsRouter } from './routes/questions';
import { progressRouter } from './routes/progress';
import { errorHandler, notFound } from '../utils/response';

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/dictionary', dictionaryRouter);
app.use('/api/game', questionsRouter);
app.use('/api/user', progressRouter);

app.use(notFound);
app.use(errorHandler);

if (env.nodeEnv !== 'serverless') {
  app.listen(env.port, () => {
    console.log(`[backend] listening on http://localhost:${env.port}`);
  });
}

export default app;
