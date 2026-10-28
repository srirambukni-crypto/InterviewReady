import { Request, Response } from 'express';
import { db } from '../models/db.ts';

export function handleLogin(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email address is required.' });
    }

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Password is required.' });
    }

    const user = db.authenticateUser(email, password);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid email or password. Please verify your credentials or use a demo login.'
      });
    }

    const progress = db.getUserProgress(user.id);

    return res.status(200).json({
      message: 'Logged in successfully',
      user,
      progress
    });
  } catch (error: any) {
    console.error('Error during login:', error);
    return res.status(500).json({ error: error.message || 'Login process failed. Please try again.' });
  }
}

export function handleRegister(req: Request, res: Response) {
  try {
    const { name, email, password, targetRole } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'Full name must be at least 2 characters.' });
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const { user } = db.registerUser(name, email, password, targetRole || 'Job Applicant');
    const progress = db.getUserProgress(user.id);

    return res.status(201).json({
      message: 'Account created successfully',
      user,
      progress
    });
  } catch (error: any) {
    console.error('Error during registration:', error);
    return res.status(400).json({ error: error.message || 'Registration failed.' });
  }
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
