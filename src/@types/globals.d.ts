import axios from "axios";

export {};

declare global {
  interface Window {
    ipcRenderer: {
      invoke: (chanel: string, ...datas: any) => any;
      once: (chanel: string, listener: any) => any;
      on: (chanel: string, listener: any) => any;
    };
    axios: typeof axios;
    html2canvas: (element: HTMLElement | null) => Promise<any>;
    givePlayData: () => void;
  }
}

window.ipcRenderer = window.ipcRenderer || {
  invoke: (chanel: string, ...datas: any) => {},
  once: (chanel: string, listener: any) => {},
  on: (chanel: string, listener: any) => {},
};
