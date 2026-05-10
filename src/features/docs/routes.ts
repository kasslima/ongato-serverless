import { generateOpenApiDocument } from "../../openapi";

export function docsRoutes() {
  return {
    "GET /openapi.json": (req: Request) => {
      const origin = new URL(req.url).origin;
      return Response.json(generateOpenApiDocument(origin));
    },
    "GET /docs": () => {
      const html = `<!DOCTYPE html>
<html>
<head>
  <title>API Docs</title>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body>
  <script
    id="api-reference"
    data-url="/openapi.json"
  ></script>
  <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
</body>
</html>`;
      return new Response(html, { headers: { 'Content-Type': 'text/html' } });
    },
  };
}
