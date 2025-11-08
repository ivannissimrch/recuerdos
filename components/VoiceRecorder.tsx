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
            // Update the last processed index when we get a final result
            lastProcessedIndexRef.current = i + 1
          } else {
            interim += transcript
          }
        }

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
        if (isListening) {
          // Restart recognition if it stops but we're still supposed to be listening
          recognition.start()
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

  // Update isListening dependency
  useEffect(() => {
    if (recognitionRef.current) {
      if (isListening) {
        // Save current text when starting to listen
        baseTextRef.current = currentText
        // Reset the processed index when starting a new session
        lastProcessedIndexRef.current = 0
        try {
          recognitionRef.current.start()
        } catch (e) {
          // Already started
        }
      } else {
        recognitionRef.current.stop()
        setInterimTranscript('')
        // Reset index when stopping
        lastProcessedIndexRef.current = 0
      }
    }
  }, [isListening, currentText])

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
