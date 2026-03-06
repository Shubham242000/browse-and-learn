import { useMemo, useState } from "react";

type Props = {
  topics: string[];
  onSubmit: (ratings: Record<string, number>) => Promise<void>;
};

function buildInitialRatings(topics: string[]) {
  return topics.reduce<Record<string, number>>((acc, topic) => {
    acc[topic] = 5;
    return acc;
  }, {});
}

export default function RatingView({ topics, onSubmit }: Props) {
  const [ratings, setRatings] = useState<Record<string, number>>(() =>
    buildInitialRatings(topics)
  );
  const [isSaving, setIsSaving] = useState(false);

  const orderedTopics = useMemo(() => topics, [topics]);

  const updateRating = (topic: string, value: number) => {
    setRatings((prev) => ({ ...prev, [topic]: value }));
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      await onSubmit(ratings);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="section">
      <p className="section-label">Missing Skill Ratings</p>
      <p className="section-copy">Rate each topic (1 = beginner, 10 = expert).</p>

      <div className="rating-list">
        {orderedTopics.map((topic) => (
          <div className="rating-row" key={topic}>
            <div className="rating-meta">
              <span className="rating-topic">{topic}</span>
              <span className="rating-value">{ratings[topic] ?? 5}/10</span>
            </div>
            <input
              className="rating-slider"
              type="range"
              min={1}
              max={10}
              step={1}
              value={ratings[topic] ?? 5}
              onChange={(e) => updateRating(topic, Number(e.target.value))}
            />
          </div>
        ))}
      </div>

      <button
        className="btn btn-primary btn-full"
        type="button"
        onClick={handleSubmit}
        disabled={isSaving}
      >
        {isSaving ? "Saving..." : "Save Ratings and Continue"}
      </button>
    </section>
  );
}
