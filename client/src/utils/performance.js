import React, { memo } from 'react';

/**
 * Custom hook to debounce values for search/filter inputs
 * @param {any} value - Value to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {any} Debounced value
 */
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Memoize a component with shallow prop comparison
 * Use only when props are stable or rarely change
 */
export const withMemo = (Component, displayName) => {
  const MemoComponent = memo(Component);
  MemoComponent.displayName = displayName || `Memo(${Component.displayName || Component.name})`;
  return MemoComponent;
};

/**
 * Optimize list rendering by memoizing items
 * @param {Array} items - Items to render
 * @param {Function} renderItem - Function to render each item
 * @returns {Array} Rendered items
 */
export const optimizeListRendering = (items, renderItem) => {
  return items.map((item, index) => (
    <React.Fragment key={item._id || index}>
      {renderItem(item)}
    </React.Fragment>
  ));
};

/**
 * Batch state updates to reduce re-renders
 * Useful for multiple setState calls in event handlers
 */
export const useBatchedState = (initialState) => {
  const [state, setState] = React.useState(initialState);
  const updateRef = React.useRef({});

  const updateState = React.useCallback((updates) => {
    Object.assign(updateRef.current, updates);
    Promise.resolve().then(() => {
      setState((prev) => ({ ...prev, ...updateRef.current }));
      updateRef.current = {};
    });
  }, []);

  return [state, updateState];
};

/**
 * Cache API responses to reduce duplicate requests
 */
class APICache {
  constructor(ttl = 300000) {
    // 5 minutes TTL by default
    this.cache = new Map();
    this.ttl = ttl;
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      expiry: Date.now() + this.ttl,
    });
  }

  clear() {
    this.cache.clear();
  }

  has(key) {
    return this.get(key) !== null;
  }
}

export const apiCache = new APICache();

/**
 * Performance monitoring hook
 * Use in development to track component render times
 */
export const useRenderTime = (componentName) => {
  React.useEffect(() => {
    if (import.meta.env.DEV) {
      const startTime = performance.now();
      return () => {
        const endTime = performance.now();
        console.log(
          `${componentName} rendered in ${(endTime - startTime).toFixed(2)}ms`
        );
      };
    }
  }, [componentName]);
};

/**
 * Intersection Observer hook for lazy loading
 * Triggers callback when element is visible in viewport
 */
export const useIntersection = (ref, options = {}) => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entry.target);
      }
    }, {
      threshold: 0.1,
      ...options,
    });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, options]);

  return isVisible;
};

export default {
  useDebounce,
  withMemo,
  optimizeListRendering,
  useBatchedState,
  apiCache,
  useRenderTime,
  useIntersection,
};
