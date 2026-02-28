import { FastifyInstance } from "fastify";
import { SkillRequestSchema } from "../schema/skillSchema";
import { getUserSkills, upsertSkill } from "../services/skillService";

export async function skillsRoute(app: FastifyInstance) {
  app.post("/skills", async (request, reply) => {
    const parsed = SkillRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({ error: "Invalid request" });
    }

    try {
      // TEMP: mock userId until auth implemented
      const userId = "dev-user-1";

      const { skillName, rating } = parsed.data;

      await upsertSkill(userId, skillName, rating);

      return reply.send({ ok: true });
    } catch (err) {
      request.log.error(err);
      return reply.status(500).send({ error: "Skill save failed" });
    }
  });


  app.get("/skills", async (request, reply) => {
    try {
      const userId = "dev-user-1";

      const skills = await getUserSkills(userId);

      return reply.send({ skills });
    } catch (err) {
      request.log.error(err);
      return reply.status(500).send({ error: "Failed to fetch skills" });
    }
  });
}

