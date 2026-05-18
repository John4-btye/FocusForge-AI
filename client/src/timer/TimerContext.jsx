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

export const breakOptions = [
  { label: '5 min', minutes: 5 },
  { label: '10 min', minutes: 10 },
  { label: '15 min', minutes: 15 },
  { label: '20 min', minutes: 20 },
]

export const timerSounds = [
  { id: 'bell', label: 'Forge bell', frequencies: [660, 880], duration: 0.9 },
  { id: 'chime', label: 'Bright chime', frequencies: [784, 1046], duration: 0.7 },
  { id: 'gong', label: 'Deep gong', frequencies: [220, 330], duration: 1.2 },
  { id: 'spark', label: 'Ember spark', frequencies: [520, 760, 980], duration: 0.55 },
]

const TimerContext = createContext(null)

export function TimerProvider({ children }) {
  // Timer state is global so the floating timer can follow users across pages.
  const [timerMinutes, setTimerMinutes] = useState(30)
  const [timerMode, setTimerMode] = useState('focus')
  const [remainingSeconds, setRemainingSeconds] = useState(30 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [timerComplete, setTimerComplete] = useState(false)
  const [completedMode, setCompletedMode] = useState(null)
  const [completedFocusMinutes, setCompletedFocusMinutes] = useState(null)
  const [showGlobalTimer, setShowGlobalTimer] = useState(
    () => localStorage.getItem('focusforge_show_timer') === 'true',
  )
  const [soundId, setSoundId] = useState(() => localStorage.getItem('focusforge_timer_sound') || 'bell')

  const totalSeconds = timerMinutes * 60
  const progress = totalSeconds ? ((totalSeconds - remainingSeconds) / totalSeconds) * 100 : 0
  const formattedTime = useMemo(() => formatTime(remainingSeconds), [remainingSeconds])
  const selectedSound = timerSounds.find((sound) => sound.id === soundId) || timerSounds[0]

  useEffect(() => {
    // Persist whether the mini timer should appear outside the Study tab.
    localStorage.setItem('focusforge_show_timer', String(showGlobalTimer))
  }, [showGlobalTimer])

  useEffect(() => {
    // Persist the completion sound choice for future sessions.
    localStorage.setItem('focusforge_timer_sound', soundId)
  }, [soundId])

  useEffect(() => {
    // Countdown interval only runs while active and cleans itself up on pause/unmount.
    if (!isRunning) return

    const interval = window.setInterval(() => {
      setRemainingSeconds((seconds) => {
        if (seconds <= 1) {
          window.clearInterval(interval)
          setIsRunning(false)
          setTimerComplete(true)
          setCompletedMode(timerMode)
          if (timerMode === 'focus') {
            setCompletedFocusMinutes(timerMinutes)
          }
          notifyTimerComplete(selectedSound)
          return 0
        }
        return seconds - 1
      })
    }, 1000)

    return () => window.clearInterval(interval)
  }, [isRunning, selectedSound, timerMinutes, timerMode])

  function selectTimer(minutes) {
    // Choosing a preset resets the active countdown to that duration.
    setTimerMode('focus')
    setTimerMinutes(minutes)
    setRemainingSeconds(minutes * 60)
    setIsRunning(false)
    setTimerComplete(false)
    setCompletedMode(null)
    setCompletedFocusMinutes(null)
  }

  function selectBreak(minutes) {
    // Break mode gives users a timed recovery period without logging study minutes.
    setTimerMode('break')
    setTimerMinutes(minutes)
    setRemainingSeconds(minutes * 60)
    setIsRunning(false)
    setTimerComplete(false)
    setCompletedMode(null)
  }

  function startTimer() {
    // Restart from the selected duration if the previous countdown already finished.
    if (remainingSeconds <= 0) {
      setRemainingSeconds(totalSeconds)
    }
    setTimerComplete(false)
    setCompletedMode(null)
    setIsRunning(true)
    requestNotificationPermission()
  }

  function pauseTimer() {
    setIsRunning(false)
  }

  function resetTimer() {
    setIsRunning(false)
    setTimerComplete(false)
    setCompletedMode(null)
    setRemainingSeconds(totalSeconds)
  }

  function previewSound() {
    playCompletionTone(selectedSound)
  }

  const value = {
    timerMinutes,
    timerMode,
    remainingSeconds,
    isRunning,
    timerComplete,
    completedMode,
    completedFocusMinutes,
    showGlobalTimer,
    soundId,
    selectedSound,
    totalSeconds,
    progress,
    formattedTime,
    selectTimer,
    selectBreak,
    startTimer,
    pauseTimer,
    resetTimer,
    setShowGlobalTimer,
    setSoundId,
    previewSound,
    clearComplete: () => {
      setTimerComplete(false)
      setCompletedMode(null)
      setCompletedFocusMinutes(null)
    },
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
  // Browser notification support is optional; unsupported browsers simply skip it.
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
}

function notifyTimerComplete(sound) {
  // Completion uses both local audio and browser notifications when available.
  playCompletionTone(sound)

  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('FocusForge timer complete', {
      body: 'Your timer is complete. Return to FocusForge when you are ready.',
    })
  }
}

function playCompletionTone(sound) {
  // Web Audio generates simple local tones without needing audio files.
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
