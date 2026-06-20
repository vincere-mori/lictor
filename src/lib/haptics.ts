import { Capacitor } from '@capacitor/core'

// лёгкий тактильный отклик: нативно через Capacitor, в вебе через vibrate
export function haptic(kind: 'light' | 'medium' = 'light') {
  try {
    if (Capacitor.isNativePlatform()) {
      import('@capacitor/haptics')
        .then(({ Haptics, ImpactStyle }) => {
          Haptics.impact({ style: kind === 'medium' ? ImpactStyle.Medium : ImpactStyle.Light }).catch(() => {})
        })
        .catch(() => {})
    } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(kind === 'medium' ? 18 : 10)
    }
  } catch {
    // нет тактильного отклика
  }
}
