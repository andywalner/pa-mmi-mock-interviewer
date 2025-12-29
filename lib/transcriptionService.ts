/**
 * Transcription Service
 *
 * Client-side helper for asynchronously transcribing audio blobs using Deepgram API.
 * Designed for fire-and-forget pattern - doesn't block UI.
 */

export async function transcribeAudio(
  stationId: number,
  audioBlob: Blob
): Promise<string | null> {
  try {
    // Create FormData with audio blob
    const formData = new FormData();
    formData.append('audio', audioBlob);

    // Call our API route
    const response = await fetch('/api/transcribe', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Transcription failed');
    }

    const { transcription } = await response.json();

    if (!transcription) {
      throw new Error('No transcription returned');
    }

    console.log(`✅ Transcription completed for station ${stationId}`);
    return transcription;

  } catch (error) {
    console.error(`❌ Transcription error for station ${stationId}:`, error);
    return null;
  }
}
