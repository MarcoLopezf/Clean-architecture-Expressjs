import { randomUUID } from 'crypto';
import pinoHttp from 'pino-http';
import type { IncomingMessage, ServerResponse } from 'http';

import { pinoInstance } from '../../../logging/pino-logger';

type InstrumentedRequest = IncomingMessage & { id?: string };
type InstrumentedResponse = ServerResponse & { statusCode: number };

export const requestLogger = () =>
  pinoHttp({
    logger: pinoInstance,
    serializers: {
      req(req: IncomingMessage) {
        const instrumentedReq = req as InstrumentedRequest;
        return {
          method: instrumentedReq.method,
          url: instrumentedReq.url,
          id: instrumentedReq.id
        };
      },
      res(res: ServerResponse) {
        const instrumentedRes = res as InstrumentedResponse;
        return {
          statusCode: instrumentedRes.statusCode
        };
      }
    },
    customLogLevel: (
      _req: IncomingMessage,
      res: ServerResponse,
      err?: Error
    ) => {
      const statusCode = (res as InstrumentedResponse).statusCode;
      if (err || statusCode >= 500) return 'error';
      if (statusCode >= 400) return 'warn';
      return 'info';
    },
    genReqId: (req: IncomingMessage) => {
      const instrumentedReq = req as InstrumentedRequest;
      const headerId = instrumentedReq.headers['x-request-id'];
      const headerValue = Array.isArray(headerId) ? headerId[0] : headerId;
      const existingId = instrumentedReq.id;

      if (existingId) {
        return existingId;
      }

      if (headerValue) {
        const parsedHeader = headerValue.toString();
        instrumentedReq.id = parsedHeader;
        return parsedHeader;
      }

      const generated = randomUUID();
      instrumentedReq.id = generated;
      return generated;
    },
    customSuccessMessage: (req: IncomingMessage, res: ServerResponse) => {
      const instrumentedReq = req as InstrumentedRequest;
      const instrumentedRes = res as InstrumentedResponse;
      return `${instrumentedReq.method ?? 'UNKNOWN'} ${
        instrumentedReq.url ?? ''
      } -> ${instrumentedRes.statusCode}`;
    }
  });
