import { useEffect, useRef, useState } from 'react';

const usePolling = <R = unknown>(
  callback: () => Promise<R> | R,
  ms = 1000,
  dependencies: any[] = []
) => {
  const [dead, kill] = useState(false);
  const callbackRef = useRef(callback);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (dead) {
      return;
    }
    let _stopped = false;
    // Side note: preceding semicolon needed for IIFEs.
    (async function pollingCallback() {
      try {
        await callbackRef.current();
      } finally {
        // Set timeout after it finished, unless stopped
        timeoutIdRef.current = !_stopped && setTimeout(pollingCallback, ms);
      }
    })();
    // Clean up if dependencies change
    return () => {
      _stopped = true; // prevent racing conditions
      clearTimeout(timeoutIdRef.current!); // eslint-disable-line @typescript-eslint/no-non-null-assertion
    };
  }, [...dependencies, ms, dead]); // eslint-disable-line react-hooks/exhaustive-deps

  return [() => kill(true), () => kill(false)];
};

export { usePolling };
