require('electron-reload')(__dirname, {
  electron: require(`${__dirname}/node_modules/electron`)
});

const { app, BrowserWindow, ipcMain, Menu, session, clipboard, dialog } = require('electron');

const fs = require('fs');

const path = require('path');

let activeDownloads = new Set();

function createWindow()
{
  const win = new BrowserWindow(
    {
      width: 800,
      height: 600,
      frame: false,
      icon: path.join(__dirname, 'src/assets/images/logo.png'),
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        webviewTag: true,
        preload: path.join(__dirname, 'preload.js'),
      }
    }
  );

  // Get the webview element

  // Handle file download
  let downloadCounter = 0;
  const mySession = session.fromPartition('persist:MohsinBrowserProfiles');
  mySession.on('will-download', (event, item, webContents) => {
    const defaultDownloadPath = app.getPath('downloads');
    item.setSavePath(path.join(defaultDownloadPath, item.getFilename()));
    const itemId = ++downloadCounter;

    activeDownloads.add(item);
    const startTime = Date.now();
    item.on('updated', function (event, state) {

      if (state === 'interrupted') {
          console.log('Download is interrupted but can be resumed');
      }else if (state === 'progressing') {

        const receivedBytes = item.getReceivedBytes();
      const elapsed = (Date.now() - startTime) / 1000; // seconds
      let timeRemaining = 0;

      if (receivedBytes > 0 && elapsed > 0) {
        const speed = receivedBytes / elapsed; // bytes per second
        const remainingBytes = item.getTotalBytes() - receivedBytes;
        timeRemaining = remainingBytes / speed; // seconds
      }

        let progress = {
          id: itemId,
          name: item.getFilename(),
          speed: timeRemaining,
          percent: Math.floor((item.getReceivedBytes()/item.getTotalBytes()) * 100),
          recieved: item.getReceivedBytes(),
          total: item.getTotalBytes()
        }
          win.webContents.send('download-progress', progress);
      }
    });

    item.once('done', function(event, state) {


      if (state === 'completed') {
        activeDownloads.delete(item);
      }
    });
  });

  win.webContents.on('did-attach-webview', (event, webContents) => {
    webContents.setWindowOpenHandler(({ url }) => {
      win.webContents.send('new-window-from-webview', url);
      return { action: 'deny' };
    });
  
    webContents.on('context-menu', (event, params) => {
      const { mediaType, linkURL, srcURL, x, y } = params;
      const menuTemplate = [];
  
      if (linkURL) {
        menuTemplate.push(
          {
            label: 'Open Link in New Tab',
            click: () => {
              win.webContents.send('new-window-from-webview', linkURL);
            }
          },
          {
            label: 'Copy Link Address',
            click: () => {
              require('electron').clipboard.writeText(linkURL);
            }
          }
        );
      }

      if (mediaType === 'image') {
        menuTemplate.push(
          {
            label: 'Save Image As...',
            click: () => {
              win.webContents.session.downloadURL(params.srcURL);
            }
          },
          {
            label: 'Copy Image Address',
            click: () => {
              clipboard.writeText(params.srcURL);
            }
          },
          {
            label: 'Open image in new tab',
            click: () => {
              win.webContents.send('new-window-from-webview', params.srcURL);
            }
          }
        );
      }
  
      if (menuTemplate.length === 0) {
        menuTemplate.push(
          {
            label: 'Back',
            enabled: webContents.navigationHistory.canGoBack(),
            click: () => {
              webContents.navigationHistory.goBack();
            }
          },
          {
            label: 'Forward',
            enabled: webContents.navigationHistory.canGoForward(),
            click: () => {
              webContents.navigationHistory.goForward();
            }
          },
          {
            label: 'Reload',
            click: () => {
              webContents.reload();
            }
          },
          {
            type: 'separator'
          }
        );
      }
  
      const menu = Menu.buildFromTemplate(menuTemplate);
      menu.popup({ window: BrowserWindow.fromWebContents(webContents) });
    });
  });

  ipcMain.handle('get-page-info', async (event, url) => {
    return await getPageInfo(url);
  });

  win.on('maximize', () => {
    win.webContents.send('window-maximized', true);
  });
  
  win.on('unmaximize', () => {
    win.webContents.send('window-maximized', false);
  });

  win.loadFile('src/index.html');

  win.on('blur', () =>
    {
      win.webContents.send('window-blur');
    }
  );

  win.on('focus', () =>
    {
      win.webContents.send('window-focus');
    }
  );


  function cancelAllDownloads() {
    for (const item of activeDownloads) {
      try {
        if (!item.isDone()) { 
          console.log("Cancelling active download...");
          item.cancel();
        }
      } catch (error) {
        console.error("Error cancelling download:", error);
      }
    }
    activeDownloads.clear();
  }
  
  // --- Handle app close ---
  app.on('before-quit', () => {
    cancelAllDownloads();
  });

  win.webContents.on('did-attach-webview', (event, webContents) =>
    {
      webContents.setWindowOpenHandler(({ url }) =>
        {
          win.webContents.send('new-window-from-webview', url);
          return { action: 'deny' };
        }
      );
    }
  );
}

app.whenReady().then(() =>
  {
    createWindow();
    app.on('activate', () =>
      {
        if (BrowserWindow.getAllWindows().length === 0)
        {
          createWindow();
        }
      }
    );
  }
);

app.on('window-all-closed', () =>
  {
    if (process.platform !== 'darwin')
    {
      app.quit();
    }
  }
);


ipcMain.on('minimize-window', (event) =>
  {
    const win = BrowserWindow.getFocusedWindow();
    if (win)
    {
      win.minimize();
    }
  }
);

ipcMain.on('maximize-restore-window', (event) =>
  {
    const win = BrowserWindow.getFocusedWindow();
    if (win)
    {
      if (win.isMaximized())
      {
        win.restore();
      } else
      {
        win.maximize();
      }
    }
  }
);

ipcMain.on('close-window', (event) =>
  {
    const win = BrowserWindow.getFocusedWindow();
    if (win)
    {
      win.close();
    }
  }
);

ipcMain.handle('is-window-maximized', (event) =>
  {
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
      return win.isMaximized();
    }
    return false;
  }
);