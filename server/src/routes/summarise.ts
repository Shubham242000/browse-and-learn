import { FastifyInstance } from "fastify";
import { generateSummaryStream } from "../services/summaryGenerator";
import { getUserSkills } from "../services/skillService";
import { z } from "zod";

const RequestSchema = z.object({
  pageText: z.string().min(50),
  topics: z.array(z.string()).min(1),
});

export async function summarizeRoute(app: FastifyInstance) {
  app.post("/summarize/stream", async (request, reply) => {
    const parsed = RequestSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({ error: "Invalid request" });
    }

    const { pageText, topics } = parsed.data;

    const userId = "dev-user-1";

    const ratings = await getUserSkills(userId);

    reply.raw.setHeader("Content-Type", "text/event-stream");
    reply.raw.setHeader("Cache-Control", "no-cache");
    reply.raw.setHeader("Connection", "keep-alive");

    const sendEvent = (event: string, data: any) => {
      reply.raw.write(`event: ${event}\n`);
      reply.raw.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    try {
      const result = await generateSummaryStream(
        pageText,
        topics,
        ratings,
        (chunk) => {
          sendEvent("chunk", chunk);
        }
      );

      sendEvent("done", result);

      reply.raw.end();
    } catch (err) {
      request.log.error(err);
      sendEvent("error", { message: "Summary failed" });
      reply.raw.end();
    }
  });
}