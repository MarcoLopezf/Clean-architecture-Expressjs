import express, { Application, Request, Response, NextFunction } from 'express';

interface ServerConfig {
  readonly port: number;
  readonly router: express.Router;
}

export const createServer = ({ port, router }: ServerConfig) => {
  const app: Application = express();

  app.use(express.json());
  app.use('/api', router);

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof Error) {
      res.status(400).json({ error: err.message });
      return;
    }

    res.status(500).json({ error: 'Unexpected error' });
  });

  return {
    app,
    start: () =>
      app.listen(port, () => {
        console.log(`HTTP server listening on port ${port}`);
      })
  };
};
