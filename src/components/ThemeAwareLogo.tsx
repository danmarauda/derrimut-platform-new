"use client"

import { useTheme } from "next-themes"
import Image from "next/image"
import { useEffect, useState } from "react"
import { DERRIMUT_BRAND } from "@/constants/branding"

interface ThemeAwareLogoProps {
  width: number
  height: number
  className?: string
  alt?: string
}

export function ThemeAwareLogo({ 
  width, 
  height, 
  className = "", 
  alt = DERRIMUT_BRAND.nameShort 
}: ThemeAwareLogoProps) {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <Image 
        src={DERRIMUT_BRAND.logo.primary} 
        alt={alt}
        width={width} 
        height={height} 
        className={className}
      />
    )
  }

  // Use white logo for dark mode, primary logo for light mode
  const logoSrc = resolvedTheme === "dark" ? DERRIMUT_BRAND.logo.white : DERRIMUT_BRAND.logo.primary
  
  return (
    <Image 
      src={logoSrc} 
      alt={alt}
      width={width} 
      height={height} 
      className={className}
    />
  )
}
