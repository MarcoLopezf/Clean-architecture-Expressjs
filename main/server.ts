import { buildRouter } from '../src/infrastructure/adapters/http/routes';
import { createServer } from '../src/infrastructure/adapters/http/server';
import { createComposition } from './composition';

const port = Number(process.env.PORT ?? 3000);

const bootstrap = async (): Promise<void> => {
  const { useCases } = await createComposition();
  const router = buildRouter(useCases);
  const server = createServer({ port, router });
  server.start();
};

void bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Server bootstrap failed', error);
  process.exit(1);
});
