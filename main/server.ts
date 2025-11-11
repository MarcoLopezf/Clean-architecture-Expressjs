import { buildRouter } from '../src/infrastructure/adapters/http/routes';
import { createServer } from '../src/infrastructure/adapters/http/server';
import { createComposition } from './composition';
import { logger as rootLogger } from '../src/infrastructure/logging/pino-logger';

const port = Number(process.env.PORT ?? 3000);

const bootstrap = async (): Promise<void> => {
  try {
    const { useCases, infrastructure } = await createComposition();
    const baseLogger = infrastructure.logger ?? rootLogger;
    const router = buildRouter(useCases, baseLogger.child({ layer: 'http' }));
    const server = createServer({
      port,
      router,
      logger: baseLogger.child({ layer: 'server' })
    });
    server.start();
  } catch (error) {
    rootLogger.error('Server bootstrap failed', { error });
    process.exit(1);
  }
};

void bootstrap();
