import { GoogleGenAI, Type } from '@google/genai';
import type { FeedbackResult } from '../models/types.ts';

const SYSTEM_PROMPT = `You are an elite English communication coach with 20 years of university and executive corporate teaching experience.
Your singular objective is to coach candidates to master job interviews in English.
Scope:
1. You are strictly restricted to evaluating and refining English communication: grammar correctness, professional vocabulary choice, conciseness, coherence, tone, and interview response structure (such as the STAR framework: Situation, Task, Action, Result).
2. If the user input is entirely unrelated to job interviews, career questions, or English practice (e.g. asking to write general fiction, code a website, solve math, or discuss politics), gently redirect them back to English interview preparation in the 'tips' section and assign a low score.
3. You must always return a strictly valid JSON object matching the required schema. No markdown formatting outside the JSON, no extra chit-chat.

Evaluation criteria:
- correctedAnswer: The candidate's original text with all grammatical mistakes, tense errors, spelling, punctuation, and awkward phrasings corrected while preserving their original voice and meaning.
- grammarIssues: An array of specific issues found (original issue, the fix, and a concise 1-sentence grammatical rule explanation).
- vocabularySuggestions: An array of words or colloquialisms used, suggesting stronger, more impactful professional alternatives (e.g., replace "did good work" with "delivered exceptional results", "helped my team" with "collaborated closely with cross-functional peers").
- improvedAnswer: A high-caliber, polished, executive-level version of the answer that is articulate, confident, and uses the STAR method or structured storytelling.
- score: An honest integer score from 0 to 10 based on grammar accuracy (30%), vocabulary strength (25%), clarity and conciseness (25%), and professional tone (20%).
- tips: 2 to 4 actionable, encouraging communication coaching tips for the candidate's next iteration.`;

export async function generateEnglishFeedback(
  type: 'introduction' | 'question' | 'sentence' | 'mock',
  question: string,
  answer: string
): Promise<FeedbackResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim().length > 0) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const userPrompt = `Module / Context: ${type.toUpperCase()}
Interview Question / Prompt: "${question}"
Candidate's Spoken or Written Answer: "${answer}"

Please analyze this answer as an experienced English interview coach. Provide actionable corrections and an upgraded professional answer.`;

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API call timed out after 7s')), 7000)
      );

      const generatePromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userPrompt,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              correctedAnswer: {
                type: Type.STRING,
                description: 'The candidate answer with grammar and typos corrected.'
              },
              grammarIssues: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    issue: { type: Type.STRING },
                    correction: { type: Type.STRING },
                    explanation: { type: Type.STRING }
                  },
                  required: ['issue', 'correction', 'explanation']
                },
                description: 'List of grammar or punctuation corrections.'
              },
              vocabularySuggestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    originalWordOrPhrase: { type: Type.STRING },
                    betterAlternative: { type: Type.STRING },
                    reason: { type: Type.STRING }
                  },
                  required: ['originalWordOrPhrase', 'betterAlternative', 'reason']
                },
                description: 'Higher-impact vocabulary recommendations.'
              },
              improvedAnswer: {
                type: Type.STRING,
                description: 'Polished, professional version demonstrating executive presence.'
              },
              score: {
                type: Type.INTEGER,
                description: 'Overall English interview score between 0 and 10.'
              },
              tips: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Actionable coaching tips.'
              }
            },
            required: ['correctedAnswer', 'grammarIssues', 'vocabularySuggestions', 'improvedAnswer', 'score', 'tips']
          }
        }
      });

      const response = await Promise.race([generatePromise, timeoutPromise]);

      const responseText = response.text;
      if (responseText) {
        const parsed: FeedbackResult = JSON.parse(responseText);
        // Normalize score bounds
        parsed.score = Math.max(0, Math.min(10, Math.round(parsed.score || 7)));
        return parsed;
      }
    } catch (err) {
      console.error('Gemini API call failed or timed out, using intelligent rule-based fallback:', err);
    }
  }

  // Resilient heuristic analysis fallback when API key is unconfigured or rate limited
  return generateHeuristicFeedback(type, question, answer);
}

function generateHeuristicFeedback(
  type: string,
  question: string,
  rawAnswer: string
): FeedbackResult {
  const answer = (rawAnswer || '').trim();
  const words = answer.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const grammarIssues: FeedbackResult['grammarIssues'] = [];
  const vocabularySuggestions: FeedbackResult['vocabularySuggestions'] = [];
  const tips: string[] = [];

  // Check capitalization of 'I'
  if (/\bi\b/.test(answer)) {
    grammarIssues.push({
      issue: 'Lowercase "i"',
      correction: 'Capital "I"',
      explanation: 'The personal pronoun "I" must always be capitalized in professional English.'
    });
  }

  // Check for common contractions or informalities
  if (/gonna|wanna|kinda|sorta/i.test(answer)) {
    grammarIssues.push({
      issue: 'Informal colloquial contraction (e.g., "gonna", "wanna")',
      correction: 'Use formal verb forms: "going to", "want to"',
      explanation: 'Avoid casual contractions in interview settings to project professionalism.'
    });
  }

  // Check double spaces or punctuation
  if (!/[.!?]$/.test(answer) && answer.length > 5) {
    grammarIssues.push({
      issue: 'Missing concluding punctuation',
      correction: 'Add a period (.) at the end of complete sentences.',
      explanation: 'Proper sentence termination enhances readability and clear pacing.'
    });
  }

  // Check vocabulary upgrades
  const vocabReplacements: Record<string, { alt: string; reason: string }> = {
    'good': { alt: 'exemplary / effective', reason: '"Good" is too generic; specify positive impact.' },
    'hard': { alt: 'rigorous / demanding', reason: '"Rigorous" conveys dedication and structured effort.' },
    'help': { alt: 'facilitate / empower', reason: '"Facilitate" highlights proactive leadership.' },
    'did': { alt: 'executed / spearheaded', reason: 'Use strong action verbs to showcase accountability.' },
    'made': { alt: 'engineered / developed', reason: 'Highlights technical craftsmanship and design.' },
    'nice': { alt: 'congenial / collaborative', reason: 'Professional synonyms convey social intelligence.' },
    'bad': { alt: 'suboptimal / challenging', reason: 'Objective phrasing presents problems constructively.' },
    'stuff': { alt: 'initiatives / responsibilities', reason: '"Stuff" is vague and overly colloquial.' },
    'things': { alt: 'deliverables / aspects', reason: 'Clear nouns communicate precision.' }
  };

  for (const [key, val] of Object.entries(vocabReplacements)) {
    const reg = new RegExp(`\\b${key}\\b`, 'i');
    if (reg.test(answer)) {
      vocabularySuggestions.push({
        originalWordOrPhrase: key,
        betterAlternative: val.alt,
        reason: val.reason
      });
    }
  }

  // Default vocabulary suggestion if none matched
  if (vocabularySuggestions.length === 0) {
    vocabularySuggestions.push({
      originalWordOrPhrase: 'Basic action verbs',
      betterAlternative: 'Spearhead, collaborate, synthesize, and optimize',
      reason: 'Action-oriented verbs emphasize tangible career results and leadership.'
    });
  }

  // Calculate heuristic score
  let baseScore = 6;
  if (wordCount >= 20 && wordCount <= 120) baseScore += 2;
  if (wordCount > 120) baseScore += 1;
  if (grammarIssues.length === 0) baseScore += 1;
  if (vocabularySuggestions.length > 0 && wordCount >= 30) baseScore += 1;
  const finalScore = Math.min(10, Math.max(3, baseScore - grammarIssues.length));

  // Build corrected answer
  let corrected = answer.replace(/\bi\b/g, 'I');
  corrected = corrected.replace(/\bgonna\b/gi, 'going to').replace(/\bwanna\b/gi, 'want to');
  if (!/[.!?]$/.test(corrected) && corrected.length > 0) {
    corrected += '.';
  }

  // Build polished improved answer
  let improved = corrected;
  if (type === 'introduction') {
    improved = `I am a forward-thinking professional with a strong foundation in collaborative problem solving. Throughout my projects, I have consistently prioritized clean execution and measurable value for my team. I am excited about this opportunity because it aligns directly with my passion for continuous learning and high-standard delivery.`;
  } else if (type === 'sentence') {
    improved = `In my previous role, I actively spearheaded critical initiatives and collaborated with cross-functional peers to exceed key milestones.`;
  } else {
    improved = `In approaching this challenge, I first assessed the core requirements and gathered relevant stakeholder insights. By systematically executing the solution and monitoring key performance indicators, I ensured our deliverable was completed smoothly, reinforcing both quality and team agility.`;
  }

  tips.push('Structure your answer using the STAR technique (Situation, Task, Action, Result) to provide tangible context.');
  tips.push('Maintain a steady speaking rhythm between 130-150 words per minute to sound poised and authoritative.');
  if (wordCount < 25) {
    tips.push('Expand your response by providing a specific real-world example to substantiate your claim.');
  } else {
    tips.push('Highlight the specific quantifiable impact or key lessons learned from your experience.');
  }

  return {
    correctedAnswer: corrected || 'Please provide a response for evaluation.',
    grammarIssues,
    vocabularySuggestions,
    improvedAnswer: improved,
    score: finalScore,
    tips
  };
}
