import { detectTopics, getSkills, saveSkill, streamSummary } from "../../lib/api";
import { useAppStore } from "../../store/useAppStore";

export function useSummaryFlow() {
  const {
    setUIState,
    setPageText,
    setDetectedTopics,
    setSkills,
    setMissingTopics,
    appendStream,
    setFinalResult,
    setError,
    resetStream,
  } = useAppStore();

  const runStreamingSummary = async (pageText: string, topics: string[]) => {
    setUIState("streaming");

    await streamSummary(
      pageText,
      topics,
      (chunk: string) => {
        appendStream(chunk);
      },
      (final) => {
        setFinalResult(final);
        setUIState("done");
      },
      () => {
        setError("Streaming failed.");
        setUIState("error");
      }
    );
  };

  const handleExtract = async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab?.id) return;

    try {
      let extractedText = "";

      try {
        const response = await chrome.tabs.sendMessage(tab.id, {
          type: "EXTRACT_PAGE",
        });
        extractedText = response?.text ?? "";
      } catch {
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => document.body?.innerText ?? "",
        });
        extractedText = String(results?.[0]?.result ?? "");
      }

      if (!extractedText.trim()) {
        throw new Error("No content received");
      }

      setPageText(extractedText);
      setError(null);
    } catch (err) {
      console.error("EXTRACT ERROR:", err);
      setError("Cannot access this page.");
      setUIState("error");
    }
  };

  const handleSummarize = async () => {
    try {
      setUIState("detecting");
      setError(null);
      resetStream();

      const pageText = useAppStore.getState().pageText;
      if (!pageText) {
        setError("Extract page content first.");
        setUIState("error");
        return;
      }

      const topicRes = await detectTopics(pageText);
      const topics = topicRes.topics;
      setDetectedTopics(topics);

      const skillRes = await getSkills();
      const skills = skillRes.skills;
      setSkills(skills);

      const missing = topics.filter((t: string) => !skills[t]);
      setMissingTopics(missing);

      if (missing.length > 0) {
        setUIState("rating");
        return;
      }

      await runStreamingSummary(pageText, topics);
    } catch (err) {
      console.error(err);
      setError("Unexpected error.");
      setUIState("error");
    }
  };

  const handleSaveRatings = async (ratings: Record<string, number>) => {
    try {
      const state = useAppStore.getState();
      const pageText = state.pageText;
      const topics = state.detectedTopics;
      const currentSkills = state.skills;

      await Promise.all(
        Object.entries(ratings).map(([skillName, rating]) =>
          saveSkill(skillName, rating)
        )
      );

      setSkills({ ...currentSkills, ...ratings });
      setMissingTopics([]);
      setError(null);

      if (!pageText || topics.length === 0) {
        setError("Missing page context for summarization.");
        setUIState("error");
        return;
      }

      await runStreamingSummary(pageText, topics);
    } catch (err) {
      console.error(err);
      setError("Unable to save ratings.");
      setUIState("error");
    }
  };

  return {
    handleExtract,
    handleSummarize,
    handleSaveRatings,
  };
}
