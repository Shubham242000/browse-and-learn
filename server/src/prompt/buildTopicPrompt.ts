export function buildPrompt(pageText: string, profile: any) {
  const ratingsString = Object.entries(profile.ratings)
    .map(([skill, score]) => `${skill}: ${score}/10`)
    .join("\n");

  return `
            You are an adaptive learning assistant.

            User profile:
            Role: ${profile.role}
            Domain: ${profile.domain}

            Skill Ratings:
            ${ratingsString}

            Instructions:
            - Adjust explanation depth based on skill ratings.
            - If rating < 5 → explain fundamentals.
            - If rating 5–7 → moderate depth.
            - If rating > 7 → skip basics, go deeper.

            Page content:
            ${pageText}
            `;
}