'use client'

import { useState, useEffect, useRef } from 'react'

interface VoiceRecorderProps {
  onTranscriptChange: (transcript: string) => void
  currentText: string
}

export default function VoiceRecorder({ onTranscriptChange, currentText }: VoiceRecorderProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(true)
  const [interimTranscript, setInterimTranscript] = useState('')
  const recognitionRef = useRef<any>(null)
  const baseTextRef = useRef('')
  const lastProcessedIndexRef = useRef(0)
  const isRestartingRef = useRef(false)

  useEffect(() => {
    // Check if browser supports Web Speech API
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

      if (!SpeechRecognition) {
        setIsSupported(false)
        return
      }

      // Initialize recognition
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'es-ES' // Spanish language

      recognition.onresult = (event: any) => {
        let interim = ''
        let final = ''

        // Process only new results to avoid duplicates on mobile
        for (let i = lastProcessedIndexRef.current; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            final += transcript + ' '
          } else {
            interim += transcript
          }
        }

        // Update the last processed index to the current length
        // This prevents reprocessing on auto-restart (mobile issue)
        lastProcessedIndexRef.current = event.results.length

        setInterimTranscript(interim)

        if (final) {
          // Append to base text stored in ref
          baseTextRef.current = baseTextRef.current + final
          onTranscriptChange(baseTextRef.current)
        }
      }

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        if (event.error === 'no-speech') {
          // Restart if no speech detected
          recognition.stop()
          setTimeout(() => {
            if (isListening) {
              recognition.start()
            }
          }, 100)
        } else {
          setIsListening(false)
        }
      }

      recognition.onend = () => {
        if (isListening && !isRestartingRef.current) {
          // Prevent rapid restart loops on mobile
          isRestartingRef.current = true
          setTimeout(() => {
            if (isListening) {
              try {
                recognition.start()
              } catch (e) {
                // Already started
              }
            }
            isRestartingRef.current = false
          }, 300) // Small delay to prevent restart loops
        }
      }

      recognitionRef.current = recognition
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  // Update isListening dependency - removed currentText to prevent restart loops
  useEffect(() => {
    if (recognitionRef.current) {
      if (isListening) {
        // Save current text when starting to listen (only first time)
        if (lastProcessedIndexRef.current === 0) {
          baseTextRef.current = currentText
        }
        // Reset the processed index when starting a new session
        lastProcessedIndexRef.current = 0
        try {
          recognitionRef.current.start()
        } catch (e) {
          // Already started
        }
      } else {
        isRestartingRef.current = false // Cancel any pending restarts
        recognitionRef.current.stop()
        setInterimTranscript('')
        // Reset index when stopping
        lastProcessedIndexRef.current = 0
      }
    }
  }, [isListening]) // Removed currentText from dependencies - it was causing restart loops on mobile

  const toggleListening = () => {
    setIsListening(!isListening)
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
        onClick={toggleListening}
        className={`w-full h-20 rounded-lg font-semibold text-lg transition-all ${
          isListening
            ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
            : 'bg-orange-500 hover:bg-orange-600 text-white'
        }`}
      >
        {isListening ? (
          <span className="flex items-center justify-center gap-2">
            🎤 Escuchando... (presiona para parar)
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            🎤 Presiona para hablar
          </span>
        )}
      </button>

      <div className="text-sm text-gray-600 text-center">
        💡 Consejo: Habla claramente y haz pausas. El texto aparecerá abajo.
      </div>
    </div>
  )
}
