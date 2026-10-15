export function scaleQuantity(qty, factor) {
  const m = qty.match(/^(\d+(?:\.\d+)?)\s*(.*)$/);
  if (!m) return qty;
  const n = parseFloat(m[1]) * factor;
  const unit = m[2];
  const rounded = n >= 10 ? Math.round(n) : Math.round(n * 2) / 2;
  let fixedUnit = unit;
  if (rounded !== 1 && /^pc$/.test(unit)) fixedUnit = "pcs";
  if (rounded === 1 && /^pcs$/.test(unit)) fixedUnit = "pc";
  return `${rounded} ${fixedUnit}`.trim();
}

export function inr(n) {
  return `₹ ${n.toLocaleString("en-IN")}`;
}
