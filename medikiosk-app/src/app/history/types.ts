export interface Socrates {
  duration: string;
  character: string;
  radiation: string;
  associations: string[];
  severity: number;
}

export interface Ayush {
  agni: string;
  ahara: string;
  prakriti: string;
  koshtha: string;
  nidra: string;
}

export interface Lifestyle {
  smoking: string;
  alcohol: string;
  diet: string;
}

export interface IntakeState {
  chiefComplaint: string;
  customComplaint: string;
  socrates: Socrates;
  pastHistory: string[];
  pastHistoryOther: string;
  drugAllergy: string[];
  drugAllergyOther: string;
  dailyMedications: string;
  familyHistory: string[];
  lifestyle: Lifestyle;
  ros: string[];
  ayush: Ayush;
  redFlagsDetected: string[];
  triagePriority: string;
}

export const initialIntakeState: IntakeState = {
  chiefComplaint: '',
  customComplaint: '',
  socrates: {
    duration: '',
    character: '',
    radiation: '',
    associations: [],
    severity: 5
  },
  pastHistory: [],
  pastHistoryOther: '',
  drugAllergy: [],
  drugAllergyOther: '',
  dailyMedications: '',
  familyHistory: [],
  lifestyle: {
    smoking: 'non_smoker',
    alcohol: 'non_drinker',
    diet: 'vegetarian'
  },
  ros: [],
  ayush: {
    agni: '',
    ahara: '',
    prakriti: '',
    koshtha: '',
    nidra: ''
  },
  redFlagsDetected: [],
  triagePriority: 'ROUTINE'
};
