export const now = () => {
  return new Date();
};

export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

export const getTimeDifferenceInMinutes = (
  target: Date,
  comparable: Date
): number => {
  const targetTime = new Date(target).getTime();
  const comparableTime = new Date(comparable).getTime();
  return Math.round((targetTime - comparableTime) / 60000);
};

export const formatTime = (timeString: string): string => {
  const date = new Date(timeString);
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDate = (timeString: string): string => {
  const date = new Date(timeString);
  return date.toLocaleDateString();
};
