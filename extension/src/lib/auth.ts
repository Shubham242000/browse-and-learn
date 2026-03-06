const BASE_URL = "http://localhost:3000";

function parseHashParams(redirectUrl: string) {
  const hash = redirectUrl.split("#")[1] || "";
  return new URLSearchParams(hash);
}

async function launchAuthFlow(url: string) {
  return new Promise<string>((resolve, reject) => {
    chrome.identity.launchWebAuthFlow({ url, interactive: true }, (resultUrl) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }

      if (!resultUrl) {
        reject(new Error("No auth response URL"));
        return;
      }

      resolve(resultUrl);
    });
  });
}

export async function startGoogleLogin() {
  const redirectUri = chrome.identity.getRedirectURL("oauth2");
  const authUrl = `${BASE_URL}/auth/google/start?redirectUri=${encodeURIComponent(
    redirectUri
  )}`;

  const redirectUrl = await launchAuthFlow(authUrl);
  const params = parseHashParams(redirectUrl);
  const token = params.get("token");
  const error = params.get("error");

  if (error) {
    throw new Error(decodeURIComponent(error));
  }

  if (!token) {
    throw new Error("Missing token from OAuth callback");
  }

  await chrome.storage.local.set({ token });
}

export async function getStoredToken() {
  const { token } = await chrome.storage.local.get("token");
  return token || null;
}

export async function clearStoredToken() {
  await chrome.storage.local.remove("token");
}
