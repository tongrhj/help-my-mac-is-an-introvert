const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { FULLSCREEN_BREAK, CLOSE_BREAK } = require("./common");

let win; /* BrowserWindow | null */
// let tray /* Tray | null */

// const createSystemTray = () => {
// 	tray = new Tray(trayIcon);

// 	tray.setToolTip(trayTooltip);
// 	tray.setContextMenu(contextMenu);

// 	tray?.on("click", () => {
// 		if (!win?.isVisible()) {
// 			win?.show();
// 		} else {
// 			if (!win?.isFullScreen()) {
// 				win?.hide();
// 			}
// 		}
// 	});
// }

const createWindow = () => {
  win = new BrowserWindow({
    show: false,
    backgroundColor: "rgb(36, 37, 45)", // --gray
    webPreferences: {
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.setResizable(false);

  win.on("minimize", () => {
    win.hide();
  });

  win.on("close", () => {
    win.hide();
  });

  win.once("ready-to-show", () => {
    win.show();
  });

  win.loadFile("index.html");
};

ipcMain.on(FULLSCREEN_BREAK, () => {
  if (!win.isVisible()) {
    win.show();
    win.focus();
  }
  win.setAlwaysOnTop(true, "screen-saver");
  win.setSkipTaskbar(true);
  win.setFullScreen(true);
  win.setFullScreenable(false);
  win.setVisibleOnAllWorkspaces(true);
  win.setClosable(false);
});

ipcMain.on(CLOSE_BREAK, () => {
  win.setAlwaysOnTop(false, "screen-saver");
  win.setSkipTaskbar(false);
  win.setFullScreen(false);
  win.setFullScreenable(true);
  win.setVisibleOnAllWorkspaces(false);
  win.setClosable(true);
  win.hide();
});

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
