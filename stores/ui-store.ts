import { create } from "zustand";

interface UIState {
  /** Desktop: collapse/expand the persistent sidebar. */
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebar: (open: boolean) => void;
  /** Mobile: the slide-in navigation drawer (independent of desktop). */
  mobileNavOpen: boolean;
  toggleMobileNav: () => void;
  setMobileNav: (open: boolean) => void;
}

/**
 * Global UI state. Desktop and mobile navigation are tracked separately so the
 * mobile drawer never auto-opens just because the desktop sidebar defaults open.
 */
export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebar: (open) => set({ sidebarOpen: open }),
  mobileNavOpen: false,
  toggleMobileNav: () => set((s) => ({ mobileNavOpen: !s.mobileNavOpen })),
  setMobileNav: (open) => set({ mobileNavOpen: open }),
}));
