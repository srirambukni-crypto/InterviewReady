import type { InterviewQuestion, VocabularyWord, SentenceExercise } from './types.ts';

export const SEED_QUESTIONS: InterviewQuestion[] = [
  // Introduction (4 questions)
  {
    id: 'q-intro-1',
    category: 'introduction',
    question: 'Tell me about yourself and your professional journey.',
    difficulty: 'Beginner',
    guidance: 'Structure your answer using the Present-Past-Future formula. Focus on your relevant skills and passion for this role.',
    modelAnswer: 'I am a dedicated software developer with over two years of hands-on experience building intuitive web applications. Recently, I led the frontend redesign of an e-commerce platform that increased customer checkout efficiency by 25%. Prior to that, I graduated with honours in Computer Science where I developed a strong foundation in data structures and scalable system architecture. I am enthusiastic about this opportunity because your team is pioneering accessible web experiences, and I am eager to contribute my technical diligence and collaborative problem-solving skills.',
    keyVocabulary: ['dedicated', 'hands-on experience', 'intuitive', 'pioneering', 'collaborative']
  },
  {
    id: 'q-intro-2',
    category: 'introduction',
    question: 'How would you summarize your background in three key highlights?',
    difficulty: 'Intermediate',
    guidance: 'Keep it punchy. Group your experience into three thematic pillars: technical mastery, collaboration, and proven impact.',
    modelAnswer: 'If I were to distill my background into three pillars, the first would be technical proficiency in modern web frameworks. Second is my collaborative mindset—I excel at translating complex technical requirements into accessible solutions for cross-functional partners. Lastly, I maintain an unwavering commitment to quality and user satisfaction, consistently delivering projects ahead of scheduled deadlines.',
    keyVocabulary: ['distill', 'proficiency', 'collaborative mindset', 'unwavering', 'cross-functional']
  },
  {
    id: 'q-intro-3',
    category: 'introduction',
    question: 'Walk me through your resume and why you are transitioning to this field.',
    difficulty: 'Intermediate',
    guidance: 'Connect the common thread of curiosity, transferable skills, and purposeful career advancement.',
    modelAnswer: 'Throughout my academic and initial work experiences, the common thread has always been analytical problem solving and clear communication. In my previous role, I frequently automated reporting workflows, which sparked my passion for full-stack software development. I completed rigorous specialized training and built production-ready applications. This role represents the natural progression where I can channel both my analytical background and modern engineering practices.',
    keyVocabulary: ['analytical', 'automated workflows', 'progression', 'transferable skills', 'rigorous']
  },
  {
    id: 'q-intro-4',
    category: 'introduction',
    question: 'What motivated you to apply for this specific role and organization?',
    difficulty: 'Beginner',
    guidance: 'Show genuine research into company values, products, or recent milestones. Align your aspirations with their mission.',
    modelAnswer: 'I have closely followed your organization’s commitment to sustainable digital infrastructure and open-source innovation. What specifically resonated with me is your recent initiative to improve digital accessibility for underserved communities. My professional ethos aligns closely with this mission, and I am excited to leverage my background in accessible interface engineering to support your continued growth.',
    keyVocabulary: ['sustainable', 'resonated', 'professional ethos', 'leverage', 'initiative']
  },

  // Strengths (4 questions)
  {
    id: 'q-strength-1',
    category: 'strengths',
    question: 'What do you consider your greatest professional strength?',
    difficulty: 'Beginner',
    guidance: 'Pick one distinct strength and substantiate it with a concrete STAR (Situation, Task, Action, Result) example.',
    modelAnswer: 'My greatest professional strength is my systematic problem-solving ability, especially under tight constraints. For instance, when a critical database query slowed our production application, I systematically audited the API response cycle, identified an inefficient N+1 query issue, and implemented targeted caching. This reduced page load times by 40% and stabilized server performance for over 50,000 active users.',
    keyVocabulary: ['systematic', 'constraints', 'audited', 'implemented', 'stabilized']
  },
  {
    id: 'q-strength-2',
    category: 'strengths',
    question: 'How do you handle ambiguous situations or rapidly shifting priorities?',
    difficulty: 'Intermediate',
    guidance: 'Emphasize adaptability, structured communication, and proactive prioritization.',
    modelAnswer: 'I view ambiguity as an opportunity for proactive inquiry and structured alignment. When client specifications shifted during a sprint, I initiated a concise clarification meeting with the project manager to rank features by business value. By establishing an agile, phased rollout plan, our team delivered the core MVP on time without team burnout.',
    keyVocabulary: ['ambiguity', 'proactive inquiry', 'alignment', 'initiated', 'agile']
  },
  {
    id: 'q-strength-3',
    category: 'strengths',
    question: 'Can you describe a situation where your communication prevented a project delay?',
    difficulty: 'Intermediate',
    guidance: 'Highlight transparent, early communication and stakeholder management.',
    modelAnswer: 'During a cross-functional integration, I noticed a discrepancy between our API payload contract and the mobile client specifications. Rather than waiting for QA testing, I immediately flagged the mismatch, scheduled a 15-minute sync with the backend lead, and proposed a backwards-compatible schema. This early intervention prevented an estimated two-week delay before the staging release.',
    keyVocabulary: ['discrepancy', 'flagged', 'backwards-compatible', 'intervention', 'cross-functional']
  },
  {
    id: 'q-strength-4',
    category: 'strengths',
    question: 'What unique perspective or capability do you bring to a multidisciplinary team?',
    difficulty: 'Advanced',
    guidance: 'Bridge the gap between design empathy and engineering precision.',
    modelAnswer: 'I bridge the gap between user experience empathy and technical rigor. Because I actively study both design systems and backend mechanics, I serve as a constructive translator between designers and engineers. This helps our team reach consensus faster and reduces rework during implementation.',
    keyVocabulary: ['bridge the gap', 'rigor', 'constructive', 'consensus', 'rework']
  },

  // Weaknesses (4 questions)
  {
    id: 'q-weak-1',
    category: 'weaknesses',
    question: 'What is an area you are actively working to improve or consider a weakness?',
    difficulty: 'Intermediate',
    guidance: 'Choose a real, non-fatal area of growth. Explain the self-awareness and active steps you are taking to overcome it.',
    modelAnswer: 'In the past, I occasionally hesitated to delegate tasks because I held an overly perfectionist standard for every deliverable. However, I recognized that this created a bottleneck for the broader team. To address this, I adopted structured delegation practices and implemented collaborative milestone check-ins. This has helped me empower peers while maintaining high output quality.',
    keyVocabulary: ['hesitated', 'bottleneck', 'adopted', 'empower', 'milestone']
  },
  {
    id: 'q-weak-2',
    category: 'weaknesses',
    question: 'Tell me about a time you received constructive criticism and how you responded.',
    difficulty: 'Intermediate',
    guidance: 'Show openness, emotional maturity, and positive behavioral change.',
    modelAnswer: 'Early in my career, my manager pointed out that while my code was technically sound, my documentation was too terse for new team members. I appreciated the candid feedback and immediately created a standardized README template with architectural diagrams. Within two months, onboarding feedback for new hires improved significantly, and I now consider clear documentation a hallmark of quality.',
    keyVocabulary: ['candid feedback', 'terse', 'standardized', 'onboarding', 'hallmark']
  },
  {
    id: 'q-weak-3',
    category: 'weaknesses',
    question: 'Have you ever missed a deadline or made an error in your work? How did you handle it?',
    difficulty: 'Advanced',
    guidance: 'Own the mistake without excuses, describe immediate corrective action, and share the preventative measure implemented.',
    modelAnswer: 'Once during a software patch release, I overlooked a configuration flag in the staging environment, which delayed the deployment by two hours. I immediately owned the error, informed our release manager with an accurate recovery timeline, and resolved the config issue. Afterward, I authored an automated pre-deployment checklist script to guarantee the parameter is validated on every future release.',
    keyVocabulary: ['owned the error', 'recovery timeline', 'authored', 'pre-deployment checklist', 'preventative']
  },
  {
    id: 'q-weak-4',
    category: 'weaknesses',
    question: 'How do you prevent public speaking anxiety or nervousness before high-stakes presentations?',
    difficulty: 'Beginner',
    guidance: 'Demonstrate actionable self-management techniques such as rehearsal and structuring talks.',
    modelAnswer: 'Public speaking initially caused me considerable nervous anticipation. To tackle this, I joined a peer presentation workshop where I learned to structure my talking points using bulleted anchor concepts rather than verbatim scripts. Practicing deliberate pauses and breathing techniques has turned my initial anxiety into focused, energetic delivery.',
    keyVocabulary: ['anticipation', 'anchor concepts', 'verbatim', 'deliberate pauses', 'energetic delivery']
  },

  // Goals (4 questions)
  {
    id: 'q-goal-1',
    category: 'goals',
    question: 'Where do you envision yourself professionally in three to five years?',
    difficulty: 'Beginner',
    guidance: 'Balance personal career growth with creating sustained value for the organization.',
    modelAnswer: 'Over the next three to five years, I aim to evolve into a senior technical contributor and mentor. I want to deepen my domain expertise in distributed cloud architectures while taking on ownership of end-to-end system designs. Ultimately, I look forward to guiding junior engineers and fostering a collaborative, high-standard team culture.',
    keyVocabulary: ['envision', 'domain expertise', 'distributed', 'fostering', 'high-standard']
  },
  {
    id: 'q-goal-2',
    category: 'goals',
    question: 'What continuous learning strategies do you use to keep your skills current?',
    difficulty: 'Beginner',
    guidance: 'Mention tech blogs, open source contributions, peer code reviews, or structured certifications.',
    modelAnswer: 'I dedicate time every week to structured technical reading, following engineering blogs from industry leaders, and experimenting with emerging tools in sandbox repositories. I also actively participate in tech meetups and open-source discussions. This habit ensures that my problem-solving repertoire remains modern, efficient, and adaptable.',
    keyVocabulary: ['continuous learning', 'sandbox repositories', 'repertoire', 'adaptable', 'emerging']
  },
  {
    id: 'q-goal-3',
    category: 'goals',
    question: 'What kind of work environment enables you to produce your best results?',
    difficulty: 'Intermediate',
    guidance: 'Highlight psychological safety, constructive dialogue, and mutual accountability.',
    modelAnswer: 'I thrive in an environment rooted in psychological safety, open communication, and mutual accountability. I value teams where questions are welcomed, constructive debate is encouraged, and individuals celebrate each other’s milestones. That collaborative atmosphere inspires my highest creativity and sustained productivity.',
    keyVocabulary: ['thrive', 'psychological safety', 'mutual accountability', 'constructive debate', 'sustained']
  },
  {
    id: 'q-goal-4',
    category: 'goals',
    question: 'What would success look like for you in the first 90 days of this position?',
    difficulty: 'Advanced',
    guidance: 'Break down your plan into 30-day milestones: absorbing context, delivering initial wins, and driving proactive impact.',
    modelAnswer: 'In the first 30 days, my priority would be absorbing our domain knowledge, understanding the codebase, and building relationships across the team. By day 60, I aim to be executing feature deliverables autonomously and contributing meaningfully in code reviews. By day 90, I plan to identify an area for workflow optimization and deliver an initiative that enhances team velocity.',
    keyVocabulary: ['absorbing context', 'autonomously', 'code reviews', 'workflow optimization', 'team velocity']
  },

  // Why Hire You (4 questions)
  {
    id: 'q-why-1',
    category: 'why-hire-you',
    question: 'Why should we hire you over other qualified candidates applying for this position?',
    difficulty: 'Intermediate',
    guidance: 'Synthesize your technical capability, cultural alignment, and proactive work ethic.',
    modelAnswer: 'You should hire me because I combine solid technical capability with proactive ownership and exceptional empathy for the end user. Beyond writing clean, maintainable code, I invest time in understanding the underlying business goals so every feature delivers measurable value. My track record shows that I ramp up rapidly and consistently bring positive momentum to team goals.',
    keyVocabulary: ['proactive ownership', 'maintainable', 'underlying business goals', 'measurable value', 'momentum']
  },
  {
    id: 'q-why-2',
    category: 'why-hire-you',
    question: 'What sets your approach to teamwork and collaboration apart from others?',
    difficulty: 'Beginner',
    guidance: 'Emphasize active listening, knowledge sharing, and uplifting teammates.',
    modelAnswer: 'What sets my approach apart is active listening and an instinctive drive to unblock teammates. I believe individual success is secondary to collective team achievement. Whether that means pairing on complex debug sessions, writing thorough documentation, or jumping in to assist during critical launches, I am always dependable and team-first.',
    keyVocabulary: ['active listening', 'unblock', 'collective achievement', 'pairing', 'dependable']
  },
  {
    id: 'q-why-3',
    category: 'why-hire-you',
    question: 'How do your personal values align with our mission and cultural principles?',
    difficulty: 'Intermediate',
    guidance: 'Connect your personal ethics—integrity, transparency, customer obsession—with the company.',
    modelAnswer: 'Your principle of "customer-centric transparency" strongly mirrors my personal ethos. I believe that sustainable software is built when engineers listen deeply to user pain points and act with relentless integrity. Joining your team is exciting because I know our daily work will genuinely benefit real people.',
    keyVocabulary: ['customer-centric', 'mirrors', 'ethos', 'relentless integrity', 'sustainable']
  },
  {
    id: 'q-why-4',
    category: 'why-hire-you',
    question: 'What is the most impactful project you have led or contributed to, and why was it significant?',
    difficulty: 'Advanced',
    guidance: 'Detail the scale, business impact, personal contribution, and key learnings.',
    modelAnswer: 'The most impactful project I contributed to was rebuilding a legacy notification system into an event-driven architecture. I spear-headed the message queue redesign and added resilient retry mechanisms. As a result, message delivery failures dropped from 4.2% to under 0.05%, preserving customer engagement across millions of notifications.',
    keyVocabulary: ['event-driven', 'spearheaded', 'resilient retry', 'failures dropped', 'preserving engagement']
  }
];

export const SEED_VOCABULARY: VocabularyWord[] = [
  {
    id: 'vocab-1',
    word: 'Spearheaded',
    phonetic: '/ˈspɪər.hed.ɪd/',
    partOfSpeech: 'verb (past tense)',
    meaning: 'Led, initiated, or championed an organized effort or project from the forefront.',
    exampleSentence: 'I spearheaded the migration of our legacy monolith to modern cloud microservices, reducing deployment downtime by 70%.',
    category: 'Leadership',
    quiz: {
      question: 'Which word best replaces "led and initiated from the front" in an interview answer?',
      options: ['Spearheaded', 'Watched', 'Followed', 'Pondered'],
      correctIndex: 0,
      explanation: '"Spearheaded" demonstrates decisive leadership and proactive initiative.'
    }
  },
  {
    id: 'vocab-2',
    word: 'Articulated',
    phonetic: '/ɑːˈtɪk.jə.leɪ.tɪd/',
    partOfSpeech: 'verb (past tense)',
    meaning: 'Expressed an idea, vision, or requirement clearly and coherently in words.',
    exampleSentence: 'I articulated the project roadmap and key trade-offs to senior executive stakeholders during our quarterly review.',
    category: 'Collaboration',
    quiz: {
      question: 'Choose the word that describes conveying ideas with precision and clarity:',
      options: ['Mumbled', 'Articulated', 'Hesitated', 'Concealed'],
      correctIndex: 1,
      explanation: '"Articulated" highlights polished, clear verbal communication.'
    }
  },
  {
    id: 'vocab-3',
    word: 'Resilient',
    phonetic: '/rɪˈzɪl.jənt/',
    partOfSpeech: 'adjective',
    meaning: 'Able to withstand, recover quickly from, and adapt positively to difficult conditions.',
    exampleSentence: 'Our team remained resilient during the sudden production outage, maintaining clear communication until full restoration was achieved.',
    category: 'Work Ethic',
    quiz: {
      question: 'Which adjective best describes staying calm and recovering rapidly from setbacks?',
      options: ['Fragile', 'Resilient', 'Passive', 'Indifferent'],
      correctIndex: 1,
      explanation: '"Resilient" shows emotional grit and professional composure under pressure.'
    }
  },
  {
    id: 'vocab-4',
    word: 'Streamlined',
    phonetic: '/ˈstriːm.laɪnd/',
    partOfSpeech: 'verb (past tense)',
    meaning: 'Improved the efficiency and simplicity of a process or organization by eliminating unnecessary steps.',
    exampleSentence: 'I streamlined the client onboarding procedure, trimming customer turnaround time from five days to twenty-four hours.',
    category: 'Problem Solving',
    quiz: {
      question: 'Which verb indicates making an existing workflow faster, leaner, and more efficient?',
      options: ['Complicated', 'Streamlined', 'Delayed', 'Ignored'],
      correctIndex: 1,
      explanation: '"Streamlined" conveys process optimization and business value.'
    }
  },
  {
    id: 'vocab-5',
    word: 'Collaborative',
    phonetic: '/kəˈlæb.ər.ə.tɪv/',
    partOfSpeech: 'adjective',
    meaning: 'Involving two or more parties working together cooperatively toward a shared objective.',
    exampleSentence: 'I foster a collaborative environment where cross-disciplinary peers feel empowered to brainstorm openly.',
    category: 'Collaboration',
    quiz: {
      question: 'What is the term for productive, cooperative teamwork across departments?',
      options: ['Isolated', 'Competitive', 'Collaborative', 'Rigid'],
      correctIndex: 2,
      explanation: '"Collaborative" underscores team synergy and mutual respect.'
    }
  },
  {
    id: 'vocab-6',
    word: 'Proactive',
    phonetic: '/prəʊˈæk.tɪv/',
    partOfSpeech: 'adjective',
    meaning: 'Creating or controlling a situation rather than just reacting after something has occurred.',
    exampleSentence: 'By taking a proactive approach to risk management, we resolved security vulnerabilities before the scheduled audit.',
    category: 'Work Ethic',
    quiz: {
      question: 'Which word means taking early initiative before issues arise?',
      options: ['Reactive', 'Proactive', 'Hesitant', 'Complacent'],
      correctIndex: 1,
      explanation: '"Proactive" shows foresight and leadership initiative.'
    }
  },
  {
    id: 'vocab-7',
    word: 'Leveraged',
    phonetic: '/ˈlev.ər.ɪdʒd/',
    partOfSpeech: 'verb (past tense)',
    meaning: 'Used something (such as resources, skills, or data) to maximum advantage.',
    exampleSentence: 'We leveraged customer behavioral analytics to optimize our navigation funnel, resulting in higher user retention.',
    category: 'Impact Verbs',
    quiz: {
      question: 'Which verb means strategically using an existing asset or tool for maximum gain?',
      options: ['Leveraged', 'Discarded', 'Wasted', 'Neglected'],
      correctIndex: 0,
      explanation: '"Leveraged" demonstrates strategic resourcefulness.'
    }
  },
  {
    id: 'vocab-8',
    word: 'Diligence',
    phonetic: '/ˈdɪl.ɪ.dʒəns/',
    partOfSpeech: 'noun',
    meaning: 'Careful and persistent work or effort; thorough attention to detail.',
    exampleSentence: 'My diligence in code reviews and edge-case testing ensured our platform sustained 99.99% availability during peak traffic.',
    category: 'Work Ethic',
    quiz: {
      question: 'What quality denotes persistent, meticulous attention to detail and care?',
      options: ['Carelessness', 'Haste', 'Diligence', 'Apathy'],
      correctIndex: 2,
      explanation: '"Diligence" indicates thoroughness and professional dependability.'
    }
  },
  {
    id: 'vocab-9',
    word: 'Synthesized',
    phonetic: '/ˈsɪn.θə.saɪzd/',
    partOfSpeech: 'verb (past tense)',
    meaning: 'Combined a range of different ideas, facts, or data points to form a coherent whole.',
    exampleSentence: 'I synthesized user feedback from twenty qualitative interviews into four prioritized feature enhancements.',
    category: 'Problem Solving',
    quiz: {
      question: 'When you consolidate disparate data points into structured insights, you have:',
      options: ['Fragmented them', 'Synthesized them', 'Ignored them', 'Scattered them'],
      correctIndex: 1,
      explanation: '"Synthesized" shows high-level cognitive and analytical prowess.'
    }
  },
  {
    id: 'vocab-10',
    word: 'Orchestrated',
    phonetic: '/ˈɔː.kɪ.streɪ.tɪd/',
    partOfSpeech: 'verb (past tense)',
    meaning: 'Carefully arranged and directed complex elements, teams, or events to produce a desired outcome.',
    exampleSentence: 'I orchestrated the multi-department rollout of our new CRM system across three global office branches.',
    category: 'Leadership',
    quiz: {
      question: 'Which word captures coordinating multiple complex parts of a major initiative?',
      options: ['Disrupted', 'Orchestrated', 'Disassembled', 'Wrecked'],
      correctIndex: 1,
      explanation: '"Orchestrated" evokes master coordination and harmonious management.'
    }
  },
  {
    id: 'vocab-11',
    word: 'Empathetic',
    phonetic: '/ˌem.pəˈθet.ɪk/',
    partOfSpeech: 'adjective',
    meaning: 'Showing an ability to deeply understand and share the feelings or perspectives of another.',
    exampleSentence: 'An empathetic approach to user research allowed us to identify accessibility pain points experienced by visually impaired users.',
    category: 'Collaboration',
    quiz: {
      question: 'What adjective describes truly understanding and caring about user or colleague perspectives?',
      options: ['Detached', 'Empathetic', 'Aloof', 'Blunt'],
      correctIndex: 1,
      explanation: '"Empathetic" demonstrates emotional intelligence and user focus.'
    }
  },
  {
    id: 'vocab-12',
    word: 'Cultivated',
    phonetic: '/ˈkʌl.tɪ.veɪ.tɪd/',
    partOfSpeech: 'verb (past tense)',
    meaning: 'Nurtured, developed, and improved relationships, habits, or capabilities over time.',
    exampleSentence: 'I cultivated long-term partnerships with strategic vendor teams, securing favourable terms and early feature previews.',
    category: 'Leadership',
    quiz: {
      question: 'Which verb expresses nurturing and developing valuable relationships over time?',
      options: ['Severed', 'Cultivated', 'Neglected', 'Ruined'],
      correctIndex: 1,
      explanation: '"Cultivated" highlights patient, deliberate relationship building.'
    }
  },
  {
    id: 'vocab-13',
    word: 'Pragmatic',
    phonetic: '/præɡˈmæt.ɪk/',
    partOfSpeech: 'adjective',
    meaning: 'Dealing with things sensibly and realistically based on practical rather than theoretical considerations.',
    exampleSentence: 'I took a pragmatic stance when prioritizing technical debt versus new features, ensuring sprint stability without sacrificing product momentum.',
    category: 'Problem Solving',
    quiz: {
      question: 'What word describes making sensible decisions based on practical real-world realities?',
      options: ['Idealistic', 'Impractical', 'Pragmatic', 'Theoretical'],
      correctIndex: 2,
      explanation: '"Pragmatic" demonstrates grounded, mature decision-making.'
    }
  },
  {
    id: 'vocab-14',
    word: 'Pivotal',
    phonetic: '/ˈpɪv.ə.təl/',
    partOfSpeech: 'adjective',
    meaning: 'Of crucial importance in relation to the development or success of something else.',
    exampleSentence: 'Our team played a pivotal role in securing SOC-2 compliance ahead of enterprise contract negotiations.',
    category: 'Impact Verbs',
    quiz: {
      question: 'Choose the word that means fundamentally crucial to a positive outcome:',
      options: ['Trivial', 'Pivotal', 'Marginal', 'Irrelevant'],
      correctIndex: 1,
      explanation: '"Pivotal" highlights indispensable impact.'
    }
  },
  {
    id: 'vocab-15',
    word: 'Decisive',
    phonetic: '/dɪˈsaɪ.sɪv/',
    partOfSpeech: 'adjective',
    meaning: 'Having or showing the ability to make clear, firm decisions quickly and confidently.',
    exampleSentence: 'Taking decisive action during the data migration incident mitigated data loss and reassured key clients.',
    category: 'Leadership',
    quiz: {
      question: 'What quality reflects making timely, firm decisions with conviction?',
      options: ['Indecisive', 'Hesitant', 'Decisive', 'Vague'],
      correctIndex: 2,
      explanation: '"Decisive" reflects executive confidence.'
    }
  },
  {
    id: 'vocab-16',
    word: 'Facilitated',
    phonetic: '/fəˈsɪl.ɪ.teɪ.tɪd/',
    partOfSpeech: 'verb (past tense)',
    meaning: 'Made an action or process easier, smoother, or more collaborative.',
    exampleSentence: 'I facilitated weekly agile retrospectives, establishing a constructive forum for continuous workflow refinement.',
    category: 'Collaboration',
    quiz: {
      question: 'Which word means guiding a session smoothly so participants collaborate effectively?',
      options: ['Obstructed', 'Facilitated', 'Dominated', 'Stifled'],
      correctIndex: 1,
      explanation: '"Facilitated" shows collaborative servant leadership.'
    }
  },
  {
    id: 'vocab-17',
    word: 'Accelerated',
    phonetic: '/əkˈsel.ə.reɪ.tɪd/',
    partOfSpeech: 'verb (past tense)',
    meaning: 'Increased the speed, velocity, or progress of a project or business objective.',
    exampleSentence: 'Implementing reusable component libraries accelerated frontend delivery across our six product squads.',
    category: 'Impact Verbs',
    quiz: {
      question: 'Which verb indicates speeding up delivery or progress significantly?',
      options: ['Slowed', 'Accelerated', 'Stalled', 'Hampered'],
      correctIndex: 1,
      explanation: '"Accelerated" demonstrates measurable productivity gains.'
    }
  },
  {
    id: 'vocab-18',
    word: 'Revitalized',
    phonetic: '/riːˈvaɪ.təl.aɪzd/',
    partOfSpeech: 'verb (past tense)',
    meaning: 'Imbued something with new life, energy, vitality, or modern efficiency.',
    exampleSentence: 'I revitalized our internal documentation culture, turning outdated wikis into an interactive, search-optimized knowledge base.',
    category: 'Problem Solving',
    quiz: {
      question: 'When you breathe fresh energy and quality into an outdated system, you have:',
      options: ['Revitalized it', 'Abandoned it', 'Suppressed it', 'Dismantled it'],
      correctIndex: 0,
      explanation: '"Revitalized" shows transformational initiative.'
    }
  },
  {
    id: 'vocab-19',
    word: 'Standardized',
    phonetic: '/ˈstæn.də.daɪzd/',
    partOfSpeech: 'verb (past tense)',
    meaning: 'Cause something to conform to a standard, baseline, or best practice.',
    exampleSentence: 'We standardized our error logging schema across all microservices, cutting bug diagnosis time in half.',
    category: 'Problem Solving',
    quiz: {
      question: 'Bringing consistency and uniform best practices across team workflows is called:',
      options: ['Standardizing', 'Disorganizing', 'Scattering', 'Improvising'],
      correctIndex: 0,
      explanation: '"Standardized" reflects structural discipline and scalability.'
    }
  },
  {
    id: 'vocab-20',
    word: 'Unwavering',
    phonetic: '/ʌnˈweɪ.vər.ɪŋ/',
    partOfSpeech: 'adjective',
    meaning: 'Steady, resolute, and not changing or faltering even in tough moments.',
    exampleSentence: 'My unwavering attention to code hygiene and test coverage ensured our releases remained regression-free.',
    category: 'Work Ethic',
    quiz: {
      question: 'What word describes steadfast, consistent dedication that never wavers?',
      options: ['Fickle', 'Unwavering', 'Fluctuating', 'Casual'],
      correctIndex: 1,
      explanation: '"Unwavering" signals deep integrity and dependability.'
    }
  },
  {
    id: 'vocab-21',
    word: 'Consensus',
    phonetic: '/kənˈsen.səs/',
    partOfSpeech: 'noun',
    meaning: 'A general agreement arrived at cooperatively by a group.',
    exampleSentence: 'When technical opinions differed on database selection, I gathered benchmarking data to help the team reach a unanimous consensus.',
    category: 'Collaboration',
    quiz: {
      question: 'What is a mutual agreement reached thoughtfully among team members?',
      options: ['Conflict', 'Consensus', 'Dictate', 'Ultimatum'],
      correctIndex: 1,
      explanation: '"Consensus" signifies collaborative harmony.'
    }
  },
  {
    id: 'vocab-22',
    word: 'Championed',
    phonetic: '/ˈtʃæm.pi.ənd/',
    partOfSpeech: 'verb (past tense)',
    meaning: 'Vigorously supported or defended a cause, standard, or innovation.',
    exampleSentence: 'I championed the adoption of automated accessibility testing in our CI/CD pipeline.',
    category: 'Leadership',
    quiz: {
      question: 'Which word describes passionately advocating and driving a progressive cause at work?',
      options: ['Opposed', 'Championed', 'Doubted', 'Resisted'],
      correctIndex: 1,
      explanation: '"Championed" indicates proactive advocacy and leadership.'
    }
  },
  {
    id: 'vocab-23',
    word: 'Mitigated',
    phonetic: '/ˈmɪt.ɪ.ɡeɪ.tɪd/',
    partOfSpeech: 'verb (past tense)',
    meaning: 'Made something less severe, harmful, or dangerous; reduced risk.',
    exampleSentence: 'By performing load testing before Black Friday, we mitigated the risk of server downtime.',
    category: 'Problem Solving',
    quiz: {
      question: 'Which term means lessening the impact or likelihood of a risk?',
      options: ['Amplified', 'Mitigated', 'Ignored', 'Aggravated'],
      correctIndex: 1,
      explanation: '"Mitigated" shows foresight and risk management.'
    }
  },
  {
    id: 'vocab-24',
    word: 'Cohesive',
    phonetic: '/kəʊˈhiː.sɪv/',
    partOfSpeech: 'adjective',
    meaning: 'Characterized by parts fitting together smoothly and working unitedly as a whole.',
    exampleSentence: 'We integrated our visual styles and component APIs into a cohesive design system used by over fifty engineers.',
    category: 'Collaboration',
    quiz: {
      question: 'When components or team members function in complete unity and harmony, they are:',
      options: ['Disjointed', 'Cohesive', 'Conflicted', 'Chaotic'],
      correctIndex: 1,
      explanation: '"Cohesive" describes seamless integration and harmony.'
    }
  },
  {
    id: 'vocab-25',
    word: 'Quantifiable',
    phonetic: '/ˌkwɒn.tɪˈfaɪ.ə.bəl/',
    partOfSpeech: 'adjective',
    meaning: 'Able to be expressed or measured as a definitive quantity or metric.',
    exampleSentence: 'In every project I undertake, I define quantifiable metrics such as latency, conversion, or error rates to measure true impact.',
    category: 'Impact Verbs',
    quiz: {
      question: 'What adjective describes business outcomes that can be measured with clear numbers?',
      options: ['Vague', 'Ambiguous', 'Quantifiable', 'Immeasurable'],
      correctIndex: 2,
      explanation: '"Quantifiable" proves data-driven business impact.'
    }
  },
  {
    id: 'vocab-26',
    word: 'Holistic',
    phonetic: '/həʊˈlɪs.tɪk/',
    partOfSpeech: 'adjective',
    meaning: 'Characterized by the belief that the parts of something are interconnected and can be explained only by reference to the whole.',
    exampleSentence: 'I take a holistic approach to application architecture, evaluating not just speed, but also security, maintainability, and developer experience.',
    category: 'Problem Solving',
    quiz: {
      question: 'Which term means analyzing the complete picture rather than isolated parts?',
      options: ['Narrow', 'Holistic', 'Segmented', 'Myopic'],
      correctIndex: 1,
      explanation: '"Holistic" showcases comprehensive, big-picture thinking.'
    }
  },
  {
    id: 'vocab-27',
    word: 'Exemplary',
    phonetic: '/ɪɡˈzem.plər.i/',
    partOfSpeech: 'adjective',
    meaning: 'Serving as a desirable model; representing the best of its kind.',
    exampleSentence: 'Our project deliverable received exemplary praise from the client for its clean code and intuitive user interface.',
    category: 'Work Ethic',
    quiz: {
      question: 'Which word describes work of outstanding quality worthy of serving as a model?',
      options: ['Subpar', 'Mediocre', 'Exemplary', 'Defective'],
      correctIndex: 2,
      explanation: '"Exemplary" connotes top-tier craftsmanship.'
    }
  },
  {
    id: 'vocab-28',
    word: 'Disseminated',
    phonetic: '/dɪˈsem.ɪ.neɪ.tɪd/',
    partOfSpeech: 'verb (past tense)',
    meaning: 'Spread or dispersed something (especially information or best practices) widely.',
    exampleSentence: 'Following the architecture summit, I disseminated key takeaways and code samples across the entire engineering department.',
    category: 'Collaboration',
    quiz: {
      question: 'Which verb denotes distributing crucial knowledge or insights broadly across a team?',
      options: ['Withheld', 'Disseminated', 'Hoarded', 'Suppressed'],
      correctIndex: 1,
      explanation: '"Disseminated" reflects open knowledge sharing.'
    }
  },
  {
    id: 'vocab-29',
    word: 'Pioneered',
    phonetic: '/ˌpaɪəˈnɪəd/',
    partOfSpeech: 'verb (past tense)',
    meaning: 'Developed or was the first to explore and apply new methods or technologies.',
    exampleSentence: 'I pioneered the adoption of server-driven UI in our mobile apps, cutting app store approval wait times for simple UI updates.',
    category: 'Leadership',
    quiz: {
      question: 'What verb means introducing and blazing the trail for an innovative method?',
      options: ['Followed', 'Pioneered', 'Copied', 'Repeated'],
      correctIndex: 1,
      explanation: '"Pioneered" emphasizes original innovation.'
    }
  },
  {
    id: 'vocab-30',
    word: 'Empowered',
    phonetic: '/ɪmˈpaʊ.əd/',
    partOfSpeech: 'verb (past tense)',
    meaning: 'Gave someone the authority, confidence, or freedom to take action and make decisions.',
    exampleSentence: 'By establishing transparent API boundaries, we empowered junior engineers to ship user-facing features independently.',
    category: 'Leadership',
    quiz: {
      question: 'Which word means equipping and trusting peers to take autonomous ownership?',
      options: ['Restricted', 'Micromanaged', 'Empowered', 'Subordinated'],
      correctIndex: 2,
      explanation: '"Empowered" captures modern, uplifting leadership.'
    }
  }
];

export const SEED_SENTENCES: SentenceExercise[] = [
  {
    id: 'sent-1',
    type: 'reorder',
    category: 'STAR Method',
    instruction: 'Arrange the words to form a polished interview statement detailing situation and action.',
    jumbledWords: ['I', 'took', 'ownership', 'of', 'the', 'project', 'and', 'delivered', 'ahead', 'of', 'schedule'],
    correctSentence: 'I took ownership of the project and delivered ahead of schedule',
    explanation: 'Placing the active subject ("I took ownership") at the beginning immediately emphasizes accountability and decisive action.'
  },
  {
    id: 'sent-2',
    type: 'reorder',
    category: 'Highlighting Strengths',
    instruction: 'Rearrange the words to convey strong cross-functional communication.',
    jumbledWords: ['I', 'excel', 'at', 'translating', 'complex', 'technical', 'concepts', 'into', 'actionable', 'business', 'solutions'],
    correctSentence: 'I excel at translating complex technical concepts into actionable business solutions',
    explanation: '"Excel at translating" conveys natural capability, and linking "technical concepts" with "business solutions" bridges engineering and business impact.'
  },
  {
    id: 'sent-3',
    type: 'reorder',
    category: 'STAR Method',
    instruction: 'Assemble this STAR result statement describing measurable efficiency gains.',
    jumbledWords: ['By', 'automating', 'the', 'workflow', 'we', 'reduced', 'processing', 'time', 'by', 'forty', 'percent'],
    correctSentence: 'By automating the workflow we reduced processing time by forty percent',
    explanation: 'Starting with "By automating..." immediately establishes the method, followed by the quantifiable metric ("reduced... by forty percent").'
  },
  {
    id: 'sent-4',
    type: 'fill-blank',
    category: 'Professional Tone',
    instruction: 'Select the most professional word to complete this career objective statement.',
    template: 'I am eager to ________ my technical skills to drive meaningful business outcomes.',
    options: ['leverage', 'throw', 'gamble', 'test'],
    correctSentence: 'I am eager to leverage my technical skills to drive meaningful business outcomes.',
    explanation: '"Leverage" is a standard professional term meaning to apply one’s capabilities strategically to maximum advantage.'
  },
  {
    id: 'sent-5',
    type: 'reorder',
    category: 'Polite Disagreement',
    instruction: 'Rearrange words into a diplomatic, constructive phrasing for team disagreement.',
    jumbledWords: ['I', 'respectfully', 'suggested', 'an', 'alternative', 'approach', 'backed', 'by', 'user', 'metrics'],
    correctSentence: 'I respectfully suggested an alternative approach backed by user metrics',
    explanation: 'Using "respectfully suggested" accompanied by "backed by user metrics" shows diplomacy grounded in objective data.'
  },
  {
    id: 'sent-6',
    type: 'fill-blank',
    category: 'STAR Method',
    instruction: 'Complete the sentence with the action verb that indicates proactive leadership.',
    template: 'When client requirements shifted, I ________ a alignment meeting with all stakeholders.',
    options: ['facilitated', 'dodged', 'delayed', 'shunned'],
    correctSentence: 'When client requirements shifted, I facilitated a alignment meeting with all stakeholders.',
    explanation: '"Facilitated" emphasizes leadership, smooth coordination, and bringing diverse parties to a common understanding.'
  },
  {
    id: 'sent-7',
    type: 'reorder',
    category: 'Highlighting Strengths',
    instruction: 'Order the words to describe professional adaptability.',
    jumbledWords: ['I', 'adapt', 'quickly', 'to', 'emerging', 'technologies', 'and', 'unfamiliar', 'codebases'],
    correctSentence: 'I adapt quickly to emerging technologies and unfamiliar codebases',
    explanation: '"I adapt quickly..." communicates learning agility, an essential trait sought after by technical interviewers.'
  },
  {
    id: 'sent-8',
    type: 'fill-blank',
    category: 'Polite Disagreement',
    instruction: 'Choose the most constructive phrasing when proposing a different architecture.',
    template: 'While I appreciate that perspective, I believe we should ________ the long-term maintainability costs.',
    options: ['consider', 'ignore', 'discard', 'dismiss'],
    correctSentence: 'While I appreciate that perspective, I believe we should consider the long-term maintainability costs.',
    explanation: '"Consider" invites collaborative evaluation without attacking the previous speaker’s idea.'
  },
  {
    id: 'sent-9',
    type: 'reorder',
    category: 'STAR Method',
    instruction: 'Reconstruct this sentence describing continuous improvement.',
    jumbledWords: ['We', 'consistently', 'solicited', 'peer', 'feedback', 'to', 'refine', 'our', 'development', 'practices'],
    correctSentence: 'We consistently solicited peer feedback to refine our development practices',
    explanation: '"Solicited peer feedback" proves a growth mindset and absence of defensive ego.'
  },
  {
    id: 'sent-10',
    type: 'fill-blank',
    category: 'Professional Tone',
    instruction: 'Complete this self-introduction statement with the most professional adjective.',
    template: 'I am a ________ problem solver who thrives when tackling complex challenges.',
    options: ['methodical', 'clueless', 'reckless', 'hesitant'],
    correctSentence: 'I am a methodical problem solver who thrives when tackling complex challenges.',
    explanation: '"Methodical" signals disciplined, structured thinking and dependable execution.'
  },
  {
    id: 'sent-11',
    type: 'reorder',
    category: 'Highlighting Strengths',
    instruction: 'Form a sentence that communicates dedication to code quality.',
    jumbledWords: ['I', 'prioritize', 'writing', 'clean', 'maintainable', 'and', 'thoroughly', 'tested', 'code'],
    correctSentence: 'I prioritize writing clean maintainable and thoroughly tested code',
    explanation: 'Using the verb "prioritize" asserts your professional standards and craftsmanship.'
  },
  {
    id: 'sent-12',
    type: 'fill-blank',
    category: 'STAR Method',
    instruction: 'Choose the best verb to complete this impact statement.',
    template: 'My optimization efforts ________ page load latency by thirty percent.',
    options: ['diminished', 'reduced', 'expanded', 'prolonged'],
    correctSentence: 'My optimization efforts reduced page load latency by thirty percent.',
    explanation: '"Reduced" directly connects the action to a measurable performance improvement.'
  },
  {
    id: 'sent-13',
    type: 'reorder',
    category: 'Polite Disagreement',
    instruction: 'Rearrange words to present data-driven consensus building.',
    jumbledWords: ['To', 'resolve', 'the', 'debate', 'I', 'conducted', 'an', 'objective', 'benchmark', 'analysis'],
    correctSentence: 'To resolve the debate I conducted an objective benchmark analysis',
    explanation: 'Leading with the intention ("To resolve the debate") clarifies the constructive purpose of the benchmark analysis.'
  },
  {
    id: 'sent-14',
    type: 'fill-blank',
    category: 'Professional Tone',
    instruction: 'Select the optimal word to conclude an interview answer.',
    template: 'I look forward to ________ to your team’s continued innovation and growth.',
    options: ['contributing', 'intruding', 'surrendering', 'submitting'],
    correctSentence: 'I look forward to contributing to your team’s continued innovation and growth.',
    explanation: '"Contributing" establishes a collaborative, value-add mindset for future employment.'
  },
  {
    id: 'sent-15',
    type: 'reorder',
    category: 'Highlighting Strengths',
    instruction: 'Arrange the words into a confident summary of personal accountability.',
    jumbledWords: ['I', 'take', 'genuine', 'pride', 'in', 'delivering', 'high', 'quality', 'outcomes', 'consistently'],
    correctSentence: 'I take genuine pride in delivering high quality outcomes consistently',
    explanation: '"I take genuine pride in..." communicates personal investment in craftsmanship and high professional standards.'
  }
];
