const listeners = new Set();

export const networkErrorNotifier = {
  notify() {
    listeners.forEach((listener) => listener());
  },

  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
