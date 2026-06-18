import { create } from 'zustand'

export type Screen = 'registry' | 'brain' | 'mode'

interface UI {
  screen: Screen
  setScreen: (s: Screen) => void
}

export const useUI = create<UI>((set) => ({
  screen: 'registry',
  setScreen: (screen) => set({ screen })
}))
