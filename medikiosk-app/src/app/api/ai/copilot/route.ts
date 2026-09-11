import { NextRequest, NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { z } from 'zod';

export async function POST(req: NextRequest) {
  try {
    const { input, currentStep, isAyushMode, lang, intakeState } = await req.json();

    if (!input) {
      return NextResponse.json({ error: 'No input provided' }, { status: 400 });
    }

    let schema;

    // Depending on the step, we ask the AI to extract different fields.
    if (currentStep === 0) {
      // Chief Complaint
      schema = z.object({
        chiefComplaint: z.enum(["chest_pain", "fever", "abdominal_pain", "breathlessness", "cough_cold", "headache", "joint_pain", "other"]).nullable().describe("The closest matching chief complaint based on user input"),
        customComplaint: z.string().nullable().describe("The translated or summarized user statement describing their issue")
      });
    } else if (!isAyushMode && currentStep === 1) {
      // HPI / SOCRATES
      schema = z.object({
        duration: z.enum(["few_hours", "1_2_days", "1_week", "1_month", "sudden"]).nullable().describe("How long the symptom has been present"),
        character: z.enum(["dull", "sharp", "burning", "crushing", "throbbing", "cramping"]).nullable().describe("The character or type of pain/symptom"),
        radiation: z.enum(["none", "left_arm", "jaw_neck", "back", "abdomen"]).nullable().describe("Where the pain radiates to"),
        associations: z.array(z.enum(["sweating", "nausea", "breathless", "dizziness", "fever_assoc", "palpitations"])).describe("Any associated symptoms mentioned"),
        severity: z.number().min(1).max(10).nullable().describe("Severity on a scale of 1 to 10")
      });
    } else if (!isAyushMode && currentStep === 2) {
      // Past Medical History
      schema = z.object({
        pastHistory: z.array(z.enum(["diabetes", "hypertension", "cad_mi", "asthma", "thyroid", "kidney", "surgery", "none_past"])).describe("Past medical history conditions"),
        pastHistoryOther: z.string().nullable().describe("Any other past medical history mentioned")
      });
    } else if (!isAyushMode && currentStep === 3) {
      // Medications & Allergies
      schema = z.object({
        drugAllergy: z.array(z.enum(["penicillin", "sulfa", "nsaids", "food_dust", "none_allergy"])).describe("Drug or food allergies"),
        dailyMedications: z.string().nullable().describe("Current daily medications mentioned")
      });
    } else if (!isAyushMode && currentStep === 4) {
      // Personal & Family History
      schema = z.object({
        familyHistory: z.array(z.enum(["early_cad", "family_diabetes", "family_cancer", "family_stroke", "none_family"])).describe("Family medical history"),
        smoking: z.enum(["non_smoker", "active_smoker", "tobacco_chewer", "former_smoker"]).nullable().describe("Smoking habit"),
        alcohol: z.enum(["non_drinker", "social_drinker", "regular_drinker"]).nullable().describe("Alcohol consumption")
      });
    } else if (!isAyushMode && currentStep === 5) {
      // Review of Systems
      schema = z.object({
        ros: z.array(z.enum(["fever_ros", "dyspnea_rest", "chronic_cough", "palpitations_ros", "weight_loss", "dysuria", "bowel_changes", "none_ros"])).describe("Review of systems symptoms")
      });
    } else if (isAyushMode && currentStep === 1) {
      // Ayush Ahara & Agni
      schema = z.object({
        agni: z.enum(["samagni", "vishama", "tikshna", "manda"]).nullable(),
        ahara: z.enum(["balanced", "irregular", "spicy_fried", "cold_dry"]).nullable()
      });
    } else if (isAyushMode && currentStep === 2) {
      // Ayush Prakriti & Koshtha
      schema = z.object({
        prakriti: z.enum(["vata", "pitta", "kapha", "vata_pitta", "pitta_kapha", "tridosha"]).nullable(),
        koshtha: z.enum(["krura", "mridu", "madhyama"]).nullable()
      });
    } else if (isAyushMode && currentStep === 3) {
      // Ayush Past & Family
      schema = z.object({
        pastHistory: z.array(z.enum(["diabetes", "hypertension", "cad_mi", "asthma", "thyroid", "kidney", "surgery", "none_past"])),
        familyHistory: z.array(z.enum(["early_cad", "family_diabetes", "family_cancer", "family_stroke", "none_family"]))
      });
    } else if (isAyushMode && currentStep === 4) {
      // Ayush Nidra
      schema = z.object({
        nidra: z.enum(["sound", "anidra", "atinidra"]).nullable()
      });
    } else {
      // Generic fallback for Summary step
      schema = z.object({
        extractedEntities: z.array(z.string()).describe("Any relevant medical entities or keywords mentioned")
      });
    }

    const groq = createGroq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const { object } = await generateObject({
      model: groq('llama-3.3-70b-versatile') as any,
      mode: 'json',
      system: `You are an AI medical assistant for a patient kiosk. The patient is speaking to you. 
You need to extract the relevant structured information from their statement based on the current step of the intake wizard.
Current Step Index: ${currentStep}
Is AYUSH Mode: ${isAyushMode}
Language: ${lang}
Only output the fields that can be confidently inferred from the input. For fields not mentioned, return null or empty arrays.`,
      schema: schema as any,
      messages: [
        {
          role: 'user',
          content: input
        }
      ]
    });

    return NextResponse.json(object);
  } catch (error) {
    console.error('Error in copilot route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
