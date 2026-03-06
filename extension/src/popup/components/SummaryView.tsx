import { useAppStore } from "../../store/useAppStore";

export default function SummaryView() {
  const result = useAppStore((s) => s.finalResult);

  if (!result) return null;

  return (
    <section className="summary-layout">
      <div className="summary-block">
        <div className="summary-head">
          <h3>3 Key Bullets</h3>
        </div>
        <ul className="bullet-list">
        {result.summary.bullets.map((b, i) => (
            <li key={i} className="bullet-item">
              {b}
            </li>
        ))}
        </ul>
      </div>

      <div className="summary-block">
        <div className="summary-head">
          <h4>The Post</h4>
        </div>
        <p className="summary-card">{result.summary.post}</p>
      </div>

      <div className="summary-block">
        <div className="summary-head">
          <h4>Analogy</h4>
        </div>
        <p className="summary-card">{result.summary.analogy}</p>
      </div>

      <div className="summary-footer">
        <span className="confidence-pill">{result.signal.confidence}</span>
        {result.signal.caveat && (
          <p className="caveat-text">{result.signal.caveat}</p>
        )}
      </div>
    </section>
  );
}
