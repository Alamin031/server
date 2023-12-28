export const getConfigVar = (name: string, fallback = undefined) => {
  const value = process.env[name] || fallback;
  if (value === undefined) {
    throw 'Environment variable ' + name + ' is missing';
  }
  return value;
};
