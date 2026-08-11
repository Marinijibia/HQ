import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';

export interface VoicePersona {
  id: string;
  name: string;
  role: string;
  elevenLabsVoiceId: string;
  openAiVoice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  huggingFaceModel: string;
  huggingFacePrompt: string;
  gender: 'male' | 'female';
  pitch: number;
  rate: number;
}

@Injectable()
export class VoiceService {
  private readonly logger = new Logger(VoiceService.name);
  private openaiClient: OpenAI | null = null;

  private readonly personas: Record<string, VoicePersona> = {
    asad: {
      id: 'asad',
      name: 'Asad AI',
      role: 'Universal Executive AI Assistant',
      elevenLabsVoiceId: '21m00Tcm4TlvDq8ikWAM',
      openAiVoice: 'onyx',
      huggingFaceModel: 'parler-tts/parler-tts-mini-v1',
      huggingFacePrompt: 'A confident, authoritative male executive speaking clearly with a professional tone.',
      gender: 'male',
      pitch: 0.9,
      rate: 1.0,
    },
    elena: {
      id: 'elena',
      name: 'CEO Elena',
      role: 'Chief Executive Officer',
      elevenLabsVoiceId: 'EXAVITQu4vr4xnSDxMaL',
      openAiVoice: 'alloy',
      huggingFaceModel: 'parler-tts/parler-tts-mini-v1',
      huggingFacePrompt: 'A clear, articulate female executive speaking with a warm, commanding corporate tone.',
      gender: 'female',
      pitch: 1.1,
      rate: 1.0,
    },
    hiroshi: {
      id: 'hiroshi',
      name: 'CTO Hiroshi',
      role: 'Chief Technology Officer',
      elevenLabsVoiceId: 'ErXwobaYiN019PkySvjV',
      openAiVoice: 'fable',
      huggingFaceModel: 'parler-tts/parler-tts-mini-v1',
      huggingFacePrompt: 'A calm, intelligent male tech lead speaking with clear articulation.',
      gender: 'male',
      pitch: 0.95,
      rate: 1.05,
    },
    sophia: {
      id: 'sophia',
      name: 'CFO Sophia',
      role: 'Chief Financial Officer',
      elevenLabsVoiceId: 'MF3mGyEYCl7XYWbV9V6O',
      openAiVoice: 'shimmer',
      huggingFaceModel: 'parler-tts/parler-tts-mini-v1',
      huggingFacePrompt: 'A sharp, precise female finance director speaking with high clarity.',
      gender: 'female',
      pitch: 1.25,
      rate: 1.0,
    },
  };

  private getOpenAIClient(): OpenAI | null {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return null;

    if (!this.openaiClient) {
      this.openaiClient = new OpenAI({ apiKey });
    }
    return this.openaiClient;
  }

  getAvailablePersonas(): VoicePersona[] {
    return Object.values(this.personas);
  }

  async synthesizeSpeech(
    text: string,
    personaKey: string = 'asad',
    providerPreference: 'elevenlabs' | 'openai' | 'huggingface' | 'auto' = 'auto',
  ): Promise<{
    audioUrl?: string;
    audioBase64?: string;
    persona: VoicePersona;
    fallbackText: string;
    engine: 'elevenlabs' | 'openai' | 'huggingface' | 'webspeech';
  }> {
    const persona = this.personas[personaKey.toLowerCase()] || this.personas.asad;
    const elevenlabsKey = process.env.ELEVENLABS_API_KEY;
    const hfToken = process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY;
    const openai = this.getOpenAIClient();

    this.logger.log(
      `[Voice Service] Synthesizing speech for ${persona.name} (${text.length} chars, preference: ${providerPreference})`,
    );

    // 1. ElevenLabs High-Definition TTS Integration
    if ((providerPreference === 'elevenlabs' || providerPreference === 'auto') && elevenlabsKey) {
      try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${persona.elevenLabsVoiceId}`, {
          method: 'POST',
          headers: {
            'xi-api-key': elevenlabsKey,
            'Content-Type': 'application/json',
            Accept: 'audio/mpeg',
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_turbo_v2',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
            },
          }),
        });

        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const audioBase64 = `data:audio/mpeg;base64,${buffer.toString('base64')}`;
          this.logger.log(`[Voice Service] ElevenLabs HD audio synthesized successfully for ${persona.name}.`);
          return {
            audioBase64,
            persona,
            fallbackText: text,
            engine: 'elevenlabs',
          };
        }
      } catch (err) {
        this.logger.warn(`[Voice Service] ElevenLabs TTS notice: ${err}`);
      }
    }

    // 2. OpenAI SDK High-Definition Speech Synthesis (`openai.audio.speech.create`)
    if ((providerPreference === 'openai' || providerPreference === 'auto') && openai) {
      try {
        const mp3Response = await openai.audio.speech.create({
          model: 'tts-1-hd',
          voice: persona.openAiVoice,
          input: text,
          response_format: 'mp3',
        });

        const arrayBuffer = await mp3Response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const audioBase64 = `data:audio/mp3;base64,${buffer.toString('base64')}`;
        this.logger.log(
          `[Voice Service] Official OpenAI SDK HD audio (${persona.openAiVoice}) synthesized successfully for ${persona.name}.`,
        );

        return {
          audioBase64,
          persona,
          fallbackText: text,
          engine: 'openai',
        };
      } catch (err) {
        this.logger.warn(`[Voice Service] OpenAI SDK Audio TTS notice: ${err}`);
      }
    }

    // 3. Hugging Face Inference API TTS (`parler-tts/parler-tts-mini-v1` or `facebook/mms-tts-eng`)
    if (hfToken) {
      try {
        // Try Parler-TTS mini first for natural prosody
        let response = await fetch(`https://api-inference.huggingface.co/models/${persona.huggingFaceModel}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${hfToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: text,
            parameters: { description: persona.huggingFacePrompt },
          }),
        });

        // Fallback to Facebook MMS-TTS if Parler-TTS is unavailable/loading
        if (!response.ok) {
          response = await fetch('https://api-inference.huggingface.co/models/facebook/mms-tts-eng', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${hfToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ inputs: text }),
          });
        }

        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const audioBase64 = `data:audio/flac;base64,${buffer.toString('base64')}`;
          this.logger.log(
            `[Voice Service] Hugging Face Inference API audio (${persona.huggingFaceModel}) synthesized successfully for ${persona.name}.`,
          );
          return {
            audioBase64,
            persona,
            fallbackText: text,
            engine: 'huggingface',
          };
        }
      } catch (err) {
        this.logger.warn(`[Voice Service] Hugging Face TTS notice: ${err}`);
      }
    }

    // 4. Web Speech API Local Browser Fallback
    return {
      persona,
      fallbackText: text,
      engine: 'webspeech',
    };
  }

  async transcribeAudio(fileBuffer: Buffer, filename: string = 'input.webm'): Promise<string | null> {
    const openai = this.getOpenAIClient();
    const hfToken = process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY;

    // 1. OpenAI Whisper STT
    if (openai) {
      try {
        const file = await OpenAI.toFile(fileBuffer, filename);
        const response = await openai.audio.transcriptions.create({
          model: 'whisper-1',
          file,
        });

        if (response.text) return response.text;
      } catch (err) {
        this.logger.warn(`[Voice Service] OpenAI Whisper STT notice: ${err}`);
      }
    }

    // 2. Hugging Face Whisper Large v3 STT (`openai/whisper-large-v3`)
    if (hfToken) {
      try {
        const response = await fetch('https://api-inference.huggingface.co/models/openai/whisper-large-v3', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${hfToken}`,
            'Content-Type': 'application/octet-stream',
          },
          body: new Uint8Array(fileBuffer),
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.text) return data.text;
        }
      } catch (err) {
        this.logger.warn(`[Voice Service] Hugging Face Whisper STT notice: ${err}`);
      }
    }

    return null;
  }
}
