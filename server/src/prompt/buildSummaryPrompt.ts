export function buildSummaryPrompt(
  pageText: string,
  topics: string[],
  ratings: Record<string, number>
) {
  const ratingLines = topics
    .map((topic) => {
      const rating = ratings[topic];
      return rating
        ? `${topic}: ${rating}/10`
        : `${topic}: not rated`;
    })
    .join("\n");

  return `
You are an adaptive technical summarizer.

User skill ratings:
${ratingLines}

Instructions:
- Adjust explanation depth based on rating.
- If rating < 5 → explain fundamentals briefly.
- If rating 5-7 → moderate depth.
- If rating > 7 → assume knowledge and include nuance.
- Keep everything concise.

Output MUST be valid JSON only:

{
  "summary": {
    "bullets": ["", "", ""],
    "post": "",
    "analogy": ""
  },
  "signal": {
    "confidence": "high | medium | low",
    "caveat": "optional"
  },
  "meta": {
    "topicsUsed": [],
    "missingRatings": []
  }
}

Constraints:
- bullets length = 3
- each bullet <= 140 chars
- post <= 220 chars
- analogy <= 240 chars
- no markdown
- no extra commentary

Article:
${pageText}
`;
}