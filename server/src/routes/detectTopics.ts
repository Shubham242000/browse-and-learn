import { FastifyInstance } from "fastify";
import { DetectTopicsRequestSchema } from "../schema/topicSchema";
import { detectTopics } from "../services/topicDetector";

export async function detectTopicsRoute(app: FastifyInstance) {
  app.post("/detect-topics", async (request, reply) => {
    const parseResult = DetectTopicsRequestSchema.safeParse(request.body);

    if (!parseResult.success) {
      return reply.status(400).send({
        error: "Invalid request",
      });
    }

    try {
      const { pageText } = parseResult.data;

      const result = await detectTopics(pageText);

      return reply.send(result);
    } catch (err: any) {
      request.log.error(err);
      return reply.status(500).send({
        error: "Topic detection failed",
      });
    }
  });
}