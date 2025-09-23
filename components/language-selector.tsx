"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Globe } from "lucide-react"

interface Language {
  code: string
  name: string
  nativeName: string
  flag: string
}

const languages: Language[] = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: "🇺🇸"
  },
  {
    code: "si",
    name: "Sinhala",
    nativeName: "සිංහල",
    flag: "🇱🇰"
  }
]

export function LanguageSelector() {
  const [currentLanguage, setCurrentLanguage] = useState("en")
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Get saved language from localStorage or default to English
    const savedLanguage = localStorage.getItem("language") || "en"
    setCurrentLanguage(savedLanguage)
    document.documentElement.lang = savedLanguage
  }, [])

  const handleLanguageChange = (languageCode: string) => {
    setCurrentLanguage(languageCode)
    localStorage.setItem("language", languageCode)
    document.documentElement.lang = languageCode
    setIsOpen(false)

    // Here you would typically integrate with a translation system
    // For now, we'll just change the document language attribute
    console.log(`Language changed to: ${languageCode}`)
  }

  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0]

  return (
    <div className="fixed top-20 left-4 z-50">
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white/90 backdrop-blur-sm border-white/20 shadow-lg hover:bg-white/95 transition-all duration-300"
        >
          <Globe className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">{currentLang.nativeName}</span>
          <span className="sm:hidden">{currentLang.flag}</span>
        </Button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <div className="absolute top-full mt-2 left-0 z-50 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-white/20 min-w-[200px] py-2">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={`w-full px-4 py-3 text-left hover:bg-orange-50 transition-colors duration-200 flex items-center space-x-3 ${
                    currentLanguage === language.code ? 'bg-orange-100 text-orange-700' : 'text-slate-700'
                  }`}
                >
                  <span className="text-lg">{language.flag}</span>
                  <div className="flex-1">
                    <div className="font-medium">{language.nativeName}</div>
                    <div className="text-xs text-slate-500">{language.name}</div>
                  </div>
                  {currentLanguage === language.code && (
                    <Badge variant="secondary" className="bg-orange-200 text-orange-700 text-xs">
                      Active
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
