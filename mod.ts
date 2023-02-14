// Copyright 2023-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

import {
  type Middleware,
} from "https://deno.land/x/http_middleware@1.0.0-beta.1/mod.ts";
import {
  type Options,
  withCors,
} from "https://deno.land/x/cors_protocol@1.0.0-beta.6/mod.ts";

/** Create CORS middleware.
 *
 * @example
 * ```ts
 * import cors from "https://deno.land/x/http_cors@$VERSION/mod.ts";
 * import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
 *
 * const middleware = cors();
 * const response = await middleware(
 *   new Request("http://cors.test", { headers: { origin: "http://cors.test" } }),
 *   (request) => new Response("ok"),
 * );
 * assertEquals(response.headers.get("access-control-allow-origin"), "*");
 * ```
 */
export default function cors(options?: Options): Middleware {
  return async (request, next) => {
    const response = await next(request.clone());

    return withCors(request.clone(), response.clone(), options);
  };
}
