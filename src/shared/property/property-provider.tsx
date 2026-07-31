"use client";

import { createContext, useContext } from "react";
import type { PropertyConfig } from "@/shared/property/types";

const PropertyContext = createContext<PropertyConfig | null>(null);

export function PropertyProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: PropertyConfig;
}) {
  return (
    <PropertyContext.Provider value={value}>{children}</PropertyContext.Provider>
  );
}

export function useProperty(): PropertyConfig {
  const property = useContext(PropertyContext);

  if (!property) {
    throw new Error("useProperty must be used within PropertyProvider");
  }

  return property;
}
