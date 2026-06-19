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

interface UI {
  screen: Screen
  setScreen: (s: Screen) => void
  theme: Theme
  setTheme: (t: Theme) => void
  editingId: string | null
  setEditing: (id: string | null) => void
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
  setEditing: (editingId) => set({ editingId })
}))
