export const stringToColour = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let colour = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    colour += ("00" + value.toString(16)).substr(-2);
  }
  return colour;
};

export const currencyFormatter = (value, symbol = true) => `${symbol?"$":""}${Number(value ?? 0).toLocaleString('en-US', {minimumFractionDigits: 0})}`;

export const handleEmptyValue = value => value ? value : '-'
