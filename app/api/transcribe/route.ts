import { createClient } from '@deepgram/sdk';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // 1. Check for API key
    if (!process.env.DEEPGRAM_API_KEY) {
      return NextResponse.json(
        { error: 'Deepgram API key not configured' },
        { status: 500 }
      );
    }

    // 2. Extract audio blob from FormData
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // 3. Initialize Deepgram client
    const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

    // 4. Convert blob to buffer for SDK
    const buffer = Buffer.from(await audioFile.arrayBuffer());

    // 5. Call Deepgram API with optimal parameters
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      buffer,
      {
        model: 'nova-2',
        smart_format: true,
        language: 'en-US',
        punctuate: true,
        filler_words: true  // Include filler words (uh, um, mhmm, etc.) for feedback
      }
    );

    // 6. Handle Deepgram API errors
    if (error) {
      console.error('Deepgram API error:', error);
      return NextResponse.json(
        { error: 'Transcription failed', details: error.message },
        { status: 500 }
      );
    }

    // 7. Extract transcription text
    const transcription = result?.results?.channels[0]?.alternatives[0]?.transcript;

    if (!transcription) {
      return NextResponse.json(
        { error: 'No transcription returned from Deepgram' },
        { status: 500 }
      );
    }

    // 8. Return successful transcription
    return NextResponse.json({
      success: true,
      transcription
    });

  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process transcription',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
