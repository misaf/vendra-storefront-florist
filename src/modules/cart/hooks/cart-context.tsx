"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
} from "react";
import type { Product } from "@/modules/products";
import { usePersistentState } from "@/shared/hooks/use-persistent-state";

export interface CartItem extends Product {
  /**
   * How many of this product are in the cart. It shadows `Product.quantity`,
   * which is how many the shop *has* — so the stock ceiling is carried
   * separately in `stock`, or the cart has no way to know it and will happily
   * take an order for fifty of something there are three of.
   */
  quantity: number;
  /** Units available when the product was added; null when untracked. */
  stock: number | null;
}

/** The catalogue tracks stock only when it reports a positive count. */
function stockCeiling(product: Product): number | null {
  return product.quantity != null && product.quantity > 0
    ? product.quantity
    : null;
}

/** Clamp to the ceiling, and never below one — zero means "remove". */
function clampToStock(quantity: number, stock: number | null): number {
  const atLeastOne = Math.max(1, quantity);
  return stock != null ? Math.min(atLeastOne, stock) : atLeastOne;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product) => void;
  restoreCartItem: (item: CartItem) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = usePersistentState<CartItem[]>("cart", []);

  const addToCart = useCallback(
    (product: Product) => {
      setItems((prevItems) => {
        const stock = stockCeiling(product);
        const existingItem = prevItems.find((item) => item.id === product.id);
        if (existingItem) {
          return prevItems.map((item) =>
            item.id === product.id
              ? {
                  ...item,
                  // Refreshed from the product just handed in, so a cart that
                  // has sat in localStorage for a week is re-checked against
                  // today's stock the moment the shopper adds another.
                  stock,
                  quantity: clampToStock(item.quantity + 1, stock),
                }
              : item
          );
        }
        return [...prevItems, { ...product, stock, quantity: 1 }];
      });
    },
    [setItems]
  );

  const removeFromCart = useCallback(
    (productId: number) => {
      setItems((prevItems) => prevItems.filter((item) => item.id !== productId));
    },
    [setItems]
  );

  const restoreCartItem = useCallback(
    (item: CartItem) => {
      setItems((prevItems) => {
        const existingItem = prevItems.find(
          (cartItem) => cartItem.id === item.id
        );

        if (existingItem) {
          return prevItems.map((cartItem) =>
            cartItem.id === item.id ? item : cartItem
          );
        }

        return [...prevItems, item];
      });
    },
    [setItems]
  );

  const updateQuantity = useCallback(
    (productId: number, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(productId);
        return;
      }
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === productId
            ? { ...item, quantity: clampToStock(quantity, item.stock) }
            : item
        )
      );
    },
    [removeFromCart, setItems]
  );

  const clearCart = useCallback(() => setItems([]), [setItems]);

  const getTotalPrice = useCallback(
    () => items.reduce((total, item) => total + item.price * item.quantity, 0),
    [items]
  );

  const getTotalItems = useCallback(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      addToCart,
      restoreCartItem,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalPrice,
      getTotalItems,
    }),
    [
      items,
      addToCart,
      restoreCartItem,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalPrice,
      getTotalItems,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
