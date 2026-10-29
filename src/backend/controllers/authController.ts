import { Request, Response } from 'express';
import { db } from '../models/db.ts';

/**
 * Universal JSON payload extractor that handles:
 * - Direct object: { email, password }
 * - Aliased keys: { username, pass, role, fullName }
 * - Nested envelopes: { user: { ... } }, { credentials: { ... } }, { loginDetails: { ... } }
 * - Stringified JSON: "{\"email\": \"...\"}"
 */
export function extractAuthPayload(rawBody: any) {
  let body = rawBody;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      // keep original
    }
  }

  if (typeof body !== 'object' || !body) {
    return { email: '', password: '', name: '', targetRole: '', action: 'auto', profile: '' };
  }

  // Support common JSON nesting patterns
  const nested = 
    body.loginDetails || 
    body.user || 
    body.credentials || 
    body.auth || 
    body.account || 
    body.data || 
    body;

  const email = (
    nested.email ||
    nested.username ||
    nested.userEmail ||
    nested.mail ||
    nested.user ||
    nested.identifier ||
    nested.login ||
    body.email ||
    body.username ||
    ''
  ).toString().trim();

  const password = (
    nested.password ||
    nested.pass ||
    nested.pwd ||
    nested.secret ||
    nested.token ||
    body.password ||
    body.pass ||
    ''
  ).toString();

  const name = (
    nested.name ||
    nested.fullName ||
    nested.displayName ||
    nested.candidateName ||
    nested.userName ||
    body.name ||
    body.fullName ||
    ''
  ).toString().trim();

  const targetRole = (
    nested.targetRole ||
    nested.role ||
    nested.jobRole ||
    nested.jobTitle ||
    nested.position ||
    body.targetRole ||
    body.role ||
    'Job Applicant'
  ).toString().trim();

  const action = (
    nested.action ||
    nested.mode ||
    body.action ||
    body.mode ||
    'auto'
  ).toString().toLowerCase();

  const profile = (
    nested.profile ||
    body.profile ||
    ''
  ).toString().toLowerCase();

  return { email, password, name, targetRole, action, profile };
}

/**
 * Standard Login Handler - Accepts flat or nested JSON
 */
export function handleLogin(req: Request, res: Response) {
  try {
    const { email, password } = extractAuthPayload(req.body);

    if (!email) {
      return res.status(400).json({
        error: 'Email address or username is required in JSON payload.',
        expectedJsonFormat: {
          email: 'student@interviewready.com',
          password: 'password123'
        }
      });
    }

    if (!password) {
      return res.status(400).json({
        error: 'Password is required in JSON payload.',
        expectedJsonFormat: {
          email: 'student@interviewready.com',
          password: 'password123'
        }
      });
    }

    const user = db.authenticateUser(email, password);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials. Please verify your email & password or try the demo accounts.',
        demoAccounts: [
          { email: 'student@interviewready.com', password: 'password123', name: 'Alex Morgan' },
          { email: 'priya@interviewready.com', password: 'password123', name: 'Priya Sharma' }
        ]
      });
    }

    const progress = db.getUserProgress(user.id);

    return res.status(200).json({
      success: true,
      message: `Logged in successfully as ${user.name}`,
      user,
      progress
    });
  } catch (error: any) {
    console.error('Error during login:', error);
    return res.status(500).json({ error: error.message || 'Login process failed.' });
  }
}

/**
 * Standard Register Handler - Accepts flat or nested JSON
 */
export function handleRegister(req: Request, res: Response) {
  try {
    const { name, email, password, targetRole } = extractAuthPayload(req.body);

    if (!name || name.length < 2) {
      return res.status(400).json({
        error: 'Full name (at least 2 characters) is required in JSON.',
        sampleJson: {
          name: 'Sarah Jenkins',
          email: 'sarah@example.com',
          password: 'password123',
          targetRole: 'Software Engineer'
        }
      });
    }

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'A valid email address is required in JSON.' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long in JSON.' });
    }

    const { user } = db.registerUser(name, email, password, targetRole || 'Job Applicant');
    const progress = db.getUserProgress(user.id);

    return res.status(201).json({
      success: true,
      message: `Account created successfully for ${user.name}`,
      user,
      progress
    });
  } catch (error: any) {
    console.error('Error during registration:', error);
    return res.status(400).json({ error: error.message || 'Registration failed.' });
  }
}

/**
 * Universal JSON Auth Endpoint (/api/auth/json)
 * Accepts any login or registration JSON payload.
 * - If user exists, authenticates them.
 * - If user doesn't exist, automatically provisions them.
 * - Accepts aliases, demo shortcuts, and nested objects.
 */
export function handleJsonAuth(req: Request, res: Response) {
  try {
    const payload = extractAuthPayload(req.body);
    const { email, password, name, targetRole, action, profile } = payload;

    // 1. Quick profile shorthand in JSON: { profile: "student" | "analyst" | "guest" }
    if (profile) {
      let targetUserId = 'user-student';
      if (profile === 'analyst' || profile === 'priya') targetUserId = 'user-priya';
      if (profile === 'guest') targetUserId = 'default-user';

      const user = db.findUserById(targetUserId) || db.getOrCreateUser(targetUserId);
      const progress = db.getUserProgress(user.id);
      return res.status(200).json({
        success: true,
        mode: 'demo_profile',
        message: `Signed in as demo ${profile} (${user.name})`,
        user,
        progress
      });
    }

    // 2. Validate email
    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid "email" in JSON payload.',
        acceptedJsonExamples: [
          {
            description: 'Sign In Existing User',
            json: {
              email: 'student@interviewready.com',
              password: 'password123'
            }
          },
          {
            description: 'Sign Up / Auto-Register New User',
            json: {
              name: 'Sarah Jenkins',
              email: 'sarah.jenkins@example.com',
              password: 'password123',
              targetRole: 'Software Engineer'
            }
          },
          {
            description: 'One-Click Demo Switcher',
            json: {
              profile: 'student'
            }
          }
        ]
      });
    }

    // 3. Check if user already exists
    const cleanEmail = email.toLowerCase().trim();
    const existingUser = db.findUserByEmail(cleanEmail);

    if (existingUser) {
      // If user requested explicit registration
      if (action === 'register') {
        return res.status(409).json({
          success: false,
          error: `An account for ${cleanEmail} already exists. Please sign in instead.`,
          userExists: true
        });
      }

      // Check password if provided, or allow demo shortcuts
      const isDemo = cleanEmail === 'student@interviewready.com' || 
                    cleanEmail === 'priya@interviewready.com' || 
                    cleanEmail === 'guest@interviewready.com';

      if (password) {
        const authenticated = db.authenticateUser(cleanEmail, password);
        if (!authenticated && !isDemo) {
          return res.status(401).json({
            success: false,
            error: 'Incorrect password for this email address.',
            hint: 'Use "password123" for demo accounts.'
          });
        }
      }

      const progress = db.getUserProgress(existingUser.id);
      return res.status(200).json({
        success: true,
        mode: 'login',
        message: `Welcome back, ${existingUser.name}!`,
        user: existingUser,
        progress
      });
    }

    // 4. User does NOT exist -> Auto-register candidate via JSON
    const candidateName = name || cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
    const candidatePassword = password || 'password123';
    const candidateRole = targetRole || 'Job Applicant';

    const { user: newUser } = db.registerUser(candidateName, cleanEmail, candidatePassword, candidateRole);
    const newProgress = db.getUserProgress(newUser.id);

    return res.status(201).json({
      success: true,
      mode: 'registered',
      message: `Account created and signed in as ${newUser.name}!`,
      user: newUser,
      progress: newProgress,
      note: 'Auto-registered with provided JSON payload.'
    });

  } catch (error: any) {
    console.error('Error in handleJsonAuth:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'JSON authentication failed.'
    });
  }
}

/**
 * Returns JSON schema and interactive template documentation
 */
export function handleAuthSchema(_req: Request, res: Response) {
  res.json({
    description: 'InterviewReady JSON Authentication Specification',
    endpoints: {
      jsonAuth: 'POST /api/auth/json',
      standardLogin: 'POST /api/auth/login',
      standardRegister: 'POST /api/auth/register'
    },
    supportedKeys: {
      email: ['email', 'username', 'userEmail', 'identifier', 'login'],
      password: ['password', 'pass', 'pwd', 'secret'],
      name: ['name', 'fullName', 'displayName', 'candidateName'],
      targetRole: ['targetRole', 'role', 'jobRole', 'jobTitle', 'position'],
      action: ['login', 'register', 'auto'],
      profile: ['student', 'analyst', 'guest']
    },
    templates: {
      login: {
        email: 'student@interviewready.com',
        password: 'password123'
      },
      register: {
        name: 'Jordan Lee',
        email: 'jordan.lee@example.com',
        password: 'password123',
        targetRole: 'Full Stack Developer'
      },
      demo: {
        profile: 'student'
      }
    }
  });
}

export function handleGetMe(req: Request, res: Response) {
  try {
    const userId = (req.query.userId as string) || (req.headers['x-user-id'] as string) || 'default-user';
    const user = db.findUserById(userId) || db.getOrCreateUser(userId);
    const progress = db.getUserProgress(user.id);

    return res.status(200).json({
      user,
      progress
    });
  } catch (error) {
    console.error('Error in handleGetMe:', error);
    return res.status(500).json({ error: 'Failed to retrieve current user session.' });
  }
}

export function handleDemoLogin(req: Request, res: Response) {
  try {
    const { profile = 'student' } = req.body;

    let targetUserId = 'user-student';
    if (profile === 'analyst' || profile === 'priya') {
      targetUserId = 'user-priya';
    } else if (profile === 'guest') {
      targetUserId = 'default-user';
    }

    const user = db.findUserById(targetUserId) || db.getOrCreateUser(targetUserId);
    const progress = db.getUserProgress(user.id);

    return res.status(200).json({
      message: `Signed in as demo ${profile}`,
      user,
      progress
    });
  } catch (error) {
    console.error('Error in demo login:', error);
    return res.status(500).json({ error: 'Failed to switch demo account.' });
  }
}
