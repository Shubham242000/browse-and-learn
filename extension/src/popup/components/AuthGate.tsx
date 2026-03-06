import { useState } from "react";
import { startGoogleLogin } from "../../lib/auth";

type Props = {
  onSuccess: () => void;
};

export default function AuthGate({ onSuccess }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setBusy(true);
    setError(null);

    try {
      await startGoogleLogin();
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Sign-in failed. Check config and try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="section auth-gate">
      <p className="section-label">Sign In Required</p>
      <p className="section-copy">
        Continue with Google to load your skills and personalize summaries.
      </p>
      <button className="btn btn-primary btn-full" onClick={handleLogin} disabled={busy}>
        {busy ? "Signing in..." : "Continue with Google"}
      </button>
      {error ? <p className="auth-error">{error}</p> : null}
    </section>
  );
}
