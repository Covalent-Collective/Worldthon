'use client'

import { useRef, useId, useEffect, type CSSProperties } from 'react'
import { animate, useMotionValue, type AnimationPlaybackControls } from 'framer-motion'

interface EtherealShadowProps {
  color?: string
  animationScale?: number
  animationSpeed?: number
  noiseOpacity?: number
  noiseScale?: number
  style?: CSSProperties
  className?: string
}

function mapRange(
  value: number,
  fromLow: number,
  fromHigh: number,
  toLow: number,
  toHigh: number
): number {
  if (fromLow === fromHigh) return toLow
  const percentage = (value - fromLow) / (fromHigh - fromLow)
  return toLow + percentage * (toHigh - toLow)
}

export function EtherealShadow({
  color = 'rgba(0, 242, 255, 0.4)',
  animationScale = 50,
  animationSpeed = 30,
  noiseOpacity = 0.3,
  noiseScale = 1,
  style,
  className,
}: EtherealShadowProps) {
  const rawId = useId().replace(/:/g, '')
  const id = `ethereal-${rawId}`
  const feColorMatrixRef = useRef<SVGFEColorMatrixElement>(null)
  const hueRotateMotionValue = useMotionValue(180)
  const hueRotateAnimation = useRef<AnimationPlaybackControls | null>(null)

  const displacementScale = mapRange(animationScale, 1, 100, 20, 100)
  const animationDuration = mapRange(animationSpeed, 1, 100, 1000, 50)

  useEffect(() => {
    if (!feColorMatrixRef.current) return

    if (hueRotateAnimation.current) {
      hueRotateAnimation.current.stop()
    }

    hueRotateMotionValue.set(0)
    hueRotateAnimation.current = animate(hueRotateMotionValue, 360, {
      duration: animationDuration / 25,
      repeat: Infinity,
      repeatType: 'loop',
      repeatDelay: 0,
      ease: 'linear',
      delay: 0,
      onUpdate: (value: number) => {
        if (feColorMatrixRef.current) {
          feColorMatrixRef.current.setAttribute('values', String(value))
        }
      },
    })

    return () => {
      if (hueRotateAnimation.current) {
        hueRotateAnimation.current.stop()
      }
    }
  }, [animationDuration, hueRotateMotionValue])

  return (
    <div
      className={className}
      style={{
        overflow: 'hidden',
        position: 'absolute',
        inset: 0,
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: -displacementScale,
          filter: `url(#${id}) blur(4px)`,
        }}
      >
        <svg style={{ position: 'absolute' }}>
          <defs>
            <filter id={id}>
              <feTurbulence
                result="undulation"
                numOctaves={2}
                baseFrequency={`${mapRange(animationScale, 0, 100, 0.001, 0.0005)},${mapRange(animationScale, 0, 100, 0.004, 0.002)}`}
                seed={0}
                type="turbulence"
              />
              <feColorMatrix
                ref={feColorMatrixRef}
                in="undulation"
                type="hueRotate"
                values="180"
              />
              <feColorMatrix
                in="dist"
                result="circulation"
                type="matrix"
                values="4 0 0 0 1 4 0 0 0 1 4 0 0 0 1 1 0 0 0 0"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="circulation"
                scale={displacementScale}
                result="dist"
              />
              <feDisplacementMap
                in="dist"
                in2="undulation"
                scale={displacementScale}
                result="output"
              />
            </filter>
          </defs>
        </svg>
        <div
          style={{
            backgroundColor: color,
            maskImage: `url('https://framerusercontent.com/images/ceBGguIpUU8luwByxuQz79t7To.png')`,
            maskSize: 'cover',
            maskRepeat: 'no-repeat',
            maskPosition: 'center',
            width: '100%',
            height: '100%',
          }}
        />
      </div>

      {noiseOpacity > 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url("https://framerusercontent.com/images/g0QcWrxr87K0ufOxIUFBakwYA8.png")`,
            backgroundSize: noiseScale * 200,
            backgroundRepeat: 'repeat',
            opacity: noiseOpacity / 2,
          }}
        />
      )}
    </div>
  )
}
