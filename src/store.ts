import { create } from 'zustand'

export type Screen = 'registry' | 'brain' | 'mode'
export type Theme = 'ink' | 'slate' | 'paper' | 'marble'

function savedTheme(): Theme {
  try {
    const t = localStorage.getItem('lictor-theme')
    if (t === 'ink' || t === 'slate' || t === 'paper' || t === 'marble') return t
  } catch {
    // localStorage недоступен
  }
  return 'ink'
}

function onboarded(): boolean {
  try {
    return localStorage.getItem('lictor-onboarded') === '1'
  } catch {
    return true
  }
}

interface UI {
  screen: Screen
  setScreen: (s: Screen) => void
  theme: Theme
  setTheme: (t: Theme) => void
  editingId: string | null
  setEditing: (id: string | null) => void
  adding: boolean
  setAdding: (v: boolean) => void
  onboarding: boolean
  setOnboarding: (v: boolean) => void
}

export const useUI = create<UI>((set) => ({
  screen: 'registry',
  setScreen: (screen) => set({ screen }),
  theme: savedTheme(),
  setTheme: (theme) => {
    try {
      localStorage.setItem('lictor-theme', theme)
    } catch {
      // игнор
    }
    set({ theme })
  },
  editingId: null,
  setEditing: (editingId) => set({ editingId }),
  adding: false,
  setAdding: (adding) => set({ adding }),
  onboarding: !onboarded(),
  setOnboarding: (v) => {
    if (!v) {
      try {
        localStorage.setItem('lictor-onboarded', '1')
      } catch {
        // игнор
      }
    }
    set({ onboarding: v })
  }
}))
