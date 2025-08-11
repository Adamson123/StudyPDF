const throttle = (func: (...arg: any) => any, delay: number) => {
  let lastRun = 0;
  return function (...args: any) {
    const now = Date.now();
    if (now - lastRun >= delay) {
      console.log(`Ran after delay of ${delay} based on ${now - lastRun}`);
      lastRun = now;
      func(args);
    }
  };
};

export default throttle;
