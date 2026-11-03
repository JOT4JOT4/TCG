// soundManager.js - Centralized audio manager for One Piece Arcana Duel

const BASE_URL = import.meta.env.BASE_URL || '/'
const SOUND_DIR = `${BASE_URL.replace(/\/$/, '')}/sounds`

const BGM_PRIMARY = `${SOUND_DIR}/Kohei%20Tanaka%20-%20We%20Are!%20(Full%20Length%20Instrumental)%20(3).mp3`
const BGM_FALLBACK = `${SOUND_DIR}/we-are.mp3`

let bgmAudio = null
let musicVolume = 0.7 // 0.0 to 1.0 (corresponds to 70%)
let sfxVolume = 0.8   // 0.0 to 1.0 (corresponds to 80%)
let isMuted = false
let bgmStarted = false
let interactionListenersAdded = false

// Preload SFX
const sfxMap = {
  flip: `${SOUND_DIR}/flipcard.mp3`,
  place: `${SOUND_DIR}/placecard.mp3`,
  take1: `${SOUND_DIR}/takecard1.mp3`,
  take2: `${SOUND_DIR}/takecard2.mp3`,
}

const sfxCache = {}

function preloadSfx() {
  if (typeof window === 'undefined') return
  Object.entries(sfxMap).forEach(([key, src]) => {
    try {
      const audio = new Audio(src)
      audio.preload = 'auto'
      audio.load()
      sfxCache[key] = audio
    } catch (e) {
      console.warn(`[SoundManager] No se pudo precargar sonido ${key}:`, e)
    }
  })
}

function initBgm() {
  if (typeof window === 'undefined') return
  if (bgmAudio) return bgmAudio

  bgmAudio = new Audio(BGM_PRIMARY)
  bgmAudio.loop = true
  bgmAudio.volume = isMuted ? 0 : musicVolume

  // Fallback to simpler filename if primary fails
  bgmAudio.addEventListener('error', () => {
    if (bgmAudio.src !== BGM_FALLBACK) {
      console.warn('[SoundManager] Reintentando BGM con ruta de respaldo...')
      bgmAudio.src = BGM_FALLBACK
      bgmAudio.play().catch(() => {})
    }
  })

  return bgmAudio
}

function tryPlayBgm() {
  const audio = initBgm()
  if (!audio) return

  if (isMuted || musicVolume <= 0) {
    audio.volume = 0
  } else {
    audio.volume = musicVolume
  }

  const promise = audio.play()
  if (promise !== undefined) {
    promise
      .then(() => {
        bgmStarted = true
      })
      .catch(() => {
        // Autoplay policy prevented playback. Wait for user interaction.
        setupInteractionHandler()
      })
  }
}

function setupInteractionHandler() {
  if (interactionListenersAdded || typeof window === 'undefined') return
  interactionListenersAdded = true

  const unlockAudio = () => {
    if (!bgmStarted && bgmAudio && !isMuted && musicVolume > 0) {
      bgmAudio.play().then(() => {
        bgmStarted = true
      }).catch(() => {})
    }
    window.removeEventListener('pointerdown', unlockAudio)
    window.removeEventListener('keydown', unlockAudio)
    window.removeEventListener('click', unlockAudio)
    interactionListenersAdded = false
  }

  window.addEventListener('pointerdown', unlockAudio, { once: true, passive: true })
  window.addEventListener('keydown', unlockAudio, { once: true, passive: true })
  window.addEventListener('click', unlockAudio, { once: true, passive: true })
}

export const soundManager = {
  // Inicialización (llamada al arrancar App)
  init(initialMusicVol = 70, initialSfxVol = 80) {
    musicVolume = Math.max(0, Math.min(100, initialMusicVol)) / 100
    sfxVolume = Math.max(0, Math.min(100, initialSfxVol)) / 100
    preloadSfx()
    tryPlayBgm()
  },

  // Reproducir BGM manualmente (por ejemplo tras interacción o reanudar)
  playBgm() {
    tryPlayBgm()
  },

  pauseBgm() {
    if (bgmAudio) {
      bgmAudio.pause()
    }
  },

  // Ajuste de volumen de música (0 - 100)
  setMusicVolume(vol) {
    musicVolume = Math.max(0, Math.min(100, vol)) / 100
    if (bgmAudio) {
      bgmAudio.volume = isMuted ? 0 : musicVolume
      if (musicVolume > 0 && bgmAudio.paused) {
        bgmAudio.play().catch(() => {})
      }
    }
  },

  // Ajuste de volumen de efectos (0 - 100)
  setSfxVolume(vol) {
    sfxVolume = Math.max(0, Math.min(100, vol)) / 100
  },

  getMusicVolume() {
    return Math.round(musicVolume * 100)
  },

  getSfxVolume() {
    return Math.round(sfxVolume * 100)
  },

  toggleMute() {
    isMuted = !isMuted
    if (bgmAudio) {
      bgmAudio.volume = isMuted ? 0 : musicVolume
    }
    return isMuted
  },

  isMuted() {
    return isMuted
  },

  // Reproducción de efectos individuales
  playSfx(key) {
    if (isMuted || sfxVolume <= 0) return
    try {
      let audio = sfxCache[key]
      if (!audio) {
        const src = sfxMap[key]
        if (!src) return
        audio = new Audio(src)
        sfxCache[key] = audio
      }
      // Clonar para permitir sonidos rápidos y simultáneos
      const clone = audio.cloneNode()
      clone.volume = sfxVolume
      clone.play().catch(() => {})
    } catch (e) {
      // Ignorar restricciones temporales de audio
    }
  },

  // Atajos para acciones específicas
  playCardFlip() {
    this.playSfx('flip')
  },

  playCardPlace() {
    this.playSfx('place')
  },

  playCardTake() {
    this.playSfx('take1')
  },

  playCardRemove() {
    this.playSfx('take2')
  },

  playButtonClick() {
    this.playSfx('take1')
  },
}

export default soundManager

