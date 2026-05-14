/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

export const timerOptions = [
  { label: '15 min', minutes: 15 },
  { label: '30 min', minutes: 30 },
  { label: '45 min', minutes: 45 },
  { label: '1 hr', minutes: 60 },
  { label: '1 hr 30 min', minutes: 90 },
  { label: '2 hr', minutes: 120 },
]

export const timerSounds = [
  { id: 'bell', label: 'Forge bell', frequencies: [660, 880], duration: 0.9 },
  { id: 'chime', label: 'Bright chime', frequencies: [784, 1046], duration: 0.7 },
  { id: 'gong', label: 'Deep gong', frequencies: [220, 330], duration: 1.2 },
  { id: 'spark', label: 'Ember spark', frequencies: [520, 760, 980], duration: 0.55 },
]

const TimerContext = createContext(null)

export function TimerProvider({ children }) {
  const [timerMinutes, setTimerMinutes] = useState(30)
  const [remainingSeconds, setRemainingSeconds] = useState(30 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [timerComplete, setTimerComplete] = useState(false)
  const [showGlobalTimer, setShowGlobalTimer] = useState(
    () => localStorage.getItem('focusforge_show_timer') === 'true',
  )
  const [soundId, setSoundId] = useState(() => localStorage.getItem('focusforge_timer_sound') || 'bell')

  const totalSeconds = timerMinutes * 60
  const progress = totalSeconds ? ((totalSeconds - remainingSeconds) / totalSeconds) * 100 : 0
  const formattedTime = useMemo(() => formatTime(remainingSeconds), [remainingSeconds])
  const selectedSound = timerSounds.find((sound) => sound.id === soundId) || timerSounds[0]

  useEffect(() => {
    localStorage.setItem('focusforge_show_timer', String(showGlobalTimer))
  }, [showGlobalTimer])

  useEffect(() => {
    localStorage.setItem('focusforge_timer_sound', soundId)
  }, [soundId])

  useEffect(() => {
    if (!isRunning) return

    const interval = window.setInterval(() => {
      setRemainingSeconds((seconds) => {
        if (seconds <= 1) {
          window.clearInterval(interval)
          setIsRunning(false)
          setTimerComplete(true)
          notifyTimerComplete(selectedSound)
          return 0
        }
        return seconds - 1
      })
    }, 1000)

    return () => window.clearInterval(interval)
  }, [isRunning, selectedSound])

  function selectTimer(minutes) {
    setTimerMinutes(minutes)
    setRemainingSeconds(minutes * 60)
    setIsRunning(false)
    setTimerComplete(false)
  }

  function startTimer() {
    if (remainingSeconds <= 0) {
      setRemainingSeconds(totalSeconds)
    }
    setTimerComplete(false)
    setIsRunning(true)
    requestNotificationPermission()
  }

  function pauseTimer() {
    setIsRunning(false)
  }

  function resetTimer() {
    setIsRunning(false)
    setTimerComplete(false)
    setRemainingSeconds(totalSeconds)
  }

  function previewSound() {
    playCompletionTone(selectedSound)
  }

  const value = {
    timerMinutes,
    remainingSeconds,
    isRunning,
    timerComplete,
    showGlobalTimer,
    soundId,
    selectedSound,
    totalSeconds,
    progress,
    formattedTime,
    selectTimer,
    startTimer,
    pauseTimer,
    resetTimer,
    setShowGlobalTimer,
    setSoundId,
    previewSound,
    clearComplete: () => setTimerComplete(false),
  }

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>
}

export function useTimer() {
  const context = useContext(TimerContext)
  if (!context) {
    throw new Error('useTimer must be used inside TimerProvider')
  }
  return context
}

export function formatTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
}

function notifyTimerComplete(sound) {
  playCompletionTone(sound)

  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('FocusForge timer complete', {
      body: 'Your study session is complete. Time to log it.',
    })
  }
}

function playCompletionTone(sound) {
  const AudioContext = window.AudioContext || window.webkitAudioContext
  if (!AudioContext) return

  const audioContext = new AudioContext()
  const gain = audioContext.createGain()
  gain.connect(audioContext.destination)

  sound.frequencies.forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator()
    oscillator.connect(gain)
    oscillator.frequency.value = frequency
    oscillator.type = sound.id === 'gong' ? 'sine' : 'triangle'
    oscillator.start(audioContext.currentTime + index * 0.08)
    oscillator.stop(audioContext.currentTime + sound.duration + index * 0.08)
  })

  gain.gain.setValueAtTime(0.001, audioContext.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.18, audioContext.currentTime + 0.03)
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + sound.duration)
}
