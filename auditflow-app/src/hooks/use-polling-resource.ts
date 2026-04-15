"use client";

import { useEffect, useReducer, useRef } from "react";

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
  resetKey?: string | number;
};

type PollingState<T extends PollingData> = {
  data: T;
  error: Error | null;
  isRefreshing: boolean;
};

type PollingAction<T extends PollingData> =
  | { type: "reset"; data: T }
  | { type: "refresh-start" }
  | { type: "refresh-success"; data: T }
  | { type: "refresh-error"; error: Error };

function pollingReducer<T extends PollingData>(state: PollingState<T>, action: PollingAction<T>): PollingState<T> {
  switch (action.type) {
    case "reset":
      return { data: action.data, error: null, isRefreshing: false };
    case "refresh-start":
      return { ...state, isRefreshing: true };
    case "refresh-success":
      return { data: action.data, error: null, isRefreshing: false };
    case "refresh-error":
      return { ...state, error: action.error, isRefreshing: false };
    default:
      return state;
  }
}

export function usePollingResource<T extends PollingData>({
  initialData,
  load,
  resetKey,
}: UsePollingResourceOptions<T>) {
  const [state, dispatch] = useReducer(pollingReducer<T>, {
    data: initialData,
    error: null,
    isRefreshing: false,
  });
  const initialDataRef = useRef(initialData);
  const dataRef = useRef(initialData);
  const loadRef = useRef(load);
  const requestIdRef = useRef(0);
  const requestedTickRef = useRef(initialData.polling.tick);
  // Tracks the current interval duration without causing the effect to re-run.
  // Prevents a missed tick when the server returns a different intervalMs.
  const intervalMsRef = useRef(initialData.polling.intervalMs);

  useEffect(() => {
    initialDataRef.current = initialData;
  }, [initialData]);

  useEffect(() => {
    loadRef.current = load;
  }, [load]);

  useEffect(() => {
    const nextInitialData = initialDataRef.current;
    dataRef.current = nextInitialData;
    intervalMsRef.current = nextInitialData.polling.intervalMs;
    requestedTickRef.current = nextInitialData.polling.tick;
    requestIdRef.current = 0;
    dispatch({ type: "reset", data: nextInitialData });
  }, [resetKey]);

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
      dispatch({ type: "refresh-start" });

      void loadRef.current(nextTick).then(
        (nextData) => {
          if (requestId !== requestIdRef.current || nextData.polling.tick < dataRef.current.polling.tick) {
            return;
          }

          dataRef.current = nextData;
          // Keep intervalMs ref in sync so the next tick uses the updated interval
          intervalMsRef.current = nextData.polling.intervalMs;

          if (nextData.polling.terminal) {
            window.clearInterval(intervalId);
          }

          dispatch({ type: "refresh-success", data: nextData });
        },
        (nextError: unknown) => {
          if (requestId !== requestIdRef.current) {
            return;
          }

          dispatch({
            type: "refresh-error",
            error: nextError instanceof Error ? nextError : new Error("Polling refresh failed"),
          });
        },
      );
    // Only depend on terminal flag — intervalMs changes are handled via ref to avoid missed ticks
    }, intervalMsRef.current);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [state.data.polling.terminal]);

  return state;
}
