const fs = require('fs');

let content = fs.readFileSync('src/app/history/page.tsx', 'utf8');

// 1. Update handleCopilotSubmit
const oldHandleCopilotSubmit = `          } else if (!isAyushMode && currentStep === 1) {
            if (data.duration) newState.socrates.duration = data.duration;
            if (data.character) newState.socrates.character = data.character;
            if (data.radiation) newState.socrates.radiation = data.radiation;
            if (data.associations) {
              // merge unique
              const combined = [...newState.socrates.associations, ...data.associations];
              newState.socrates.associations = Array.from(new Set(combined));
            }
            if (data.severity) newState.socrates.severity = data.severity;
          }`;

const newHandleCopilotSubmit = `          } else if (!isAyushMode && currentStep === 1) {
            if (data.duration) newState.socrates.duration = data.duration;
            if (data.character) newState.socrates.character = data.character;
            if (data.radiation) newState.socrates.radiation = data.radiation;
            if (data.associations) {
              const combined = [...newState.socrates.associations, ...data.associations];
              newState.socrates.associations = Array.from(new Set(combined));
            }
            if (data.severity) newState.socrates.severity = data.severity;
          } else if (!isAyushMode && currentStep === 2) {
            if (data.pastHistory) newState.pastHistory = Array.from(new Set([...newState.pastHistory, ...data.pastHistory]));
            if (data.pastHistoryOther) newState.pastHistoryOther = data.pastHistoryOther;
          } else if (!isAyushMode && currentStep === 3) {
            if (data.drugAllergy) newState.drugAllergy = Array.from(new Set([...newState.drugAllergy, ...data.drugAllergy]));
            if (data.dailyMedications) newState.dailyMedications = data.dailyMedications;
          } else if (!isAyushMode && currentStep === 4) {
            if (data.familyHistory) newState.familyHistory = Array.from(new Set([...newState.familyHistory, ...data.familyHistory]));
            if (data.smoking) newState.lifestyle.smoking = data.smoking;
            if (data.alcohol) newState.lifestyle.alcohol = data.alcohol;
          } else if (!isAyushMode && currentStep === 5) {
            if (data.ros) newState.ros = Array.from(new Set([...newState.ros, ...data.ros]));
          } else if (isAyushMode && currentStep === 1) {
            if (data.agni) newState.ayush.agni = data.agni;
            if (data.ahara) newState.ayush.ahara = data.ahara;
          } else if (isAyushMode && currentStep === 2) {
            if (data.prakriti) newState.ayush.prakriti = data.prakriti;
            if (data.koshtha) newState.ayush.koshtha = data.koshtha;
          } else if (isAyushMode && currentStep === 3) {
            if (data.pastHistory) newState.pastHistory = Array.from(new Set([...newState.pastHistory, ...data.pastHistory]));
            if (data.familyHistory) newState.familyHistory = Array.from(new Set([...newState.familyHistory, ...data.familyHistory]));
          } else if (isAyushMode && currentStep === 4) {
            if (data.nidra) newState.ayush.nidra = data.nidra;
          }`;

content = content.replace(oldHandleCopilotSubmit, newHandleCopilotSubmit);

// 2. Update renderStepContent
const oldRenderStepContentPlaceholder = `    // Placeholder for other steps
    return (
      <div className="question-header">
        <div>
          <h3 className="question-title">Step {currentStep + 1}</h3>
          <div className="question-subtitle">Please select the appropriate options (This step is partially implemented for brevity).</div>
        </div>
      </div>
    );`;

const newRenderStepContent = `
    const MultiSelectUI = ({ title, sub, items, selected, toggleFn }: any) => (
      <>
        <div className="question-header">
          <div>
            <h3 className="question-title">{title}</h3>
            <div className="question-subtitle">{sub}</div>
          </div>
          <button className="audio-prompt-btn" onClick={() => speakText(title)} title="Listen">🔊</button>
        </div>
        <div className="chip-grid">
          {items.map((item: any) => (
            <button key={item.id} className={\`chip-btn \${item.isDanger ? 'danger-chip' : ''} \${selected.includes(item.id) ? 'selected' : ''}\`} 
              onClick={() => toggleFn(item.id)}>
              {item.label}
            </button>
          ))}
        </div>
      </>
    );

    const SingleSelectUI = ({ title, items, selected, setFn }: any) => (
      <div style={{ marginTop: '16px' }}>
        <label style={{fontWeight: 600, fontSize: '14px', marginBottom: '8px', display: 'block'}}>{title}</label>
        <div className="chip-grid">
          {items.map((item: any) => (
            <button key={item.id} className={\`chip-btn \${selected === item.id ? 'selected' : ''}\`} 
              onClick={() => setFn(item.id)}>
              {item.label}
            </button>
          ))}
        </div>
      </div>
    );

    if (!isAyushMode && currentStep === 2) {
      return (
        <>
          <MultiSelectUI title={dict.past.title} sub={dict.past.sub} items={dict.past.items} selected={intakeState.pastHistory} 
            toggleFn={(id: string) => {
              if (id === 'none_past') setIntakeState({...intakeState, pastHistory: ['none_past']});
              else {
                const next = intakeState.pastHistory.includes(id) ? intakeState.pastHistory.filter(x => x !== id) : [...intakeState.pastHistory.filter(x => x !== 'none_past'), id];
                setIntakeState({...intakeState, pastHistory: next});
              }
            }} />
          <input type="text" className="text-input-field" placeholder={dict.past.placeholder} value={intakeState.pastHistoryOther} onChange={e => setIntakeState({...intakeState, pastHistoryOther: e.target.value})} style={{marginTop: '20px', width: '100%'}} />
        </>
      );
    }

    if (!isAyushMode && currentStep === 3) {
      return (
        <>
          <MultiSelectUI title={dict.meds.title} sub={dict.meds.sub} items={dict.meds.items} selected={intakeState.drugAllergy} 
            toggleFn={(id: string) => {
              if (id === 'none_allergy') setIntakeState({...intakeState, drugAllergy: ['none_allergy']});
              else {
                const next = intakeState.drugAllergy.includes(id) ? intakeState.drugAllergy.filter(x => x !== id) : [...intakeState.drugAllergy.filter(x => x !== 'none_allergy'), id];
                setIntakeState({...intakeState, drugAllergy: next});
              }
            }} />
          <div style={{marginTop: '20px'}}>
            <label style={{fontWeight: 600, fontSize: '14px', marginBottom: '8px', display: 'block'}}>{dict.meds.medsLabel}</label>
            <input type="text" className="text-input-field" placeholder={dict.meds.medsPlaceholder} value={intakeState.dailyMedications} onChange={e => setIntakeState({...intakeState, dailyMedications: e.target.value})} style={{width: '100%'}} />
          </div>
        </>
      );
    }

    if (!isAyushMode && currentStep === 4) {
      return (
        <>
          <MultiSelectUI title={dict.family.title} sub={dict.family.sub} items={dict.family.familyItems} selected={intakeState.familyHistory} 
            toggleFn={(id: string) => {
              if (id === 'none_family') setIntakeState({...intakeState, familyHistory: ['none_family']});
              else {
                const next = intakeState.familyHistory.includes(id) ? intakeState.familyHistory.filter(x => x !== id) : [...intakeState.familyHistory.filter(x => x !== 'none_family'), id];
                setIntakeState({...intakeState, familyHistory: next});
              }
            }} />
          <SingleSelectUI title={dict.family.smokingLabel} items={dict.family.smokingOptions} selected={intakeState.lifestyle.smoking} setFn={(id: string) => setIntakeState({...intakeState, lifestyle: {...intakeState.lifestyle, smoking: id}})} />
          <SingleSelectUI title={dict.family.alcoholLabel} items={dict.family.alcoholOptions} selected={intakeState.lifestyle.alcohol} setFn={(id: string) => setIntakeState({...intakeState, lifestyle: {...intakeState.lifestyle, alcohol: id}})} />
        </>
      );
    }

    if (!isAyushMode && currentStep === 5) {
      return (
        <MultiSelectUI title={dict.ros.title} sub={dict.ros.sub} items={dict.ros.items} selected={intakeState.ros} 
          toggleFn={(id: string) => {
            if (id === 'none_ros') setIntakeState({...intakeState, ros: ['none_ros']});
            else {
              const next = intakeState.ros.includes(id) ? intakeState.ros.filter(x => x !== id) : [...intakeState.ros.filter(x => x !== 'none_ros'), id];
              setIntakeState({...intakeState, ros: next});
            }
          }} />
      );
    }

    if (isAyushMode && currentStep === 1) {
      return (
        <>
          <div className="question-header">
            <div>
              <h3 className="question-title">{dict.ayush.agniTitle}</h3>
              <div className="question-subtitle">{dict.ayush.agniSub}</div>
            </div>
            <button className="audio-prompt-btn" onClick={() => speakText(dict.ayush.agniTitle)} title="Listen">🔊</button>
          </div>
          <SingleSelectUI title={dict.ayush.agniLabel} items={dict.ayush.agniItems} selected={intakeState.ayush.agni} setFn={(id: string) => setIntakeState({...intakeState, ayush: {...intakeState.ayush, agni: id}})} />
          <SingleSelectUI title={dict.ayush.aharaLabel} items={dict.ayush.aharaItems} selected={intakeState.ayush.ahara} setFn={(id: string) => setIntakeState({...intakeState, ayush: {...intakeState.ayush, ahara: id}})} />
        </>
      );
    }

    if (isAyushMode && currentStep === 2) {
      return (
        <>
          <div className="question-header">
            <div>
              <h3 className="question-title">{dict.ayush.prakritiTitle}</h3>
              <div className="question-subtitle">{dict.ayush.prakritiSub}</div>
            </div>
            <button className="audio-prompt-btn" onClick={() => speakText(dict.ayush.prakritiTitle)} title="Listen">🔊</button>
          </div>
          <SingleSelectUI title={dict.ayush.prakritiLabel} items={dict.ayush.prakritiItems} selected={intakeState.ayush.prakriti} setFn={(id: string) => setIntakeState({...intakeState, ayush: {...intakeState.ayush, prakriti: id}})} />
          <SingleSelectUI title={dict.ayush.koshthaLabel} items={dict.ayush.koshthaItems} selected={intakeState.ayush.koshtha} setFn={(id: string) => setIntakeState({...intakeState, ayush: {...intakeState.ayush, koshtha: id}})} />
        </>
      );
    }

    if (isAyushMode && currentStep === 3) {
      return (
        <>
          <MultiSelectUI title={dict.past.title} sub={dict.past.sub} items={dict.past.items} selected={intakeState.pastHistory} 
            toggleFn={(id: string) => {
              if (id === 'none_past') setIntakeState({...intakeState, pastHistory: ['none_past']});
              else {
                const next = intakeState.pastHistory.includes(id) ? intakeState.pastHistory.filter(x => x !== id) : [...intakeState.pastHistory.filter(x => x !== 'none_past'), id];
                setIntakeState({...intakeState, pastHistory: next});
              }
            }} />
          <MultiSelectUI title={dict.family.title} sub={dict.family.sub} items={dict.family.familyItems} selected={intakeState.familyHistory} 
            toggleFn={(id: string) => {
              if (id === 'none_family') setIntakeState({...intakeState, familyHistory: ['none_family']});
              else {
                const next = intakeState.familyHistory.includes(id) ? intakeState.familyHistory.filter(x => x !== id) : [...intakeState.familyHistory.filter(x => x !== 'none_family'), id];
                setIntakeState({...intakeState, familyHistory: next});
              }
            }} />
        </>
      );
    }

    if (isAyushMode && currentStep === 4) {
      return (
        <>
          <div className="question-header">
            <div>
              <h3 className="question-title">{dict.ayush.nidraTitle}</h3>
              <div className="question-subtitle">{dict.ayush.nidraSub}</div>
            </div>
            <button className="audio-prompt-btn" onClick={() => speakText(dict.ayush.nidraTitle)} title="Listen">🔊</button>
          </div>
          <SingleSelectUI title={dict.ayush.nidraLabel} items={dict.ayush.nidraItems} selected={intakeState.ayush.nidra} setFn={(id: string) => setIntakeState({...intakeState, ayush: {...intakeState.ayush, nidra: id}})} />
        </>
      );
    }

    // Final Summary Step
    if ((!isAyushMode && currentStep === 6) || (isAyushMode && currentStep === 5)) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="question-header">
            <div>
              <h3 className="question-title">{dict.review.title}</h3>
              <div className="question-subtitle">{dict.review.sub}</div>
            </div>
          </div>
          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: '8px' }}>{dict.review.ccLabel}</h4>
            <p>{intakeState.chiefComplaint ? dict.complaints.items.find((i:any) => i.id === intakeState.chiefComplaint)?.label : intakeState.customComplaint || dict.review.notSpecified}</p>

            <h4 style={{ fontWeight: 600, color: 'var(--primary)', marginTop: '16px', marginBottom: '8px' }}>{dict.review.pastLabel}</h4>
            <p>{intakeState.pastHistory.length > 0 ? intakeState.pastHistory.map((id:string) => dict.past.items.find((i:any) => i.id === id)?.label).join(', ') : dict.review.noneReported}</p>

            <h4 style={{ fontWeight: 600, color: 'var(--primary)', marginTop: '16px', marginBottom: '8px' }}>{dict.review.medsLabel}</h4>
            <p>{intakeState.drugAllergy.length > 0 ? intakeState.drugAllergy.map((id:string) => dict.meds.items.find((i:any) => i.id === id)?.label).join(', ') : dict.review.noAllergies}</p>
            <p>{intakeState.dailyMedications || dict.review.noMeds}</p>
          </div>
        </div>
      );
    }
`;

content = content.replace(oldRenderStepContentPlaceholder, newRenderStepContent);
fs.writeFileSync('src/app/history/page.tsx', content);
console.log("Successfully patched page.tsx");
