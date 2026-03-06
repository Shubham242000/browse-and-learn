import { useAppStore } from "../../store/useAppStore";

export default function StreamingView() {
  const streamingText = useAppStore((s) => s.streamingText);

  return (
    <section className="section">
      <p className="section-label">Generating Summary</p>
      <p className="section-copy">Streaming structured response from AI.</p>
      <pre className="stream-box">{streamingText || "Waiting for chunks..."}</pre>
    </section>
  );
}
