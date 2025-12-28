# PA MMI Mock Interviewer

A Next.js web application for practicing Physician Assistant (PA) Multiple Mini Interview (MMI) scenarios with AI-powered feedback.

## Features

- **5 MMI Stations**: Practice with realistic interview scenarios
- **Audio Recording Mode**: Record your spoken responses with pause/resume functionality
- **7-Minute Recording Limit**: Enforced time limit per station (actual recording time)
- **Text Mode Available**: Toggle to text input mode via environment variable
- **AI Feedback**: Get detailed evaluation using Claude API (text mode only)
- **Session Persistence**: Your progress is saved during your session
- **Cost Controls**: API confirmation dialog and mock responses for testing

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** with custom pink medical theme
- **Anthropic Claude API** for response evaluation
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

4. Add your Anthropic API key to `.env.local`:
```
ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here
```

5. **(Optional) Choose your Claude model** for cost/quality tradeoff:

By default, the app uses **Claude Haiku 3.5** (cheapest, great for testing). You can override this in `.env.local`:

```bash
# For testing (default, 75% cheaper):
CLAUDE_MODEL=claude-3-5-haiku-20241022

# For better quality (balanced):
CLAUDE_MODEL=claude-3-5-sonnet-20241022

# For best quality (most expensive):
CLAUDE_MODEL=claude-sonnet-4-5-20250929
```

**Cost Comparison (per 1M tokens):**
| Model | Input | Output | Quality | Speed |
|-------|-------|--------|---------|-------|
| **Haiku 3.5** | $0.80 | $4.00 | Good | ⚡⚡⚡ |
| **Sonnet 3.5** | $3.00 | $15.00 | Great | ⚡⚡ |
| **Sonnet 4.5** | $3.00 | $15.00 | Excellent | ⚡ |

💡 **Tip:** Use Haiku for development/testing, then switch to Sonnet for production!

6. **(Optional) Configure application mode**:

```bash
# Enable audio recording mode (default: true)
NEXT_PUBLIC_ENABLE_AUDIO_MODE=true

# Show API confirmation dialog to prevent accidental costs (default: false)
NEXT_PUBLIC_ENABLE_API_CONFIRMATION=true
```

**Audio Mode Notes:**
- **Enabled (default)**: Users record spoken responses via browser microphone
- **Disabled**: Users type text responses (useful for quick testing)
- In audio mode prototype, recordings are stored in memory only (S3 upload + Deepgram transcription to be added)

**API Confirmation Notes:**
- **Enabled**: Shows dialog before submitting to Claude API with option for mock response
- **Disabled**: Submits directly to API (production mode)
- Useful during development to avoid unnecessary API costs

7. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Start Interview**: Click "Start Practice Interview" on the landing page
2. **Complete 5 Stations**:
   - Read each scenario carefully
   - **Audio Mode (default)**:
     - Click "Start Recording" to begin
     - Speak your response naturally
     - Use Pause/Resume as needed
     - Click "Done" when finished (7-minute max enforced)
     - Preview your recording before continuing
   - **Text Mode** (if enabled): Type your response
   - Click "Next Station" to proceed (only enabled after recording/typing)
3. **Get Feedback**:
   - **Audio mode**: View your recordings list (transcription/evaluation to be added)
   - **Text mode**: Receive detailed AI feedback from Claude
4. **Start New Interview**: Practice again with a fresh start

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
│   ├── schools.ts          # School list
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
- Uses configurable Claude model (defaults to Haiku 3.5 for cost-effective testing)
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
| `CLAUDE_MODEL` | Claude model to use (haiku/sonnet-3.5/sonnet-4.5) | No | `claude-3-5-haiku-20241022` |
| `NEXT_PUBLIC_ENABLE_API_CONFIRMATION` | Show confirmation dialog before API calls (`true`/`false`) | No | `false` |
| `NEXT_PUBLIC_ENABLE_AUDIO_MODE` | Enable audio recording mode (`true`/`false`) | No | `true` |

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
