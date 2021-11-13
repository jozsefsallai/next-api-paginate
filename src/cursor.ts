import {
  NextApiPaginateCursorData,
  NextApiPaginateCursorOptions,
  NextApiPaginateData,
  NextApiPaginateOptions,
  NextMiddlewareCallback,
} from './typings';
import { NextApiRequest } from 'next';
import { firstOf } from './utils';

const withPagination = (
  _opts?: NextApiPaginateOptions<NextApiPaginateCursorOptions>,
): NextMiddlewareCallback => {
  const opts: NextApiPaginateOptions = {
    cursorQueryParam: _opts?.cursorQueryParam || 'cursor',
    limitQueryParam: _opts?.limitQueryParam || 'limit',
    defaultLimit: _opts?.defaultLimit || 10,
    maxLimit: _opts?.maxLimit || 50,
  };

  return (callback) => {
    return async (req, res) => {
      const cursor = firstOf(req.query[opts.cursorQueryParam]) || null;

      let limit =
        (req.query[opts.limitQueryParam] &&
          parseInt(firstOf(req.query[opts.limitQueryParam]))) ||
        opts.defaultLimit;

      if (limit < 1) {
        limit = 1;
      }

      if (limit > opts.maxLimit) {
        limit = opts.maxLimit;
      }

      req.query[opts.cursorQueryParam] = cursor;
      req.query[opts.limitQueryParam] = limit as any;

      return callback(req, res);
    };
  };
};

const getPagination = (
  req: NextApiRequest,
  cursorQueryParam: string = 'cursor',
  limitQueryParam: string = 'limit',
): NextApiPaginateData<NextApiPaginateCursorData> => {
  const cursor: string | null = req.query[cursorQueryParam] as string | null;
  const limit: number =
    req.query[limitQueryParam] && (req.query[limitQueryParam] as any);

  return {
    cursor,
    limit,
  };
};

export { withPagination, getPagination };
