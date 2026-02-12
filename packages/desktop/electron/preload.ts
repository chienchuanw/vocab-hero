import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  isElectron: true,

  sendNotification: (title: string, body: string) => {
    ipcRenderer.send('show-notification', { title, body });
  },

  getAppPath: (name: string): Promise<string> => {
    return ipcRenderer.invoke('get-app-path', name);
  },

  getVersion: (): Promise<string> => {
    return ipcRenderer.invoke('get-app-version');
  },
});
