/**
 * Handles navigation inside INTIP Web (iframe parent) or React Native WebView.
 */

/**
 * 모바일 앱(React Native) 웹뷰 환경 또는 앱 컨텍스트 여부 확인
 */
export function isMobileAppEnvironment(clientContext?: Record<string, any>): boolean {
  if (typeof window === "undefined") return false;
  if ((window as any).ReactNativeWebView) return true;
  if (clientContext?.isApp === true) return true;
  if (new URLSearchParams(window.location.search).get("isApp") === "true") return true;
  return false;
}

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

  // 2. Embedded in Portal Web iframe (postMessage to parent window)
  // 인팁 앱/웹의 iframe 안에서 렌더링될 때는 부모 윈도우로 INTIP_NAVIGATE를 전달하여 부모 라우터가 페이지 이동을 수행
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

  // 3. Standalone Mobile App React Native WebView Bridge (단독 웹뷰 환경)
  if ((window as any).ReactNativeWebView) {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      (window as any).ReactNativeWebView.postMessage(
        JSON.stringify({
          type: "openUrl",
          payload: { url },
        })
      );
    } else {
      (window as any).ReactNativeWebView.postMessage(
        JSON.stringify({
          type: "navigateTo",
          payload: { path: url, url },
        })
      );
    }
    (window as any).ReactNativeWebView.postMessage(
      JSON.stringify({
        type: "NAVIGATE",
        url,
      })
    );
    return;
  }

  // 4. Fallback standalone web: open in new tab so user keeps their chat session intact
  if (url.startsWith("http://") || url.startsWith("https://")) {
    window.open(url, "_blank", "noopener,noreferrer");
  } else {
    const portalBase = (import.meta.env.VITE_PORTAL_WEB_URL || "https://intip.inuappcenter.kr").replace(/\/$/, "");
    const targetPath = url.startsWith("/") ? url : `/${url}`;
    window.open(`${portalBase}${targetPath}`, "_blank", "noopener,noreferrer");
  }
}

