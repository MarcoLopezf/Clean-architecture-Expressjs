import pinoHttp from 'pino-http';
import type { IncomingMessage, ServerResponse } from 'http';

import { pinoInstance } from '../../../logging/pino-logger';

type InstrumentedRequest = IncomingMessage & { id?: string };
type InstrumentedResponse = ServerResponse & { statusCode: number };

export const requestLogger = () =>
  pinoHttp({
    logger: pinoInstance,
    serializers: {
      req(req) {
        const instrumentedReq = req as InstrumentedRequest;
        return {
          method: instrumentedReq.method,
          url: instrumentedReq.url,
          id: instrumentedReq.id
        };
      },
      res(res) {
        const instrumentedRes = res as InstrumentedResponse;
        return {
          statusCode: instrumentedRes.statusCode
        };
      }
    },
    customLogLevel: (_req, res, err) => {
      const statusCode = (res as InstrumentedResponse).statusCode;
      if (err || statusCode >= 500) return 'error';
      if (statusCode >= 400) return 'warn';
      return 'info';
    },
    genReqId: (req) => {
      const instrumentedReq = req as InstrumentedRequest;
      const headerId = req.headers['x-request-id'];
      const headerValue = Array.isArray(headerId) ? headerId[0] : headerId;
      return instrumentedReq.id ?? headerValue?.toString();
    },
    customSuccessMessage: (req, res) => {
      const instrumentedRes = res as InstrumentedResponse;
      return `${req.method ?? 'UNKNOWN'} ${req.url ?? ''} -> ${instrumentedRes.statusCode}`;
    }
  });
