import { get, writable, type Writable } from "svelte/store";
import { DEFAULT_MINUTES, DEFAULT_SECONDS } from "./timer";

type Store = {
  timerId: number|null,
  minutes: number,
  seconds: number,
  startedAt: Date,
  finishedAt: Date,
  progress: number,
  currentMinutes: number,
  currentSeconds: number,
}

const defaultValues: Store = {
  timerId: null,
  minutes: DEFAULT_MINUTES,
  seconds: DEFAULT_SECONDS,
  currentMinutes: DEFAULT_MINUTES,
  currentSeconds: DEFAULT_SECONDS,
  startedAt: new Date,
  finishedAt: new Date,
  progress: 0
}

const create = () => {
  const timer: Writable<Store> = writable(defaultValues);

  const start = (
    minutes: number,
    seconds: number,
    callback: (startedAt: Date, finishedAt: Date, progress: number) => void
  ): void => {
    const startedAt = new Date()
    const finishedAt = new Date(startedAt.getTime())
  
    finishedAt.setTime(
      startedAt.getTime() + (minutes * 60 * 1000) + (seconds * 1000)
    );

    timer.update(t => {
      t.minutes = minutes
      t.seconds = seconds
      t.startedAt = startedAt
      t.finishedAt = finishedAt

      return t
    })

    const timerId = setInterval(() => {
      const progress = finishedAt.getTime() - Date.now()

      timer.update(t => {
        t.progress = progress
        t.currentMinutes = Math.floor(progress / 1000 / 60) % 60
        t.currentSeconds = Math.floor(progress / 1000) % 60

        return t
      })
  
      callback(startedAt, finishedAt, progress)
    }, 300)

    timer.update(t => { 
      t.timerId = timerId
      return t
    })
  }

  const resume = (callback: (startedAt: Date, finishedAt: Date, progress: number) => void) => {
    const currentTimerId = get(timer).timerId
    if (currentTimerId !== null) { return }

    const { minutes, seconds, currentMinutes, currentSeconds} = get(timer)
    const elapsed = ((minutes * 60 * 1000) + (seconds * 1000)) - ((currentMinutes * 60 * 1000) + (currentSeconds * 1000))
    const remains = ((minutes * 60 * 1000) + (seconds * 1000)) - elapsed

    const now = new Date()
    const startedAt = new Date()
    const finishedAt = new Date()

    startedAt.setTime(now.getTime() - elapsed)
    finishedAt.setTime(now.getTime() + remains)

    timer.update(t => {
      t.startedAt = startedAt
      t.finishedAt = finishedAt

      return t
    })

    const timerId = setInterval(() => {
      const progress = finishedAt.getTime() - Date.now()

      timer.update(t => {
        t.progress = progress
        t.currentMinutes = Math.floor(progress / 1000 / 60) % 60
        t.currentSeconds = Math.floor(progress / 1000) % 60

        return t
      })
  
      callback(startedAt, finishedAt, progress)
    }, 300)

    timer.update(t => { 
      t.timerId = timerId
      return t
    })
  }

  const pause = () => {
    const timerId = get(timer).timerId

    if (timerId) {
      clearInterval(timerId)
      timer.update(t => {
        t.timerId = null

        return t
      })
    }
  }

  const stop = () => {
    pause()
    timer.update(t => {
      t.minutes = DEFAULT_MINUTES
      t.seconds = DEFAULT_SECONDS
      t.currentMinutes = DEFAULT_MINUTES
      t.currentSeconds = DEFAULT_SECONDS
      t.startedAt = new Date()
      t.finishedAt = new Date()
      t.progress = 0

      return t
    })
  }

  return { 
    ...timer,
    start,
    resume,
    pause,
    stop
  }
}

export const timer = create()