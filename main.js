const {
  app,
  BrowserWindow,
  Menu,
  Tray,
  Notification,
  nativeImage,
  ipcMain,
} = require("electron");
const path = require("path");
const {
  FULLSCREEN_BREAK,
  CLOSE_BREAK,
  NOTIFY_BREAK_STARTING,
  SNOOZE,
} = require("./common");

let win; /* InstanceType<BrowserWindow> | null */
let tray; /* InstanceType<Tray> | null */
let notification; /* InstanceType<Notification> */

const notificationImage = nativeImage.createFromPath("./assets/Original.png");

const showSnoozeNotification = (count, unit) => {
  const snoozeNotification = new Notification({
    title: "Snooze for now",
    body: `Next break in ${count} ${unit}`,
    icon: notificationImage,
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
      const endOfDay = new Date().setHours(23, 59, 59, 999);
      win.webContents.send(SNOOZE, endOfDay.getTime() - new Date().getTime());
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
      click: () => {
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
      icon: notificationImage,
    });
  }
  notification.show();
});

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
