"use client";

import { useEffect, useRef, useState } from "react";

type PollingData = {
  polling: {
    intervalMs: number;
    tick: number;
    terminal: boolean;
  };
};

type UsePollingResourceOptions<T extends PollingData> = {
  initialData: T;
  load: (nextTick: number) => Promise<T>;
};

export function usePollingResource<T extends PollingData>({
  initialData,
  load,
}: UsePollingResourceOptions<T>) {
  const [data, setData] = useState(initialData);
  const dataRef = useRef(initialData);
  const loadRef = useRef(load);
  const requestIdRef = useRef(0);
  const requestedTickRef = useRef(initialData.polling.tick);

  useEffect(() => {
    loadRef.current = load;
  }, [load]);

  useEffect(() => {
    dataRef.current = data;
    requestedTickRef.current = data.polling.tick;
  }, [data]);

  useEffect(() => {
    if (dataRef.current.polling.terminal) {
      return;
    }

    const intervalId = window.setInterval(() => {
      if (dataRef.current.polling.terminal) {
        window.clearInterval(intervalId);
        return;
      }

      const nextTick = requestedTickRef.current + 1;
      requestedTickRef.current = nextTick;

      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;

      void loadRef.current(nextTick).then((nextData) => {
        if (requestId !== requestIdRef.current) {
          return;
        }

        setData((currentData) => {
          if (nextData.polling.tick < currentData.polling.tick) {
            return currentData;
          }

          dataRef.current = nextData;

          if (nextData.polling.terminal) {
            window.clearInterval(intervalId);
          }

          return nextData;
        });
      });
    }, initialData.polling.intervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [initialData.polling.intervalMs]);

  return { data };
}
