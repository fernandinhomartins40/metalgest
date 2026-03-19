import 'dotenv/config';
import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { corsOptions } from '@/config/cors';
import { logger } from '@/utils/logger';
import { errorHandler, notFoundHandler } from '@/middlewares/error';
import { auditMiddleware } from '@/middlewares/audit';
import routes from '@/routes';

const app = express();

app.use(helmet());
app.use(cors(corsOptions));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);
app.use(
  express.json({
    limit: '10mb',
    verify: (req, _res, buffer) => {
      (req as express.Request).rawBody = buffer.toString('utf8');
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

app.use('/api/uploads', express.static(path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads')));
app.use('/api', auditMiddleware);
app.use('/api', routes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
