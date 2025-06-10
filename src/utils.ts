const formatTimeToSeconds = (time: number) => {
  return `${(time / 1000).toFixed(2)}s`;
};

export default {
  formatTimeToSeconds,
};
