import { createContext, useContext } from "react";

export const IsMobileContext = createContext(false);

export function useIsMobile() {
  return useContext(IsMobileContext);
}
