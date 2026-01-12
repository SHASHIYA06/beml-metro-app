import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { aiSearchService } from './aiSearch';
import { apiService } from './api';

class VoiceAgentService {
  constructor() {
    this.isListening = false;
    this.commands = [];
  }

  // Start listening
  startListening() {
    this.isListening = true;
    return SpeechRecognition.startListening({ continuous: true, language: 'en-IN' });
  }

  // Stop listening
  stopListening() {
    this.isListening = false;
    return SpeechRecognition.stopListening();
  }

  // Process voice command
  async processCommand(transcript) {
    const lowerTranscript = transcript.toLowerCase();

    // Search commands
    if (lowerTranscript.includes('search') || lowerTranscript.includes('find')) {
      const query = transcript.replace(/search|find/gi, '').trim();
      return await this.handleSearch(query);
    }

    // Navigation commands
    if (lowerTranscript.includes('open') || lowerTranscript.includes('go to')) {
      return this.handleNavigation(transcript);
    }

    // Work entry commands
    if (lowerTranscript.includes('submit') || lowerTranscript.includes('create entry')) {
      return this.handleWorkEntry(transcript);
    }

    // Document commands
    if (lowerTranscript.includes('show document') || lowerTranscript.includes('open document')) {
      return this.handleDocumentOpen(transcript);
    }

    return {
      success: false,
      message: 'Command not recognized. Try saying "search for", "open", or "submit entry"'
    };
  }

  // Handle search
  async handleSearch(query) {
    try {
      const result = await aiSearchService.ragSearch(query);
      
      if (result.success) {
        this.speak(`I found ${result.sources?.length || 0} relevant documents. ${result.answer}`);
        return {
          success: true,
          type: 'search',
          data: result
        };
      }

      return { success: false, message: 'No results found' };
    } catch (error) {
      console.error('Voice search error:', error);
      return { success: false, error: error.message };
    }
  }

  // Handle navigation
  handleNavigation(transcript) {
    const routes = {
      'dashboard': '/dashboard',
      'work entry': '/work-entry',
      'my entries': '/my-entries',
      'documents': '/documents',
      'supervisor': '/supervisor',
      'admin': '/admin'
    };

    for (const [keyword, route] of Object.entries(routes)) {
      if (transcript.toLowerCase().includes(keyword)) {
        this.speak(`Opening ${keyword}`);
        return {
          success: true,
          type: 'navigation',
          route: route
        };
      }
    }

    return { success: false, message: 'Page not found' };
  }

  // Handle work entry
  async handleWorkEntry(transcript) {
    // Extract information from voice command
    const parser = this.parseWorkEntry(transcript);
    
    if (parser.isComplete) {
      this.speak('Submitting work entry');
      return {
        success: true,
        type: 'workEntry',
        data: parser.data
      };
    }

    this.speak(`I need more information. Please provide: ${parser.missing.join(', ')}`);
    return {
      success: false,
      type: 'workEntry',
      missing: parser.missing,
      data: parser.data
    };
  }

  // Parse work entry from voice
  parseWorkEntry(transcript) {
    const data = {};
    const required = ['trainset', 'system', 'problem', 'action'];
    const missing = [];

    // Extract trainset
    const trainsetMatch = transcript.match(/trainset\s+(\w+)/i);
    if (trainsetMatch) {
      data.trainset = trainsetMatch[1];
    } else {
      missing.push('trainset');
    }

    // Extract system
    const systemMatch = transcript.match(/system\s+(.+?)(?:problem|issue|$)/i);
    if (systemMatch) {
      data.system = systemMatch[1].trim();
    } else {
      missing.push('system');
    }

    // Extract problem
    const problemMatch = transcript.match(/(?:problem|issue)\s+(.+?)(?:action|fixed|$)/i);
    if (problemMatch) {
      data.problem = problemMatch[1].trim();
    } else {
      missing.push('problem');
    }

    // Extract action
    const actionMatch = transcript.match(/(?:action|fixed|resolved)\s+(.+?)$/i);
    if (actionMatch) {
      data.actionTaken = actionMatch[1].trim();
    } else {
      missing.push('action taken');
    }

    return {
      data,
      missing,
      isComplete: missing.length === 0
    };
  }

  // Text-to-speech
  speak(text) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-IN';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }

  // Check if browser supports speech recognition
  isSupported() {
    return SpeechRecognition.browserSupportsSpeechRecognition();
  }
}

export const voiceAgentService = new VoiceAgentService();