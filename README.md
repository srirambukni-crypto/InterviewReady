# InterviewReady - English Communication Coach for Job Interviews

An interactive full-stack web application designed to help students, recent graduates, and job seekers master English communication for high-stakes job interviews. Powered by an AI English coach with 20 years of experience, the platform provides granular grammar corrections, power vocabulary upgrades, speaking speed (WPM) tracking, sentence syntax drills, and real-time chat mock interviews.

---

## 🚀 Key Features & Modules

1. **Home**:
   - Hero banner with immediate CTA.
   - Comprehensive module readiness roadmap with real-time percentage progress bar.
   - 6 interactive module cards with difficulty tags and time estimates.

2. **Module 1: Self-Introduction**:
   - 4–5 sentence introduction writing workspace with live sentence and word counter.
   - Speech-to-text mic input with Web Speech API.
   - Side-by-side professional model answers (Software Engineering, Business Analytics, Marketing) showcasing the *Present-Past-Future* structure.
   - Audio pronunciation of model answers via Web Speech synthesis.

3. **Module 2: Common Interview Questions**:
   - 20+ interview questions categorized into *Introduction*, *Strengths*, *Weaknesses*, *Career Goals*, and *Why Hire You*.
   - Recruiter guidance explaining what the interviewer is really testing.
   - Key vocabulary pills and model answers.

4. **Module 3: Sentence Builder**:
   - 15 interactive drills covering STAR method statements, diplomatic disagreement, and active voice.
   - Drag or click tokens into the sentence slot with live reset and reordering.
   - Instant correct/incorrect feedback with clear English grammar rule explanations.

5. **Module 4: Professional Vocabulary**:
   - 30+ curated power verbs and executive adjectives (*spearheaded, articulated, resilient, streamlined, leveraged, etc.*).
   - 3D interactive flip cards with phonetic pronunciation, part of speech, definition, and realistic interview sentences.
   - Audio pronunciation player and multiple-choice quiz mode.

6. **Module 5: Pronunciation & Fluency**:
   - Browser Web Speech API continuous speech recognition.
   - Real-time animated audio visualizer waves.
   - Live Words Per Minute (WPM) gauge (target: 130–160 WPM).
   - Filler words detection (*um, uh, like, actually, basically, you know*) with counts.
   - Pause and silence counter.

7. **Module 6: Mock Interview Simulator**:
   - Chat-style virtual interview room with audio voice support.
   - Multi-round questions (Introduction, Strengths, Conflict Resolution, Future Goals).
   - Instant coach feedback after every turn.
   - Comprehensive Final Score Card summarizing Grammar, Vocabulary, Fluency, Strengths, Areas for Improvement, and Action Plan.

8. **Feedback Display (All Modules)**:
   - (a) Corrected Grammar & Syntax
   - (b) Better Word Choices & Power Verbs
   - (c) Stronger Version of the Answer with audio pronunciation
   - (d) Overall Score out of 10

---

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Web Speech API (SpeechRecognition & SpeechSynthesis).
- **Backend**: Node.js, Express, tsx, dotenv, cors, express-rate-limit.
- **AI / LLM Engine**: `@google/genai` TypeScript SDK (`gemini-3.8-flash`) with structured JSON schema output and intelligent heuristic fallback.
- **Database**: Relational models for users, sessions, answers, and progress with automatic JSON persistence.

---

## 📁 Project Structure

```
├── data/
│   └── interviewready_db.json     # Auto-generated database storage
├── src/
│   ├── backend/
│   │   ├── controllers/           # Route handlers
│   │   │   ├── feedbackController.ts
│   │   │   ├── questionsController.ts
│   │   │   ├── vocabularyController.ts
│   │   │   ├── sentencesController.ts
│   │   │   ├── mockInterviewController.ts
│   │   │   ├── speechMetricsController.ts
│   │   │   └── progressController.ts
│   │   ├── middleware/            # Validation, rate limiting & error handling
│   │   │   ├── validator.ts
│   │   │   ├── rateLimiter.ts
│   │   │   └── errorHandler.ts
│   │   ├── models/                # Types, Seed Data (20 questions, 30 words, 15 sentences), DB engine
│   │   │   ├── types.ts
│   │   │   ├── seedData.ts
│   │   │   └── db.ts
│   │   ├── routes/                # API router definitions
│   │   │   └── apiRoutes.ts
│   │   └── services/              # AI and speech analytics services
│   │       ├── geminiService.ts
│   │       └── speechMetricsService.ts
│   ├── components/                # React modular UI components
│   │   ├── Navbar.tsx
│   │   ├── HomeView.tsx
│   │   ├── FeedbackCard.tsx
│   │   ├── IntroductionModule.tsx
│   │   ├── QuestionsModule.tsx
│   │   ├── SentenceBuilderModule.tsx
│   │   ├── VocabularyModule.tsx
│   │   ├── FluencyModule.tsx
│   │   └── MockInterviewModule.tsx
│   ├── utils/
│   │   └── speechUtils.ts
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── server.ts                      # Express server with Vite middleware integration
├── index.html
├── package.json
└── README.md
```

---

## 🏃 Running Locally

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   # In AI Studio, GEMINI_API_KEY is automatically injected
   GEMINI_API_KEY="your_api_key_here"
   PORT=3000
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your web browser.

4. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

---

## 📡 API Endpoints & Example Curl Requests

### 0. Authentication Endpoints

#### Login (`POST /api/auth/login`)
Demo accounts:
- Student: `student@interviewready.com` / `password123`
- Business Analyst: `priya@interviewready.com` / `password123`
- Guest: `guest@interviewready.com` / `guest`

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@interviewready.com",
    "password": "password123"
  }'
```

#### Register (`POST /api/auth/register`)
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sarah Jenkins",
    "email": "sarah@example.com",
    "password": "password123",
    "targetRole": "Software Engineer"
  }'
```

#### Instant Demo Profile (`POST /api/auth/demo`)
```bash
curl -X POST http://localhost:3000/api/auth/demo \
  -H "Content-Type: application/json" \
  -d '{ "profile": "student" }'
```

---

### 1. `POST /api/feedback`
Submits an answer and receives structured English coaching feedback.

```bash
curl -X POST http://localhost:3000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "type": "question",
    "question": "What is your greatest professional strength?",
    "answer": "i am very good at coding and i did a lot of things to help my team finish the project."
  }'
```

**Response Format**:
```json
{
  "correctedAnswer": "I am proficient at software development and I spearheaded several initiatives to empower my team to complete the project.",
  "grammarIssues": [
    {
      "issue": "Lowercase \"i\"",
      "correction": "Capital \"I\"",
      "explanation": "The personal pronoun \"I\" must always be capitalized."
    }
  ],
  "vocabularySuggestions": [
    {
      "originalWordOrPhrase": "good at coding",
      "betterAlternative": "proficient in software engineering",
      "reason": "Conveys technical depth and professionalism."
    }
  ],
  "improvedAnswer": "My greatest professional strength is my technical agility and methodical problem-solving. In my previous role, I spearheaded backend optimizations that reduced latency by 35%.",
  "score": 7,
  "tips": [
    "Structure your response using the STAR framework.",
    "Quantify your results with metrics or time saved."
  ]
}
```

---

### 2. `GET /api/questions`
Returns interview questions (optional `?category=strengths|weaknesses|goals|why-hire-you|introduction`).

```bash
curl -X GET "http://localhost:3000/api/questions?category=strengths"
```

---

### 3. `GET /api/vocabulary`
Returns 30+ professional vocabulary words with phonetic spelling, definition, interview example, and quiz.

```bash
curl -X GET http://localhost:3000/api/vocabulary
```

---

### 4. `GET /api/sentences`
Returns 15 sentence-building exercises (reorder and fill-in-the-blank) with correct answers and grammar explanations.

```bash
curl -X GET http://localhost:3000/api/sentences
```

---

### 5. `POST /api/mock/start`
Starts a new mock interview session and returns session ID and first question.

```bash
curl -X POST http://localhost:3000/api/mock/start \
  -H "Content-Type: application/json" \
  -d '{ "questionCount": 4 }'
```

---

### 6. `POST /api/mock/answer`
Submits candidate answer for current turn and returns feedback + next question (or final report card).

```bash
curl -X POST http://localhost:3000/api/mock/answer \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "PASTE_SESSION_ID_HERE",
    "answer": "I have spent the past two years developing user interfaces with a focus on web accessibility."
  }'
```

---

### 7. `POST /api/speech-metrics`
Analyzes transcribed speech duration, Words Per Minute (WPM), and filler word frequency.

```bash
curl -X POST http://localhost:3000/api/speech-metrics \
  -H "Content-Type: application/json" \
  -d '{
    "transcript": "Um, so basically, I led the project and, like, we delivered it on time.",
    "duration": 6
  }'
```

---

### 8. `GET /api/progress` & `POST /api/progress`
Retrieves or updates user progress, streaks, and module scores.

```bash
# Get progress
curl -X GET "http://localhost:3000/api/progress?userId=default-user"

# Save progress
curl -X POST http://localhost:3000/api/progress \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "default-user",
    "completedModules": ["intro", "questions"],
    "totalPracticedAnswers": 5,
    "averageScore": 8.2
  }'
```
