export type Language = "en" | "hi";

export interface ClinicalEntity {
  id: string;
  priority: number;
  labelEn: string;
  labelHi: string;
  defaultSentenceEn: string;
  defaultSentenceHi: string;
  patterns: RegExp[];
}

export const CLINICAL_ENTITIES: ClinicalEntity[] = [
  {
    id: "chest_pain",
    priority: 1,
    labelEn: "Chest Pain / Heaviness",
    labelHi: "छाती में दर्द या भारीपन",
    defaultSentenceEn: "Chest pain and heaviness",
    defaultSentenceHi: "छाती में दर्द और भारीपन",
    patterns: [
      /\b(chest\s*pain|chest|heart\s*pain|heart\s*attack|cardiac|angina|chest\s*heaviness|chest\s*tightness)\b/i,
      /\b(chhati|chati|seena|seene|chhati\s*me\s*dard|seene\s*me\s*dard|seena\s*phatna|dil\s*ka\s*dard|dil\s*me\s*dard|chhati\s*me\s*jalan)\b/i,
      /\b(छाती|सीने|सीने\s*में\s*दर्द|छाती\s*में\s*दर्द|दिल\s*में\s*दर्द|हार्ट|हार्ट\s*अटैक|छाती\s*में\s*भारीपन)\b/u,
    ],
  },
  {
    id: "abdominal_pain",
    priority: 2,
    labelEn: "Stomach / Abdominal Pain",
    labelHi: "पेट में दर्द या मरोड़",
    defaultSentenceEn: "Stomach and abdominal pain",
    defaultSentenceHi: "पेट में दर्द और मरोड़",
    patterns: [
      /\b(stomach\s*pain|stomach\s*ache|abdominal\s*pain|abdomen|belly\s*pain|tummy\s*pain|gastric|indigestion|cramps|bloating|acidity|vomiting|nausea|diarrhea|loose\s*motion|constipation)\b/i,
      /\b(pet\s*dard|pet\s*me\s*dard|pait\s*dard|pait\s*me\s*dard|pet\s*kharab|pet\s*me\s*marod|marod|dast|ulti|ji\s*machlana|ji\s*ghabrana|kabz|khatti\s*dakar|pet\s*phoolna)\b/i,
      /\b(पेट|पेट\s*दर्द|पेट\s*में\s*दर्द|मरोड़|दस्त|उल्टी|जी\s*मिचलाना|गैस|कब्ज|खट्टी\s*डकार|उदर)\b/u,
    ],
  },
  {
    id: "breathlessness",
    priority: 3,
    labelEn: "Shortness of Breath",
    labelHi: "सांस लेने में तकलीफ",
    defaultSentenceEn: "Shortness of breath and breathing difficulty",
    defaultSentenceHi: "सांस लेने में तकलीफ और दम घुटना",
    patterns: [
      /\b(breathless|breathlessness|shortness\s*of\s*breath|difficulty\s*breathing|asthma|wheezing|suffocation|choking)\b/i,
      /\b(saans\s*phoolna|sans\s*phulna|saans\s*lene\s*me\s*dikkat|saans\s*lene\s*me\s*takleef|dum\s*ghutna|dama|seeti\s*bajna)\b/i,
      /\b(सांस|सांस\s*फूलना|सांस\s*लेने\s*में\s*तकलीफ|दम\s*घुटना|दमा|घुटन)\b/u,
    ],
  },
  {
    id: "fever",
    priority: 7,
    labelEn: "Fever & Chills",
    labelHi: "बुखार और कंपकंपी",
    defaultSentenceEn: "Fever with chills and body temperature",
    defaultSentenceHi: "बुखार और कंपकंपी",
    patterns: [
      /\b(fever|high\s*fever|temperature|pyrexia|chills|shivering|body\s*temperature)\b/i,
      /\b(bukhar|bukhaar|tez\s*bukhar|taap|jwar|hararat|badan\s*garm|thand\s*lagna|kampkampani|thand\s*lagke\s*bukhar)\b/i,
      /\b(बुखार|ज्वर|तेज\s*बुखार|ठंड\s*लगकर|कंपकंपी|हरारत|बदन\s*गरम|तापमान)\b/u,
    ],
  },
];

export const PHRASE_TRANSLATIONS = [
  { en: "I have a fever", hi: "मुझे बुखार है", match: /\b(fever|bukhar|बुखार)\b/i },
  { en: "Chest pain and heaviness", hi: "छाती में दर्द और भारीपन", match: /\b(chest|chhati|seene|छाती|सीने)\b/i },
];

export function translateText(text: string, targetLang: Language): string {
  if (!text || !text.trim()) return "";
  const trimmed = text.trim();

  for (const p of PHRASE_TRANSLATIONS) {
    if (p.match.test(trimmed)) {
      return targetLang === "hi" ? p.hi : p.en;
    }
  }

  for (const ent of CLINICAL_ENTITIES) {
    for (const pat of ent.patterns) {
      if (pat.test(trimmed)) {
        return targetLang === "hi" ? ent.defaultSentenceHi : ent.defaultSentenceEn;
      }
    }
  }

  return text;
}
