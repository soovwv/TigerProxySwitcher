// background.js

// 확장 프로그램이 처음 설치되거나 업데이트될 때 실행
chrome.runtime.onInstalled.addListener(() => {
  // 초기 상태를 'direct'로 설정
  updateProxyState({ mode: 'direct' });
});

// 브라우저가 시작될 때 현재 프록시 상태에 맞게 아이콘/배지 업데이트
chrome.runtime.onStartup.addListener(() => {
  chrome.proxy.settings.get({ incognito: false }, (details) => {
    updateProxyState({ mode: details.value.mode });
  });
});

// popup.js로부터 메시지를 수신
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "applyProxy") {
    updateProxyState(request.config);
  }
  return true; // 비동기 응답을 위해 true 반환
});

// 프록시 상태 설정과 UI(아이콘, 배지) 업데이트를 모두 처리하는 함수
function updateProxyState(config) {
  let proxyConfig;
  let iconPath;

  const baseIconPath = "icons/icon16.png"; // 모든 상태에서 기본 아이콘은 동일

  chrome.action.setIcon({ path: baseIconPath }, () => {
    if (chrome.runtime.lastError) {
      console.error("Icon setting error:", chrome.runtime.lastError.message);
    }
  });

  switch (config.mode) {
    case 'direct':
      proxyConfig = { mode: 'direct' };
      chrome.action.setBadgeText({ text: "OFF" });
      chrome.action.setBadgeBackgroundColor({ color: "#6c757d" });
      break;
    case 'system':
      proxyConfig = { mode: 'system' };
      chrome.action.setBadgeText({ text: "OFF" });
      chrome.action.setBadgeBackgroundColor({ color: "#6c757d" });
      break;
    case 'fixed_servers':
      if (config.profile) {
        proxyConfig = {
          mode: "fixed_servers",
          rules: {
            singleProxy: {
              scheme: "http",
              host: config.profile.host,
              port: config.profile.port
            },
            bypassList: ["<local>"]
          }
        };
        chrome.action.setBadgeText({ text: "" }); // 프로필 사용 중에는 배지 없음
      }
      break;
    default:
      console.error("Invalid proxy config mode:", config.mode);
      return;
  }

  if (proxyConfig) {
    chrome.proxy.settings.set({ value: proxyConfig, scope: 'regular' }, () => {
      if (chrome.runtime.lastError) {
        console.error("Proxy setting failed:", chrome.runtime.lastError.message);
        // 프록시 설정 자체에 실패했을 경우 에러 배지 표시
        chrome.action.setBadgeText({ text: "ERR" });
        chrome.action.setBadgeBackgroundColor({ color: "#dc3545" });
      }
    });
  }
}