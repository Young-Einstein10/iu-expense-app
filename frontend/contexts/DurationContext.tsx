"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { DurationFilter } from "../types";

interface DurationContextType {
  duration: DurationFilter;
  setDuration: (duration: DurationFilter) => void;
}

const DurationContext = createContext<DurationContextType | undefined>(
  undefined,
);

export const useDuration = () => {
  const context = useContext(DurationContext);
  if (!context) {
    throw new Error("useDuration must be used within a DurationProvider");
  }
  return context;
};

interface DurationProviderProps {
  children: ReactNode;
}

export const DurationProvider: React.FC<DurationProviderProps> = ({
  children,
}) => {
  const [duration, setDuration] = useState<DurationFilter>("daily");

  const value: DurationContextType = {
    duration,
    setDuration,
  };

  return (
    <DurationContext.Provider value={value}>
      {children}
    </DurationContext.Provider>
  );
};
