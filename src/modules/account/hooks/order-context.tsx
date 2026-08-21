"use client";

import React, { createContext, useContext } from "react";
import { usePersistentState } from "@/shared/hooks/use-persistent-state";

export interface OrderItem {
  id: number;
  name: string;
  price: number;
  formattedPrice?: string;
  image: string;
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  items: OrderItem[];
  total: number;
  subtotal: number;
  shipping: number;
  tax: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  shippingAddress?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    zipCode: string;
    country: string;
    latitude?: number;
    longitude?: number;
  };
}

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, "id" | "date">) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

/**
 * A reference a customer can actually read back over the phone — the order date
 * plus a short random tail — rather than the raw millisecond timestamp and
 * nine-character base-36 blob this used to produce. It is shown on the
 * confirmation screen and in order history, so it has to survive being written
 * on a notepad.
 */
function createOrderReference(): string {
  const now = new Date();
  const datePart = [
    String(now.getFullYear()).slice(2),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  const tail = Math.random().toString(36).slice(2, 6).toUpperCase();

  return `${datePart}-${tail}`;
}

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = usePersistentState<Order[]>("orders", []);

  const addOrder = (orderData: Omit<Order, "id" | "date">) => {
    const newOrder: Order = {
      ...orderData,
      id: createOrderReference(),
      date: new Date().toISOString(),
    };
    setOrders((prevOrders) => [newOrder, ...prevOrders]);
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        addOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error("useOrders must be used within an OrderProvider");
  }
  return context;
}
