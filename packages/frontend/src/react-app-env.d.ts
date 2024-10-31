/// <reference types="react-scripts" />

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    REACT_APP_API_ENDPOINT: string;
    REACT_APP_ENV: 'production' | 'test';
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Window {
    jQuery?: any;
    initLibrary?: any;
  }
}

export {};
