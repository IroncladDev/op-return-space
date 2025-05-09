export const truncateMiddle = (str: string, maxLength: number) => {
  if (typeof str !== 'string') return str;
  if (str.length <= maxLength) return str;
  const midpoint = Math.ceil(maxLength / 2);
  return `${str.slice(0, midpoint)}...${str.slice(-midpoint)}`;
};
