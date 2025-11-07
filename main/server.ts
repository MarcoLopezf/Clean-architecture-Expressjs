import { buildRouter } from '../src/infrastructure/adapters/http/routes';
import { createServer } from '../src/infrastructure/adapters/http/server';
import { useCases, logger } from './composition';

const port = Number(process.env.PORT ?? 3000);

const router = buildRouter(useCases, logger.child({ layer: 'http' }));

const server = createServer({ port, router, logger: logger.child({ layer: 'server' }) });

server.start();
