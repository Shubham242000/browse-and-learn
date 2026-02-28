import OpenAI from "openai";
import { buildSummaryPrompt } from "../prompt/buildSummaryPrompt";
import { SummarySchema } from "../schema/summarySchema";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateSummaryStream(
  pageText: string,
  topics: string[],
  ratings: Record<string, number>,
  onChunk: (chunk: string) => void
) {
  const prompt = buildSummaryPrompt(pageText, topics, ratings);

  const stream = await openai.responses.stream({
    model: "gpt-4.1-mini",
    input: prompt,
  });

  let fullText = "";

  for await (const event of stream) {
    if (event.type === "response.output_text.delta") {
      const delta = event.delta;
      fullText += delta;
      onChunk(delta);
    }
  }

  await stream.finalResponse();

  let parsed;

  try {
    parsed = JSON.parse(fullText);
  } catch {
    throw new Error("Invalid JSON from summary model");
  }

  const validated = SummarySchema.parse(parsed);

  return validated;
}