import { ComponentPropsWithoutRef, FC, useEffect, useMemo, useRef, useState } from 'react';
import { usePolling } from '../../hooks';

const randomAlphanumeric = (length: number) => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset[Math.floor(Math.random() * charset.length)];
  }
  return result;
};

export interface VqrProps extends ComponentPropsWithoutRef<'div'> {
  queryId: string;
  mode: 'dynamic' | 'static';
  app?: 'ShareRing Me' | string;
  encryptionKey?: string;
  qrcodeOwner?: string;
  metadata?: string;
  appSchemePrefix?: string;
  appSchemeSuffix?: string;
  onScan?: (data: any) => void;
  onInit?: (data: any) => void;
}

const Vqr: FC<VqrProps> = ({
  queryId,
  qrcodeOwner,
  metadata,
  appSchemePrefix,
  appSchemeSuffix,
  onScan,
  onInit,
  encryptionKey,
  mode,
  app,
  ...props
}) => {
  const theRef = useRef<any>(null);
  const randomId = useMemo(() => randomAlphanumeric(6), []);

  useEffect(() => {
    if (onScan) {
      window.addEventListener(`vqronscan${randomId}`, onScan, false);
    }
    if (onInit) {
      window.addEventListener(`vqroninit${randomId}`, onInit, false);
    }
    return () => {
      if (onScan) {
        window.removeEventListener(`vqronscan${randomId}`, onScan, false);
      }
      if (onInit) {
        window.removeEventListener(`vqroninit${randomId}`, onInit, false);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const jqueryLoad = document.createElement('script');
    jqueryLoad.src = 'https://cdnjs.cloudflare.com/ajax/libs/jquery/2.2.4/jquery.min.js';
    jqueryLoad.async = false;
    document.body.appendChild(jqueryLoad);

    const jqueryQrCodeLoad = document.createElement('script');
    jqueryQrCodeLoad.src =
      'https://cdnjs.cloudflare.com/ajax/libs/jquery.qrcode/1.0/jquery.qrcode.min.js';
    jqueryQrCodeLoad.async = false;
    document.body.appendChild(jqueryQrCodeLoad);

    return () => {
      document.body.removeChild(jqueryLoad);
      document.body.removeChild(jqueryQrCodeLoad);
    };
  }, []);

  const [jqueryLoaded, setJqueryLoaded] = useState(false);
  const [jqueryQrCodeLoaded, setJqueryQrCodeLoaded] = useState(false);
  const [domLoaded, setDomLoaded] = useState(false);

  const [stop] = usePolling(
    () => {
      if (typeof window.jQuery !== 'undefined') {
        setJqueryLoaded(true);
      }
      if (typeof window.jQuery?.fn?.qrcode !== 'undefined') {
        setJqueryQrCodeLoaded(true);
      }
    },
    500,
    [window.jQuery, window.jQuery?.fn?.qrcode]
  );

  useEffect(() => {
    if (jqueryLoaded && jqueryQrCodeLoaded) {
      stop();
      // let query: HTMLElement;
      // let script: HTMLScriptElement;
      const script = window.document.createElement('script');
      script.textContent = `;window.vqronscan${randomId} = function(data) {window.dispatchEvent(new CustomEvent('vqronscan${randomId}', {detail: data}))}; window.vqroninit${randomId} = function(data) {window.dispatchEvent(new CustomEvent('vqroninit${randomId}', {detail: data}))};`;
      script.async = false;
      document.body.appendChild(script);

      const query = window.document.createElement('div');
      query.classList.add('sharering-query');
      query.setAttribute('queryId', queryId); // TODO
      query.setAttribute('mode', mode);
      query.setAttribute('qrcodeOwner', qrcodeOwner!); // eslint-disable-line @typescript-eslint/no-non-null-assertion
      if (metadata) {
        query.setAttribute('metadata', metadata);
      }
      if (appSchemePrefix) {
        query.setAttribute('appSchemePrefix', appSchemePrefix);
      }
      if (appSchemeSuffix) {
        query.setAttribute('appSchemeSuffix', appSchemeSuffix);
      }
      query.setAttribute('onscan', `vqronscan${randomId}`);
      query.setAttribute('oninit', `vqroninit${randomId}`);
      if (app) {
        query.setAttribute('app', app);
      }
      const qrcontent = window.document.createElement('div');
      qrcontent.classList.add('qrcode-content');
      const qrcode = window.document.createElement('div');
      qrcode.id = 'qrcode';
      qrcontent.appendChild(qrcode);
      query.appendChild(qrcontent);
      theRef.current?.appendChild(query);

      setDomLoaded(true);

      return () => {
        if (query) {
          theRef.current?.removeChild(query); // eslint-disable-line react-hooks/exhaustive-deps
        }
        if (script) {
          document.body.removeChild(script);
        }
      };
    }
  }, [jqueryLoaded, jqueryQrCodeLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (domLoaded) {
      const queryScriptLoad = document.createElement('script');
      const isProduction = process.env.REACT_APP_ENV === 'production';
      queryScriptLoad.src = `https://raw.githack.com/ShareRing/shareringlink-javascript-library/master/sharering.query.lib.${
        isProduction ? 'prod' : 'test'
      }.min.js`;
      queryScriptLoad.async = false;
      document.body.appendChild(queryScriptLoad);

      return () => {
        document.body.removeChild(queryScriptLoad);
      };
    }
  }, [domLoaded]);

  return (
    <>
      <div {...props} ref={theRef}></div>
    </>
  );
};

export default Vqr;
