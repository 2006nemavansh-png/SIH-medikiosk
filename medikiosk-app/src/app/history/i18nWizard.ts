export const I18N = {
      en: {
        headerSub: "Module A: Clinical Intake",
        ayushAllopathy: "Allopathy Mode",
        ayushAyurvedic: "AYUSH Mode",
        speakPrompt: "Tap mic to speak your symptoms",
        speakActive: "Listening... speak now in English",
        speakError: "Speech recognition not supported in this browser",
        aiRecognized: "AI Detected Symptom:",
        next: "Next",
        back: "Back",
        submit: "Confirm & Proceed to Document Scan",
        emergencyTitle: "EMERGENCY PRIORITY DETECTED",
        emergencyDefault: "Symptoms indicate potential critical condition. Hospital triage staff will be alerted for priority consultation.",
        steps: [
          "Chief Complaint",
          "Symptom Details (HPI)",
          "Past Medical History",
          "Medications & Allergies",
          "Personal & Family History",
          "Review of Systems",
          "Summary Review"
        ],
        ayushSteps: [
          "Chief Complaint",
          "Ahara & Agni Assessment",
          "Prakriti & Koshtha",
          "Past & Family History",
          "Nidra & Vihara Assessment",
          "Summary Review"
        ],
        complaints: {
          title: "What is the main problem bothering you?",
          sub: "Select from common symptoms or speak into the microphone",
          placeholder: "Type or speak specific complaint details...",
          items: [
            { id: "chest_pain", label: "💔 Chest Pain / Heaviness", isDanger: true },
            { id: "fever", label: "🌡️ Fever & Chills" },
            { id: "abdominal_pain", label: "🤢 Stomach / Abdominal Pain" },
            { id: "breathlessness", label: "🫁 Shortness of Breath", isDanger: true },
            { id: "cough_cold", label: "🤧 Cough & Cold" },
            { id: "headache", label: "🤕 Severe Headache" },
            { id: "joint_pain", label: "🦴 Joint & Body Pain" },
            { id: "other", label: "✍️ Other Problem" }
          ]
        },
        hpi: {
          title: "Tell us more about your symptoms",
          sub: "When did it start, how does it feel, and does it spread anywhere?",
          durationLabel: "When did it start? (Onset & Duration)",
          durationItems: [
            { id: "few_hours", label: "Few hours ago" },
            { id: "1_2_days", label: "1 - 2 Days" },
            { id: "1_week", label: "About 1 Week" },
            { id: "1_month", label: "Over a Month" },
            { id: "sudden", label: "Sudden onset (Minutes ago)" }
          ],
          characterLabel: "How does the pain/symptom feel? (Character)",
          characterItems: [
            { id: "dull", label: "Dull ache" },
            { id: "sharp", label: "Sharp / Stabbing" },
            { id: "burning", label: "Burning sensation" },
            { id: "crushing", label: "Crushing / Heavy pressure" },
            { id: "throbbing", label: "Throbbing / Pulsing" },
            { id: "cramping", label: "Colicky / Cramping" }
          ],
          radiationLabel: "Does the pain radiate or spread anywhere?",
          radiationItems: [
            { id: "none", label: "No spread (Stays in one place)" },
            { id: "left_arm", label: "Spreads to Left Arm", isDanger: true },
            { id: "jaw_neck", label: "Spreads to Jaw / Neck", isDanger: true },
            { id: "back", label: "Spreads to Back" },
            { id: "abdomen", label: "Spreads to Lower Abdomen" }
          ],
          associationsLabel: "Any other associated symptoms? (Multi-select)",
          associationsItems: [
            { id: "sweating", label: "Profuse Sweating", isDanger: true },
            { id: "nausea", label: "Nausea / Vomiting" },
            { id: "breathless", label: "Shortness of Breath", isDanger: true },
            { id: "dizziness", label: "Dizziness / Fainting" },
            { id: "fever_assoc", label: "Fever / Shivering" },
            { id: "palpitations", label: "Fast Heartbeat (Palpitations)" }
          ],
          severityLabel: "Pain / Discomfort Level",
          severityHint: "(1 = Mild, 10 = Severe & Unbearable)"
        },
        past: {
          title: "Do you have any existing medical conditions?",
          sub: "Select all chronic conditions diagnosed previously",
          placeholder: "Mention any other past illnesses or surgeries...",
          items: [
            { id: "diabetes", label: "Diabetes Mellitus" },
            { id: "hypertension", label: "High Blood Pressure (Hypertension)" },
            { id: "cad_mi", label: "Heart Disease / Prior Heart Attack" },
            { id: "asthma", label: "Asthma / COPD" },
            { id: "thyroid", label: "Thyroid Disorder" },
            { id: "kidney", label: "Kidney Disease" },
            { id: "surgery", label: "Prior Major Surgery" },
            { id: "none_past", label: "No Prior Chronic Illness" }
          ]
        },
        meds: {
          title: "Drug Allergies & Daily Medications",
          sub: "Do you have adverse drug reactions or take daily prescriptions?",
          allergyLabel: "Known Drug / Substance Allergies:",
          medsLabel: "Current Daily Medications:",
          medsPlaceholder: "e.g. Tab Amlodipine 5mg, Metformin 500mg, Inhaler...",
          items: [
            { id: "penicillin", label: "Penicillin / Amoxicillin Allergy", isDanger: true },
            { id: "sulfa", label: "Sulfa Drugs Allergy", isDanger: true },
            { id: "nsaids", label: "Aspirin / Painkillers (NSAIDs) Allergy", isDanger: true },
            { id: "food_dust", label: "Food / Dust Allergy" },
            { id: "none_allergy", label: "No Known Drug Allergies (NKDA)" }
          ]
        },
        family: {
          title: "Personal Habits & Family History",
          sub: "Family history of premature conditions and lifestyle factors",
          familyLabel: "Family Medical History:",
          lifestyleLabel: "Personal Lifestyle & Habits:",
          smokingLabel: "Tobacco / Smoking:",
          alcoholLabel: "Alcohol Consumption:",
          familyItems: [
            { id: "early_cad", label: "Early Heart Attack in Parents (<55 yrs)" },
            { id: "family_diabetes", label: "Diabetes in Family" },
            { id: "family_cancer", label: "Cancer in Family" },
            { id: "family_stroke", label: "Stroke / Paralysis in Family" },
            { id: "none_family", label: "No Major Hereditary Illness" }
          ],
          smokingOptions: [
            { id: "non_smoker", label: "Non-smoker" },
            { id: "active_smoker", label: "Active Smoker (Cigarette/Bidi)" },
            { id: "tobacco_chewer", label: "Chews Tobacco / Gutkha" },
            { id: "former_smoker", label: "Former Smoker (Quit)" }
          ],
          alcoholOptions: [
            { id: "non_drinker", label: "Non-drinker" },
            { id: "social_drinker", label: "Occasional / Social Drinker" },
            { id: "regular_drinker", label: "Regular Drinker" }
          ]
        },
        ros: {
          title: "Review of Systems (Secondary Symptoms)",
          sub: "Rapid systemic check for any secondary warning signs",
          items: [
            { id: "fever_ros", label: "Fever or Chills" },
            { id: "dyspnea_rest", label: "Shortness of breath while resting" },
            { id: "chronic_cough", label: "Chronic cough for over 2 weeks" },
            { id: "palpitations_ros", label: "Chest pounding / Palpitations" },
            { id: "weight_loss", label: "Unexplained weight loss" },
            { id: "dysuria", label: "Burning sensation during urination" },
            { id: "bowel_changes", label: "Persistent diarrhea or constipation" },
            { id: "none_ros", label: "None of the above" }
          ]
        },
        ayush: {
          agniTitle: "Agni & Ahara Assessment",
          agniSub: "Assessment of digestive capacity and dietary patterns",
          agniLabel: "Agni (Digestive Fire):",
          agniItems: [
            { id: "samagni", label: "Samagni (Balanced digestion)" },
            { id: "vishama", label: "Vishama Agni (Irregular digestion & bloating - Vata)" },
            { id: "tikshna", label: "Tikshna Agni (Hyperacidic / burning hunger - Pitta)" },
            { id: "manda", label: "Manda Agni (Sluggish digestion & heaviness - Kapha)" }
          ],
          aharaLabel: "Ahara Habit (Diet Pattern):",
          aharaItems: [
            { id: "balanced", label: "Timely & Balanced home meals" },
            { id: "irregular", label: "Irregular meal timings" },
            { id: "spicy_fried", label: "Excessive spicy, oily or fried food" },
            { id: "cold_dry", label: "Excessive dry or cold food" }
          ],
          prakritiTitle: "Prakriti & Koshtha Assessment",
          prakritiSub: "Constitutional dominance and bowel habit assessment",
          prakritiLabel: "Prakriti (Dominant Constitution):",
          prakritiItems: [
            { id: "vata", label: "Vata Dominant (Dry, cold, light)" },
            { id: "pitta", label: "Pitta Dominant (Heat, acidity, sharp)" },
            { id: "kapha", label: "Kapha Dominant (Heavy, slow, calm)" },
            { id: "vata_pitta", label: "Vata-Pitta" },
            { id: "pitta_kapha", label: "Pitta-Kapha" },
            { id: "tridosha", label: "Tridoshaja (Balanced)" }
          ],
          koshthaLabel: "Koshtha (Bowel Nature):",
          koshthaItems: [
            { id: "krura", label: "Krura Koshtha (Hard stools / Constipated)" },
            { id: "mridu", label: "Mridu Koshtha (Soft stools / Quick evacuation)" },
            { id: "madhyama", label: "Madhyama Koshtha (Normal regular bowel)" }
          ],
          nidraTitle: "Nidra Assessment",
          nidraSub: "Sleep cycle and daily routine balance",
          nidraLabel: "Nidra (Sleep Quality):",
          nidraItems: [
            { id: "sound", label: "Prakrita (Sound, refreshing sleep)" },
            { id: "anidra", label: "Anidra (Disturbed / sleeplessness)" },
            { id: "atinidra", label: "Atinidra (Excessive sleepiness / lethargy)" }
          ]
        },
        review: {
          title: "Review Structured Clinical Intake",
          sub: "Synthesized physician-ready summary generated from your responses",
          ccLabel: "Chief Complaint",
          hpiLabel: "History of Present Illness (HPI)",
          pastLabel: "Past Medical / Surgical",
          medsLabel: "Drug Allergies & Current Meds",
          familyLabel: "Family & Personal History",
          rosLabel: "Review of Systems (ROS)",
          ayushLabel: "AYUSH Parameters (Dashavidha Pariksha)",
          notSpecified: "Not specified",
          noneReported: "None reported",
          noAllergies: "No known drug allergies",
          noMeds: "No regular daily medications",
          nonContributory: "Non-contributory",
          negativeRos: "Negative for major constitutional signs"
        }
      },
      hi: {
        headerSub: "मॉड्यूल A: क्लिनिकल इतिहास",
        ayushAllopathy: "एलोपैथी मोड",
        ayushAyurvedic: "आयुष (AYUSH) मोड",
        speakPrompt: "बोलने के लिए माइक दबाएं",
        speakActive: "सुन रहे हैं... कृपया हिंदी में अपने लक्षण बताएं",
        speakError: "इस ब्राउज़र में आवाज पहचान समर्थित नहीं है",
        aiRecognized: "AI द्वारा पहचाना गया लक्षण:",
        next: "आगे बढ़ें",
        back: "पीछे जाएं",
        submit: "पुष्टि करें और दस्तावेज़ स्कैन पर जाएं",
        emergencyTitle: "आपातकालीन स्थिति पहचानी गई",
        emergencyDefault: "लक्षण गंभीर स्थिति का संकेत देते हैं। प्राथमिकता से जांच के लिए अस्पताल ट्राइएज स्टाफ को सूचित किया जा रहा है।",
        steps: [
          "मुख्य समस्या",
          "लक्षणों का विवरण",
          "पिछला मेडिकल इतिहास",
          "दवाइयां और एलर्जी",
          "व्यक्तिगत व पारिवारिक इतिहास",
          "शारीरिक प्रणालियों की जांच",
          "विवरण की समीक्षा"
        ],
        ayushSteps: [
          "मुख्य समस्या",
          "आहार एवं अग्नि परीक्षा",
          "प्रकृति एवं कोष्ठ परीक्षा",
          "पूर्व एवं कुल इतिहास",
          "निद्रा एवं विहार परीक्षा",
          "विवरण की समीक्षा"
        ],
        complaints: {
          title: "आपको मुख्य रूप से क्या परेशानी हो रही है?",
          sub: "नीचे दिए गए मुख्य लक्षणों में से चुनें या माइक दबाकर बोलें",
          placeholder: "अपनी समस्या का विवरण यहाँ लिखें या बोलें...",
          items: [
            { id: "chest_pain", label: "💔 छाती में दर्द या भारीपन", isDanger: true },
            { id: "fever", label: "🌡️ बुखार और कंपकंपी" },
            { id: "abdominal_pain", label: "🤢 पेट में दर्द" },
            { id: "breathlessness", label: "🫁 सांस लेने में तकलीफ", isDanger: true },
            { id: "cough_cold", label: "🤧 खांसी और जुकाम" },
            { id: "headache", label: "🤕 तेज सिरदर्द" },
            { id: "joint_pain", label: "🦴 जोड़ों व बदन में दर्द" },
            { id: "other", label: "✍️ अन्य कोई समस्या" }
          ]
        },
        hpi: {
          title: "अपनी परेशानी के बारे में और बताएं",
          sub: "यह कब शुरू हुआ, कैसा दर्द है, और क्या यह कहीं फैलता है?",
          durationLabel: "यह कब से शुरू हुआ?",
          durationItems: [
            { id: "few_hours", label: "कुछ घंटे पहले" },
            { id: "1_2_days", label: "1 - 2 दिन पहले" },
            { id: "1_week", label: "लगभग 1 हफ़्ता पहले" },
            { id: "1_month", label: "एक महीने से अधिक समय से" },
            { id: "sudden", label: "अचानक शुरू हुआ (कुछ मिनट पहले)" }
          ],
          characterLabel: "दर्द या लक्षण किस प्रकार का महसूस होता है?",
          characterItems: [
            { id: "dull", label: "हल्का धीमा दर्द" },
            { id: "sharp", label: "तेज चुभने वाला दर्द" },
            { id: "burning", label: "जलन जैसा दर्द" },
            { id: "crushing", label: "भारी दबाव / जकड़न जैसा दर्द" },
            { id: "throbbing", label: "धड़कने / फड़कने जैसा दर्द" },
            { id: "cramping", label: "मरोड़ जैसा दर्द" }
          ],
          radiationLabel: "क्या दर्द शरीर के किसी अन्य हिस्से में फैलता है?",
          radiationItems: [
            { id: "none", label: "कहीं नहीं फैलता (एक ही जगह रहता है)" },
            { id: "left_arm", label: "बायें हाथ की तरफ फैलता है", isDanger: true },
            { id: "jaw_neck", label: "जबड़े या गर्दन की तरफ फैलता है", isDanger: true },
            { id: "back", label: "पीठ की तरफ फैलता है" },
            { id: "abdomen", label: "पेट के निचले हिस्से में फैलता है" }
          ],
          associationsLabel: "क्या इसके साथ अन्य कोई लक्षण भी हैं? (एक से अधिक चुन सकते हैं)",
          associationsItems: [
            { id: "sweating", label: "बहुत पसीना आना", isDanger: true },
            { id: "nausea", label: "जी मिचलाना या उल्टी" },
            { id: "breathless", label: "सांस फूलना", isDanger: true },
            { id: "dizziness", label: "चक्कर आना या बेहोशी" },
            { id: "fever_assoc", label: "बुखार या कंपकंपी" },
            { id: "palpitations", label: "दिल की तेज धड़कन / घबराहट" }
          ],
          severityLabel: "दर्द या परेशानी का स्तर",
          severityHint: "(1 = हल्का, 10 = अत्यधिक असहनीय)"
        },
        past: {
          title: "क्या आपको पहले से कोई बीमारी है?",
          sub: "पहले से पहचानी गई पुरानी बीमारियाँ चुनें",
          placeholder: "अन्य कोई पुरानी बीमारी या ऑपरेशन का विवरण लिखें...",
          items: [
            { id: "diabetes", label: "मधुमेह (शुगर)" },
            { id: "hypertension", label: "हाई ब्लड प्रेशर (बीपी)" },
            { id: "cad_mi", label: "दिल की बीमारी या पुराना हार्ट अटैक" },
            { id: "asthma", label: "दमा / सांस की बीमारी" },
            { id: "thyroid", label: "थायरॉइड की समस्या" },
            { id: "kidney", label: "गुर्दे (किडनी) की बीमारी" },
            { id: "surgery", label: "पहले कोई बड़ा ऑपरेशन / सर्जरी" },
            { id: "none_past", label: "कोई पुरानी बीमारी नहीं है" }
          ]
        },
        meds: {
          title: "दवाइयां और एलर्जी",
          sub: "क्या आपको किसी दवा से एलर्जी है या आप कोई नियमित दवा लेते हैं?",
          allergyLabel: "ज्ञात दवाओं से एलर्जी:",
          medsLabel: "दैनिक ली जाने वाली दवाएं:",
          medsPlaceholder: "उदा. बीपी की गोली, शुगर की गोली, इनहेलर...",
          items: [
            { id: "penicillin", label: "पेनिसिलिन / एमोक्सिसिलिन एलर्जी", isDanger: true },
            { id: "sulfa", label: "सल्फा दवाओं से एलर्जी", isDanger: true },
            { id: "nsaids", label: "एस्पिरिन / दर्द निवारक दवाओं से एलर्जी", isDanger: true },
            { id: "food_dust", label: "धूल या खाने से एलर्जी" },
            { id: "none_allergy", label: "किसी दवा से कोई एलर्जी नहीं है" }
          ]
        },
        family: {
          title: "व्यक्तिगत व पारिवारिक इतिहास",
          sub: "परिवार में गंभीर बीमारियाँ और जीवनशैली की आदतें",
          familyLabel: "पारिवारिक मेडिकल इतिहास:",
          lifestyleLabel: "व्यक्तिगत जीवनशैली व आदतें:",
          smokingLabel: "तंबाकू / धूम्रपान:",
          alcoholLabel: "शराब का सेवन:",
          familyItems: [
            { id: "early_cad", label: "माता-पिता में 55 वर्ष से पहले हार्ट अटैक" },
            { id: "family_diabetes", label: "परिवार में शुगर (डायबिटीज)" },
            { id: "family_cancer", label: "परिवार में कैंसर की बीमारी" },
            { id: "family_stroke", label: "परिवार में लकवा (स्ट्रोक)" },
            { id: "none_family", label: "परिवार में कोई गंभीर बीमारी नहीं" }
          ],
          smokingOptions: [
            { id: "non_smoker", label: "धूम्रपान नहीं करते" },
            { id: "active_smoker", label: "बीड़ी / सिगरेट पीते हैं" },
            { id: "tobacco_chewer", label: "तंबाकू / गुटखा चबाते हैं" },
            { id: "former_smoker", label: "पहले पीते थे, अब छोड़ दिया" }
          ],
          alcoholOptions: [
            { id: "non_drinker", label: "शराब नहीं पीते" },
            { id: "social_drinker", label: "कभी-कभार पीते हैं" },
            { id: "regular_drinker", label: "नियमित पीते हैं" }
          ]
        },
        ros: {
          title: "शारीरिक प्रणालियों की जांच",
          sub: "अन्य जुड़े हुए लक्षणों की त्वरित जांच",
          items: [
            { id: "fever_ros", label: "बुखार या ठंड लगना" },
            { id: "dyspnea_rest", label: "बैठे रहने पर भी सांस फूलना" },
            { id: "chronic_cough", label: "दो हफ्ते से ज्यादा समय से खांसी" },
            { id: "palpitations_ros", label: "सीने में तेज धड़कन / घबराहट" },
            { id: "weight_loss", label: "बिना कारण वजन घटना" },
            { id: "dysuria", label: "पेशाब में जलन या दर्द" },
            { id: "bowel_changes", label: "लगातार दस्त या कब्ज" },
            { id: "none_ros", label: "इनमें से कोई लक्षण नहीं है" }
          ]
        },
        ayush: {
          agniTitle: "अग्नि एवं आहार परीक्षा",
          agniSub: "पाचन क्षमता और खान-पान की आदतों का मूल्यांकन",
          agniLabel: "अग्नि (पाचन क्षमता):",
          agniItems: [
            { id: "samagni", label: "समाग्नि (संतुलित पाचन)" },
            { id: "vishama", label: "विषमाग्नि (अनियमित पाचन व गैस - वात)" },
            { id: "tikshna", label: "तीक्ष्णाग्नि (अत्यधिक भूख व जलन - पित्त)" },
            { id: "manda", label: "मन्दाग्नि (सुस्त पाचन व भारीपन - कफ)" }
          ],
          aharaLabel: "आहार की आदतें (भोजन प्रकार):",
          aharaItems: [
            { id: "balanced", label: "समय पर पौष्टिक व संतुलित भोजन" },
            { id: "irregular", label: "अनियमित समय पर भोजन" },
            { id: "spicy_fried", label: "अत्यधिक तला-भुना व मसालेदार भोजन" },
            { id: "cold_dry", label: "रूखा, सूखा या बासी भोजन" }
          ],
          prakritiTitle: "प्रकृति एवं कोष्ठ परीक्षा",
          prakritiSub: "शारीरिक प्रकृति और मल त्याग की प्रकृति का मूल्यांकन",
          prakritiLabel: "प्रकृति (प्रधान दोष):",
          prakritiItems: [
            { id: "vata", label: "वात प्रधान (रूखापन, चंचलता)" },
            { id: "pitta", label: "पित्त प्रधान (गर्मी, तीक्ष्णता)" },
            { id: "kapha", label: "कफ प्रधान (भारीपन, स्थिरता)" },
            { id: "vata_pitta", label: "वात-पित्त" },
            { id: "pitta_kapha", label: "पित्त-कफ" },
            { id: "tridosha", label: "त्रिदोषज (समान)" }
          ],
          koshthaLabel: "कोष्ठ (मल विसर्जन की प्रकृति):",
          koshthaItems: [
            { id: "krura", label: "क्रूर कोष्ठ (कठिन मल / कब्ज)" },
            { id: "mridu", label: "मृदु कोष्ठ (नरम मल / तुरंत शौच)" },
            { id: "madhyama", label: "मध्यम कोष्ठ (सामान्य नियमित मल)" }
          ],
          nidraTitle: "निद्रा परीक्षा",
          nidraSub: "नींद का चक्र और दिनचर्या",
          nidraLabel: "निद्रा (नींद की गुणवत्ता):",
          nidraItems: [
            { id: "sound", label: "प्राकृत (गहरी व आरामदायक नींद)" },
            { id: "anidra", label: "अनिद्रा (कम या टूटी हुई नींद)" },
            { id: "atinidra", label: "अतिनिद्रा (अत्यधिक आलस्य व नींद)" }
          ]
        },
        review: {
          title: "दर्ज इतिहास की समीक्षा",
          sub: "आपके उत्तरों के आधार पर तैयार किया गया क्लिनिकल विवरण",
          ccLabel: "मुख्य समस्या",
          hpiLabel: "लक्षणों का विवरण (HPI)",
          pastLabel: "पिछला मेडिकल इतिहास",
          medsLabel: "दवाइयां और एलर्जी",
          familyLabel: "पारिवारिक व जीवनशैली इतिहास",
          rosLabel: "शारीरिक प्रणालियों की जांच",
          ayushLabel: "आयुष मानक (दशविध परीक्षा)",
          notSpecified: "अनिर्दिष्ट",
          noneReported: "कोई नहीं",
          noAllergies: "कोई ज्ञात दवा एलर्जी नहीं",
          noMeds: "कोई नियमित दैनिक दवा नहीं",
          nonContributory: "कोई विशेष पारिवारिक इतिहास नहीं",
          negativeRos: "कोई गंभीर अतिरिक्त लक्षण नहीं"
        }
      }
    };