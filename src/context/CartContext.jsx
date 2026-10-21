import { createContext, useContext, useState, useCallback } from "react";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem("dl_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const addItem = useCallback((property) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.id === property.id);
      const next = exists ? prev : [...prev, property];
      localStorage.setItem("dl_cart", JSON.stringify(next));
      return next;
    });
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== id);
      localStorage.setItem("dl_cart", JSON.stringify(next));
      return next;
    });
  }, []);

  const clearItems = useCallback(() => {
    setItems([]);
    localStorage.removeItem("dl_cart");
  }, []);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearItems, count: items.length }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
