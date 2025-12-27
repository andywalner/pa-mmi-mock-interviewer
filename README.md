# PA MMI Mock Interviewer

A Next.js web application for practicing Physician Assistant (PA) Multiple Mini Interview (MMI) scenarios with AI-powered feedback.

## Features

- **School Selection**: Choose from 5 PA programs
- **5 MMI Stations**: Practice with realistic interview scenarios
- **7-Minute Timer**: Visual countdown timer for each station (not enforced)
- **Text-Based Responses**: Type your responses (simulating spoken answers)
- **AI Feedback**: Get detailed evaluation using Claude API
- **Session Persistence**: Your progress is saved during your session

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

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Select Your PA Program**: Choose your school from the dropdown
2. **Start Interview**: Click "Start Practice Interview"
3. **Complete 5 Stations**:
   - Read each scenario carefully
   - Type your response (what you would say in a real interview)
   - Watch the 7-minute timer (you can continue past it)
   - Click "Next Station" to proceed
4. **Get Feedback**: After completing all stations, receive detailed AI feedback
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
- Uses Claude Sonnet 4.5 model
- Reads evaluation criteria from `instructions.md`
- Provides comprehensive feedback on:
  - Communication skills
  - Critical thinking
  - Ethical reasoning
  - Empathy and interpersonal skills

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key | Yes |

## MMI Questions

The prototype includes 5 hardcoded MMI scenarios:

1. Academic integrity dilemma
2. Teamwork and conflict resolution
3. Healthcare policy discussion
4. Professional responsibility scenario
5. Personal motivation question

Each station has a 7-minute (420 seconds) time limit for realism.

## Customization

### Adding More Schools
Edit `lib/schools.ts`:
```typescript
export const SCHOOLS: School[] = [
  { id: 'new-school', name: 'New School Name' },
  // ...
];
```

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
