import "dotenv/config";
import express from "express";
import serverless from "serverless-http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "../../server/_core/oauth";
import { registerStorageProxy } from "../../server/_core/storageProxy";
import { appRouter } from "../../server/routers";
import { createContext } from "../../server/_core/context";

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Strip Netlify's function path prefix if it is present
app.use((req, res, next) => {
  const prefix = "/.netlify/functions/api";
  if (req.url.startsWith(prefix)) {
    req.url = req.url.substring(prefix.length);
  }
  if (!req.url.startsWith("/")) {
    req.url = "/" + req.url;
  }
  next();
});

registerStorageProxy(app);
registerOAuthRoutes(app);

app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

export const handler = serverless(app);
