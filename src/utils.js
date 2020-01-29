import { useRef, useEffect, useState } from "react";
import moment from "moment-timezone";

export const toMoment = dateStr => moment(dateStr, "YYYY-MM-DD HH:mm:ss Z");

export function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export function useThrottle(fun, timeout, changes = []) {
  // Create the mutable local ref to store timer.
  const timer = useRef(null);

  function cancel() {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }

  // Cancel the timer when the given values change or the component will unmount.
  useEffect(() => cancel, changes);

  // Return the throttled version of the function.
  return function(...args) {
    cancel();

    // Save the timer to the ref, so it can be cancelled.
    timer.current = setTimeout(() => {
      timer.current = null;
      fun.apply(this, args);
    }, timeout);
  };
}

export const useInput = initialValue => {
  const [value, setValue] = useState(initialValue);

  return {
    value,
    setValue,
    reset: () => setValue(""),
    bind: {
      value,
      onChange: event => {
        setValue(event.target.value);
      }
    }
  };
};
