import "./App.css";
import { useEffect, useState } from "react";

import { useAppStore } from "./store/useAppStore";
import IdleView from "./popup/components/IdleView";
import DetectingView from "./popup/components/DetectingView";
import ErrorView from "./popup/components/ErrorView";
import StreamingView from "./popup/components/StreamingView";
import SummaryView from "./popup/components/SummaryView";
import RatingView from "./popup/components/RatingView";
import HistoryView from "./popup/components/HistoryView";
import SettingsView from "./popup/components/SettingsView";
import { useSummaryFlow } from "./popup/hooks/useSummaryFlow";
import AuthGate from "./popup/components/AuthGate";
import { clearStoredToken, getStoredToken } from "./lib/auth";

type AuthState = "checking" | "unauthenticated" | "authenticated";
type PanelAction = "extract" | "summarize";
type ActiveTab = "summary" | "history" | "settings";

function App() {
  const { handleExtract, handleSummarize, handleSaveRatings } = useSummaryFlow();

  const [authState, setAuthState] = useState<AuthState>("checking");
  const [pendingAction, setPendingAction] = useState<PanelAction | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("summary");

  const pageText = useAppStore((s) => s.pageText);
  const missingTopics = useAppStore((s) => s.missingTopics);
  const error = useAppStore((s) => s.error);
  const uiState = useAppStore((s) => s.uiState);
  const setError = useAppStore((s) => s.setError);
  const setUIState = useAppStore((s) => s.setUIState);
  const resetStream = useAppStore((s) => s.resetStream);

  useEffect(() => {
    void getStoredToken().then((token) => {
      setAuthState(token ? "authenticated" : "unauthenticated");
    });
  }, []);

  useEffect(() => {
    const executePanelAction = async (action: string) => {
      setActiveTab("summary");
      if (action === "extract") {
        await handleExtract();
      }
      if (action === "summarize") {
        await handleSummarize();
      }
    };

    const queueOrExecuteAction = async (action: string) => {
      if (action !== "extract" && action !== "summarize") return;

      if (authState !== "authenticated") {
        setPendingAction(action);
        setAuthState("unauthenticated");
        return;
      }

      await executePanelAction(action);
    };

    const onMessage = (message: { type?: string; action?: string }) => {
      if (message?.type !== "PANEL_ACTION") return;
      void queueOrExecuteAction(message.action || "");
    };

    chrome.runtime.onMessage.addListener(onMessage);

    void chrome.storage.session
      .get("pendingPanelAction")
      .then(
        (res: {
          pendingPanelAction?: { action?: string };
        }) => {
          const pending = res.pendingPanelAction;
      if (!pending?.action) return;

      void queueOrExecuteAction(pending.action);
      void chrome.storage.session.remove("pendingPanelAction");
        }
      );

    return () => {
      chrome.runtime.onMessage.removeListener(onMessage);
    };
  }, [authState, handleExtract, handleSummarize]);

  const handleAuthSuccess = async () => {
    setAuthState("authenticated");

    if (pendingAction) {
      const action = pendingAction;
      setPendingAction(null);

      if (action === "extract") {
        await handleExtract();
      } else {
        await handleSummarize();
      }
    }
  };

  const handleSignOut = async () => {
    await clearStoredToken();
    setAuthState("unauthenticated");
    setPendingAction(null);
    resetStream();
    setError(null);
    setUIState("idle");
    setActiveTab("summary");
  };

  return (
    <div className="popup-root">
      <div className="panel">
        <header className="panel-header">
          <div className="brand">
            <span className="brand-badge">✦</span>
            <h1>Summarize</h1>
          </div>
          <span className="header-sub">Adaptive side panel</span>
        </header>

        <main className="panel-body">
          {authState === "checking" && (
            <section className="section">
              <p className="section-label">Loading</p>
              <p className="section-copy">Checking session...</p>
            </section>
          )}

          {authState === "unauthenticated" && <AuthGate onSuccess={handleAuthSuccess} />}

          {authState === "authenticated" && (
            <>
              <div className="tab-row">
                <button
                  className={`tab-btn ${activeTab === "summary" ? "tab-active" : ""}`}
                  onClick={() => setActiveTab("summary")}
                >
                  Summary
                </button>
                <button
                  className={`tab-btn ${activeTab === "history" ? "tab-active" : ""}`}
                  onClick={() => setActiveTab("history")}
                >
                  History
                </button>
                <button
                  className={`tab-btn ${activeTab === "settings" ? "tab-active" : ""}`}
                  onClick={() => setActiveTab("settings")}
                >
                  Settings
                </button>
              </div>
            </>
          )}

          {authState === "authenticated" && activeTab === "summary" && (
            <>
              {uiState === "idle" && (
                <IdleView
                  hasPageText={Boolean(pageText)}
                  onExtract={handleExtract}
                  onSummarize={handleSummarize}
                />
              )}

              {uiState === "detecting" && <DetectingView />}

              {uiState === "rating" && (
                <RatingView topics={missingTopics} onSubmit={handleSaveRatings} />
              )}

              {uiState === "streaming" && <StreamingView />}
              {uiState === "done" && <SummaryView />}

              {uiState === "error" && <ErrorView message={error} />}
            </>
          )}

          {authState === "authenticated" && activeTab === "history" && <HistoryView />}

          {authState === "authenticated" && activeTab === "settings" && (
            <SettingsView onSignOut={handleSignOut} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
