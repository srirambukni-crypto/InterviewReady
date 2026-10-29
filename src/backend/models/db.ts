import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { User, MockSession, FeedbackResult, UserProgress, InterviewQuestion, VocabularyWord, SentenceExercise } from './types.ts';
import { SEED_QUESTIONS, SEED_VOCABULARY, SEED_SENTENCES } from './seedData.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'interviewready_db.json');

interface StoredAnswer {
  id: string;
  userId: string;
  type: string;
  question: string;
  answer: string;
  feedback: FeedbackResult;
  createdAt: string;
}

interface StoredUser extends User {
  passwordHash?: string;
}

interface DatabaseSchema {
  users: Record<string, StoredUser>;
  passwords: Record<string, string>;
  sessions: Record<string, MockSession>;
  answers: StoredAnswer[];
  progress: Record<string, UserProgress>;
  questions: InterviewQuestion[];
  vocabulary: VocabularyWord[];
  sentences: SentenceExercise[];
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.initializeDatabase();
  }

  private initializeDatabase(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        const schema: DatabaseSchema = {
          users: parsed.users || {},
          passwords: parsed.passwords || {},
          sessions: parsed.sessions || {},
          answers: parsed.answers || [],
          progress: parsed.progress || {},
          questions: parsed.questions?.length ? parsed.questions : SEED_QUESTIONS,
          vocabulary: parsed.vocabulary?.length ? parsed.vocabulary : SEED_VOCABULARY,
          sentences: parsed.sentences?.length ? parsed.sentences : SEED_SENTENCES,
        };

        // Ensure default demo users exist
        this.seedDemoUsersIfMissing(schema);
        this.saveToFile(schema);
        return schema;
      }
    } catch (err) {
      console.warn('Database file read warning, creating default structure:', err);
    }

    const initial: DatabaseSchema = {
      users: {},
      passwords: {},
      sessions: {},
      answers: [],
      progress: {},
      questions: SEED_QUESTIONS,
      vocabulary: SEED_VOCABULARY,
      sentences: SEED_SENTENCES
    };

    this.seedDemoUsersIfMissing(initial);
    this.saveToFile(initial);
    return initial;
  }

  private seedDemoUsersIfMissing(schema: DatabaseSchema) {
    if (!schema.users['user-student']) {
      schema.users['user-student'] = {
        id: 'user-student',
        name: 'Alex Morgan',
        email: 'student@interviewready.com',
        targetRole: 'Software Engineer',
        createdAt: new Date().toISOString()
      };
      schema.passwords['student@interviewready.com'] = 'password123';
      schema.progress['user-student'] = {
        userId: 'user-student',
        completedModules: ['intro', 'questions', 'vocab'],
        totalPracticedAnswers: 8,
        averageScore: 8.4,
        streakDays: 4,
        lastPracticedAt: new Date().toISOString(),
        moduleScores: { intro: 8.5, questions: 8.0, vocab: 8.7 },
        recentActivity: [
          { id: 'act-1', type: 'intro', title: 'Self-Introduction (STAR)', score: 8.5, timestamp: new Date().toISOString() },
          { id: 'act-2', type: 'questions', title: 'What is your greatest strength?', score: 8.0, timestamp: new Date().toISOString() }
        ]
      };
    }

    if (!schema.users['user-priya']) {
      schema.users['user-priya'] = {
        id: 'user-priya',
        name: 'Priya Sharma',
        email: 'priya@interviewready.com',
        targetRole: 'Business Analyst',
        createdAt: new Date().toISOString()
      };
      schema.passwords['priya@interviewready.com'] = 'password123';
      schema.progress['user-priya'] = {
        userId: 'user-priya',
        completedModules: ['intro', 'questions', 'sentences', 'vocab'],
        totalPracticedAnswers: 14,
        averageScore: 8.9,
        streakDays: 6,
        lastPracticedAt: new Date().toISOString(),
        moduleScores: { intro: 9.0, questions: 8.8, sentences: 9.2, vocab: 8.6 },
        recentActivity: []
      };
    }

    if (!schema.users['default-user']) {
      schema.users['default-user'] = {
        id: 'default-user',
        name: 'Guest Candidate',
        email: 'guest@interviewready.com',
        targetRole: 'Job Applicant',
        createdAt: new Date().toISOString()
      };
      schema.passwords['guest@interviewready.com'] = 'guest';
      schema.progress['default-user'] = {
        userId: 'default-user',
        completedModules: [],
        totalPracticedAnswers: 0,
        averageScore: 0,
        streakDays: 1,
        lastPracticedAt: new Date().toISOString(),
        moduleScores: {},
        recentActivity: []
      };
    } else {
      if (!schema.users['default-user'].email) {
        schema.users['default-user'].email = 'guest@interviewready.com';
      }
      if (!schema.users['default-user'].targetRole) {
        schema.users['default-user'].targetRole = 'Job Applicant';
      }
      if (!schema.passwords['guest@interviewready.com']) {
        schema.passwords['guest@interviewready.com'] = 'guest';
      }
    }
  }

  private saveToFile(stateToSave = this.data) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(stateToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  // User Authentication & Management
  public findUserByEmail(email: string): User | undefined {
    if (!email) return undefined;
    const cleanEmail = email.trim().toLowerCase();
    const user = Object.values(this.data.users).find(u => (u.email ? u.email.toLowerCase() : '') === cleanEmail);
    if (!user) return undefined;
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  public findUserById(id: string): User | undefined {
    const user = this.data.users[id];
    if (!user) return undefined;
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  public authenticateUser(email: string, password: string): User | null {
    if (!this.data.passwords) {
      this.data.passwords = {};
    }
    const cleanEmail = email.trim().toLowerCase();
    const storedPassword = this.data.passwords[cleanEmail];
    if (!storedPassword || storedPassword !== password) {
      return null;
    }
    return this.findUserByEmail(cleanEmail) || null;
  }

  public registerUser(name: string, email: string, password: string, targetRole = 'Job Applicant'): { user: User } {
    const cleanEmail = email.trim().toLowerCase();
    if (this.findUserByEmail(cleanEmail)) {
      throw new Error('An account with this email address already exists.');
    }

    const userId = `user-${Date.now()}`;
    const newUser: StoredUser = {
      id: userId,
      name: name.trim(),
      email: cleanEmail,
      targetRole: targetRole.trim(),
      createdAt: new Date().toISOString()
    };

    this.data.users[userId] = newUser;
    this.data.passwords[cleanEmail] = password;

    // Initialize progress record for this new user
    this.data.progress[userId] = {
      userId,
      completedModules: [],
      totalPracticedAnswers: 0,
      averageScore: 0,
      streakDays: 1,
      lastPracticedAt: new Date().toISOString(),
      moduleScores: {},
      recentActivity: []
    };

    this.saveToFile();
    const { passwordHash, ...safeUser } = newUser;
    return { user: safeUser };
  }

  public getOrCreateUser(userId = 'default-user', name = 'Guest Candidate'): User {
    if (!this.data.users[userId]) {
      this.data.users[userId] = {
        id: userId,
        name,
        email: `${userId}@interviewready.com`,
        targetRole: 'Job Applicant',
        createdAt: new Date().toISOString()
      };
      this.saveToFile();
    }
    const { passwordHash, ...safeUser } = this.data.users[userId];
    return safeUser;
  }

  public getDatabaseDump() {
    const safeUsers = Object.values(this.data.users).map(u => {
      const { passwordHash, ...safe } = u;
      return safe;
    });

    return {
      users: safeUsers,
      progress: this.data.progress,
      answers: this.data.answers,
      sessionsCount: Object.keys(this.data.sessions).length,
      exportedAt: new Date().toISOString()
    };
  }

  // Questions
  public getQuestions(category?: string): InterviewQuestion[] {
    if (!category || category === 'all') {
      return this.data.questions;
    }
    return this.data.questions.filter(q => q.category.toLowerCase() === category.toLowerCase());
  }

  public getQuestionById(id: string): InterviewQuestion | undefined {
    return this.data.questions.find(q => q.id === id);
  }

  // Vocabulary
  public getVocabulary(): VocabularyWord[] {
    return this.data.vocabulary;
  }

  // Sentences
  public getSentences(): SentenceExercise[] {
    return this.data.sentences;
  }

  // Answers & Feedback records
  public recordAnswer(userId: string, type: string, question: string, answer: string, feedback: FeedbackResult): StoredAnswer {
    const record: StoredAnswer = {
      id: uuidv4(),
      userId,
      type,
      question,
      answer,
      feedback,
      createdAt: new Date().toISOString()
    };
    this.data.answers.push(record);

    // Update user progress metrics
    this.updateUserProgressWithAnswer(userId, type, feedback.score, question);
    this.saveToFile();
    return record;
  }

  // Mock Interview Sessions
  public createMockSession(userId: string, questions: string[]): MockSession {
    const session: MockSession = {
      id: uuidv4(),
      userId,
      status: 'in-progress',
      currentQuestionIndex: 0,
      totalQuestions: questions.length,
      questions,
      answers: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.sessions[session.id] = session;
    this.saveToFile();
    return session;
  }

  public getMockSession(sessionId: string): MockSession | undefined {
    return this.data.sessions[sessionId];
  }

  public updateMockSession(session: MockSession) {
    session.updatedAt = new Date().toISOString();
    this.data.sessions[session.id] = session;
    this.saveToFile();
  }

  // User Progress
  public getUserProgress(userId = 'default-user'): UserProgress {
    if (!this.data.progress[userId]) {
      this.data.progress[userId] = {
        userId,
        completedModules: [],
        totalPracticedAnswers: 0,
        averageScore: 0,
        streakDays: 1,
        lastPracticedAt: new Date().toISOString(),
        moduleScores: {},
        recentActivity: []
      };
      this.saveToFile();
    }
    return this.data.progress[userId];
  }

  public saveUserProgress(userId: string, progressUpdate: Partial<UserProgress>): UserProgress {
    const current = this.getUserProgress(userId);
    const updated: UserProgress = {
      ...current,
      ...progressUpdate,
      userId,
      completedModules: Array.from(new Set([...(current.completedModules || []), ...(progressUpdate.completedModules || [])])),
      lastPracticedAt: new Date().toISOString(),
      moduleScores: {
        ...current.moduleScores,
        ...(progressUpdate.moduleScores || {})
      }
    };
    this.data.progress[userId] = updated;
    this.saveToFile();
    return updated;
  }

  private updateUserProgressWithAnswer(userId: string, moduleType: string, score: number, questionTitle: string) {
    const current = this.getUserProgress(userId);
    const totalAnswers = current.totalPracticedAnswers + 1;
    const oldScoreSum = current.averageScore * current.totalPracticedAnswers;
    const newAverage = Number(((oldScoreSum + score) / totalAnswers).toFixed(1));

    const moduleScores = { ...current.moduleScores };
    if (!moduleScores[moduleType]) {
      moduleScores[moduleType] = score;
    } else {
      moduleScores[moduleType] = Number(((moduleScores[moduleType] + score) / 2).toFixed(1));
    }

    const completed = new Set(current.completedModules);
    if (score >= 6) {
      completed.add(moduleType);
    }

    const activity = [
      {
        id: uuidv4(),
        type: moduleType,
        title: questionTitle.length > 50 ? questionTitle.substring(0, 50) + '...' : questionTitle,
        score,
        timestamp: new Date().toISOString()
      },
      ...current.recentActivity.slice(0, 19)
    ];

    this.data.progress[userId] = {
      ...current,
      totalPracticedAnswers: totalAnswers,
      averageScore: newAverage,
      moduleScores,
      completedModules: Array.from(completed),
      lastPracticedAt: new Date().toISOString(),
      recentActivity: activity
    };
  }
}

export const db = new Database();
