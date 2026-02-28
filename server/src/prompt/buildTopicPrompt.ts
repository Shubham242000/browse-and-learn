export function buildTopicPrompt(pageText: string) {
  return `
You are a technical topic extraction system.

Task:
Extract 1 to 6 concise technical topics required to understand the article below.

Return ONLY valid JSON:
{
  "topics": ["Topic1", "Topic2"]
}

Article:
${pageText}
`;
}