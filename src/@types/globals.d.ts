import axios from "axios";

export interface MusicData {
  times: number;
  url: string;
}

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
    al: (a: string, b: string) => void;
    setMusics: (musics: MusicData[]) => void;
  }
}

window.ipcRenderer = window.ipcRenderer || {
  invoke: (chanel: string, ...datas: any) => {},
  once: (chanel: string, listener: any) => {},
  on: (chanel: string, listener: any) => {},
};
