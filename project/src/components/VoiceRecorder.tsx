import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Loader2, Volume2, Play, Pause, Trash2, Square, Brain, Zap, Target, Activity } from 'lucide-react';

interface VoiceRecorderProps {
  onVoiceLog: (audioBlob: Blob, transcript?: string) => Promise<void>;
  isLoading: boolean;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onVoiceLog, isLoading }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [waveformData, setWaveformData] = useState<number[]>(new Array(20).fill(0));
  const [recordingStatus, setRecordingStatus] = useState<'idle' | 'recording' | 'recorded' | 'processing'>('idle');
  const [detectedIntent, setDetectedIntent] = useState<string | null>(null);
  const [workflowStep, setWorkflowStep] = useState<string>('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Detect intent from transcript based on your n8n OpenAI Assistant instructions
  useEffect(() => {
    if (transcript) {
      const lowerTranscript = transcript.toLowerCase();
      
      if (lowerTranscript.includes('today is') || 
          lowerTranscript.includes('day') || 
          lowerTranscript.includes('muscle') ||
          lowerTranscript.includes('chest') ||
          lowerTranscript.includes('back') ||
          lowerTranscript.includes('legs') ||
          lowerTranscript.includes('arms') ||
          lowerTranscript.includes('feeling') ||
          lowerTranscript.includes('slept')) {
        setDetectedIntent('workout_session');
      } else if (lowerTranscript.includes('feel') || 
                lowerTranscript.includes('mood') ||
                lowerTranscript.includes('energy') ||
                lowerTranscript.includes('tired') ||
                lowerTranscript.includes('motivated') ||
                lowerTranscript.includes('sore')) {
        setDetectedIntent('mood');
      } else if (lowerTranscript.includes('set') ||
                lowerTranscript.includes('reps') ||
                lowerTranscript.includes('lbs') ||
                lowerTranscript.includes('pounds') ||
                lowerTranscript.includes('kg') ||
                /\d+\s*(reps?|rep)/.test(lowerTranscript) ||
                /\d+\s*(lbs?|pounds?)/.test(lowerTranscript)) {
        setDetectedIntent('exercise');
      } else {
        setDetectedIntent('exercise'); // Default to exercise for any exercise name
      }
    } else {
      setDetectedIntent(null);
    }
  }, [transcript]);

  // Simulate workflow steps during processing
  useEffect(() => {
    if (recordingStatus === 'processing') {
      const steps = [
        'Uploading audio to n8n...',
        'Transcribing with Whisper...',
        'Analyzing with OpenAI Assistant...',
        'Parsing JSON response...',
        'Saving to Supabase...',
        'Complete!'
      ];
      
      let stepIndex = 0;
      setWorkflowStep(steps[0]);
      
      const stepInterval = setInterval(() => {
        stepIndex++;
        if (stepIndex < steps.length) {
          setWorkflowStep(steps[stepIndex]);
        } else {
          clearInterval(stepInterval);
        }
      }, 800);
      
      return () => clearInterval(stepInterval);
    }
  }, [recordingStatus]);

  const analyzeAudio = (stream: MediaStream) => {
    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);
    
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.8;
    microphone.connect(analyser);
    analyserRef.current = analyser;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const waveformArray = new Float32Array(analyser.fftSize);
    
    const updateAudioLevel = () => {
      if (analyserRef.current && isRecording) {
        analyserRef.current.getByteFrequencyData(dataArray);
        analyserRef.current.getFloatTimeDomainData(waveformArray);
        
        // Calculate average volume
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average / 255);
        
        // Update waveform visualization
        const waveform = [];
        const step = Math.floor(waveformArray.length / 20);
        for (let i = 0; i < 20; i++) {
          const slice = waveformArray.slice(i * step, (i + 1) * step);
          const rms = Math.sqrt(slice.reduce((sum, val) => sum + val * val, 0) / slice.length);
          waveform.push(Math.min(rms * 10, 1)); // Normalize and cap at 1
        }
        setWaveformData(waveform);
        
        animationRef.current = requestAnimationFrame(updateAudioLevel);
      }
    };
    
    updateAudioLevel();
  };

  const startRecording = async () => {
    try {
      setRecordingStatus('recording');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
          channelCount: 1,
        }
      });
      
      // Use WebM format for better n8n compatibility
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
          ? 'audio/webm;codecs=opus' 
          : 'audio/webm'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      // Start audio analysis for visual feedback
      analyzeAudio(stream);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        setAudioBlob(blob);
        setAudioLevel(0);
        setWaveformData(new Array(20).fill(0));
        setRecordingStatus('recorded');
        stream.getTracks().forEach(track => track.stop());
        
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setRecordingStatus('idle');
      alert('Unable to access microphone. Please check permissions and try again.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSend = async () => {
    if (audioBlob || transcript.trim()) {
      setRecordingStatus('processing');
      await onVoiceLog(audioBlob || new Blob(), transcript);
      // Reset after successful send
      resetRecorder();
    }
  };

  const resetRecorder = () => {
    setAudioURL(null);
    setAudioBlob(null);
    setTranscript('');
    setRecordingTime(0);
    setIsPlaying(false);
    setAudioLevel(0);
    setWaveformData(new Array(20).fill(0));
    setRecordingStatus('idle');
    setDetectedIntent(null);
    setWorkflowStep('');
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusMessage = () => {
    switch (recordingStatus) {
      case 'recording':
        return 'Recording in progress...';
      case 'recorded':
        return 'Recording complete. Ready to send to n8n.';
      case 'processing':
        return workflowStep || 'Processing with n8n AI...';
      default:
        return 'Ready to record your workout';
    }
  };

  const getIntentIcon = (intent: string | null) => {
    switch (intent) {
      case 'workout_session':
        return <Target className="h-4 w-4" />;
      case 'mood':
        return <Zap className="h-4 w-4" />;
      case 'exercise':
        return <Activity className="h-4 w-4" />;
      default:
        return <Brain className="h-4 w-4" />;
    }
  };

  const getIntentColor = (intent: string | null) => {
    switch (intent) {
      case 'workout_session':
        return 'bg-primary-100 text-primary-700 border-primary-200';
      case 'mood':
        return 'bg-accent-100 text-accent-700 border-accent-200';
      case 'exercise':
        return 'bg-secondary-100 text-secondary-700 border-secondary-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getIntentLabel = (intent: string | null) => {
    switch (intent) {
      case 'workout_session':
        return 'Workout Session Creation';
      case 'mood':
        return 'Mood Logging';
      case 'exercise':
        return 'Exercise Set Logging';
      default:
        return 'Auto-detect Intent';
    }
  };

  const getWorkflowEndpoint = (intent: string | null) => {
    switch (intent) {
      case 'workout_session':
        return '/log_workout_session';
      case 'mood':
        return '/log_mood';
      case 'exercise':
        return '/log_excersice';
      default:
        return '/log_excersice';
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Voice Workout Log</h2>
        <p className="text-sm sm:text-base text-gray-600">Record your workout and let n8n AI parse the details</p>
      </div>

      {/* Status Indicator */}
      <div className="text-center mb-4" role="status" aria-live="polite">
        <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
          recordingStatus === 'recording' ? 'bg-red-100 text-red-700' :
          recordingStatus === 'recorded' ? 'bg-green-100 text-green-700' :
          recordingStatus === 'processing' ? 'bg-blue-100 text-blue-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            recordingStatus === 'recording' ? 'bg-red-500 animate-pulse' :
            recordingStatus === 'recorded' ? 'bg-green-500' :
            recordingStatus === 'processing' ? 'bg-blue-500 animate-pulse' :
            'bg-gray-500'
          }`}></div>
          <span>{getStatusMessage()}</span>
        </div>
      </div>

      {/* Intent Detection */}
      {detectedIntent && (
        <div className="text-center mb-4">
          <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium border ${getIntentColor(detectedIntent)}`}>
            {getIntentIcon(detectedIntent)}
            <div className="text-left">
              <div className="font-semibold">{getIntentLabel(detectedIntent)}</div>
              <div className="text-xs opacity-75">→ {getWorkflowEndpoint(detectedIntent)}</div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 mb-6">
        <div className="text-center">
          {/* Recording Button with Audio Level Visualization */}
          <div className="relative mb-6">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isLoading || recordingStatus === 'processing'}
              className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 focus:ring-red-300'
                  : 'bg-primary-600 hover:bg-primary-700 hover:scale-105 focus:ring-primary-300'
              } disabled:opacity-50 disabled:cursor-not-allowed shadow-lg`}
              style={{
                transform: isRecording ? `scale(${1 + audioLevel * 0.2})` : 'scale(1)',
              }}
              aria-label={isRecording ? 'Stop recording' : 'Start recording'}
              aria-pressed={isRecording}
            >
              {isRecording ? (
                <Square className="h-8 w-8 sm:h-10 sm:w-10 text-white mx-auto" />
              ) : (
                <Mic className="h-8 w-8 sm:h-10 sm:w-10 text-white mx-auto" />
              )}
              
              {isRecording && (
                <>
                  <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-20"></div>
                  <div 
                    className="absolute inset-0 rounded-full bg-red-400 opacity-30"
                    style={{
                      transform: `scale(${1 + audioLevel * 0.3})`,
                      transition: 'transform 0.1s ease-out'
                    }}
                  ></div>
                </>
              )}
            </button>

            {/* Real-time Waveform Visualization */}
            {isRecording && (
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex items-end space-x-1" 
                   role="img" aria-label="Audio waveform visualization">
                {waveformData.map((amplitude, i) => (
                  <div
                    key={i}
                    className="bg-red-500 rounded-full transition-all duration-100"
                    style={{
                      width: '3px',
                      height: `${Math.max(4, amplitude * 24)}px`,
                      opacity: amplitude > 0.1 ? 1 : 0.3,
                    }}
                  ></div>
                ))}
              </div>
            )}
          </div>

          {/* Recording Time and Level Indicator */}
          {isRecording && (
            <div className="mb-6 animate-fade-in">
              <div className="text-2xl sm:text-3xl font-bold text-red-600 mb-2" aria-live="polite">
                {formatTime(recordingTime)}
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center space-x-2">
                <Volume2 className="h-4 w-4" />
                <span>Recording for n8n processing...</span>
              </div>
              
              {/* Audio Level Meter */}
              <div className="mt-3 max-w-xs mx-auto">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">Level:</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 h-2 rounded-full transition-all duration-100"
                      style={{ width: `${audioLevel * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 w-8">{Math.round(audioLevel * 100)}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Status Messages */}
          <div className="text-center mb-4">
            {isRecording ? (
              <p className="text-red-600 font-medium">Tap the square to stop recording</p>
            ) : audioURL ? (
              <p className="text-green-600 font-medium">Recording ready to send to n8n workflow</p>
            ) : (
              <p className="text-gray-600">Tap the microphone to start recording</p>
            )}
          </div>
        </div>

        {/* Audio Playback Controls */}
        {audioURL && (
          <div className="bg-gray-50 rounded-xl p-4 mb-4 animate-slide-up">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">
                Recorded Audio ({formatTime(recordingTime)})
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={togglePlayback}
                  className="p-2 rounded-lg bg-primary-100 hover:bg-primary-200 text-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-300"
                  aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>
                <button
                  onClick={resetRecorder}
                  className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
                  aria-label="Delete recording"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <audio
              ref={audioRef}
              src={audioURL}
              onEnded={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className="w-full"
              controls
              aria-label="Recorded workout audio"
            />
          </div>
        )}

        {/* Manual Transcript Input */}
        <div className="mb-4">
          <label htmlFor="transcript" className="block text-sm font-medium text-gray-700 mb-2">
            Or type your workout manually
          </label>
          <textarea
            id="transcript"
            rows={3}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="e.g., Did 3 sets of bench press at 185 lbs for 10, 8, and 6 reps"
            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-colors"
            aria-describedby="transcript-help"
          />
          <p id="transcript-help" className="text-xs text-gray-500 mt-1">
            You can either record audio or type your workout details manually
          </p>
        </div>

        {/* Send Button */}
        {(audioBlob || transcript.trim()) && (
          <button
            onClick={handleSend}
            disabled={isLoading || recordingStatus === 'processing'}
            className="w-full bg-secondary-600 hover:bg-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center space-x-2 animate-scale-in focus:outline-none focus:ring-4 focus:ring-secondary-300"
            aria-label="Send workout data for processing"
          >
            {isLoading || recordingStatus === 'processing' ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
            <span>
              {isLoading || recordingStatus === 'processing' ? 'Processing with n8n...' : 'Send to n8n Workflow'}
            </span>
          </button>
        )}
      </div>

      {/* n8n Workflow Guide */}
      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        <div className="bg-primary-50 rounded-xl p-4 border border-primary-200">
          <h3 className="font-semibold text-primary-900 mb-2 flex items-center">
            🎯 Your n8n Workflow Endpoints:
          </h3>
          <ul className="text-sm text-primary-800 space-y-1">
            <li>• <strong>Exercise Sets:</strong> "Set 1 bench press 185 for 10 reps"</li>
            <li>• <strong>Workout Session:</strong> "Today is chest and back day"</li>
            <li>• <strong>Mood Logging:</strong> "I feel energetic before the gym"</li>
            <li>• <strong>Smart Routing:</strong> AI detects intent automatically</li>
          </ul>
        </div>

        <div className="bg-accent-50 rounded-xl p-4 border border-accent-200">
          <h3 className="font-semibold text-accent-900 mb-2">🤖 AI Processing Flow:</h3>
          <div className="space-y-2 text-sm text-accent-800">
            <div className="bg-white rounded-lg p-3 border border-accent-200">
              <strong>Audio → Whisper STT → OpenAI Assistant → Parse JSON → Supabase</strong>
              <div className="text-xs text-accent-600 mt-1">→ Your n8n workflow (ID: 57ce16fe-2090-4d87-84cb-7f3806d083cc)</div>
            </div>
          </div>
        </div>
      </div>

      {/* n8n Integration Status */}
      <div className="mt-4 bg-blue-50 rounded-xl p-4 border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">🔗 n8n Workflow Status:</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-blue-800">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Exercise Logging Active</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Mood Tracking Active</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Session Creation Active</span>
          </div>
        </div>
        <div className="mt-2 text-xs text-blue-700">
          <strong>Webhook ID:</strong> 57ce16fe-2090-4d87-84cb-7f3806d083cc
        </div>
      </div>
    </div>
  );
};

export default VoiceRecorder;