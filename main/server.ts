import { buildRouter } from '../src/infrastructure/adapters/http/routes';
import { createServer } from '../src/infrastructure/adapters/http/server';
import { useCases } from './composition';

const port = Number(process.env.PORT ?? 3000);

const router = buildRouter(useCases);

const server = createServer({ port, router });

server.start();
