import express, { Application, Request, Response, NextFunction } from 'express';
import { requestLogger } from './middlewares/requestLogger';
import { type LoggerPort } from '../../../application/ports/logger.port';

interface ServerConfig {
  readonly port: number;
  readonly router: express.Router;
  readonly logger: LoggerPort;
}

export const createServer = ({ port, router, logger }: ServerConfig) => {
  const app: Application = express();

  app.use(requestLogger());
  app.use(express.json());
  app.use('/api', router);

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof Error) {
      logger.error('Handled application error', { error: err });
      res.status(400).json({ error: err.message });
      return;
    }

    logger.error('Unhandled non-error rejection', { error: err });
    res.status(500).json({ error: 'Unexpected error' });
  });

  return {
    app,
    start: () =>
      app.listen(port, () => {
        logger.info(`HTTP server listening on port ${port}`);
      })
  };
};
