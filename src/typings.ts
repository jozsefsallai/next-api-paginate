import { NextApiHandler } from 'next';

export interface NextApiPaginateBasicOptions {
  pageQueryParam?: string;
}

export interface NextApiPaginateBasicData {
  page?: number;
}

export interface NextApiPaginateCursorOptions {
  cursorQueryParam?: string;
}

export interface NextApiPaginateCursorData {
  cursor?: string | null;
}

export type NextApiPaginateOptions<
  T = NextApiPaginateBasicOptions | NextApiPaginateCursorOptions,
> = T & {
  limitQueryParam?: string;
  defaultLimit?: number;
  maxLimit?: number;
};

export type NextApiPaginateData<
  T = NextApiPaginateBasicData | NextApiPaginateCursorData,
> = T & {
  limit?: number;
};

export type NextMiddlewareCallback = (
  callback: NextApiHandler,
) => NextApiHandler;
