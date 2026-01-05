/**
 * Transcription Service
 *
 * Client-side helper for asynchronously transcribing audio blobs using Deepgram API.
 * Designed for fire-and-forget pattern - doesn't block UI.
 */

export async function transcribeAudio(
  stationId: number,
  audioBlob: Blob,
  retryCount = 0
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

    // Retry once if this is the first attempt
    if (retryCount === 0) {
      console.log(`🔄 Retrying transcription for station ${stationId}...`);
      return transcribeAudio(stationId, audioBlob, 1);
    }

    // After retry failed, return null
    console.error(`❌ Transcription failed after retry for station ${stationId}`);
    return null;
  }
}
