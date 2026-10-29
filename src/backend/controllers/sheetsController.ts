import type { Request, Response } from 'express';
import { db } from '../models/db.ts';

export function getDatabaseExportForSheets(req: Request, res: Response) {
  try {
    const dump = db.getDatabaseDump();
    return res.status(200).json(dump);
  } catch (error) {
    console.error('Error generating database export for Sheets:', error);
    return res.status(500).json({ error: 'Failed to retrieve database export.' });
  }
}
