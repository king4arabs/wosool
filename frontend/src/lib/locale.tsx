"use client"

import * as React from "react"

export type Locale = "ar" | "en" | "fr"

export const localeOptions = [
  { code: "ar" as const, nativeLabel: "العربية", direction: "rtl" as const },
  { code: "en" as const, nativeLabel: "English", direction: "ltr" as const },
  { code: "fr" as const, nativeLabel: "Français", direction: "ltr" as const },
]

interface LocaleContextValue {
  locale: Locale
  direction: "rtl" | "ltr"
  setLocale: (locale: Locale) => void
}

const LocaleContext = React.createContext<LocaleContextValue | null>(null)
const STORAGE_KEY = "wosool-locale"

function getDirection(locale: Locale): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr"
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>("ar")

  React.useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Locale | null
    if (stored && localeOptions.some((option) => option.code === stored)) {
      setLocaleState(stored)
    }
  }, [])

  React.useEffect(() => {
    const direction = getDirection(locale)
    document.documentElement.lang = locale
    document.documentElement.dir = direction
    document.body.classList.toggle("locale-ar", locale === "ar")
    document.body.classList.toggle("locale-latin", locale !== "ar")
    document.body.dataset.locale = locale
    document.body.dataset.direction = direction
  }, [locale])

  const setLocale = React.useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale)
    window.localStorage.setItem(STORAGE_KEY, nextLocale)
  }, [])

  const value = React.useMemo(
    () => ({
      locale,
      direction: getDirection(locale),
      setLocale,
    }),
    [locale, setLocale]
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const context = React.useContext(LocaleContext)
  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider")
  }

  return context
}
