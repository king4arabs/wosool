'use client'

import { Pause, Play } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

export function EoaHeroMedia({ ar }: { ar: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [failed, setFailed] = useState(false)
  const [paused, setPaused] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  const sources = useMemo(
    () =>
      [
        {
          src: process.env.NEXT_PUBLIC_EOA_HERO_VIDEO_WEBM,
          type: 'video/webm',
        },
        {
          src: process.env.NEXT_PUBLIC_EOA_HERO_VIDEO_MP4,
          type: 'video/mp4',
        },
      ].filter((source): source is { src: string; type: string } => Boolean(source.src)),
    [],
  )

  const poster = process.env.NEXT_PUBLIC_EOA_HERO_POSTER
  const hasVideo = sources.length > 0

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncPreference = () => {
      setReducedMotion(query.matches)
      if (query.matches) {
        videoRef.current?.pause()
        setPaused(true)
      }
    }

    syncPreference()
    query.addEventListener?.('change', syncPreference)
    return () => query.removeEventListener?.('change', syncPreference)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video || failed || reducedMotion) return

    void video
      .play()
      .then(() => setPaused(false))
      .catch(() => setPaused(true))
  }, [failed, reducedMotion])

  async function togglePlayback() {
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      try {
        await video.play()
        setPaused(false)
      } catch {
        setPaused(true)
      }
      return
    }

    video.pause()
    setPaused(true)
  }

  return (
    <>
      <div className="eoa-hero-fallback" aria-hidden="true" />
      {hasVideo && !failed && (
        <video
          ref={videoRef}
          className="eoa-hero-media"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={poster || undefined}
          aria-hidden="true"
          onError={() => setFailed(true)}
          onPause={() => setPaused(true)}
          onPlay={() => setPaused(false)}
        >
          {sources.map((source) => (
            <source key={source.type} src={source.src} type={source.type} />
          ))}
        </video>
      )}
      <div className="eoa-hero-scrim" aria-hidden="true" />
      {hasVideo && !failed && !reducedMotion && (
        <button
          className="eoa-hero-media-control"
          type="button"
          onClick={togglePlayback}
          aria-label={
            paused
              ? ar
                ? 'تشغيل خلفية الرياض'
                : 'Play Riyadh background video'
              : ar
                ? 'إيقاف خلفية الرياض مؤقتاً'
                : 'Pause Riyadh background video'
          }
          aria-pressed={paused}
        >
          {paused ? <Play size={17} /> : <Pause size={17} />}
          <span>
            {paused
              ? ar
                ? 'تشغيل'
                : 'Play'
              : ar
                ? 'إيقاف مؤقت'
                : 'Pause'}
          </span>
        </button>
      )}
    </>
  )
}
