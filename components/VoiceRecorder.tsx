'use client'

import { useState, useEffect, useRef } from 'react'

interface VoiceRecorderProps {
  onTranscriptChange: (transcript: string) => void
  currentText: string
}

export default function VoiceRecorder({ onTranscriptChange, currentText }: VoiceRecorderProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(true)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

      if (!SpeechRecognition) {
        setIsSupported(false)
        return
      }

      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'es-ES'

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        const newText = currentText + transcript + ' '
        onTranscriptChange(newText)
        setIsListening(false)
      }

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [currentText, onTranscriptChange])

  const handleClick = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    } else {
      try {
        recognitionRef.current?.start()
        setIsListening(true)
      } catch (e) {
        console.error('Failed to start recognition:', e)
      }
    }
  }

  if (!isSupported) {
    return (
      <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4 text-center">
        <p className="text-orange-800">
          Tu navegador no soporta grabación de voz. Intenta usar Chrome o Safari.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleClick}
        className={`w-full h-20 rounded-lg font-semibold text-lg transition-all ${
          isListening
            ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
            : 'bg-orange-500 hover:bg-orange-600 text-white'
        }`}
      >
        {isListening ? (
          <span className="flex items-center justify-center gap-2">
            🎤 Escuchando... (habla ahora)
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            🎤 Toca para agregar más
          </span>
        )}
      </button>

      <div className="text-sm text-gray-600 text-center">
        💡 Toca el botón, di una frase, y se agregará al texto. Repite para agregar más.
      </div>
    </div>
  )
}
