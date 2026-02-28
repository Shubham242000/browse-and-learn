import "dotenv/config";
import OpenAI from "openai";
import { buildTopicPrompt } from "../prompt/buildTopicPrompt";
import { DetectTopicsResponseSchema } from "../schema/topicSchema";

let openaiClient: OpenAI | null = null;

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Missing OPENAI_API_KEY. Set it in server/.env or your shell environment before starting the server.",
    );
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey });
  }

  return openaiClient;
}

export async function detectTopics(pageText: string) {
  const openai = getOpenAIClient();
  const prompt = buildTopicPrompt(pageText);

  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: prompt,
  });

  const raw = response.output_text?.trim();

  if (!raw) {
    throw new Error("Empty response from model");
  }

  let parsed;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Invalid JSON from model");
  }

  const validated = DetectTopicsResponseSchema.parse(parsed);

  return validated;
}
