import type { User, UserProgress } from '../backend/models/types.ts';

export interface DatabaseDump {
  users: User[];
  progress: Record<string, UserProgress>;
  answers: Array<{
    id: string;
    userId: string;
    type: string;
    question: string;
    answer: string;
    feedback: {
      score: number;
      correctedAnswer: string;
      improvedAnswer: string;
      grammarIssues?: Array<{ issue: string; correction: string }>;
      vocabularySuggestions?: Array<{ originalWordOrPhrase: string; betterAlternative: string }>;
      tips?: string[];
    };
    createdAt: string;
  }>;
  sessionsCount: number;
  exportedAt: string;
}

export interface SpreadsheetExportResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
  syncedAt: string;
  usersCount: number;
  answersCount: number;
}

/**
 * Creates a new Google Spreadsheet in the user's Google Drive and populates
 * it with 3 distinct sheets: "Users & Profiles", "Module Progress", and "Practice & Answers".
 */
export async function createAndSyncInterviewReadySheet(
  accessToken: string,
  dump: DatabaseDump,
  customTitle = 'InterviewReady - User Database & Performance'
): Promise<SpreadsheetExportResult> {
  // Step 1: Create Spreadsheet with 3 Tabs
  const createPayload = {
    properties: {
      title: customTitle
    },
    sheets: [
      {
        properties: {
          sheetId: 0,
          title: 'Users & Profiles',
          gridProperties: { frozenRowCount: 1 }
        }
      },
      {
        properties: {
          sheetId: 1,
          title: 'Module Progress',
          gridProperties: { frozenRowCount: 1 }
        }
      },
      {
        properties: {
          sheetId: 2,
          title: 'Practice & Feedback History',
          gridProperties: { frozenRowCount: 1 }
        }
      }
    ]
  };

  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(createPayload)
  });

  if (!createRes.ok) {
    const errData = await createRes.json().catch(() => ({}));
    throw new Error(errData.error?.message || `Failed to create Google Spreadsheet (HTTP ${createRes.status})`);
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;

  // Step 2: Prepare Row Data for all 3 sheets
  // Sheet 1: Users & Profiles
  const userHeaders = [
    'User ID',
    'Full Name',
    'Email Address',
    'Target Job Role',
    'Account Created At',
    'Total Practiced Answers',
    'Average Score (/10)',
    'Current Streak (Days)',
    'Last Practiced At'
  ];

  const userRows = dump.users.map(u => {
    const p = dump.progress[u.id] || {
      totalPracticedAnswers: 0,
      averageScore: 0,
      streakDays: 1,
      lastPracticedAt: u.createdAt
    };

    return [
      u.id,
      u.name,
      u.email,
      u.targetRole || 'Job Applicant',
      formatDate(u.createdAt),
      p.totalPracticedAnswers || 0,
      p.averageScore || 0,
      p.streakDays || 1,
      formatDate(p.lastPracticedAt || u.createdAt)
    ];
  });

  // Sheet 2: Module Progress
  const moduleHeaders = [
    'User ID',
    'Candidate Name',
    'Target Role',
    'Self-Introduction Score',
    'Common Questions Score',
    'Sentence Builder Score',
    'Vocabulary Score',
    'Pronunciation / Fluency Score',
    'Mock Interview Score',
    'Modules Mastered (Count)',
    'Readiness Status'
  ];

  const moduleRows = dump.users.map(u => {
    const p = dump.progress[u.id];
    const scores = p?.moduleScores || {};
    const masteredCount = p?.completedModules?.length || 0;
    const status = masteredCount >= 5 ? 'Interview Ready' : (masteredCount >= 2 ? 'In Active Training' : 'Getting Started');

    return [
      u.id,
      u.name,
      u.targetRole || 'Job Applicant',
      scores['intro'] ? `${scores['intro']}/10` : 'Not Started',
      scores['questions'] ? `${scores['questions']}/10` : 'Not Started',
      scores['sentences'] ? `${scores['sentences']}/10` : 'Not Started',
      scores['vocab'] ? `${scores['vocab']}/10` : 'Not Started',
      scores['fluency'] ? `${scores['fluency']}/10` : 'Not Started',
      scores['mock'] ? `${scores['mock']}/10` : 'Not Started',
      `${masteredCount} of 6`,
      status
    ];
  });

  // Sheet 3: Practice & Answers History
  const historyHeaders = [
    'Logged Timestamp',
    'User ID',
    'Candidate Name',
    'Module Category',
    'Interview Prompt / Question',
    'Candidate Response',
    'Score (/10)',
    'Corrected Grammar & Syntax',
    'Higher-Impact Vocabulary Upgrades',
    'Executive Improved Version'
  ];

  const userMap: Record<string, string> = {};
  dump.users.forEach(u => { userMap[u.id] = u.name; });

  const historyRows = dump.answers.map(ans => {
    const grammarSummary = (ans.feedback.grammarIssues || [])
      .map(g => `[${g.issue} -> ${g.correction}]`)
      .join('; ');

    const vocabSummary = (ans.feedback.vocabularySuggestions || [])
      .map(v => `${v.originalWordOrPhrase} -> ${v.betterAlternative}`)
      .join(', ');

    return [
      formatDate(ans.createdAt),
      ans.userId,
      userMap[ans.userId] || ans.userId,
      ans.type.toUpperCase(),
      ans.question,
      ans.answer,
      `${ans.feedback.score}/10`,
      grammarSummary || ans.feedback.correctedAnswer || 'Grammatically sound',
      vocabSummary || 'Clear vocabulary',
      ans.feedback.improvedAnswer || ''
    ];
  });

  // Step 3: Populate all values using batchUpdate
  const batchValuePayload = {
    valueInputOption: 'USER_ENTERED',
    data: [
      {
        range: "'Users & Profiles'!A1",
        values: [userHeaders, ...userRows]
      },
      {
        range: "'Module Progress'!A1",
        values: [moduleHeaders, ...moduleRows]
      },
      {
        range: "'Practice & Feedback History'!A1",
        values: [historyHeaders, ...historyRows]
      }
    ]
  };

  const valuesRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(batchValuePayload)
    }
  );

  if (!valuesRes.ok) {
    console.warn('Batch value update warning:', await valuesRes.text());
  }

  // Step 4: Stylize Headers (Blue Header Background, White Bold Text)
  try {
    const stylingRequests = [0, 1, 2].map(sheetId => ({
      repeatCell: {
        range: {
          sheetId: sheetId,
          startRowIndex: 0,
          endRowIndex: 1
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.145, green: 0.388, blue: 0.922 }, // Royal Blue #2563EB
            textFormat: {
              foregroundColor: { red: 1, green: 1, blue: 1 },
              bold: true,
              fontSize: 10
            },
            horizontalAlignment: 'CENTER'
          }
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)'
      }
    }));

    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ requests: stylingRequests })
    });
  } catch (err) {
    console.warn('Optional styling failed, core values are safely written:', err);
  }

  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  return {
    spreadsheetId,
    spreadsheetUrl,
    title: customTitle,
    syncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    usersCount: dump.users.length,
    answersCount: dump.answers.length
  };
}

/**
 * Syncs the latest records to an existing linked spreadsheet.
 */
export async function syncToExistingSheet(
  accessToken: string,
  spreadsheetId: string,
  dump: DatabaseDump
): Promise<{ success: boolean; syncedAt: string }> {
  const userHeaders = [
    'User ID',
    'Full Name',
    'Email Address',
    'Target Job Role',
    'Account Created At',
    'Total Practiced Answers',
    'Average Score (/10)',
    'Current Streak (Days)',
    'Last Practiced At'
  ];

  const userRows = dump.users.map(u => {
    const p = dump.progress[u.id] || {
      totalPracticedAnswers: 0,
      averageScore: 0,
      streakDays: 1,
      lastPracticedAt: u.createdAt
    };

    return [
      u.id,
      u.name,
      u.email,
      u.targetRole || 'Job Applicant',
      formatDate(u.createdAt),
      p.totalPracticedAnswers || 0,
      p.averageScore || 0,
      p.streakDays || 1,
      formatDate(p.lastPracticedAt || u.createdAt)
    ];
  });

  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Users & Profiles'!A1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        range: "'Users & Profiles'!A1",
        values: [userHeaders, ...userRows]
      })
    }
  );

  if (!updateRes.ok) {
    throw new Error('Failed to update spreadsheet data.');
  }

  return {
    success: true,
    syncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
}

function formatDate(isoStr?: string): string {
  if (!isoStr) return '';
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return isoStr;
  }
}
