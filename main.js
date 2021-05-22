const {
  app,
  BrowserWindow,
  Menu,
  Tray,
  Notification,
  nativeImage,
  ipcMain,
  shell,
} = require("electron");
const path = require("path");
const {
  FULLSCREEN_BREAK,
  CLOSE_BREAK,
  NOTIFY_BREAK_STARTING,
  SNOOZE,
} = require("./common");

let win; /* InstanceType<BrowserWindow> | undefined */
let tray; /* InstanceType<Tray> | undefined */
let notification; /* InstanceType<Notification> | undefined */
let aboutWindow; /* InstanceType<BrowserWindow> | undefined */

const appIcon = nativeImage.createFromPath("./assets/MyIcon.iconset/icon_512x512.png");

const showSnoozeNotification = (count, unit) => {
  const snoozeNotification = new Notification({
    title: "Snooze for now",
    body:
      unit === "day"
        ? `Your Mac will not take a break till tomorrow`
        : `Your Mac's next break is in ${count} ${unit}`,
    icon: appIcon,
    silent: true,
  });
  snoozeNotification.show();
};

const dispatchSnoozeAction = (count, unit) => {
  switch (unit) {
    case "minutes": {
      win.webContents.send(SNOOZE, count * 1000);
      break;
    }
    case "hour":
    case "hours": {
      win.webContents.send(SNOOZE, count * 60 * 1000);
      break;
    }
    case "day": {
      const endOfDay = new Date().setHours(23, 59, 59);
      win.webContents.send(SNOOZE, endOfDay - new Date().getTime());
      break;
    }
  }
};

const snoozeMenuTemplate = (
  count,
  unit /*: 'minutes' | 'hour' | 'hours' | 'day' */
) => {
  return {
    label: `Snooze for ${count} ${unit}`,
    click: () => {
      dispatchSnoozeAction(count, unit);
      showSnoozeNotification(count, unit);
    },
  };
};

const createSystemTray = (options = {}) => {
  const { hideSnooze } = options;
  tray = tray || new Tray("./assets/TrayIconTemplate.png");

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "About H!MMIAI",
      click: () => {
        if (aboutWindow) {
          aboutWindow.show();
        } else {
          createAboutWindow();
        }
      },
    },
    {
      type: "separator",
    },
    {
      ...snoozeMenuTemplate(30, "minutes"),
      enabled: !hideSnooze,
    },
    {
      ...snoozeMenuTemplate(1, "hour"),
      enabled: !hideSnooze,
    },
    {
      ...snoozeMenuTemplate(2, "hours"),
      enabled: !hideSnooze,
    },
    {
      ...snoozeMenuTemplate(1, "day"),
      enabled: !hideSnooze,
    },
    {
      type: "separator",
    },
    {
      label: "Quit",
      accelerator: "Command+Q",
      click: () => {
        if (win) win.destroy();
        if (aboutWindow) aboutWindow.destroy();
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
};

const createWindow = () => {
  win = new BrowserWindow({
    backgroundColor: "#24252D", // --gray
    titleBarStyle: "hidden",
    webPreferences: {
      devTools: false,
      preload: path.join(__dirname, "preload.js"),
    },
    show: false,
    frame: false,
    resizable: false,
    closable: false,
  });
  win.setWindowButtonVisibility(false);
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  win.loadFile("index.html");
};

const createAboutWindow = () => {
  aboutWindow = new BrowserWindow({
    backgroundColor: "#24252D", // --gray
    titleBarStyle: "hidden",
    show: false,
    width: 500,
    height: 250,
    frame: false,
    resizable: false,
    minimizable: false,
    fullscreenable: false,
    maximizable: false,
    closable: true,
    autoHideMenuBar: true,
    webPreferences: {
      devTools: false,
    },
  });
  aboutWindow.webContents.setWindowOpenHandler(({ url }) => {
    // open url in a browser and prevent default
    shell.openExternal(url);
    return { action: "deny" };
  });
  aboutWindow.loadFile("about.html");
  aboutWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  aboutWindow.once("ready-to-show", () => {
    aboutWindow.show();
    aboutWindow.setVisibleOnAllWorkspaces(false, { visibleOnFullScreen: true });
  });
  aboutWindow.on("closed", () => {
    aboutWindow = undefined;
  });
};

ipcMain.on(FULLSCREEN_BREAK, () => {
  app.dock.show();
  win.setAlwaysOnTop(true, "screen-saver");
  win.setFullScreen(true);
  createSystemTray({ hideSnooze: true });
  if (!win.isVisible()) {
    win.show();
    win.focus();
  }
});

ipcMain.on(CLOSE_BREAK, () => {
  win.setAlwaysOnTop(false);
  win.setFullScreen(false);
  createSystemTray();
  win.hide();
  app.dock.hide();
});

ipcMain.on(NOTIFY_BREAK_STARTING, () => {
  if (!notification) {
    notification = new Notification({
      title: "It's time for a break",
      body: "Your break is about to start",
      icon: appIcon,
    });
  }
  notification.show();
});

Menu.setApplicationMenu(null); // Suppress placeholder menu from Electron

app.whenReady().then(() => {
  app.dock.setIcon(appIcon);
  app.setActivationPolicy("accessory");
  app.dock.hide();
  createSystemTray();

  createWindow();
  // createAboutWindow();
  require("update-electron-app")({
    updateInterval: "6 hours",
  });
});
