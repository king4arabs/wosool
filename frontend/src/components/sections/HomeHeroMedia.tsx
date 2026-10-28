"use client"

import Image from "next/image"
import { Pause, Play } from "lucide-react"
import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import styles from "./HomeHeroMedia.module.css"

type Connection = EventTarget & { saveData?: boolean; effectiveType?: string }
const connection = () => (navigator as Navigator & { connection?: Connection }).connection

function subscribePreferences(onChange: () => void) {
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)")
  const network = connection()
  motion.addEventListener("change", onChange)
  network?.addEventListener("change", onChange)
  return () => {
    motion.removeEventListener("change", onChange)
    network?.removeEventListener("change", onChange)
  }
}

function canPlayBackground() {
  const network = connection()
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    && !network?.saveData && !["slow-2g", "2g"].includes(network?.effectiveType || "")
}

function BackgroundVideo({ ar }: { ar: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const userPaused = useRef(false)
  const failedSources = useRef(0)
  const [paused, setPaused] = useState(true)
  const [failed, setFailed] = useState(false)
  // Select once per mount, avoiding a second download on orientation changes.
  const [src] = useState(() => window.matchMedia("(max-width: 720px)").matches
    ? "/media/home-journey-mobile" : "/media/home-journey")

  useEffect(() => {
    const video = videoRef.current
    if (!video || failed) return
    let visible = true
    const syncPlayback = () => {
      if (document.hidden || !visible || userPaused.current) video.pause()
      else void video.play().catch(() => setPaused(true))
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      syncPlayback()
    })
    observer.observe(video)
    document.addEventListener("visibilitychange", syncPlayback)
    return () => {
      observer.disconnect()
      document.removeEventListener("visibilitychange", syncPlayback)
      video.pause()
    }
  }, [failed])

  if (failed) return null

  function togglePlayback() {
    const video = videoRef.current
    if (!video) return
    userPaused.current = !video.paused
    if (userPaused.current) video.pause()
    else void video.play().catch(() => setPaused(true))
  }

  return <>
    <video ref={videoRef} className={styles.video} muted loop playsInline
      preload="metadata" poster="/media/home-journey.webp" aria-hidden="true"
      onPlaying={() => setPaused(false)} onPause={() => setPaused(true)}
      onError={event => { if (event.target === event.currentTarget) setFailed(true) }}>
      {["webm", "mp4"].map(format => <source key={format} src={`${src}.${format}`} type={`video/${format}`}
        onError={() => { if (++failedSources.current === 2) setFailed(true) }} />)}
    </video>
    <button type="button" className={styles.control} onClick={togglePlayback}
      aria-label={paused
        ? ar ? "تشغيل فيديو الخلفية" : "Play background video"
        : ar ? "إيقاف فيديو الخلفية مؤقتًا" : "Pause background video"}>
      {paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
      <span>{paused ? ar ? "تشغيل" : "Play" : ar ? "إيقاف مؤقت" : "Pause"}</span>
    </button>
  </>
}

export function HomeHeroMedia({ ar }: { ar: boolean }) {
  const allowed = useSyncExternalStore(subscribePreferences, canPlayBackground, () => false)
  return <>
    <Image src="/media/home-journey.webp" alt="" fill preload sizes="100vw"
      className={styles.poster} />
    {allowed && <BackgroundVideo ar={ar} />}
    <div className={styles.scrim} aria-hidden="true" />
  </>
}
