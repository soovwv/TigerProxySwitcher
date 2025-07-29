const nameInput = document.getElementById('profileName');
const hostInput = document.getElementById('proxyHost');
const portInput = document.getElementById('proxyPort');
const saveButton = document.getElementById('saveProfile');
const profilesListDiv = document.getElementById('profilesList');

function loadProfiles() {
  chrome.storage.sync.get({ profiles: [] }, (data) => {
    profilesListDiv.innerHTML = ''; // Clear previous list
    if (data.profiles.length === 0) {
      profilesListDiv.innerHTML = '<h3 style="color:red">No profiles saved yet.</h3>';
      return;
    }

    data.profiles.forEach((profile, index) => {
      const profileItem = document.createElement('div');
      profileItem.className = 'profile-item';

      const profileInfo = document.createElement('div');
      profileInfo.className = 'profile-item-info';
      
      // --- XSS Patch START ---
      // Create elements manually and use .textContent to prevent XSS
      const strongEl = document.createElement('strong');
      strongEl.textContent = profile.name; // Safely sets the profile name as TEXT

      const spanEl = document.createElement('span');
      spanEl.textContent = `${profile.host}:${profile.port}`;

      profileInfo.appendChild(strongEl);
      profileInfo.appendChild(spanEl);
      // --- XSS Patch END ---
      
      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.className = 'delete-button';
      deleteButton.onclick = () => deleteProfile(index);
      
      profileItem.appendChild(profileInfo);
      profileItem.appendChild(deleteButton);
      profilesListDiv.appendChild(profileItem);
    });
  });
}

saveButton.addEventListener('click', () => {
  const port = parseInt(portInput.value, 10);

  // --- 입력값 검증 로직 추가 ---
  if (!nameInput.value || !hostInput.value) {
    alert('Please fill all fields.');
    return;
  }
  if (isNaN(port) || port < 1 || port > 65535) {
    alert('Please enter a valid port number (1-65535).');
    return;
  }

  const newProfile = {
    name: nameInput.value,
    host: hostInput.value,
    port: port // 이미 파싱된 값을 사용
  };

  chrome.storage.sync.get({ profiles: [] }, (data) => {
    const profiles = data.profiles;
    profiles.push(newProfile);
    chrome.storage.sync.set({ profiles }, () => {
      nameInput.value = '';
      hostInput.value = '';
      portInput.value = '';
      loadProfiles();
    });
  });
});

function deleteProfile(index) {
  chrome.storage.sync.get({ profiles: [] }, (data) => {
    const profiles = data.profiles;
    profiles.splice(index, 1);
    chrome.storage.sync.set({ profiles }, loadProfiles);
  });
}

document.addEventListener('DOMContentLoaded', loadProfiles);