'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'

interface VoiceOrbProps {
  state: 'idle' | 'recording' | 'processing'
  onTap?: () => void
}

export function VoiceOrb({ state, onTap }: VoiceOrbProps) {
  const [volume, setVolume] = useState(0)
  const [freqBands, setFreqBands] = useState<number[]>(Array(8).fill(0))
  const rafRef = useRef<number>(0)
  const smoothVol = useRef(0)

  const startAudio = useCallback(() => {
    const tick = () => {
      const t = Date.now() / 1000
      const fakeVol = 0.25 + Math.sin(t * 2) * 0.15 + Math.random() * 0.1
      setVolume(fakeVol)
      setFreqBands(Array(8).fill(0).map((_, i) =>
        0.2 + Math.sin(t * 3 + i * 0.8) * 0.2 + Math.random() * 0.15
      ))
      rafRef.current = requestAnimationFrame(tick)
    }
    tick()
  }, [])

  const stopAudio = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    smoothVol.current = 0
    setVolume(0)
    setFreqBands(Array(8).fill(0))
  }, [])

  useEffect(() => {
    if (state === 'recording') {
      startAudio()
    } else {
      stopAudio()
    }
    return () => stopAudio()
  }, [state, startAudio, stopAudio])

  // Blob morph: map 8 freq bands → 8 border-radius corners
  const blobRadius = state === 'recording'
    ? freqBands.map(b => `${42 + b * 22}%`).join(' ') + ' / ' + [...freqBands].reverse().map(b => `${38 + b * 26}%`).join(' ')
    : '50%'

  const orbScale = state === 'recording' ? 1 + volume * 0.5 : 1
  const glowIntensity = state === 'recording' ? volume : 0.1

  return (
    <button
      onClick={onTap}
      className="relative flex items-center justify-center w-52 h-52 group"
      style={{ touchAction: 'manipulation' }}
    >
      {/* Deep ambient glow */}
      <motion.div
        className="absolute"
        animate={{
          scale: state === 'recording' ? 1.6 + volume * 1.0 : 1.2,
          opacity: state === 'recording' ? 0.4 + volume * 0.4 : 0.15,
        }}
        transition={{ type: 'spring', stiffness: 100, damping: 12 }}
        style={{
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(120,220,255,0.5) 0%, rgba(140,160,255,0.3) 40%, transparent 70%)',
          filter: 'blur(30px)',
        }}
      />

      {/* Secondary violet glow */}
      <motion.div
        className="absolute"
        animate={{
          scale: state === 'recording' ? 1.3 + volume * 0.6 : 1.1,
          opacity: state === 'recording' ? 0.3 + volume * 0.3 : 0.1,
        }}
        transition={{ type: 'spring', stiffness: 120, damping: 14 }}
        style={{
          width: 180,
          height: 180,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 60% 70%, rgba(180,130,255,0.45) 0%, rgba(240,147,251,0.2) 30%, transparent 60%)',
          filter: 'blur(20px)',
        }}
      />

      {/* Ripple rings on strong input */}
      {state === 'recording' && volume > 0.3 && (
        <>
          <motion.div
            className="absolute rounded-full border border-aurora-cyan/30"
            animate={{
              scale: [1, 2.2],
              opacity: [0.4, 0],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: 'easeOut',
            }}
            style={{ width: 140, height: 140 }}
          />
          <motion.div
            className="absolute rounded-full border border-aurora-violet/20"
            animate={{
              scale: [1, 2.5],
              opacity: [0.3, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeOut',
              delay: 0.3,
            }}
            style={{ width: 140, height: 140 }}
          />
        </>
      )}

      {/* 3D Sphere */}
      <motion.div
        className="relative overflow-hidden"
        animate={{
          scale: orbScale,
          rotate: state === 'processing' ? 360 : 0,
        }}
        transition={state === 'processing'
          ? { scale: { type: 'spring', stiffness: 180, damping: 12 }, rotate: { duration: 3, repeat: Infinity, ease: 'linear' } }
          : { type: 'spring', stiffness: 180, damping: 12 }
        }
        style={{
          width: 140,
          height: 140,
          borderRadius: blobRadius,
          transition: 'border-radius 0.15s ease',
          boxShadow: `
            inset -8px -10px 20px rgba(0,0,0,0.5),
            inset 4px 4px 15px rgba(0,242,255,${0.15 + glowIntensity * 0.3}),
            0 0 ${20 + glowIntensity * 60}px rgba(0,242,255,${0.15 + glowIntensity * 0.4}),
            0 0 ${40 + glowIntensity * 80}px rgba(102,126,234,${0.1 + glowIntensity * 0.2})
          `,
        }}
      >
        {/* Base gradient — bright sphere body */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(-20deg, #ddd6f3 0%, #faaca8 100%)',
          }}
        />

        {/* Diffuse light — top hemisphere, brighter */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 35% 25%, rgba(120,220,255,0.6) 0%, rgba(0,242,255,0.2) 35%, transparent 60%)',
          }}
        />

        {/* Specular highlight — larger, brighter */}
        <div
          className="absolute"
          style={{
            top: '8%',
            left: '18%',
            width: '40%',
            height: '30%',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.2) 40%, transparent 70%)',
            filter: 'blur(4px)',
          }}
        />

        {/* Rim light — bottom edge, warm violet */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 70% 85%, rgba(180,130,255,0.5) 0%, rgba(240,147,251,0.2) 30%, transparent 55%)',
          }}
        />

        {/* Ambient occlusion — bottom shadow */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 50% 100%, rgba(0,0,0,0.4) 0%, transparent 50%)',
          }}
        />

        {/* Volume-reactive color shift */}
        <motion.div
          className="absolute inset-0"
          animate={{
            opacity: state === 'recording' ? volume * 0.6 : 0,
          }}
          transition={{ duration: 0.1 }}
          style={{
            background: 'radial-gradient(ellipse at 40% 40%, rgba(120,230,255,0.6) 0%, rgba(180,160,255,0.4) 40%, transparent 65%)',
          }}
        />

        {/* Surface distortion shimmer */}
        {state === 'recording' && (
          <motion.div
            className="absolute inset-0"
            animate={{
              opacity: 0.05 + volume * 0.25,
              rotate: volume * 180,
            }}
            transition={{ duration: 0.15 }}
            style={{
              background: `conic-gradient(from 0deg, transparent, rgba(0,242,255,0.25), transparent, rgba(118,75,162,0.2), transparent, rgba(0,242,255,0.2), transparent)`,
            }}
          />
        )}

{/* No center icons — sphere only */}
      </motion.div>

      {/* Idle breathing pulse */}
      {state === 'idle' && (
        <motion.div
          className="absolute rounded-full border border-aurora-cyan/15"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.25, 0.05, 0.25],
          }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ width: 170, height: 170 }}
        />
      )}
    </button>
  )
}
