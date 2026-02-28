import Fastify from "fastify";
import cors from "@fastify/cors";
import dotenv from "dotenv";

dotenv.config();

const app = Fastify({ logger: true });

async function bootstrap() {
  await app.register(cors, {
    origin: true,
  });

  app.get("/health", async () => {
    return { ok: true };
  });

  await app.listen({ port: 3000 });
}

bootstrap();