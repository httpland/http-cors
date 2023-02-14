import { BuildOptions } from "https://deno.land/x/dnt@0.33.1/mod.ts";

export const makeOptions = (version: string): BuildOptions => ({
  test: false,
  shims: {},
  compilerOptions: {
    lib: ["esnext", "dom", "dom.iterable"],
  },
  typeCheck: true,
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  package: {
    name: "@httpland/http-cors",
    version,
    description: "CORS middleware for standard Request and Response",
    keywords: [
      "http",
      "cors",
      "preflight",
      "middleware",
      "request",
      "response",
    ],
    license: "MIT",
    homepage: "https://github.com/httpland/http-cors",
    repository: {
      type: "git",
      url: "git+https://github.com/httpland/http-cors.git",
    },
    bugs: {
      url: "https://github.com/httpland/http-cors/issues",
    },
    sideEffects: false,
    type: "module",
    publishConfig: {
      access: "public",
    },
  },
  packageManager: "pnpm",
});
