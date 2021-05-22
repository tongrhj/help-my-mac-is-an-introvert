const channels = require("./common");
const { contextBridge, ipcRenderer } = require("electron");
const path = require("path");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electron", {
  send: (channel, data) => {
    let validChannels = [
      channels.FULLSCREEN_BREAK,
      channels.CLOSE_BREAK,

      channels.NOTIFY_BREAK_STARTING,
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel, fn) => {
    let validChannels = [channels.SNOOZE];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => fn(...args));
    }
  },
  notificationFile: () => path.join(__dirname, "assets/ping.wav"),
});

window.channels = channels;
