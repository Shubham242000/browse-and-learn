const BASE_URL = "http://localhost:3000";

async function getAuthHeaders() {
  const { token } = await chrome.storage.local.get("token");

  if (!token) {
    throw new Error("Missing auth token");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function detectTopics(pageText: string) {
  const res = await fetch(`${BASE_URL}/detect-topics`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pageText }),
  });

  if (!res.ok) throw new Error("Topic detection failed");

  return res.json();
}

export async function getSkills() {
   const res = await fetch(`${BASE_URL}/skills`, {
    headers: await getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Failed to fetch skills");

  return res.json();
}

export async function saveSkill(skillName: string, rating: number) {
  const res = await fetch(`${BASE_URL}/skills`, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify({ skillName, rating }),
  });

  if (!res.ok) throw new Error("Failed to save skill");
}

export async function streamSummary(
  pageText: string,
  topics: string[],
  onChunk: (chunk: string) => void,
  onDone: (data: any) => void,
  onError: () => void
) {
  const res = await fetch(`${BASE_URL}/summarize/stream`, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify({ pageText, topics }),
  });

  if (!res.body) {
    onError();
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const parts = buffer.split("\n\n");
    buffer = parts.pop() || "";

    for (const part of parts) {
      if (part.includes("event: chunk")) {
        const data = part.split("data: ")[1];
        onChunk(JSON.parse(data));
      }

      if (part.includes("event: done")) {
        const data = part.split("data: ")[1];
        onDone(JSON.parse(data));
      }

      if (part.includes("event: error")) {
        onError();
      }
    }
  }
}

export async function getHistory(limit = 20) {
  const res = await fetch(`${BASE_URL}/history?limit=${limit}`, {
    headers: await getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Failed to fetch history");

  return res.json();
}
