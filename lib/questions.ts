import { MMIQuestion } from '@/types';

export const MMI_QUESTIONS: MMIQuestion[] = [
  {
    id: 1,
    station: 1,
    prompt: 'A fellow student asks to copy your homework. What do you do?',
    timeLimit: 420
  },
  {
    id: 2,
    station: 2,
    prompt: 'Describe a time you had to work with someone difficult. How did you handle it?',
    timeLimit: 420
  },
  {
    id: 3,
    station: 3,
    prompt: 'Should healthcare be free for everyone? Discuss both sides.',
    timeLimit: 420
  },
  {
    id: 4,
    station: 4,
    prompt: 'You notice a colleague making a mistake with a patient. What do you do?',
    timeLimit: 420
  },
  {
    id: 5,
    station: 5,
    prompt: 'Why do you want to become a Physician Assistant?',
    timeLimit: 420
  }
];
