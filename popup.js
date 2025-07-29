// popup.js

document.addEventListener('DOMContentLoaded', () => {
  const profilesContainer = document.getElementById('profilesContainer');
  const optionsButton = document.getElementById('optionsButton');
  const systemProxyButton = document.getElementById('systemProxyButton');
  const directConnectionButton = document.getElementById('directConnectionButton');

  // --- 모든 버튼의 활성 상태를 초기화하는 함수 ---
  function clearAllActiveClasses() {
    document.querySelectorAll('.wrapper .button').forEach(btn => {
      btn.classList.remove('active');
    });
  }

  // --- Event Listeners ---
  optionsButton.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  systemProxyButton.addEventListener('click', (event) => {
    clearAllActiveClasses();
    event.currentTarget.classList.add('active');
    applyProxy({ mode: 'system' });
  });

  directConnectionButton.addEventListener('click', (event) => {
    clearAllActiveClasses();
    event.currentTarget.classList.add('active');
    applyProxy({ mode: 'direct' });
  });

  // --- Main Logic: Display current status ---
  chrome.proxy.settings.get({ incognito: false }, (details) => {
    const currentMode = details.value.mode;
    const currentHost = details.value.rules?.singleProxy?.host;
    const currentPort = details.value.rules?.singleProxy?.port;

    if (currentMode === 'system') systemProxyButton.classList.add('active');
    if (currentMode === 'direct') directConnectionButton.classList.add('active');

    chrome.storage.sync.get({ profiles: [] }, (data) => {
      if (data.profiles.length > 0) {
        data.profiles.forEach(profile => {
          const button = document.createElement('button');
          button.className = 'button';
          button.title = `${profile.host}:${profile.port}`;

          button.innerHTML = '<svg viewBox="0 0 24 24"><path d="M14,15V9H12V15H14M10,15V9H8V15H10M16,1H8C6.89,1 6,1.89 6,3V17A2,2 0 0,0 8,19H16A2,2 0 0,0 18,17V3C18,1.89 17.1,1 16,1Z" /></svg>';
          
          const textSpan = document.createElement('span');
          textSpan.textContent = profile.name;
          
          if (currentMode === 'fixed_servers' && currentHost === profile.host && currentPort === profile.port) {
            button.classList.add('active');
          }
          
          button.appendChild(textSpan);

          // --- UI 즉시 업데이트 로직 추가 ---
          button.addEventListener('click', (event) => {
            clearAllActiveClasses();
            event.currentTarget.classList.add('active');
            applyProxy({ mode: 'fixed_servers', profile: profile });
          });

          profilesContainer.appendChild(button);
        });
      }
    });
  });
});

function applyProxy(config) {
  // background.js에 메시지를 보내고, 성공하면 팝업을 닫음
  chrome.runtime.sendMessage({ action: "applyProxy", config: config }, () => {
    window.close();
  });
}