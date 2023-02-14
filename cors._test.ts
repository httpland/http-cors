import cors from "./cors.ts";
import {
  assert,
  assertEquals,
  describe,
  equalsResponse,
  it,
} from "./_dev_deps.ts";

describe("cors", () => {
  it("should return same response If the request is not CORS request", async () => {
    const middleware = cors();

    const init = new Response("ok");
    const response = await middleware(
      new Request("http://localhost"),
      () => init,
    );

    assertEquals(response, init);
  });

  it("should add access-control-allow-origin header If the request is CORS request", async () => {
    const middleware = cors();

    const init = new Response("ok");
    const response = await middleware(
      new Request("http://localhost", {
        headers: {
          "origin": "http://localhost",
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
          "origin": "http://localhost",
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
            "access-control-allow-method": "POST",
            "access-control-allow-headers": "content-type",
          },
        }),
      ),
    );
  });
});
