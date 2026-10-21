export const formatPrice = (price) => {
  if (!price) return "₹0";
  // price already formatted string like "₹1.45 Cr*" or "₹1,000 / sq. ft."
  return price;
};

export const formatArea = (area) => area;

export const debounce = (fn, wait) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
};
