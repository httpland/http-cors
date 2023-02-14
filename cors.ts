// Copyright 2023-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

import { isUndefined, mergeHeaders, type Middleware } from "./deps.ts";
import {
  Cors,
  Field,
  isCrossOriginRequest,
  isPreflightRequest,
  StrictResponse,
} from "./utils.ts";

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
export default function cors(options?: PreflightOptions): Middleware {
  return async (request, next) => {
    const response = await next(request.clone());

    return match(request, {
      sameOrigin: () => response,
      crossOrigin: (request) =>
        withCors(request.clone(), response.clone(), options),
      preflight: (request) =>
        withPreflight(request.clone(), response.clone(), options),
    });
  };
}

export interface PreflightOptions extends Options {
  /** Configures the `Access-Control-Allow-Method` header.
   *
   * @default `Access-Control-Request-Method` field value
   */
  readonly allowMethod?: string;

  /** Configures the `Access-Control-Allow-Headers` header.
   *
   * @default `Access-Control-Request-Headers` field value
   */
  readonly allowHeaders?: string;

  /** Configures the `Access-Control-Max-Age` header. */
  readonly maxAge?: string | number;

  /** Configures the `Access-Control-Expose-Headers` header. */
  readonly exposeHeaders?: string;
}

interface Options {
  /** Configures the `Access-Control-Allow-Origin` header.
   *
   * @default "*"
   */
  readonly allowOrigin?: string;

  /** Configures the `Access-Control-Allow-Credentials` header. */
  readonly allowCredentials?:
    | string
    | true;
}

export function withPreflight(
  request: Request,
  response: Response,
  options?: PreflightOptions,
): Response {
  if (!isPreflightRequest(request)) return response;

  const requestMethod = request.headers.get(Cors.RequestMethod);
  const requestHeaders = request.headers.get(Cors.RequestHeaders);

  const {
    allowOrigin = STAR,
    allowCredentials,
    exposeHeaders,
    maxAge,
    allowHeaders = requestHeaders,
    allowMethod = requestMethod,
  } = options ?? {};

  const corsHeaders = new Headers({
    [Cors.AllowOrigin]: allowOrigin,
    [Cors.AllowMethod]: allowMethod,
    [Cors.AllowHeaders]: allowHeaders,
  });

  if (allowOrigin !== STAR) {
    corsHeaders.append(Field.Vary, Field.Origin);
  }

  if (allowCredentials) {
    corsHeaders.append(Cors.AllowCredentials, allowCredentials.toString());
  }

  if (exposeHeaders) {
    corsHeaders.append(Cors.ExposeHeaders, exposeHeaders);
  }

  if (!isUndefined(maxAge)) {
    corsHeaders.append(Cors.MaxAge, maxAge.toString());
  }

  const headers = mergeHeaders(response.headers, corsHeaders);

  return new StrictResponse(null, { ...response, headers, status: 204 });
}

export function withCors(
  request: Request,
  response: Response,
  options?: Options,
): Response {
  const isCrossOrigin = isCrossOriginRequest(request.clone());
  const origin = request.headers.get(Field.Origin);

  if (!isCrossOrigin || !origin) return response;

  const { allowOrigin = STAR, allowCredentials } = options ?? {};

  const corsHeaders = new Headers({
    [Cors.AllowOrigin]: allowOrigin,
  });

  if (allowOrigin !== STAR) {
    corsHeaders.append(Field.Vary, Field.Origin);
  }

  if (allowCredentials) {
    corsHeaders.set(Cors.AllowCredentials, String(allowCredentials));
  }

  const headers = mergeHeaders(response.headers, corsHeaders);

  return new Response(response.body, { ...response, headers });
}

function match<T>(request: Request, callbacks: {
  sameOrigin: (request: Request) => T;
  preflight: (request: Request) => T;
  crossOrigin: (request: Request) => T;
}) {
  if (!isCrossOriginRequest(request.clone())) {
    return callbacks.sameOrigin(request);
  }

  if (isPreflightRequest(request.clone())) {
    return callbacks.preflight(request.clone());
  }

  return callbacks.crossOrigin(request.clone());
}

const STAR = "*";
