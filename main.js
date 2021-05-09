const { app, BrowserWindow, Menu, Tray, Notification, nativeImage, ipcMain } = require("electron");
const path = require("path");
const { FULLSCREEN_BREAK, CLOSE_BREAK, NOTIFY_BREAK_STARTING } = require("./common");

let win; /* InstanceType<BrowserWindow> | null */
let tray; /* InstanceType<Tray> | null */
let notification; /* InstanceType<Notification> */

const notificationImage = nativeImage.createFromPath('./assets/Original.png')

const createSystemTray = () => {
  tray = new Tray("./assets/TrayIconTemplate.png");

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Quit",
      click: function () {
        win.destroy();
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
};

const createWindow = () => {
  win = new BrowserWindow({
    backgroundColor: "rgb(36, 37, 45)", // --gray
    titleBarStyle: "hidden",
    webPreferences: {
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, "preload.js"),
    },
    show: false,
    frame: false,
  });
  win.setResizable(false);
  win.setWindowButtonVisibility(false);
  win.setVisibleOnAllWorkspaces(true);
  win.setClosable(false);
  win.loadFile("index.html");
};

ipcMain.on(FULLSCREEN_BREAK, () => {
  app.dock.show();
  win.setAlwaysOnTop(true, "screen-saver");
  win.setFullScreen(true);
  if (!win.isVisible()) {
    win.show();
    win.focus();
  }
});

ipcMain.on(CLOSE_BREAK, () => {
  win.setAlwaysOnTop(false);
  win.setFullScreen(false);
  win.hide();
  app.dock.hide();
});

ipcMain.on(NOTIFY_BREAK_STARTING, () => {
  notification ||= new Notification({
    title: "It's time for a break",
    body: "Your break is about to start",
    icon: notificationImage
  })
  notification.show()
})

app.setActivationPolicy("accessory");
app.dock.hide();

app.whenReady().then(() => {
  createWindow();
  createSystemTray();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
