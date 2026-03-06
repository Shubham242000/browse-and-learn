type Props = {
  message: string | null;
};

export default function ErrorView({ message }: Props) {
  return (
    <section className="section">
      <p className="section-label">Error</p>
      <p className="section-copy">{message || "Something went wrong."}</p>
    </section>
  );
}
