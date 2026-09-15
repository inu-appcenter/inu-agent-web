/**
 * Handles navigation inside INTIP Web (iframe parent) or React Native WebView.
 */
export function handleAppNavigation(url?: string) {
  if (!url) return;

  // 1. Mobile App React Native WebView Bridge
  if ((window as any).ReactNativeWebView) {
    (window as any).ReactNativeWebView.postMessage(
      JSON.stringify({
        type: "NAVIGATE",
        url,
      })
    );
    return;
  }

  // 2. Embedded in Portal Web iframe (postMessage to parent window)
  if (window.parent && window.parent !== window) {
    window.parent.postMessage(
      {
        type: "INTIP_NAVIGATE",
        url,
      },
      "*"
    );
    return;
  }

  // 3. Fallback standalone web
  if (url.startsWith("http://") || url.startsWith("https://")) {
    window.open(url, "_blank", "noopener,noreferrer");
  } else {
    const portalBase = import.meta.env.VITE_PORTAL_WEB_URL || "https://intip-test.pages.dev";
    window.location.href = `${portalBase}${url.startsWith("/") ? "" : "/"}${url}`;
  }
}

