// src/data/notificationTemplates.ts
// Still Us notification templates (Swedish).
// N1–N8. Max 2 notifications per week per user.
// Philosophy: minimum notifications. Not a daily engagement app.
// No daily reminders. No streak alerts. No "your partner just opened the app." No guilt messages.

export type NotificationTemplate = {
  type: string;
  title: string;
  body: string;
  deepLink: string;
};

export const notificationTemplates: Record<string, NotificationTemplate> = {
  N1: {
    type: 'N1',
    title: 'Ny vecka i Still Us',
    body: 'Veckans samtalskort är redo. Börja med din check-in när du vill.',
    deepLink: '/check-in/{cardSlug}',
  },
  N2: {
    type: 'N2',
    title: 'Ny vecka har börjat',
    body: 'Förra veckans kort har gått vidare. Ert nya kort väntar.',
    deepLink: '/check-in/{cardSlug}',
  },
  N3: {
    type: 'N3',
    title: 'Dags att prata',
    body: 'Ni har båda gjort er check-in. Sätt er ner när det passar.',
    deepLink: '/',
  },
  N4: {
    type: 'N4',
    title: 'Ert andra samtal väntar',
    body: 'Ni har ett samtal kvar den här veckan.',
    deepLink: '/',
  },
  N5: {
    type: 'N5',
    title: 'Still Us väntar på er',
    body: 'Det har gått ett tag. Ert samtalskort finns kvar.',
    deepLink: '/',
  },
  N6: {
    type: 'N6',
    title: 'Vill ni fortsätta?',
    body: 'Er provperiod på en vecka är slut. Lås upp hela resan.',
    deepLink: '/unlock',
  },
  N7: {
    type: 'N7',
    title: 'Välkomna till hela resan',
    body: 'Still Us är upplåst. 22 veckor av samtal väntar.',
    deepLink: '/',
  },
  N8: {
    type: 'N8',
    title: 'Ett tillbaka-samtal har kommit',
    body: 'Dags att titta tillbaka. Börja med er check-in.',
    deepLink: '/check-in/{tillbakaSlug}',
  },
};

export function getNotificationTemplate(type: string): NotificationTemplate | null {
  return notificationTemplates[type] ?? null;
}

// Resolve deep link placeholders
export function resolveDeepLink(template: NotificationTemplate, params: Record<string, string>): string {
  let link = template.deepLink;
  for (const [key, value] of Object.entries(params)) {
    link = link.replace(`{${key}}`, value);
  }
  return link;
}
