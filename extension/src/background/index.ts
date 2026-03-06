chrome.runtime.onInstalled.addListener(() => {
  console.log("Adaptive AI installed");
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((err) => {
      console.warn("setPanelBehavior not available, using manual action click", err);
    });
});

type PanelAction = "extract" | "summarize";

async function openPanelAndDispatch(action: PanelAction) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab?.id || !tab.windowId) return;

  await chrome.sidePanel.setOptions({
    tabId: tab.id,
    path: "index.html",
    enabled: true,
  });

  await chrome.sidePanel.open({ windowId: tab.windowId });

  try {
    await chrome.runtime.sendMessage({
      type: "PANEL_ACTION",
      action,
      tabId: tab.id,
    });
  } catch {
    await chrome.storage.session.set({
      pendingPanelAction: {
        type: "PANEL_ACTION",
        action,
        tabId: tab.id,
        at: Date.now(),
      },
    });
  }
}

async function openPanelForTab(tab: chrome.tabs.Tab) {
  if (!tab.id || !tab.windowId) return;

  await chrome.sidePanel.setOptions({
    tabId: tab.id,
    path: "index.html",
    enabled: true,
  });

  await chrome.sidePanel.open({ windowId: tab.windowId });
}

chrome.action.onClicked.addListener(async (tab) => {
  try {
    await openPanelForTab(tab);
  } catch (err) {
    console.error("action click open panel failed", err);
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "PANEL_LAUNCH") return;

  const action = message.action as PanelAction;
  openPanelAndDispatch(action)
    .then(() => sendResponse({ ok: true }))
    .catch((err) => {
      console.error("PANEL_LAUNCH failed", err);
      sendResponse({ ok: false });
    });

  return true;
});
