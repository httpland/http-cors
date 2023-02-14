import cors from "./mod.ts";
import { assert, describe, equalsResponse, it } from "./_dev_deps.ts";

describe("cors", () => {
  it("should return same response If the request is not CORS request", async () => {
    const middleware = cors();

    const init = new Response("ok");
    const response = await middleware(
      new Request("http://localhost"),
      () => init,
    );

    assert(equalsResponse(response, init));
  });

  it("should add access-control-allow-origin header If the request is CORS request", async () => {
    const middleware = cors();

    const init = new Response("ok");
    const response = await middleware(
      new Request("http://localhost", {
        headers: {
          "origin": "http://api",
        },
      }),
      () => init,
    );

    assert(
      equalsResponse(
        response,
        new Response("ok", {
          headers: {
            "access-control-allow-origin": "*",
            "content-type": "text/plain;charset=UTF-8",
          },
        }),
      ),
    );
  });

  it("should return  preflight request If the request is CORS preflight request", async () => {
    const middleware = cors();

    const response = await middleware(
      new Request("http://localhost", {
        method: "OPTIONS",
        headers: {
          "origin": "http://api",
          "access-control-request-method": "POST",
          "access-control-request-headers": "content-type",
        },
      }),
      () => new Response("ok"),
    );

    assert(
      equalsResponse(
        response,
        new Response(null, {
          status: 204,
          headers: {
            "access-control-allow-origin": "*",
            "access-control-allow-methods": "POST",
            "access-control-allow-headers": "content-type",
          },
        }),
      ),
    );
  });

  it("should override CORS headers", async () => {
    const middleware = cors({ maxAge: 100, exposeHeaders: "x-server" });

    const response = await middleware(
      new Request("http://localhost", {
        method: "OPTIONS",
        headers: {
          "origin": "http://api",
          "access-control-request-method": "POST",
          "access-control-request-headers": "content-type",
        },
      }),
      () => new Response("ok"),
    );

    assert(
      equalsResponse(
        response,
        new Response(null, {
          status: 204,
          headers: {
            "access-control-allow-origin": "*",
            "access-control-allow-methods": "POST",
            "access-control-allow-headers": "content-type",
            "access-control-max-age": "100",
            "access-control-expose-headers": "x-server",
          },
        }),
      ),
    );
  });
});
