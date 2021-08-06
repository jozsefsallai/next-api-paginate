# next-api-paginate

A middleware-like HOC for dealing with pagination in Next.js API routes. This
project was inspired by [express-paginate][express-paginate].

## Getting Started

**1. Install the module:**

```sh
npm i next-api-paginate
# or
yarn add next-api-paginate
```

**2. Wrap your API route in the `withPagination` function:**

```js
import { withPagination } from 'next-api-paginate';

export default withPagination()((req, res) => {
  return res.send(`Page: ${req.query.page}, limit: ${req.query.limit}`);
});
```

You can also pass several options to the `withPagination` function:

```js
import { withPagination } from 'next-api-paginate';

export default withPagination({
  // the name of the query parameter used for indicating the current page
  // (defaults to "page")
  pageQueryParam: 'p',

  // the name of the query parameter used for indicating the entry limit
  // (defaults to "limit")
  limitQueryParam: 'l',

  // the default limit (when a `limit` is not provided)
  // (defaults to 10)
  defaultLimit: 15,

  // the maximum limit accepted by the API; if someone passes a limit greater
  // than this value then the limit will be this value
  // (defaults to 50)
  maxLimit: 50
})((req, res) => {
  // ... your logic
});
```

## For TypeScript Users

The type of query parameters in Next.js is always string or an array of strings,
however, `next-api-paginate` will store the page and limit as numbers. As of
now, there is no way to properly type-cast a query parameter as a number, so you
have two options:

**1. Use `as any` and explicitly declare the variable as a number**

This might sound hacky on surface (because it is), but it is also the only way
to access the values directly:

```ts
const page: number = req.query.page as any;
const limit: number = req.query.limit as any;
```

You can also use `as unknown as number` instead of `as any`, but I think that's
uglier.

**2. Use a utility function**

You may opt in to use a wrapper/utility function that does the exact thing from
the first option, except it's under the hood, so your code looks somewhat
cleaner. The utility function is described in the following section.

## Utility Functions

You can use some of the utility functions for making it easier to implement some
pagination-related logic.

### `getPagination`

Will return the current page and limit from the request. These values are
numbers, or undefined if the query parameters don't exist.

```js
import { getPagination } from 'next-api-paginate';

const route = ((req, res) => {
  // get pagination information when the query params are `page` and `limit`
  const { page, limit } = getPagination(req);

  // get pagination information when the page query param is `p` but `limit` is
  // default
  const { page, limit } = getPagination(req, 'p');

  // get pagination information when the page query param is `p` and limit is
  // `l`
  const { page, limit } = getPagination(req, 'p', 'l');
});
```

### `hasPreviousPages`

Will return true if there are pages before the current request's page number.
It has the exact same function signature as `getPagination` except it returns a
boolean.

```js
import { hasPreviousPages } from 'next-api-paginate';

const route = ((req, res) => {
  if (hasPreviousPages(req)) {
    return res.send('There are more pages before this!');
  } else {
    return res.send('This is the first page.');
  }
});
```

### `hasNextPages`

Returns a callback that allows you to pass the total page count and check
whether there are any other pages after the current request's page count. The
callback takes a number as a parameter and returns a boolean. The higher order
function's parameters are the same as in `getPagination` and `hasPreviousPages`.

```js
import { hasNextPages } from 'next-api-paginate';

const route = ((req, res) => {
  const totalPageCount = 40;

  if (hasNextPages(req)(totalPageCount)) {
    return res.send('There are more pages after this!');
  } else {
    return res.send('You have reached the end.');
  }
});
```

## Practical Example -- Sequelize

```js
import {
  withPagination,
  getPagination,
  hasPreviousPage,
  hasNextPage
} from 'next-api-paginate';
import { Post } from '~/db/models/Post';

export default withPagination({
  defaultLimit: 15,
  maxLimit: 40
})(async (req, res) => {
  const { page, limit } = getPagination(req);
  const offset = page * limit - limit;

  try {
    const { rows, count } = await Post.findAndCountAll({
      limit,
      offset
    });

    const pageCount = Math.ceil(count / limit);

    return res.json({
      ok: true,
      posts: rows,
      pagination: {
        page,
        limit,
        pageCount,
        itemCount: count,
        hasPrevious: hasPreviousPage(req),
        hasNext: hasNextPage(req)(count)
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      ok: false
    });
  }
});
```

## License

MIT.

[express-paginate]: https://github.com/expressjs/express-paginate
