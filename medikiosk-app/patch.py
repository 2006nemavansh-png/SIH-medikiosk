import re

with open("src/app/history/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

start_marker = "{currentStep > 0 && ("
end_marker = "          )}\n        </div>\n\n        {/* Navigation Buttons */}"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx == -1 or end_idx == -1:
    print("Could not find markers")
    exit(1)

new_jsx = """{currentStep === 1 && !isAyushMode && (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="font-headline text-[20px] font-bold text-(--color-on-surface)">{dict.hpi.title}</h3>
                <p className="font-body text-[16px] text-(--color-on-surface-variant) mt-1">{dict.hpi.sub}</p>
              </div>
              
              <div className="flex flex-col gap-4">
                <span className="font-label text-[14px] font-bold text-(--color-on-surface)">{dict.hpi.durationLabel}</span>
                <div className="flex flex-wrap gap-2">
                  {dict.hpi.durationItems.map((item: any) => (
                    <button key={item.id} onClick={() => setSocrates({...socrates, duration: item.id})}
                      className={`px-4 py-2 rounded-full font-label text-[14px] border transition-all active:scale-95 ${socrates.duration === item.id ? 'bg-(--color-primary) text-white border-(--color-primary)' : 'bg-white text-(--color-on-surface-variant) border-[#D9D3CC] hover:bg-[#F5F1E8]'}`}>
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <span className="font-label text-[14px] font-bold text-(--color-on-surface)">{dict.hpi.characterLabel}</span>
                <div className="flex flex-wrap gap-2">
                  {dict.hpi.characterItems.map((item: any) => (
                    <button key={item.id} onClick={() => setSocrates({...socrates, character: item.id})}
                      className={`px-4 py-2 rounded-full font-label text-[14px] border transition-all active:scale-95 ${socrates.character === item.id ? 'bg-(--color-primary) text-white border-(--color-primary)' : 'bg-white text-(--color-on-surface-variant) border-[#D9D3CC] hover:bg-[#F5F1E8]'}`}>
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <span className="font-label text-[14px] font-bold text-(--color-on-surface)">{dict.hpi.radiationLabel}</span>
                <div className="flex flex-wrap gap-2">
                  {dict.hpi.radiationItems.map((item: any) => (
                    <button key={item.id} onClick={() => setSocrates({...socrates, radiation: item.id})}
                      className={`px-4 py-2 rounded-full font-label text-[14px] border transition-all active:scale-95 ${socrates.radiation === item.id ? (item.isDanger ? 'bg-(--color-error) text-white border-(--color-error)' : 'bg-(--color-primary) text-white border-(--color-primary)') : 'bg-white text-(--color-on-surface-variant) border-[#D9D3CC] hover:bg-[#F5F1E8]'}`}>
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <span className="font-label text-[14px] font-bold text-(--color-on-surface)">{dict.hpi.associationsLabel}</span>
                <div className="flex flex-wrap gap-2">
                  {dict.hpi.associationsItems.map((item: any) => (
                    <button key={item.id} onClick={() => toggleArrayItem(setSocrates, item.id)}
                      className={`px-4 py-2 rounded-full font-label text-[14px] border transition-all active:scale-95 ${socrates.associations?.includes(item.id) ? (item.isDanger ? 'bg-(--color-error) text-white border-(--color-error)' : 'bg-(--color-primary) text-white border-(--color-primary)') : 'bg-white text-(--color-on-surface-variant) border-[#D9D3CC] hover:bg-[#F5F1E8]'}`}>
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && !isAyushMode && (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="font-headline text-[20px] font-bold text-(--color-on-surface)">{dict.past.title}</h3>
                <p className="font-body text-[16px] text-(--color-on-surface-variant) mt-1">{dict.past.sub}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {dict.past.items.map((item: any) => (
                  <button key={item.id} onClick={() => toggleArrayItem(setPastConditions, item.id)}
                    className={`px-4 py-2 rounded-full font-label text-[14px] border transition-all active:scale-95 ${pastConditions.includes(item.id) ? 'bg-(--color-primary) text-white border-(--color-primary)' : 'bg-white text-(--color-on-surface-variant) border-[#D9D3CC] hover:bg-[#F5F1E8]'}`}>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 3 && !isAyushMode && (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="font-headline text-[20px] font-bold text-(--color-on-surface)">{dict.meds.title}</h3>
                <p className="font-body text-[16px] text-(--color-on-surface-variant) mt-1">{dict.meds.sub}</p>
              </div>
              <div className="flex flex-col gap-4">
                <span className="font-label text-[14px] font-bold text-(--color-on-surface)">{dict.meds.allergyLabel}</span>
                <div className="flex flex-wrap gap-2">
                  {dict.meds.items.map((item: any) => (
                    <button key={item.id} onClick={() => toggleArrayItem(setAllergies, item.id)}
                      className={`px-4 py-2 rounded-full font-label text-[14px] border transition-all active:scale-95 ${allergies.includes(item.id) ? (item.isDanger ? 'bg-(--color-error) text-white border-(--color-error)' : 'bg-(--color-primary) text-white border-(--color-primary)') : 'bg-white text-(--color-on-surface-variant) border-[#D9D3CC] hover:bg-[#F5F1E8]'}`}>
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-4 mt-4">
                <span className="font-label text-[14px] font-bold text-(--color-on-surface)">{dict.meds.medsLabel}</span>
                <input type="text" value={meds} onChange={(e) => setMeds(e.target.value)} placeholder={dict.meds.medsPlaceholder} className="w-full bg-white border border-[#D9D3CC] rounded-[8px] px-4 py-3 focus:border-(--color-primary) outline-none font-body" />
              </div>
            </div>
          )}

          {currentStep === 4 && !isAyushMode && (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="font-headline text-[20px] font-bold text-(--color-on-surface)">{dict.family.title}</h3>
                <p className="font-body text-[16px] text-(--color-on-surface-variant) mt-1">{dict.family.sub}</p>
              </div>
              <div className="flex flex-col gap-4">
                <span className="font-label text-[14px] font-bold text-(--color-on-surface)">{dict.family.familyLabel}</span>
                <div className="flex flex-wrap gap-2">
                  {dict.family.familyItems.map((item: any) => (
                    <button key={item.id} onClick={() => toggleArrayItem(setFamilyHistory, item.id)}
                      className={`px-4 py-2 rounded-full font-label text-[14px] border transition-all active:scale-95 ${familyHistory.includes(item.id) ? 'bg-(--color-primary) text-white border-(--color-primary)' : 'bg-white text-(--color-on-surface-variant) border-[#D9D3CC] hover:bg-[#F5F1E8]'}`}>
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-4 mt-4">
                <span className="font-label text-[14px] font-bold text-(--color-on-surface)">{dict.family.smokingLabel}</span>
                <div className="flex flex-wrap gap-2">
                  {dict.family.smokingOptions.map((item: any) => (
                    <button key={item.id} onClick={() => setSmoking(item.id)}
                      className={`px-4 py-2 rounded-full font-label text-[14px] border transition-all active:scale-95 ${smoking === item.id ? 'bg-(--color-primary) text-white border-(--color-primary)' : 'bg-white text-(--color-on-surface-variant) border-[#D9D3CC] hover:bg-[#F5F1E8]'}`}>
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && !isAyushMode && (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="font-headline text-[20px] font-bold text-(--color-on-surface)">{dict.ros.title}</h3>
                <p className="font-body text-[16px] text-(--color-on-surface-variant) mt-1">{dict.ros.sub}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {dict.ros.items.map((item: any) => (
                  <button key={item.id} onClick={() => toggleArrayItem(setRos, item.id)}
                    className={`px-4 py-2 rounded-full font-label text-[14px] border transition-all active:scale-95 ${ros.includes(item.id) ? 'bg-(--color-primary) text-white border-(--color-primary)' : 'bg-white text-(--color-on-surface-variant) border-[#D9D3CC] hover:bg-[#F5F1E8]'}`}>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 1 && isAyushMode && (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="font-headline text-[20px] font-bold text-(--color-on-surface)">{dict.ayush.agniTitle}</h3>
                <p className="font-body text-[16px] text-(--color-on-surface-variant) mt-1">{dict.ayush.agniSub}</p>
              </div>
              <div className="flex flex-col gap-4">
                <span className="font-label text-[14px] font-bold text-(--color-on-surface)">{dict.ayush.agniLabel}</span>
                <div className="flex flex-wrap gap-2">
                  {dict.ayush.agniItems.map((item: any) => (
                    <button key={item.id} onClick={() => setAyushData({...ayushData, agni: item.id})}
                      className={`px-4 py-2 rounded-full font-label text-[14px] border transition-all active:scale-95 ${ayushData.agni === item.id ? 'bg-(--color-primary) text-white border-(--color-primary)' : 'bg-white text-(--color-on-surface-variant) border-[#D9D3CC] hover:bg-[#F5F1E8]'}`}>
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && isAyushMode && (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="font-headline text-[20px] font-bold text-(--color-on-surface)">{dict.ayush.prakritiTitle}</h3>
              </div>
              <div className="flex flex-col gap-4">
                <span className="font-label text-[14px] font-bold text-(--color-on-surface)">{dict.ayush.prakritiLabel}</span>
                <div className="flex flex-wrap gap-2">
                  {dict.ayush.prakritiItems.map((item: any) => (
                    <button key={item.id} onClick={() => setAyushData({...ayushData, prakriti: item.id})}
                      className={`px-4 py-2 rounded-full font-label text-[14px] border transition-all active:scale-95 ${ayushData.prakriti === item.id ? 'bg-(--color-primary) text-white border-(--color-primary)' : 'bg-white text-(--color-on-surface-variant) border-[#D9D3CC] hover:bg-[#F5F1E8]'}`}>
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {currentStep === 3 && isAyushMode && (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="font-headline text-[20px] font-bold text-(--color-on-surface)">{dict.past.title}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {dict.past.items.map((item: any) => (
                  <button key={item.id} onClick={() => toggleArrayItem(setPastConditions, item.id)}
                    className={`px-4 py-2 rounded-full font-label text-[14px] border transition-all active:scale-95 ${pastConditions.includes(item.id) ? 'bg-(--color-primary) text-white border-(--color-primary)' : 'bg-white text-(--color-on-surface-variant) border-[#D9D3CC] hover:bg-[#F5F1E8]'}`}>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {currentStep === 4 && isAyushMode && (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="font-headline text-[20px] font-bold text-(--color-on-surface)">{dict.ayush.nidraTitle}</h3>
              </div>
              <div className="flex flex-col gap-4">
                <span className="font-label text-[14px] font-bold text-(--color-on-surface)">{dict.ayush.nidraLabel}</span>
                <div className="flex flex-wrap gap-2">
                  {dict.ayush.nidraItems.map((item: any) => (
                    <button key={item.id} onClick={() => setAyushData({...ayushData, nidra: item.id})}
                      className={`px-4 py-2 rounded-full font-label text-[14px] border transition-all active:scale-95 ${ayushData.nidra === item.id ? 'bg-(--color-primary) text-white border-(--color-primary)' : 'bg-white text-(--color-on-surface-variant) border-[#D9D3CC] hover:bg-[#F5F1E8]'}`}>
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === stepsList.length - 1 && (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="font-headline text-[20px] font-bold text-(--color-on-surface)">{dict.review.title}</h3>
                <p className="font-body text-[16px] text-(--color-on-surface-variant) mt-1">{dict.review.sub}</p>
              </div>
              <div className="bg-[#F5F1E8] p-4 rounded-[12px] border border-[#D9D3CC] flex flex-col gap-4 font-body">
                <div>
                  <span className="font-bold text-[16px]">{dict.review.ccLabel}: </span>
                  <span className="text-[16px]">{chiefComplaint || customComplaint || dict.review.notSpecified}</span>
                </div>
                {!isAyushMode ? (
                  <>
                    <div>
                      <span className="font-bold text-[16px]">{dict.review.hpiLabel}: </span>
                      <span className="text-[16px]">Duration: {socrates.duration || '-'}, Character: {socrates.character || '-'}, Radiation: {socrates.radiation || '-'}</span>
                    </div>
                    <div>
                      <span className="font-bold text-[16px]">{dict.review.pastLabel}: </span>
                      <span className="text-[16px]">{pastConditions.length > 0 ? pastConditions.join(', ') : dict.review.noneReported}</span>
                    </div>
                    <div>
                      <span className="font-bold text-[16px]">{dict.review.medsLabel}: </span>
                      <span className="text-[16px]">Allergies: {allergies.length > 0 ? allergies.join(', ') : dict.review.noAllergies}. Meds: {meds || dict.review.noMeds}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <span className="font-bold text-[16px]">{dict.review.ayushLabel}: </span>
                      <span className="text-[16px]">Agni: {ayushData.agni || '-'}, Prakriti: {ayushData.prakriti || '-'}, Nidra: {ayushData.nidra || '-'}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}"""

with open("src/app/history/page.tsx", "w", encoding="utf-8") as f:
    f.write(content[:start_idx] + new_jsx + "\n        </div>\n\n        {/* Navigation Buttons */}" + content[end_idx + len(end_marker):])

print("Patched successfully")
