import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import en from './locales/en.json'
import fr from './locales/fr.json'
import ar from './locales/ar.json'

export const RTL_LANGUAGES = ['ar']

export const SUPPORTED_LANGUAGES = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' },
]

/** Kept alongside i18next's own resolution so <html dir/lang> can be set before
 * first paint (see main.jsx) without waiting on the React tree to mount. */
export function applyDocumentDirection(language) {
  const dir = RTL_LANGUAGES.includes(language) ? 'rtl' : 'ltr'
  document.documentElement.lang = language
  document.documentElement.dir = dir
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      ar: { translation: ar },
    },
    // Morocco is the primary market and French is the common written language
    // there for e-commerce; a browser reporting no clear preference lands on it
    // rather than on English.
    fallbackLng: 'fr',
    supportedLngs: ['en', 'fr', 'ar'],
    nonExplicitSupportedLngs: true,
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'giftme-language',
    },
    interpolation: { escapeValue: false },
  })

applyDocumentDirection(i18n.resolvedLanguage ?? i18n.language)

i18n.on('languageChanged', (language) => {
  applyDocumentDirection(language)
})

export default i18n
