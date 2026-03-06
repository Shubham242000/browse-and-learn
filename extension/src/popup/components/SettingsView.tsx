type Props = {
  onSignOut: () => Promise<void>;
};

export default function SettingsView({ onSignOut }: Props) {
  return (
    <section className="settings-layout">
      <section className="section">
        <p className="section-label">Model Access</p>
        <p className="section-copy">
          This app uses the server-managed AI key. No user API key required in v1.
        </p>
      </section>

      <section className="section">
        <p className="section-label">Output</p>
        <p className="section-copy">
          Structured output includes 3 bullets, one short post, one analogy, and a
          confidence signal.
        </p>
      </section>

      <section className="section">
        <p className="section-label">Account</p>
        <p className="section-copy">You are signed in on this browser profile.</p>
        <button className="btn btn-ghost btn-full settings-signout" onClick={onSignOut}>
          Sign Out
        </button>
      </section>
    </section>
  );
}
