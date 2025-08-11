const debouncedHandler = (
  func: (param?: any) => any,
  scrollTimeoutId: NodeJS.Timeout,
  DEBOUNCE_DELAY = 150,
) => {
  const debouncedFunc = () => {
    clearTimeout(scrollTimeoutId as NodeJS.Timeout);

    scrollTimeoutId = setTimeout(async () => {
      await func();
    }, DEBOUNCE_DELAY);
  };

  return debouncedFunc;
};

export default debouncedHandler;
