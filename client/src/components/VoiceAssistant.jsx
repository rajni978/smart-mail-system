import { useState, useEffect, useRef, useMemo } from 'react';
import './VoiceAssistant.css';

const VoiceAssistant = ({ subject, senderName, body, emailId }) => {
  const [status, setStatus] = useState('idle');
  const [muted, setMuted] = useState(false);
  const utteranceRef = useRef(null);

  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

  const text = useMemo(() => {
    const parts = [];
    if (subject) parts.push(`Subject: ${subject}.`);
    parts.push(`From: ${senderName || 'Unknown sender'}.`);
    if (body) parts.push(body);
    return parts.join(' ').trim();
  }, [subject, senderName, body]);

  const cancelSpeech = () => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setStatus('idle');
  };

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    cancelSpeech();
  }, [emailId, text]);

  const handleRead = () => {
    if (!supported || !text) return;
    const synth = window.speechSynthesis;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = muted ? 0 : 1;
    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onstart = () => setStatus('speaking');
    utterance.onend = () => {
      utteranceRef.current = null;
      setStatus('idle');
    };
    utterance.onerror = () => {
      utteranceRef.current = null;
      setStatus('idle');
    };
    utterance.onpause = () => setStatus('paused');
    utterance.onresume = () => setStatus('speaking');

    utteranceRef.current = utterance;
    synth.speak(utterance);
  };

  const handlePause = () => {
    if (!supported) return;
    const synth = window.speechSynthesis;
    if (synth.speaking && !synth.paused) {
      synth.pause();
    }
  };

  const handleResume = () => {
    if (!supported) return;
    const synth = window.speechSynthesis;
    if (synth.paused) {
      synth.resume();
    }
  };

  const handleStop = () => {
    cancelSpeech();
  };

  const handleToggleMute = () => {
    setMuted((prev) => {
      const next = !prev;
      if (utteranceRef.current) {
        utteranceRef.current.volume = next ? 0 : 1;
      }
      return next;
    });
  };

  if (!supported) {
    return (
      <div className="voice-assistant voice-assistant-unavailable">
        <span className="voice-assistant-status">Voice assistant unavailable in this browser.</span>
      </div>
    );
  }

  const canRead = status === 'idle' && !!text;
  const canPause = status === 'speaking';
  const canResume = status === 'paused';
  const canStop = status === 'speaking' || status === 'paused';

  const statusLabel = status === 'idle' ? 'Idle' : status === 'speaking' ? 'Speaking' : 'Paused';

  return (
    <div className="voice-assistant">
      <div className="voice-assistant-header">
        <span className="voice-assistant-title">Voice Assistant</span>
        <span className={`voice-assistant-badge voice-assistant-badge-${status}`}>{statusLabel}</span>
      </div>
      <div className="voice-assistant-controls">
        <button type="button" className="voice-btn voice-btn-primary" onClick={handleRead} disabled={!canRead}>
          Read Email
        </button>
        <button type="button" className="voice-btn" onClick={handlePause} disabled={!canPause}>
          Pause
        </button>
        <button type="button" className="voice-btn" onClick={handleResume} disabled={!canResume}>
          Resume
        </button>
        <button type="button" className="voice-btn" onClick={handleStop} disabled={!canStop}>
          Stop
        </button>
        <button type="button" className="voice-btn" onClick={handleToggleMute}>
          {muted ? 'Unmute' : 'Mute'}
        </button>
      </div>
    </div>
  );
};

export default VoiceAssistant;
