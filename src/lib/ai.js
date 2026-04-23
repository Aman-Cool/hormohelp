import { getAI, getGenerativeModel, GoogleAIBackend } from 'firebase/ai';
import { app } from '../firebase';

const ai = getAI(app, { backend: new GoogleAIBackend() });

export function createModel(systemInstruction, opts = {}) {
  return getGenerativeModel(ai, {
    model: 'gemini-2.0-flash',
    systemInstruction,
    generationConfig: { temperature: 0.7, maxOutputTokens: 600, ...opts },
  });
}
