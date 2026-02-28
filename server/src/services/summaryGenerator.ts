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

`{
    "summary": {
        "bullets": [
            "React Server Components (RSC) enable rendering components on the server, sending serialized HTML and minimal JS to the client.",
            "Hydration is the process of attaching React event handlers to server-rendered HTML, enabling interactivity without re-rendering.",
            "RSC reduce client-bundle size and improve performance by moving data fetching and heavy logic server-side."
        ],
        "post": "React Server Components allow rendering on the server, sending lightweight HTML + JS. Hydration connects React logic client-side, optimizing performance and UX.",
        "analogy": "Think of React Server Components as a chef prepping a meal in the kitchen (server), while hydration is the waiter (client) bringing the meal to your table and making it interactive."
    },
    "signal": {
        "confidence": "high",
        "caveat": ""
    },
    "meta": {
        "topicsUsed": [
            "React Server Components",
            "Hydration",
            "Server-Side Rendering",
            "Performance Optimization"
        ],
        "missingRatings": [
            "SSR"
        ]
    }
}`