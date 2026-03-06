import "./launcher.css";
import { useState } from "react";

type PanelAction = "extract" | "summarize";

async function launchPanel(action: PanelAction) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab?.id || !tab.windowId) {
    throw new Error("No active tab");
  }

  // Keep action for side-panel app to consume on mount.
  await chrome.storage.session.set({
    pendingPanelAction: {
      type: "PANEL_ACTION",
      action,
      tabId: tab.id,
      at: Date.now(),
    },
  });

  try {
    await chrome.sidePanel.setOptions({
      tabId: tab.id,
      path: "index.html",
      enabled: true,
    });
    await chrome.sidePanel.open({ windowId: tab.windowId });
    return { ok: true };
  } catch {
    // Fallback to background route if direct open fails.
    return chrome.runtime.sendMessage({
      type: "PANEL_LAUNCH",
      action,
    });
  }
}

export default function Launcher() {
  const [status, setStatus] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const onLaunch = async (action: PanelAction) => {
    setBusy(true);
    setStatus("Opening side panel...");
    try {
      const res = await launchPanel(action);
      if (res?.ok) {
        setStatus("Side panel opened.");
      } else {
        setStatus("Could not open side panel.");
      }
    } catch {
      setStatus("Could not open side panel.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="launcher-root">
      <div className="launcher-card">
        <h1>Summarize</h1>
        <p>Use side panel for full summary view.</p>

        <button
          className="launcher-btn ghost"
          onClick={() => onLaunch("extract")}
          disabled={busy}
        >
          Extract Page
        </button>
        <button
          className="launcher-btn primary"
          onClick={() => onLaunch("summarize")}
          disabled={busy}
        >
          Summarize
        </button>
        {status ? <p className="launcher-status">{status}</p> : null}
      </div>
    </div>
  );
}
