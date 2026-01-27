import { Category, Card } from '@/types';

export const categories: Category[] = [
  {
    id: 'communication',
    title: 'Arbetsfördelning & mentala lasset',
    description: 'Understanding how we speak, listen, and connect with each other',
    cardCount: 3,
  },
  {
    id: 'parenting-together',
    title: 'Uppfostringsstilar',
    description: 'Navigating the shared journey of raising children',
    cardCount: 3,
  },
  {
    id: 'emotional-intimacy',
    title: 'Paridentitet vs föräldraidentitet',
    description: 'Deepening connection and understanding between partners',
    cardCount: 3,
  },
  {
    id: 'daily-life',
    title: 'Närhet & Intimitet',
    description: 'The rhythms, routines, and small moments that shape us',
    cardCount: 2,
  },
  {
    id: 'individual-needs',
    title: 'Släkt & kultur',
    description: 'Balancing personal wellbeing within partnership',
    cardCount: 2,
  },
  {
    id: 'category-6',
    title: '',
    description: '',
    cardCount: 0,
  },
  {
    id: 'category-7',
    title: '',
    description: '',
    cardCount: 0,
  },
  {
    id: 'category-8',
    title: '',
    description: '',
    cardCount: 0,
  },
  {
    id: 'category-9',
    title: '',
    description: '',
    cardCount: 0,
  },
  {
    id: 'category-10',
    title: '',
    description: '',
    cardCount: 0,
  },
  {
    id: 'category-11',
    title: '',
    description: '',
    cardCount: 0,
  },
  {
    id: 'category-12',
    title: '',
    description: '',
    cardCount: 0,
  },
];

export const cards: Card[] = [
  {
    id: 'listening-presence',
    title: 'Listening & Presence',
    subtitle: 'What does it mean to truly be heard?',
    categoryId: 'communication',
    sections: [
      {
        id: 'opening-1',
        type: 'opening',
        title: 'Öppnare',
        content: 'These questions are meant to gently open the conversation. There are no right answers—only your honest experience.',
        prompts: [
          'När känner du att din insats för dagen verkligen är slut hemma?',
          'Vad önskar du att jag såg i det du gör /precis innan du sätter dig ner/ de sista 20 minutrarna innan dagens slut?',
          'När under dagen känner du att din insats är färdig?',
          '',
          '',
        ],
      },
      {
        id: 'reflective-1',
        type: 'reflective',
        title: 'Deeper Reflection',
        content: 'Take your time with these. You might want to sit with them before discussing.',
        prompts: [
          'What makes it difficult for you to listen fully sometimes?',
          'When you feel unheard, what happens inside you?',
          'How has the way you listen changed since becoming a parent?',
        ],
      },
      {
        id: 'scenario-1',
        type: 'scenario',
        title: 'A Realistic Scenario',
        content: 'You come home after a long day. Your partner starts telling you about something that happened, but you notice your mind wandering to the tasks still ahead. Your partner pauses and says, "You seem distracted."\n\nConsider: What might be happening for each person in this moment? What might help?',
      },
      {
        id: 'exercise-1',
        type: 'exercise',
        title: 'A Shared Exercise',
        content: 'If you would like to try something together:\n\nSet a timer for 5 minutes. One person speaks about something on their mind—anything at all. The other person simply listens without responding, asking questions, or offering solutions. When the timer ends, the listener shares back what they noticed, without judgment.\n\nThen switch roles.',
      },
    ],
  },
  {
    id: 'expressing-needs',
    title: 'Expressing Needs',
    subtitle: 'Finding words for what we need',
    categoryId: 'communication',
    sections: [
      {
        id: 'opening-2',
        type: 'opening',
        title: 'Öppnare',
        content: 'Begin wherever feels natural.',
        prompts: [
          'How easy or difficult is it for you to ask for what you need?',
          'What was modeled for you growing up about expressing needs?',
          'When do you find it easiest to share what you need with your partner?',
        ],
      },
      {
        id: 'reflective-2',
        type: 'reflective',
        title: 'Deeper Reflection',
        content: 'These questions invite you to look inward.',
        prompts: [
          'What needs do you tend to minimize or dismiss?',
          'How do you feel when your partner expresses a need to you?',
          'What would change if you could express needs without fear?',
        ],
      },
      {
        id: 'scenario-2',
        type: 'scenario',
        title: 'A Realistic Scenario',
        content: 'You have been feeling overwhelmed and need some time alone to recharge. But you hesitate to say anything because you know your partner is also tired and has been looking forward to spending the evening together.\n\nConsider: What might each person need here? How might this conversation unfold in a way that honors both?',
      },
    ],
  },
  {
    id: 'conflict-repair',
    title: 'Conflict & Repair',
    subtitle: 'Understanding rupture and reconnection',
    categoryId: 'communication',
    sections: [
      {
        id: 'opening-3',
        type: 'opening',
        title: 'Öppnare',
        content: 'Conflict is a natural part of any close relationship.',
        prompts: [
          'How do you typically respond when conflict arises?',
          'What helps you calm down after a disagreement?',
          'How do you and your partner usually reconnect after tension?',
        ],
      },
      {
        id: 'reflective-3',
        type: 'reflective',
        title: 'Deeper Reflection',
        content: 'These questions explore patterns and history.',
        prompts: [
          'What did you learn about conflict from your family of origin?',
          'What do you need most from your partner after a rupture?',
          'Are there recurring patterns in your conflicts? What might they reveal?',
        ],
      },
    ],
  },
  {
    id: 'different-parenting-styles',
    title: 'Different Styles',
    subtitle: 'When we parent differently',
    categoryId: 'parenting-together',
    sections: [
      {
        id: 'opening-4',
        type: 'opening',
        title: 'Öppnare',
        content: 'Every parent brings their own history and instincts.',
        prompts: [
          'In what ways do your parenting approaches differ?',
          'What parenting strength does your partner have that you admire?',
          'When differences arise, how do you typically navigate them?',
        ],
      },
      {
        id: 'reflective-4',
        type: 'reflective',
        title: 'Deeper Reflection',
        content: 'Consider the roots of your approach.',
        prompts: [
          'What from your own childhood do you consciously want to repeat—or avoid?',
          'When you disagree about parenting, what do you fear might happen?',
          'How might your differences actually benefit your children?',
        ],
      },
      {
        id: 'scenario-4',
        type: 'scenario',
        title: 'A Realistic Scenario',
        content: 'Your child is having a meltdown. You believe in letting them feel their feelings; your partner wants to set a boundary and move on. You catch each other\'s eye, aware you\'re approaching this differently—again.\n\nConsider: What might each parent be feeling? What might the child need? Is there a way forward that honors both approaches?',
      },
    ],
  },
  {
    id: 'parenting-exhaustion',
    title: 'Exhaustion & Support',
    subtitle: 'Caring for each other while parenting',
    categoryId: 'parenting-together',
    sections: [
      {
        id: 'opening-5',
        type: 'opening',
        title: 'Öppnare',
        content: 'Parenting young children is often depleting.',
        prompts: [
          'When do you feel most supported by your partner as a parent?',
          'What drains you most in your current daily routine?',
          'How do you let your partner know when you are running low?',
        ],
      },
      {
        id: 'reflective-5',
        type: 'reflective',
        title: 'Deeper Reflection',
        content: 'These questions invite honesty about capacity.',
        prompts: [
          'What do you need but rarely ask for?',
          'How do you respond when both of you are exhausted at the same time?',
          'What would it mean to truly share the load?',
        ],
      },
    ],
  },
  {
    id: 'staying-connected',
    title: 'Staying Connected',
    subtitle: 'Maintaining closeness through busy seasons',
    categoryId: 'emotional-intimacy',
    sections: [
      {
        id: 'opening-6',
        type: 'opening',
        title: 'Öppnare',
        content: 'Connection can feel distant when life is full.',
        prompts: [
          'What small moments help you feel connected to your partner?',
          'When did you last feel genuinely close?',
          'What gets in the way of feeling connected right now?',
        ],
      },
      {
        id: 'reflective-6',
        type: 'reflective',
        title: 'Deeper Reflection',
        content: 'Reflect on what connection means to you.',
        prompts: [
          'How do you know when your partner feels close to you?',
          'What does emotional intimacy mean to you—beyond physical closeness?',
          'How has your need for connection changed over time?',
        ],
      },
      {
        id: 'exercise-6',
        type: 'exercise',
        title: 'A Shared Exercise',
        content: 'Choose one evening this week. Put away devices after the children are asleep. Sit together—perhaps with tea or a glass of wine—and simply ask: "What\'s on your mind lately?"\n\nNo agenda. No problem to solve. Just presence.',
      },
    ],
  },
  {
    id: 'division-of-labour',
    title: 'Division of Labour',
    subtitle: 'The visible and invisible work',
    categoryId: 'daily-life',
    sections: [
      {
        id: 'opening-7',
        type: 'opening',
        title: 'Öppnare',
        content: 'Household and family work is often unevenly seen.',
        prompts: [
          'How did you divide responsibilities when you first became parents?',
          'What invisible work do you do that often goes unnoticed?',
          'How satisfied are you with how things are divided now?',
        ],
      },
      {
        id: 'reflective-7',
        type: 'reflective',
        title: 'Deeper Reflection',
        content: 'Consider the feelings beneath the logistics.',
        prompts: [
          'When do you feel resentful—and what might that resentment be protecting?',
          'What would fairness look like to you?',
          'How might your expectations differ from your partner\'s—and why?',
        ],
      },
    ],
  },
  {
    id: 'personal-space',
    title: 'Personal Space',
    subtitle: 'The need for solitude within togetherness',
    categoryId: 'individual-needs',
    sections: [
      {
        id: 'opening-8',
        type: 'opening',
        title: 'Öppnare',
        content: 'Needing space is not a rejection of connection.',
        prompts: [
          'How much alone time do you need to feel like yourself?',
          'How do you currently carve out space for yourself?',
          'How does your partner respond when you need time alone?',
        ],
      },
      {
        id: 'reflective-8',
        type: 'reflective',
        title: 'Deeper Reflection',
        content: 'Explore what solitude means for you.',
        prompts: [
          'What happens when you don\'t get enough time alone?',
          'Do you ever feel guilty for wanting space? Where does that come from?',
          'How can asking for space become an act of care for the relationship?',
        ],
      },
    ],
  },
];

export function getCardsByCategory(categoryId: string): Card[] {
  return cards.filter((card) => card.categoryId === categoryId);
}

export function getCardById(cardId: string): Card | undefined {
  return cards.find((card) => card.id === cardId);
}

export function getCategoryById(categoryId: string): Category | undefined {
  return categories.find((cat) => cat.id === categoryId);
}
