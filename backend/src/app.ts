  import express, { type Express } from "express";
  import cors from "cors";
  import pinoHttp from "pino-http";
  import router from "./routes";
  import { logger } from "./lib/logger";

  const app: Express = express();

  app.use(
    pinoHttp({
      logger,
      serializers: {
        req(req) {
          return {
            id: req.id,
            method: req.method,
            url: req.url?.split("?")[0],
          };
        },
        res(res) {
          return {
            statusCode: res.statusCode,
          };
        },
      },
    }),
  );
  // Re-read on every request — no startup race condition on Render
app.options("*", cors({                          // ← ADD THIS LINE (handles preflight)
  origin(origin, callback) {
    const allowedOrigins = (process.env.CORS_ORIGIN ?? "")
      .split(",")
      .map((o) => o.trim())
      .filter(Boolean);

    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, false);                // ← WAS: callback(new Error(...))
  },
  credentials: true,
}));

app.use(
  cors({
    origin(origin, callback) {
      const allowedOrigins = (process.env.CORS_ORIGIN ?? "")
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean);

      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);              // ← WAS: callback(new Error(...))
    },
    credentials: true,
  })
);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use("/api", router);

  export default app;
