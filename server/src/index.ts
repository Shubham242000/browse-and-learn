import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { detectTopicsRoute } from "./routes/detectTopics";
import { skillsRoute } from "./routes/skills";
import { summarizeRoute } from "./routes/summarise";

const app = Fastify({ logger: true });

async function bootstrap() {
  await app.register(cors, { origin: true });

  app.get("/health", async () => ({ ok: true }));

  await app.register(detectTopicsRoute);
  await app.register(skillsRoute);
  await app.register(summarizeRoute);

  await app.listen({ port: 3000 });
}

bootstrap();
