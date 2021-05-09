const channels = require("./common");
const { contextBridge, ipcRenderer, nativeImage } = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electron", {
  send: (channel, data) => {
    let validChannels = [
      channels.FULLSCREEN_BREAK,
      channels.CLOSE_BREAK,

      channels.NOTIFY_BREAK_STARTING
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  // receive: (channel, func) => {
  //     let validChannels = ["fromMain"];
  //     if (validChannels.includes(channel)) {
  //         // Deliberately strip event as it includes `sender`
  //         ipcRenderer.on(channel, (event, ...args) => func(...args));
  //     }
  // }
});

window.channels = channels;
