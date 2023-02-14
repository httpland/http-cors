// Copyright 2023-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

/** CORS header field. */
export enum Cors {
  AllowOrigin = "access-control-allow-origin",
  AllowCredentials = "access-control-allow-credentials",
  AllowMethod = "access-control-allow-method",
  AllowHeaders = "access-control-allow-headers",
  ExposeHeaders = "access-control-expose-headers",
  MaxAge = "access-control-max-age",
  RequestMethod = "access-control-request-method",
  RequestHeaders = "access-control-request-headers",
}

export enum Field {
  Vary = "vary",
  Origin = "origin",
  ContentType = "content-type",
  ContentLength = "content-length",
}

/** Header strict `Response`. */
export class StrictResponse extends Response {
  constructor(
    body?: BodyInit | null | undefined,
    init?: ResponseInit | undefined,
  ) {
    const hasContent = !!body;

    super(body, init);

    if (!hasContent) {
      this.headers.delete(Field.ContentType);
      this.headers.delete(Field.ContentLength);
    }
  }
}

/** Whether the request is preflight request or not.
 * Living Standard - Fetch, 3.2.2 HTTP requests
 */
export function isPreflightRequest(
  request: Request,
): request is PreflightRequest {
  return isCrossOriginRequest(request) &&
    request.method === "OPTIONS" &&
    request.headers.has(Cors.RequestHeaders) &&
    request.headers.has(Cors.RequestMethod);
}

export type PreflightHeaderField =
  | "origin"
  | "access-control-request-method"
  | "access-control-request-headers";

export interface PreflightHeaders extends Headers {
  get(name: PreflightHeaderField): string;
  get(name: string): string | null;
}

export interface PreflightRequest extends Request {
  headers: PreflightHeaders;
}

export function isCrossOriginRequest(
  request: Request,
): request is Request & { headers: { get(name: "origin"): string } } {
  return request.headers.has(Field.Origin);
}
