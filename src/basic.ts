import {
  NextApiPaginateBasicData,
  NextApiPaginateBasicOptions,
  NextApiPaginateData,
  NextApiPaginateOptions,
  NextMiddlewareCallback,
} from './typings';
import { NextApiRequest } from 'next';
import { firstOf } from './utils';

type HasNextPagesCallback = (totalPages: number) => boolean;

const withPagination = (
  _opts?: NextApiPaginateOptions<NextApiPaginateBasicOptions>,
): NextMiddlewareCallback => {
  const opts: NextApiPaginateOptions = {
    pageQueryParam: _opts?.pageQueryParam || 'page',
    limitQueryParam: _opts?.limitQueryParam || 'limit',
    defaultLimit: _opts?.defaultLimit || 10,
    maxLimit: _opts?.maxLimit || 50,
  };

  return (callback) => {
    return async (req, res) => {
      let page =
        (req.query[opts.pageQueryParam] &&
          parseInt(firstOf(req.query[opts.pageQueryParam]))) ||
        1;
      let limit =
        (req.query[opts.limitQueryParam] &&
          parseInt(firstOf(req.query[opts.limitQueryParam]))) ||
        opts.defaultLimit;

      if (page < 1) {
        page = 1;
      }

      if (limit < 1) {
        limit = 1;
      }

      if (limit > opts.maxLimit) {
        limit = opts.maxLimit;
      }

      req.query[opts.pageQueryParam] = page as any;
      req.query[opts.limitQueryParam] = limit as any;

      return callback(req, res);
    };
  };
};

const getPagination = (
  req: NextApiRequest,
  pageQueryParam: string = 'page',
  limitQueryParam: string = 'limit',
): NextApiPaginateData<NextApiPaginateBasicData> => {
  const page: number =
    req.query[pageQueryParam] && (req.query[pageQueryParam] as any);
  const limit: number =
    req.query[limitQueryParam] && (req.query[limitQueryParam] as any);

  return {
    page,
    limit,
  };
};

const hasPreviousPages = (
  req: NextApiRequest,
  pageQueryParam: string = 'page',
  limitQueryParam: string = 'limit',
): boolean => {
  const { page } = getPagination(req, pageQueryParam, limitQueryParam);
  return page && page > 1;
};

const hasNextPages = (
  req: NextApiRequest,
  pageQueryParam: string = 'page',
  limitQueryParam: string = 'limit',
): HasNextPagesCallback => {
  const { page } = getPagination(req, pageQueryParam, limitQueryParam);
  return (totalPages: number) => totalPages && page < totalPages;
};

export { withPagination, getPagination, hasPreviousPages, hasNextPages };
