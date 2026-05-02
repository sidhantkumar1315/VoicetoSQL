import { useState, useRef } from "react";

// Minimal podcast mic — pill capsule with concentric arcs + solid base
function MicIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {/* Capsule outline */}
      <path d="M12 2a4 4 0 0 0-4 4v5a4 4 0 0 0 8 0V6a4 4 0 0 0-4-4z" />
      {/* Concentric arcs inside capsule */}
      <path d="M10 6.5a2 2 0 0 1 4 0" strokeWidth="1.2" />
      <path d="M9 8.5a3 3 0 0 1 6 0"  strokeWidth="1.2" />
      {/* Stem */}
      <line x1="12" y1="15" x2="12" y2="19" />
      {/* Solid base bar */}
      <line x1="7" y1="19" x2="17" y2="19" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="10" fillOpacity="0.15" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}

export default function VoiceButton({ onTranscript, disabled }) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const toggle = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Your browser doesn't support voice input. Try Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      onTranscript(transcript);
      setListening(false);
    };

    recognition.onerror = () => setListening(false);
    recognition.onend   = () => setListening(false);

    recognition.start();
    setListening(true);
  };

  return (
    <button
      onClick={toggle}
      disabled={disabled}
      title={listening ? "Stop listening" : "Ask with voice"}
      className={`voice-btn${listening ? " listening" : ""}`}
    >
      {listening ? <StopIcon /> : <MicIcon />}
    </button>
  );
}
