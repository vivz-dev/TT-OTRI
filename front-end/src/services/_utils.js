// src/services/_utils.js
export const removeNullish = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== null && v !== undefined));

/** Si v es null/undefined/'' -> 0, si es numérico -> Number(v) */
export const coalesceZero = (v) => {
  if (v === '' || v === null || v === undefined) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
