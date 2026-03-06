import { useEffect, useState } from "react";
import { getHistory } from "../../lib/api";

type HistoryItem = {
  id: string;
  topics: unknown;
  result: {
    summary?: {
      bullets?: string[];
      post?: string;
      analogy?: string;
    };
    signal?: {
      confidence?: string;
    };
  };
  createdAt: string;
};

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export default function HistoryView() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getHistory(20);
      setItems(data.items || []);
    } catch (err: any) {
      setError(err?.message || "Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  if (loading) {
    return (
      <section className="section">
        <p className="section-label">History</p>
        <p className="section-copy">Loading previous summaries...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="section">
        <p className="section-label">History</p>
        <p className="section-copy">{error}</p>
        <button className="btn btn-ghost btn-sm history-refresh" onClick={load}>
          Retry
        </button>
      </section>
    );
  }

  if (!items.length) {
    return (
      <section className="section">
        <p className="section-label">History</p>
        <p className="section-copy">No summaries yet.</p>
      </section>
    );
  }

  return (
    <section className="history-layout">
      <div className="history-head">
        <p className="section-label">History</p>
        <button className="btn btn-ghost btn-sm" onClick={load}>
          Refresh
        </button>
      </div>
      <div className="history-list">
        {items.map((item) => (
          <article className="history-item" key={item.id}>
            <div className="history-meta">
              <span>{formatDate(item.createdAt)}</span>
            </div>
            <p className="history-post">
              {item.result?.summary?.post ||
                item.result?.summary?.bullets?.[0] ||
                "No content"}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
