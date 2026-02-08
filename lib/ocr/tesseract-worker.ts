import { createWorker } from 'tesseract.js';
import type Tesseract from 'tesseract.js';

const OCR_LANGUAGES = 'jpn+eng';
const OEM_LSTM_ONLY = 1;

export interface OcrProgress {
  status: string;
  progress: number;
}

export interface OcrResult {
  text: string;
  confidence: number;
}

let worker: Tesseract.Worker | null = null;
let activeProgressCallback: ((progress: OcrProgress) => void) | undefined;

function handleLoggerMessage(message: Tesseract.LoggerMessage): void {
  if (activeProgressCallback) {
    activeProgressCallback({
      status: message.status,
      progress: message.progress,
    });
  }
}

export async function initializeOcr(onProgress?: (progress: OcrProgress) => void): Promise<void> {
  if (worker) return;

  activeProgressCallback = onProgress;

  worker = await createWorker(OCR_LANGUAGES, OEM_LSTM_ONLY, {
    logger: handleLoggerMessage,
  });
}

export async function recognizeText(
  imageFile: File | Blob,
  onProgress?: (progress: OcrProgress) => void
): Promise<OcrResult> {
  if (!worker) {
    await initializeOcr(onProgress);
  } else if (onProgress) {
    activeProgressCallback = onProgress;
  }

  const result = await worker!.recognize(imageFile);

  return {
    text: result.data.text,
    confidence: result.data.confidence,
  };
}

export async function terminateOcr(): Promise<void> {
  if (!worker) return;

  await worker.terminate();
  worker = null;
  activeProgressCallback = undefined;
}
