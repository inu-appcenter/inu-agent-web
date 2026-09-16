/**
 * Handles navigation inside INTIP Web (iframe parent) or React Native WebView.
 */
/**
 * Handles navigation inside INTIP Web (iframe parent) or React Native WebView.
 */
export function handleAppNavigation(url?: string) {
  if (!url) return;

  // 1. 전화걸기(tel:) 및 메일(mailto:) 스키마 처리
  if (url.startsWith("tel:") || url.startsWith("mailto:")) {
    if ((window as any).ReactNativeWebView) {
      (window as any).ReactNativeWebView.postMessage(
        JSON.stringify({
          type: "openUrl",
          payload: { url },
        })
      );
      (window as any).ReactNativeWebView.postMessage(
        JSON.stringify({
          type: "NAVIGATE",
          url,
        })
      );
    }
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(
        {
          type: "INTIP_NAVIGATE",
          url,
        },
        "*"
      );
    }
    window.location.href = url;
    return;
  }

  // 2. Mobile App React Native WebView Bridge
  if ((window as any).ReactNativeWebView) {
    (window as any).ReactNativeWebView.postMessage(
      JSON.stringify({
        type: "openUrl",
        payload: { url },
      })
    );
    (window as any).ReactNativeWebView.postMessage(
      JSON.stringify({
        type: "navigateTo",
        payload: { path: url, url },
      })
    );
    (window as any).ReactNativeWebView.postMessage(
      JSON.stringify({
        type: "NAVIGATE",
        url,
      })
    );
    return;
  }

  // 3. Embedded in Portal Web iframe (postMessage to parent window)
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

  // 4. Fallback standalone web: open in new tab so user keeps their chat session intact
  if (url.startsWith("http://") || url.startsWith("https://")) {
    window.open(url, "_blank", "noopener,noreferrer");
  } else {
    const portalBase = import.meta.env.VITE_PORTAL_WEB_URL || "https://intip-test.pages.dev";
    window.open(`${portalBase}${url.startsWith("/") ? "" : "/"}${url}`, "_blank", "noopener,noreferrer");
  }
}

