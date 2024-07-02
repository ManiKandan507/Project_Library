
import { useEffect, useRef } from 'react';

/**
 * Custom hook for performing actions after a specified delay.
 * @param {Function} action - The action to perform after the delay.
 * @param {number} delay - The delay in milliseconds.
 * @param {Array} dependencies - The dependencies array for useEffect.
 */
function useDelayedActionTimer(action, delay, dependencies) {
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Clear the existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set a new timeout
    timeoutRef.current = setTimeout(() => {
      action();
    }, delay);

    // Clear the timeout when the dependencies change or on component unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, dependencies);
}

export default useDelayedActionTimer