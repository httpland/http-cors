# http-cors

CORS middleware for standard `Request` and `Response`.

## Middleware

For a definition of Universal HTTP middleware, see the
[http-middleware](https://github.com/httpland/http-middleware) project.

## Usage

Middleware is exported by default.

In this example, the `access-control-allow-origin` header will add in the case
of a CORS request.

```ts
import cors from "https://deno.land/x/http_cors@$VERSION/mod.ts";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

const middleware = cors();
const response = await middleware(
  new Request("http://api.test", { headers: { origin: "http://cors.test" } }),
  (request) => new Response("ok"),
);
assertEquals(response.headers.get("access-control-allow-origin"), "*");
```

It also returns a `Request` for CORS Preflight in the case of a CORS Preflight
request.

```ts
import cors from "https://deno.land/x/http_cors@$VERSION/mod.ts";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

const preflightRequest = new Request("http://api.test", {
  method: "OPTIONS",
  headers: {
    origin: "http://cors.test",
    "access-control-request-method": "POST",
    "access-control-request-headers": "content-type",
  },
});
const middleware = cors();
const response = await middleware(
  preflightRequest,
  (request) => new Response("ok"),
);

assertEquals(response.status, 204);
assertEquals(await response.text(), "");
assertEquals(response.headers.get("access-control-allow-origin"), "*");
```

## License

Copyright © 2023-present [httpland](https://github.com/httpland).

Released under the [MIT](./LICENSE) license
