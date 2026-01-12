// Copy from Part 6
import React, { useState, useEffect } from 'react';
import { voiceAgentService } from '../services/voiceAgent';
import './VoiceAgent.css';

export default function VoiceAgent({ onClose }) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastResult, setLastResult] = useState(null);

  useEffect(() => {
    return () => {
      if (listening) voiceAgentService.stopListening();
    };
  }, [listening]);

  const handleStart = () => {
    voiceAgentService.startListening();
    setListening(true);
    // Use browser API to capture interim transcript if available
    // The service handles processing; here we simulate capturing via events
    window.addEventListener('speechResult', onSpeechResult);
  };

  const handleStop = () => {
    voiceAgentService.stopListening();
    setListening(false);
    window.removeEventListener('speechResult', onSpeechResult);
  };

  const onSpeechResult = async (e) => {
    const t = e.detail?.transcript || '';
    setTranscript(t);
    const res = await voiceAgentService.processCommand(t);
    setLastResult(res);
  };

  return (
    <div className="voice-agent-panel">
      <div className="voice-header">
        <h3>Voice Agent</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="voice-body">
        <div className="controls">
          {!listening ? (
            <button className="btn btn-primary" onClick={handleStart}>Start Listening</button>
          ) : (
            <button className="btn btn-danger" onClick={handleStop}>Stop</button>
          )}
        </div>

        <div className="transcript">
          <label>Transcript</label>
          <div className="transcript-box">{transcript || 'No input yet'}</div>
        </div>

        {lastResult && (
          <div className="result-box">
            <h4>Result</h4>
            <pre>{JSON.stringify(lastResult, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
