export interface Comic4LifeDesktopBridge {
  isElectron: boolean;
  platform: string;
  setTitle: (title: string) => Promise<void> | void;
  quit: () => Promise<void> | void;
  getVersion: () => Promise<string>;
}

declare global {
  interface Window {
    comic4lifeDesktop?: Comic4LifeDesktopBridge;
  }
}

export {};
