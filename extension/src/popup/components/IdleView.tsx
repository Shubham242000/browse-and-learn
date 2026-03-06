type Props = {
  hasPageText: boolean;
  onExtract: () => Promise<void>;
  onSummarize: () => Promise<void>;
};

export default function IdleView({ hasPageText, onExtract, onSummarize }: Props) {
  return (
    <>
      <section className="section">
        <p className="section-label">Current Page</p>
        <p className="section-copy">
          Extract page content, then generate adaptive summary.
        </p>
      </section>

      <div className="button-row">
        <button className={`btn btn-ghost ${!hasPageText ? "btn-full" : ""}`} onClick={onExtract}>
          Extract Page
        </button>
        {hasPageText && (
          <button className="btn btn-primary" onClick={onSummarize}>
            Summarize
          </button>
        )}
      </div>

      {hasPageText ? (
        <div className="status ok">Content extracted successfully.</div>
      ) : (
        <div className="status">No extracted content yet.</div>
      )}
    </>
  );
}
