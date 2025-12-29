# PA MMI Mock Interviewer

A Next.js web application for practicing Physician Assistant (PA) Multiple Mini Interview (MMI) scenarios with AI-powered feedback.

## Features

- **5 MMI Stations**: Practice with realistic interview scenarios
- **Audio Recording Mode**: Record your spoken responses with pause/resume functionality (default)
- **Text Input Mode**: Toggle to text input via dev settings for quick testing
- **7-Minute Recording Limit**: Enforced auto-stop per station (actual recording time)
- **AI Feedback**: Get detailed evaluation using Claude API on transcribed or typed responses
- **Deepgram Transcription**: Automatic speech-to-text with filler word detection
- **Model Selection**: Choose between Haiku 4.5 (cheap), Sonnet 4.5 (default), or Opus 4.5 (premium)
- **Session Persistence**: Progress and settings saved during your session
- **Dev Settings Panel**: Granular control over features and API calls during development

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** with custom pink medical theme
- **Anthropic Claude API** (Haiku/Sonnet/Opus 4.5) for response evaluation
- **Deepgram API** (Nova-2) for speech-to-text transcription
- **MediaRecorder API** for browser audio recording
- **React Context API** for state management
- **sessionStorage** for persistence

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Anthropic API key ([Get one here](https://console.anthropic.com/))

### Installation

1. Clone or download this repository

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```bash
cp .env.local.example .env.local
```

4. Add your API keys to `.env.local`:
```bash
# Required: Anthropic API Key
ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here

# Required for audio mode: Deepgram API Key
# Get your API key from: https://console.deepgram.com/
DEEPGRAM_API_KEY=your-deepgram-api-key-here
```

5. **(Optional) Override Claude model** via environment variable:

By default, the app uses **Claude Sonnet 4.5**. When dev mode is enabled, you can select models via the dev settings panel. You can also override via `.env.local`:

```bash
# Override default model (optional)
CLAUDE_MODEL=claude-haiku-4-5-20251001
```

**Available Models (2025):**
| Model | Model ID | Input | Output | Use Case |
|-------|----------|-------|--------|----------|
| **Haiku 4.5** | `claude-haiku-4-5-20251001` | $1 | $5 | Fast, cheap testing |
| **Sonnet 4.5** | `claude-sonnet-4-5-20250929` | $3 | $15 | Default, balanced |
| **Opus 4.5** | `claude-opus-4-5-20251101` | $15 | $75 | Premium quality |

💡 **Note:** Model selection is easier via dev settings panel when `NEXT_PUBLIC_DEV_MODE=true`

6. **(Optional) Enable dev settings panel**:

```bash
# Enable dev settings panel for controlling app behavior (default: false)
NEXT_PUBLIC_DEV_MODE=true
```

**What Dev Mode Controls:**

When **enabled** (NEXT_PUBLIC_DEV_MODE=true):
- Shows subtle dev settings panel in bottom-right corner
- Toggle audio recording mode ON/OFF (switch to text input)
- Toggle Deepgram transcription ON/OFF
- Toggle Claude AI evaluation ON/OFF
- Select Claude model (Haiku 4.5 / Sonnet 4.5 / Opus 4.5)
- Settings persist in sessionStorage during testing
- Prevents accidental API costs during development

When **disabled** (production mode):
- No dev panel shown
- Defaults: Audio mode ON, Deepgram ON, Claude ON, Model = Sonnet 4.5
- All features enabled by default
- Can still override model via `CLAUDE_MODEL` env variable

7. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Start Interview**: Click "Start Practice Interview" on the landing page

2. **(Optional) Configure Dev Settings**: Click the subtle panel in bottom-right corner to:
   - Toggle between audio recording and text input modes
   - Enable/disable Deepgram transcription
   - Enable/disable Claude AI evaluation
   - Select Claude model (Haiku/Sonnet/Opus)

3. **Complete 5 Stations**:
   - Read each scenario carefully
   - **Audio Mode (default)**:
     - Click "Start Recording" to begin
     - Speak your response naturally (up to 7 minutes)
     - Use Pause/Resume as needed
     - Auto-stops at 7-minute limit
     - Preview your recording before continuing
   - **Text Mode** (via dev settings):
     - Type your response in the text area
     - No time limit (informational timer only)
   - Click "Next Station" to proceed (only enabled after recording/typing)

4. **Get Feedback**:
   - View your audio recordings with transcriptions (if Deepgram enabled)
   - Receive detailed AI feedback from Claude (if Claude enabled)
   - Review evaluation across all 5 stations

5. **Start New Interview**: Practice again with a fresh start

## Project Structure

```
pa-mmi-mock-interviewer/
├── app/                      # Next.js app directory
│   ├── api/evaluate/        # Claude API route
│   ├── interview/           # Interview page
│   ├── feedback/            # Feedback page
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Landing page
│   └── globals.css         # Global styles
├── components/              # React components
│   ├── providers/          # Context providers
│   ├── landing/            # Landing page components
│   ├── interview/          # Interview components
│   └── feedback/           # Feedback components
├── lib/                     # Utilities and data
│   ├── questions.ts        # MMI questions
│   └── utils.ts            # Helper functions
├── types/                   # TypeScript definitions
│   └── index.ts
└── instructions.md          # System prompt for Claude API
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Key Features

### Pink Medical Theme
The application uses a professional pink color scheme designed for medical/healthcare contexts:
- Primary: `#ec4899` (medical-500)
- Gradient background for visual appeal
- Accessible contrast ratios

### State Management
- React Context API for global state
- sessionStorage for persistence during user session
- Automatic save on page refresh (same tab)
- Clean state on new tab or session end

### Interview Flow
- Linear progression through 5 stations
- Auto-save responses with debouncing
- Timer tracks actual time spent per station
- Cannot proceed without typing a response

### AI Evaluation
- Uses configurable Claude model (defaults to Sonnet 4.5, selectable via dev settings)
- Reads evaluation criteria from `instructions.md`
- Prompt caching enabled (90% discount on repeated system prompts)
- Provides comprehensive feedback on:
  - Communication skills
  - Critical thinking
  - Ethical reasoning
  - Empathy and interpersonal skills

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key | Yes | - |
| `CLAUDE_MODEL` | Override Claude model (use dev settings panel instead) | No | `claude-sonnet-4-5-20250929` |
| `DEEPGRAM_API_KEY` | Your Deepgram API key for audio transcription | Yes (audio mode) | - |
| `NEXT_PUBLIC_DEV_MODE` | Show dev settings panel to control input mode and API calls (`true`/`false`) | No | `false` |

## MMI Questions

The prototype includes 5 hardcoded MMI scenarios:

1. Academic integrity dilemma
2. Teamwork and conflict resolution
3. Healthcare policy discussion
4. Professional responsibility scenario
5. Personal motivation question

Each station has a 7-minute (420 seconds) time limit for realism.

## Customization

### Changing Questions
Edit `lib/questions.ts`:
```typescript
export const MMI_QUESTIONS: MMIQuestion[] = [
  {
    id: 1,
    station: 1,
    prompt: 'Your new question here',
    timeLimit: 420
  },
  // ...
];
```

### Modifying Evaluation Criteria
Edit `instructions.md` to change how Claude evaluates responses.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add `ANTHROPIC_API_KEY` environment variable
4. Deploy

### Other Platforms

Build the production bundle:
```bash
npm run build
```

Then deploy the `.next` folder using your preferred hosting platform.

## Troubleshooting

### TypeScript Errors
Run type checking:
```bash
npm run type-check
```

### API Key Issues
- Verify `.env.local` file exists in root directory
- Check that the key starts with `sk-ant-api03-`
- Restart the dev server after adding the key

### sessionStorage Not Working
- Check browser privacy settings
- Ensure you're not in incognito/private mode
- Clear browser cache if issues persist

## License

This is a prototype/practice tool. Use freely for educational purposes.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- AI evaluation powered by [Anthropic Claude](https://www.anthropic.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
