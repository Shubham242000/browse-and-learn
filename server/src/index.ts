import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { detectTopicsRoute } from "./routes/detectTopics";

const app = Fastify({ logger: true });

async function bootstrap() {
  await app.register(cors, { origin: true });

  app.get("/health", async () => ({ ok: true }));

  await app.register(detectTopicsRoute);

  await app.listen({ port: 3000 });
}

bootstrap();
