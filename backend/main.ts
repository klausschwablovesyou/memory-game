import { DanetApplication } from "@danet/core";
import { AppModule } from "./src/app.module.ts";

const application = new DanetApplication();
application.registerBasePath("/api");

await application.init(AppModule);

const isDevelopment = Deno.env.get("DENO_ENV") !== "production";
const staticAssetsPath = isDevelopment
  ? `${Deno.cwd()}/../frontend/dist`
  : `${Deno.cwd()}/../frontend/dist`;

application.useStaticAssets(staticAssetsPath);

// SPA fallback — serve index.html for any non-API route not matched by static files
application.app.use("*", async (c, next) => {
  await next();

  if (c.res.status === 404 && !c.req.path.startsWith("/api")) {
    try {
      const content = await Deno.readTextFile(`${staticAssetsPath}/index.html`);
      return c.html(content);
    } catch {
      // index.html not built yet; ignore in development
    }
  }
});

const port = Number(Deno.env.get("PORT") ?? 3001);
await application.listen(port);

console.log(`🎮 memo mission running on http://localhost:${port}`);
