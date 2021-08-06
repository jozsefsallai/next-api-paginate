export interface NextApiPaginateOptions {
  pageQueryParam?: string;
  limitQueryParam?: string;
  defaultLimit?: number;
  maxLimit?: number;
};

export interface NextApiPaginateData {
  page?: number;
  limit?: number;
};
