-- Dynamic Questions Migration
-- Cleans existing data, drops station_number from questions, and inserts 78 questions by category.

-- 1. Clean slate: delete all existing interviews, responses, evaluations
DELETE FROM evaluations;
DELETE FROM responses;
DELETE FROM interviews;
DELETE FROM questions;

-- 2. Drop station_number column from questions table
ALTER TABLE questions DROP COLUMN IF EXISTS station_number;

-- 3. Insert 78 questions organized by category
-- All questions reference the 'pa-mmi-7min' interview type

-- Academic Integrity (6 questions)
INSERT INTO questions (interview_type_id, category, prompt, is_active)
SELECT id, 'academic-integrity', prompt, true
FROM interview_types, (VALUES
  ('Your preceptor asks you to document something in a patient''s chart that you didn''t actually do. What would you do?'),
  ('You discover a classmate is romantically involved with their preceptor. What should be done, if anything?'),
  ('Role-play: You are a PA student on rotation. You notice that a fellow student frequently arrives late, appears sleep-deprived, and made a concerning error yesterday. Enter the room and speak with them.'),
  ('A fellow PA student asks if they can review your completed patient notes before writing their own for similar cases. How do you respond?'),
  ('You witness another student looking at their phone during a practical exam where this is explicitly prohibited. What do you do?'),
  ('During clinicals, you realize you forgot to complete a required patient assessment yesterday. Your preceptor asks if you completed it. What do you do?')
) AS q(prompt)
WHERE interview_types.slug = 'pa-mmi-7min';

-- Teamwork/Conflict (15 questions)
INSERT INTO questions (interview_type_id, category, prompt, is_active)
SELECT id, 'teamwork-conflict', prompt, true
FROM interview_types, (VALUES
  ('You witness a colleague make an error that could harm a patient, and they ask you not to report it. How would you handle this situation?'),
  ('You witness a physician speaking disrespectfully to a nurse in front of patients and staff. What''s your response?'),
  ('You''re running late to rounds and notice a colleague skipped proper hand hygiene before entering a patient''s room. What do you do?'),
  ('Your supervising physician asks you to discharge a patient you believe needs further observation. How do you handle this disagreement?'),
  ('Can you describe a time when you had to work with someone whose work style or values differed significantly from yours? How did you navigate that?'),
  ('Tell me about a time when you faced a significant interpersonal conflict. How did you handle it, and what would you do differently now?'),
  ('You overhear colleagues discussing identifiable patient information in a public area (elevator, cafeteria). What would you do?'),
  ('Role-play: You are working in a busy ED and have multiple urgent cases: a chest pain patient waiting for troponins, a child with a laceration needing sutures, and a septic patient needing admission orders. Your supervising physician asks you to explain your prioritization.'),
  ('Describe a time when you had to deliver difficult feedback to someone. How did you approach it?'),
  ('Tell me about a time when you failed at something important to you. What happened and how did you respond?'),
  ('Describe a situation where you had to advocate for yourself or someone else. What was the outcome?'),
  ('What qualities make a good team member in a healthcare setting?'),
  ('Role-play: Your close friend drove home intoxicated last night after a party you both attended. You need to address this with them. Enter the room.'),
  ('You notice your attending physician appears impaired (slurred speech, unsteady gait) before starting a procedure. What actions do you take?'),
  ('Role-play: A patient''s adult child (played by an actor) is insisting their parent needs to be admitted to the hospital, but you''ve determined the parent is stable for discharge with outpatient follow-up. Address this situation.')
) AS q(prompt)
WHERE interview_types.slug = 'pa-mmi-7min';

-- Healthcare Policy (12 questions)
INSERT INTO questions (interview_type_id, category, prompt, is_active)
SELECT id, 'healthcare-policy', prompt, true
FROM interview_types, (VALUES
  ('What is the biggest challenge facing healthcare today?'),
  ('What are the biggest challenges PAs face today?'),
  ('Is healthcare a right or a privilege? Defend your position.'),
  ('You are caring for an obese patient on multiple medications, some of which are causing side effects. Would you recommend a change in medications or lifestyle changes?'),
  ('A patient insists on receiving antibiotics for what you''ve diagnosed as a viral upper respiratory infection. How do you handle this situation?'),
  ('How would you approach caring for patients when there are significant resource limitations (time, medications, specialists)?'),
  ('What role should social determinants of health play in clinical decision-making?'),
  ('How do you think healthcare should address the opioid epidemic while ensuring patients with legitimate pain receive adequate treatment?'),
  ('A patient with advanced dementia is refusing to eat and drink. Their family is very distressed and insists on aggressive intervention, while the patient has an advance directive requesting comfort measures only. How do you navigate this dilemma?'),
  ('A 20-year-old patient with Down syndrome has become pregnant. The patient does not want an abortion, but her parents insist she should have one. What should you do as the PA taking care of this patient?'),
  ('A patient discloses they are undocumented and afraid to follow up with specialty care due to deportation fears, but they have a serious condition requiring treatment. How do you address this?'),
  ('How should healthcare systems balance the need for efficiency with providing thorough, patient-centered care?')
) AS q(prompt)
WHERE interview_types.slug = 'pa-mmi-7min';

-- Professional Responsibility (33 questions)
INSERT INTO questions (interview_type_id, category, prompt, is_active)
SELECT id, 'professional-responsibility', prompt, true
FROM interview_types, (VALUES
  ('A patient refuses EMS transport despite showing signs of a possible heart attack. How would you handle this situation?'),
  ('You discover that a patient received an incorrect medication dosage earlier in the day. What would you do?'),
  ('A 16-year-old patient arrives in distress, and you cannot reach their parent or guardian. How do you proceed?'),
  ('A patient nods along during your instructions, but you suspect they may not actually understand what you''re saying. What would you do?'),
  ('A diabetic patient''s labs show poor control, but they insist they''ve been taking their medications as prescribed. How would you approach this situation?'),
  ('You are asked to perform a procedure you have not been trained for. How would you respond?'),
  ('A patient''s spouse answers questions for them and asks you for details about the patient''s diagnosis. How do you handle this?'),
  ('A patient presents with recurrent unexplained injuries that make you suspect abuse. What would you do?'),
  ('A hypertensive patient has stopped taking their medications due to personal beliefs. How would you address this?'),
  ('A family member calls your clinic asking for information about a patient. How do you respond?'),
  ('A patient''s family wants full intervention, but the patient has a documented DNR and expressed comfort-only goals. How would you handle this conflict?'),
  ('A mother refuses a recommended vaccine for her 15-year-old daughter due to personal beliefs. How would you approach this conversation?'),
  ('You are a PA in a busy primary care clinic. One of your regular patients, Mr. Thompson, is a 45-year-old man with a history of hypertension and diabetes. During a routine check-up, he confides in you that he has been experiencing severe chest pain and shortness of breath for the past few days. He insists that you keep this information confidential because he doesn''t want to worry his family or take time off from work. How do you handle this situation?'),
  ('A patient refuses a life-saving blood transfusion due to religious or cultural beliefs. How would you handle this situation?'),
  ('You are a PA working in a clinic, and a patient refuses to be treated by you because of your gender/race. What would you do?'),
  ('A patient asks for your personal opinion on a politically divisive healthcare topic. How do you respond?'),
  ('You are an emergency room PA evaluating a patient requesting opioid painkillers for back pain. After examination, you find no objective findings. Reviewing his chart, you see he frequently visits different emergency departments with similar complaints. When you explain you cannot prescribe opioids, he threatens to use heroin. What do you do?'),
  ('A pregnant patient at 20 weeks gestation has just received devastating news that her fetus has a condition incompatible with life. She''s asking about her options. How do you approach this conversation?'),
  ('A patient''s family asks you not to tell the patient about their cancer diagnosis because of cultural beliefs about protecting loved ones from bad news. The patient is asking you directly about their test results. What do you do?'),
  ('During a pelvic exam, a patient discloses that their partner has been forcing them to have unprotected sex. How do you respond?'),
  ('A teenager presents requesting birth control but explicitly asks you not to tell their parents. What are the considerations, and how do you proceed?'),
  ('What steps would you take if you were asked to perform a medical procedure that is outside your scope of practice as a PA?'),
  ('Tell me about a mistake you made in an academic, professional, or healthcare setting. How did you address it and what did you learn?'),
  ('What does professionalism mean to you in a healthcare context?'),
  ('What do you think it means to have cultural competency, and can you give an example of how you''ve demonstrated it?'),
  ('How would you handle a situation where a patient''s values or decisions conflict with your personal beliefs?'),
  ('How do you stay informed about developments in the medical field?'),
  ('Describe your approach to lifelong learning. How do you plan to stay current in medicine throughout your career?'),
  ('Role-play: A patient is refusing the treatment plan you''ve recommended. They are skeptical of your recommendations and want to try alternative medicine instead. Discuss this with the patient (played by an actor).'),
  ('Role-play: You need to break bad news to a patient that their biopsy came back positive for cancer. Enter the room.'),
  ('Teach me how to use an inhaler properly, as if I''m a patient who has never used one before.'),
  ('Explain what diabetes is and why blood sugar control matters to a patient with a 6th-grade education level.'),
  ('Describe the purpose and process of a colonoscopy to a reluctant patient who is anxious about the procedure.')
) AS q(prompt)
WHERE interview_types.slug = 'pa-mmi-7min';

-- Personal Motivation (12 questions)
INSERT INTO questions (interview_type_id, category, prompt, is_active)
SELECT id, 'personal-motivation', prompt, true
FROM interview_types, (VALUES
  ('What do you think are the most important qualities a PA should possess?'),
  ('How do you prioritize patient care when faced with multiple tasks or responsibilities?'),
  ('Who has been the most influential person in your journey toward becoming a PA, and why?'),
  ('Tell us about a significant challenge you have faced and how you overcame it.'),
  ('How do you plan to maintain your mental health and prevent burnout during PA school and in practice?'),
  ('What do you think is the most important skill for a PA to develop during their training?'),
  ('Why do you want to become a Physician Assistant specifically, rather than pursuing another healthcare profession?'),
  ('What experiences have shaped your understanding of what it means to be a PA?'),
  ('Describe a moment in your healthcare experience that confirmed your desire to become a PA.'),
  ('What aspect of patient care are you most passionate about, and why?'),
  ('How has your background prepared you for the challenges of PA school and practice?'),
  ('What do you hope to contribute to the PA profession?')
) AS q(prompt)
WHERE interview_types.slug = 'pa-mmi-7min';
