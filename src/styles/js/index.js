document.addEventListener('DOMContentLoaded', () => {

  const downloadButton = document.getElementById('download-button');
  const dropdownCard = document.getElementById('dropdownCard');
  const bgg = document.getElementById('bgg');
  let isdshow = false;
  let history = JSON.parse(localStorage.getItem('webviewHistory')) || [];
  
  downloadButton.addEventListener('click', (event) => {
    event.stopPropagation(); // Prevent click from reaching document
    isdshow = true;
    dropdownCard.classList.toggle('show');
    bgg.classList.toggle('show');
  });

  var element = document.getElementById('getdata');

if (typeof(element) !== 'undefined' && element !== null) {
  element.src = "https://accounts.google.com/SignOutOptions?hl=en&continue=https://myaccount.google.com/";
  
  element.addEventListener('did-finish-load', async () => {
    const accountInfo = await getAccountInfoFromWebview(element);

    if (accountInfo.exist === "yes") {
      document.getElementById('profileSection').style.display = 'block';
      document.getElementById('profilePic').src = accountInfo.imageSrc;
      document.getElementById('profilePicc').src = accountInfo.imageSrc;
      document.getElementById('name').textContent = accountInfo.name;
      document.getElementById('email').textContent = accountInfo.email;
    } else {
      document.getElementById('profileSection').style.display = 'none';
    }
  });
}

function getAccountInfoFromWebview(webview) {
  return webview.executeJavaScript(`
    (function() {
      const container = document.getElementById('choose-account-0');
      if (!container) return { exist: "no" };

      const nameSpan = container.querySelector('.account-name');
      const emailSpan = container.querySelector('.account-email');
      const image = container.querySelector('.account-image');

      return {
        exist: "yes",
        name: nameSpan && nameSpan.tagName.toLowerCase() === 'span' ? nameSpan.innerText.trim() : null,
        email: emailSpan && emailSpan.tagName.toLowerCase() === 'span' ? emailSpan.innerText.trim() : null,
        imageSrc: image && image.tagName.toLowerCase() === 'img' ? image.src : null
      };
    })();
  `);
}

const profileButton = document.getElementById('profile-button');
  const pdropdownCard = document.getElementById('pdropdownCard');
  
  profileButton.addEventListener('click', (event) => {
    event.stopPropagation(); // Prevent click from reaching document
    pdropdownCard.classList.toggle('show');
    bgg.classList.toggle('show');
  });

  const historyButton = document.getElementById('history-button');
  const hdropdownCard = document.getElementById('hdropdownCard');
  
  historyButton.addEventListener('click', (event) => {
    event.stopPropagation(); // Prevent click from reaching document
    hdropdownCard.classList.toggle('show');
    bgg.classList.toggle('show');
    renderHistory();
  });
  
  bgg.addEventListener('click', (event) => {
    if (!dropdownCard.contains(event.target) && !downloadButton.contains(event.target)) {
      dropdownCard.classList.remove('show');
      bgg.classList.remove('show');
    }
    if (!pdropdownCard.contains(event.target) && !profileButton.contains(event.target)) {
      pdropdownCard.classList.remove('show');
      bgg.classList.remove('show');
    }
    if (!hdropdownCard.contains(event.target) && !historyButton.contains(event.target)) {
      hdropdownCard.classList.remove('show');
      bgg.classList.remove('show');
    }
  });

  document.addEventListener('click', (event) => {
    if (!dropdownCard.contains(event.target) && !downloadButton.contains(event.target)) {
      dropdownCard.classList.remove('show');
      bgg.classList.remove('show');
    }
    if (!pdropdownCard.contains(event.target) && !profileButton.contains(event.target)) {
      pdropdownCard.classList.remove('show');
      bgg.classList.remove('show');
    }
  });

  document.getElementById('manage-account').addEventListener('click', (event) => {
    createNewTab("https://accounts.google.com/ManageAccount?authuser=0", true);
    pdropdownCard.classList.remove('show');
        bgg.classList.remove('show');
  });

  document.getElementById('signout-account').addEventListener('click', (event) => {
    element.src = 'https://accounts.google.com/Logout';
    pdropdownCard.classList.remove('show');
        bgg.classList.remove('show');

    document.getElementById('profileSection').style.display = 'none';
  });


  
  // window control title bar actions

  const minimizeButton = document.getElementById('minimize-button');
  const maximizeButton = document.getElementById('maximize-button');
  const closeButton = document.getElementById('close-button');
  const controlButtons = document.querySelectorAll('.control-button');

  var maximizeIcon = `<svg width="27" height="27" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 5V4C7 2.34315 8.34315 1 10 1H23C24.6569 1 26 2.34315 26 4V17C26 18.6569 24.6569 20 23 20H22" stroke="white" stroke-width="2"/>
    <rect x="1" y="5" width="21" height="21" rx="3" stroke="white" stroke-width="2"/>
  </svg>`;
  var restoreIcon = `<svg width="27" height="27" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="25" height="25" rx="3" stroke="white" stroke-width="2"/>
  </svg>`;

  minimizeButton.addEventListener('click', () => {
    window.electronAPI.minimize();
  });

  maximizeButton.addEventListener('click', () => {
    window.electronAPI.maximize();
  });

  closeButton.addEventListener('click', () => {
    window.electronAPI.close();
  });

  window.electronAPI.onWindowBlur((event) => {
    controlButtons.forEach(btn => btn.classList.add('blur'));
  });

  window.electronAPI.onWindowFocus((event) => {
    controlButtons.forEach(btn => btn.classList.remove('blur'));
  });

  window.electronAPI.onWindowMaximizeChange((isMaximized) => {
    if(isMaximized) {
      maximizeButton.innerHTML = maximizeIcon;
    }
    else {
      maximizeButton.innerHTML = restoreIcon;
    }
  });

  window.electronAPI.onDownloadProgress((progress) => {
    if(!(dropdownCard.classList.contains('show')) && isdshow == false)
    {
      dropdownCard.classList.toggle('show');
      bgg.classList.toggle('show');
      isdshow = true;
    }
    // Extract the download progress information
    const { id: itemId, percent, recieved, total, speed, name } = progress;
  
    // Check if the download section already exists, create it if not
    let downloadSection = document.getElementById(`download-section-${itemId}`);
    if (!downloadSection) {
      // Create a new div for the download section if it doesn't exist
      downloadSection = document.createElement('div');
      downloadSection.id = `download-section-${itemId}`;
      downloadSection.classList.add('download-section');
      
      // Create the download status paragraph
      const downloadStatus = document.createElement('p');
      downloadStatus.id = `status-${itemId}`;
      downloadStatus.textContent = `${name}`;
      downloadSection.appendChild(downloadStatus);
      
      // Create the progress bar
      const progressBar = document.createElement('progress');
      progressBar.id = `progress-bar-${itemId}`;
      progressBar.value = 0;
      progressBar.max = 100;
      downloadSection.appendChild(progressBar);
      
      // Create the download info paragraph
      const downloadInfo = document.createElement('p');
      downloadInfo.id = `download-info-${itemId}`;
      downloadInfo.textContent = `0% - 0KB / 0KB`;
      downloadSection.appendChild(downloadInfo);
  
      // Append to the parent container
      document.getElementById('download-progress').appendChild(downloadSection);
    }
  
    // Update the progress bar and information for the download
    const progressBar = document.getElementById(`progress-bar-${itemId}`);
    const downloadInfo = document.getElementById(`download-info-${itemId}`);
    const statusText = document.getElementById(`status-${itemId}`);
  
    if (progressBar && downloadInfo && statusText) {
      // Update the progress bar with the new percentage
      progressBar.value = percent;
  
      // Update the download information with the new received and total size
      downloadInfo.textContent = `${percent}% - ${formatBytes(recieved)} / ${formatBytes(total)} - ${formatTimeRemaining(speed)}`;
  
      // Update the status text
      statusText.textContent = `${name}`;
    }
  });

  function formatTimeRemaining(seconds) {
    seconds = Math.round(seconds);
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
  
    if (h > 0) return `${h}h ${m}min ${s}s`;
    if (m > 0) return `${m}min ${s}s`;
    return `${s}s`;
  }
  
  // Helper function for formatting bytes (KB, MB, GB)
  function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    return `${(mb / 1024).toFixed(1)} GB`;
  }
  
  

  const urlInput = document.getElementById('url-input');

  var currentActiveUrl;
  var currentActivePrettyUrl;

  function getPrettyUrl(url) {
    try {
      const urlObj = new URL(url);
      let host = urlObj.hostname.replace(/^www\./, ''); // remove www.
      let path = urlObj.pathname + urlObj.search + urlObj.hash;
      
      // Remove trailing slash from path if it exists
      if (path.endsWith('/')) {
        path = path.slice(0, -1);
      }
      currentActivePrettyUrl = host + path;
      return currentActivePrettyUrl;
    } catch (e) {
      return '';
    }
  }

  urlInput.addEventListener('keydown', (event) => {
    const suggestionsBox = document.getElementById('suggestions');
    const items = suggestionsBox.querySelectorAll('li');
    if (event.key === 'Enter') {
      var input;
      if(suggestionsBox.style.display == 'block')
      {
        const selectedText = items[currentFocusIndex].querySelector('span').textContent;
        urlInput.value = selectedText;
        suggestionsBox.style.display = 'none';
        input = selectedText;

      }
      else
      {
        input = urlInput.value.trim();
      }
  
      if (!input) return;
  
      var targetUrl;
      if (input.startsWith('data:image/'))
      {
        targetUrl = input;
      }
      else
      {
        const isProbablyUrl = input.includes('.') || input.startsWith('http');
  
        if (!input.startsWith('http://') && !input.startsWith('https://') && isProbablyUrl) {
          input = 'https://' + input;
        }

        targetUrl = isProbablyUrl ? input : `https://www.google.com/search?q=${encodeURIComponent(input)}`;
      }
  
      const activeWebview = document.querySelector('webview.active');
      if (activeWebview) {
        activeWebview.loadURL(targetUrl);
        urlInput.blur();
      }
    }
    else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      if (event.key === 'ArrowDown') {
        currentFocusIndex = (currentFocusIndex + 1) % items.length;
        highlightSuggestion(currentFocusIndex);
      } else if (event.key === 'ArrowUp') {
        currentFocusIndex = (currentFocusIndex - 1 + items.length) % items.length;
        highlightSuggestion(currentFocusIndex);
      }
    }
  }); 
  
  function highlightSuggestion(index) {
    const suggestionsBox = document.getElementById('suggestions');
    const items = suggestionsBox.querySelectorAll('li');
  
    items.forEach((item, i) => {
      item.style.background = i === index ? '#3a3a3a' : ''; // Highlight selected
    });
  
    currentFocusIndex = index;
  }
  
  

  // When the input field is focused, show the full URL
  urlInput.addEventListener('focus', function() {
    urlInput.value = currentActiveUrl
  });

  // When the input field is blurred, show only the domain name
  urlInput.addEventListener('blur', function() {
    const currentUrl = urlInput.value;
    if (currentUrl) {
      if (currentUrl.includes(urlInput.value)) {
        const domain = getPrettyUrl(currentUrl);
        urlInput.value = domain ? domain : currentUrl;
      }
      
    }
  });

  // Create new tab function
  function createNewTab(url = 'https://www.google.com', fromPopup = false) {
    const Webviewid = Date.now();
  
    // 1. Create Webview
    const webviewHTML = `
      <webview id="webview${Webviewid}" partition="persist:MohsinBrowserProfiles" allowpopups src="${url}" class="webview"></webview>
    `;
  
    if (fromPopup) {
      const activeWebview = document.querySelector('webview.active');
      if (activeWebview) {
        activeWebview.insertAdjacentHTML('afterend', webviewHTML);
      } else {
        document.querySelector('.content').insertAdjacentHTML('beforeend', webviewHTML);
      }
    } else {
      document.querySelector('.content').insertAdjacentHTML('beforeend', webviewHTML);
    }
  
    const webview = document.getElementById('webview' + Webviewid);
  
    webview.addEventListener('dom-ready', () => {
      webview.insertCSS(`
        ::-webkit-scrollbar {
          width: 16px;
        }
        ::-webkit-scrollbar-track {
          background: #212121;
          border-left: 1.5px solid #303030;
        }
        ::-webkit-scrollbar-thumb {
          border-radius: 8px;
          border: 4px solid transparent;
          background-clip: content-box;
          background-color: #9F9F9F;
        }
      `);
    });
  
    webview.addEventListener('did-fail-load', (e) => {
      if (e.errorCode === -21) {
        console.log('Network changed while loading:', e.validatedURL);
        setTimeout(() => {
          webview.reload();
        }, 2000);
      } else {
        console.error('Some other error:', e.errorDescription);
      }
    });
  
    // 2. Create Tab
    const tabHTML = `
      <div id="tab${Webviewid}" data-id="${Webviewid}" class="tab">
      <div class="wrapper" id="loaderWrapper">
    <div class="loader"></div>
    <img src="assets/images/placeholder_logo.png" class="image" width="20" height="20">
  </div>
        <div class="blur-container">
          <p>Loading...</p>
          <div class="blur-fade-overlay"></div>
        </div>
        <button class="close-tab" data-id="${Webviewid}">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 19L19 1.32233" stroke="white" stroke-width="2" stroke-linecap="round"/>
            <path d="M1 1L19 18.6777" stroke="white" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    `;
  
    if (fromPopup) {
      const activeTab = document.querySelector('.tab.active');
      if (activeTab) {
        activeTab.insertAdjacentHTML('afterend', tabHTML);
      } else {
        document.getElementById('tabs-list').insertAdjacentHTML('beforeend', tabHTML);
      }
    } else {
      const tabsList = document.getElementById('tabs-list');
const addButton = document.getElementById('add-tab-button');
tabsList.insertBefore(createElementFromHTML(tabHTML), addButton);
    }

    function createElementFromHTML(htmlString) {
      const div = document.createElement('div');
      div.innerHTML = htmlString.trim();
      return div.firstChild;
    }
  
    const tab = document.getElementById('tab' + Webviewid);
  
    // ❗ Now remove active class from others and set this one active
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('webview').forEach(wv => wv.classList.remove('active'));
    tab.classList.add('active');
    webview.classList.add('active');
    currentActiveUrl = url;
    document.getElementById('url-input').value = getPrettyUrl(currentActiveUrl);
  
    // 3. Function to update tab title and favicon
    async function updateTabInfo(currentUrl) {
      tab.querySelector('p').textContent = webview.getTitle();
      const img = tab.querySelector('img');
      if (currentUrl.startsWith('data:image/'))
      {
        img.src = 'assets/images/placeholder_logo.png';
      }
      else
      {
        img.src = `https://www.google.com/s2/favicons?sz=64&domain_url=${currentUrl}`;
      }

      img.addEventListener("error", (e) => {
        img.src = 'assets/images/placeholder_logo.png';
      });
    }

    webview.addEventListener("did-start-loading", () => {
      const wrapper = document.querySelector('.tab.active .wrapper');
      if (wrapper) {
        wrapper.classList.remove('loaded');
      }
    });
    
    webview.addEventListener("did-stop-loading", () => {
      const wrapper = document.querySelector('.tab.active .wrapper');
      if (wrapper) {
        wrapper.classList.add('loaded');
      }
    });
    
    webview.addEventListener("did-fail-load", (e) => {
      const wrapper = document.querySelector('.tab.active .wrapper');
      if (wrapper) {
        wrapper.classList.add('loaded');
      }
    });
    
  
    webview.addEventListener('did-navigate', (e) => {
      updateTabInfo(e.url);
      currentActiveUrl = e.url;
      document.getElementById('url-input').value = getPrettyUrl(currentActiveUrl);
      updateNavButtons();
    });
  
    webview.addEventListener('did-navigate-in-page', (e) => {
      updateTabInfo(e.url);
      currentActiveUrl = e.url;
      const entry = {
        url: e.url,
        title: webview.getTitle(),
        timestamp: new Date().toISOString()
      };
      trackHistory(entry);
      document.getElementById('url-input').value = getPrettyUrl(currentActiveUrl);
    });
  
    webview.addEventListener('did-finish-load', () => {
      updateTabInfo(webview.getURL());
      currentActiveUrl = e.url;
      document.getElementById('url-input').value = getPrettyUrl(currentActiveUrl);
    });
  }
  


  function trackHistory(entry) {
    history.push(entry);
          localStorage.setItem('webviewHistory', JSON.stringify(history));
          console.log('History updated:', entry);
  }

  function renderHistory() {
    const historyDiv = document.getElementById('history');
    historyDiv.innerHTML = ''; // Clear all existing elements

    var savedHistoryr = JSON.parse(localStorage.getItem('webviewHistory')) || [];
  
    var savedHistory = savedHistoryr.reverse();
  
    if (savedHistory.length === 0) {
      historyDiv.textContent = 'No history available.';
      return;
    }
  
    savedHistory.forEach(entry => {
      const entryDiv = document.createElement('div');
      entryDiv.style.marginBottom = '10px';
  
      const titleEl = document.createElement('div');
      titleEl.textContent = `Title: ${entry.title}`;
      titleEl.style.fontWeight = 'bold';
  
      const urlEl = document.createElement('div');
      urlEl.textContent = `URL: ${entry.url}`;
  
      const timeEl = document.createElement('div');
      timeEl.textContent = `Time: ${new Date(entry.timestamp).toLocaleString()}`;
  
      entryDiv.appendChild(titleEl);
      entryDiv.appendChild(urlEl);
      entryDiv.appendChild(timeEl);
  
      historyDiv.appendChild(entryDiv);
    });
  }  
  
  
  

  // Now you can call createNewTab() anywhere!

  // Open two tabs immediately
  createNewTab('https://www.google.com');

  // 3. Setup events (same)
  document.getElementById('tabs-list').addEventListener('click', (e) => {
    const tab = e.target.closest('.tab');

    if (tab && !e.target.closest('button')) {
      const id = tab.getAttribute('data-id');
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.webview').forEach(wv => wv.classList.remove('active'));
      const webview = document.getElementById('webview' + id);
      if (webview)
      {
        webview.classList.add('active');
        currentActiveUrl = webview.getURL();
        document.getElementById('url-input').value = getPrettyUrl(currentActiveUrl);
        updateNavButtons();
      }
    }

    const closeButton = e.target.closest('button.close-tab');
    if (closeButton) {
      const id = closeButton.getAttribute('data-id');
      const tab = document.getElementById('tab' + id);
      const webview = document.getElementById('webview' + id);

      const isActive = tab.classList.contains('active');

      let nextTab = tab.nextElementSibling;
      let previousTab = tab.previousElementSibling;

      if (nextTab && !nextTab.classList.contains('tab')) {
        nextTab = null;
      }
      
      if (previousTab && !previousTab.classList.contains('tab')) {
        previousTab = null;
      }

      if (tab) tab.remove();
      if (webview) webview.remove();

      const remainingTabs = document.querySelectorAll('.tab').length;

      if (remainingTabs === 0) {
        window.electronAPI.close();
        return;
      }

      if (isActive) {
        let tabToActivate = nextTab || previousTab;
        if (tabToActivate) {
          const newId = tabToActivate.getAttribute('data-id');
          tabToActivate.classList.add('active');
          const newWebview = document.getElementById('webview' + newId);
          if (newWebview)
          {
            newWebview.classList.add('active');
            currentActiveUrl = newWebview.getURL();
            document.getElementById('url-input').value = getPrettyUrl(currentActiveUrl);
            updateNavButtons();
          }

        }
      }
    }
  });

  const webview = document.querySelector('webview.active');

  if (webview) {
    webview.addEventListener('did-navigate', () => {
      currentActiveUrl = newWebview.getURL();
      document.getElementById('url-input').value = getPrettyUrl(currentActiveUrl);
      updateNavButtons();
    });
    webview.addEventListener('did-navigate-in-page', () => {
      currentActiveUrl = newWebview.getURL();
      document.getElementById('url-input').value = getPrettyUrl(currentActiveUrl);
      updateNavButtons();
    });
    webview.addEventListener('did-finish-load', () => {
      currentActiveUrl = newWebview.getURL();
      document.getElementById('url-input').value = getPrettyUrl(currentActiveUrl);
      updateNavButtons();
    });
  }

  // New tab when external window attempt
  window.electronAPI.onWebviewWindowAttempt((url) => {
    createNewTab(url, true);
  });

  document.getElementById('add-tab-button').addEventListener('click', () => {
    createNewTab('https://www.google.com');
  });

  document.getElementById('back-button').addEventListener('click', () => {
    const webview5 = document.querySelector('webview.active');
    if (webview5.canGoBack()) {
      webview5.goBack();
    }
    updateNavButtons()
  });

  document.getElementById('next-button').addEventListener('click', () => {
    const webview4 = document.querySelector('webview.active');
    if (webview4.canGoForward()) {
      webview4.goForward();
    }
    updateNavButtons()
  });

  document.getElementById('reload-button').addEventListener('click', () => {
    const webview3 = document.querySelector('webview.active');
    webview3.reload();
  });

  function updateNavButtons() {
    const webview2 = document.querySelector('webview.active');
    if (!webview2.canGoBack()) {
      document.getElementById('back-button').classList.add('block');
    }
    else
    {
      document.getElementById('back-button').classList.remove('block');
    }

    if (!webview2.canGoForward()) {
      document.getElementById('next-button').classList.add('block');
    }
    else
    {
      document.getElementById('next-button').classList.remove('block');
    }
    
  }

  updateNavButtons();


});