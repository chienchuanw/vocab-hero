/**
 * Electron API type definitions
 * 定義 Electron 主進程暴露給渲染進程的 API 類型
 */

interface ElectronAPI {
  platform: string;
  isElectron: boolean;
  sendNotification: (title: string, body: string) => void;
  getAppPath: (name: string) => Promise<string>;
  getVersion: () => Promise<string>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
