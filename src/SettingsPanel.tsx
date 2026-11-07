import type { ReactNode } from 'react'
import { APP_VERSION } from './config'
import { drillLabels as labels } from './drillPresentation'
import { flashcardLessons } from './content/flashcards'
import { validateCustomRange } from './drills'
import type { DrillId, Settings, Direction } from './types'

export function SettingsPanel({view,settings,flashcardLessonIds,setFlashcardLessonIds,flashcardDirection,setFlashcardDirection,close,change,installed}:{view:DrillId|'flashcards';settings:Settings;flashcardLessonIds:string[];setFlashcardLessonIds:(ids:string[])=>void;flashcardDirection:'korean'|'english';setFlashcardDirection:(direction:'korean'|'english')=>void;close:()=>void;change:(p:Partial<Settings>)=>void;installed:boolean}){
  const rangeError=validateCustomRange(settings.customMin,settings.customMax,settings.numberSystem)
  const title=view==='flashcards'?'Vocab':labels[view]
  return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)close()}}><section className="settings-panel" role="dialog" aria-modal="true" aria-label={`${title} settings`}><header><div><p className="eyebrow">Make it yours</p><h2>{title} settings</h2></div><button className="icon-button" onClick={close} aria-label="Close settings">×</button></header>
    {view==='flashcards'?<><SettingGroup label="Flashcard lessons">{flashcardLessons.map(item=><label className="lesson-option" key={item.id}><input type="checkbox" checked={flashcardLessonIds.includes(item.id)} disabled={flashcardLessonIds.length===1&&flashcardLessonIds.includes(item.id)} onChange={event=>setFlashcardLessonIds(event.target.checked?[...flashcardLessonIds,item.id]:flashcardLessonIds.filter(id=>id!==item.id))}/>Lesson {item.number} · {item.title}</label>)}</SettingGroup><SettingGroup label="Direction"><Segment value={flashcardDirection} options={[["korean","Korean first"],["english","English first"]]} onChange={value=>setFlashcardDirection(value as 'korean'|'english')}/></SettingGroup></>:<>
      {view==='numbers'&&<SettingGroup label="Number system"><Segment value={settings.numberSystem} options={[['mixed','Mixed'],['sino','Sino'],['native','Native']]} onChange={numberSystem=>change({numberSystem:numberSystem as Settings['numberSystem']})}/><select value={settings.numberPreset} onChange={e=>change({numberPreset:e.target.value as Settings['numberPreset']})}><option value="small">Small · 0–99</option><option value="medium">Medium · 0–9,999</option><option value="large">Large · 0–999,999</option><option value="extra-large">Extra large · 1,000,000–999,999,999</option><option value="custom">Custom range</option></select>{settings.numberPreset==='custom'&&<><div className="range"><input type="number" value={settings.customMin} onChange={e=>change({customMin:Number(e.target.value)})}/><span>to</span><input type="number" value={settings.customMax} onChange={e=>change({customMax:Number(e.target.value)})}/></div>{rangeError&&<p className="error">{rangeError}</p>}</>}</SettingGroup>}
      {view==='counters'&&<SettingGroup label="Counter level"><Segment value={settings.counterLevel} options={[['all','All'],['beginner','A1–A2'],['intermediate','B1–B2']]} onChange={counterLevel=>change({counterLevel:counterLevel as Settings['counterLevel']})}/></SettingGroup>}
      {view==='time'&&<SettingGroup label="Time format"><Segment value={settings.timeFormat} options={[['mixed','Mixed'],['12','12 hour'],['24','24 hour']]} onChange={timeFormat=>change({timeFormat:timeFormat as Settings['timeFormat']})}/></SettingGroup>}
      {view!=='counters'&&<SettingGroup label="Direction"><Segment value={settings.directions[view]} options={[['mixed','Mixed'],['forward','To Korean'],['reverse','From Korean']]} onChange={direction=>change({directions:{...settings.directions,[view]:direction as Direction}})}/></SettingGroup>}
    </>}
    {view!=='flashcards'&&<section className="global-settings" aria-label="Global settings"><h3>Global settings</h3>
      <SettingGroup label="Answer style"><Segment value={settings.answerMode} options={[['typing','Typing'],['choice','3 choices']]} onChange={answerMode=>change({answerMode:answerMode as Settings['answerMode']})}/></SettingGroup>
    </section>}
    <footer><span>v{APP_VERSION} · {installed?'Installed':'Web app'}</span><p>Progress stays on this device. Uninstalling or clearing site data can remove it.</p></footer>
  </section></div>
}
function SettingGroup({label,children}:{label:string;children:ReactNode}){return <div className="setting-group"><label>{label}</label>{children}</div>}
function Segment({value,options,onChange}:{value:string;options:[string,string][];onChange:(v:string)=>void}){return <div className="segment">{options.map(([v,label])=><button key={v} className={v===value?'selected':''} onClick={()=>onChange(v)}>{label}</button>)}</div>}
