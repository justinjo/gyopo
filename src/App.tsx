import { Alphabet } from './Alphabet'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { adapters, updateQuestion, validateCustomRange } from './drills'
import { APP_NAME, APP_VERSION, DRILLS, initialState } from './config'
import { flashcardLessons } from './content/flashcards'
import { createFlashcardSession, flashcardDeck, type FlashcardSession } from './content/flashcardSession'
import { shuffle } from './lib/normalize'
import { repository } from './storage/repository'
import type { ActiveSession, DrillId, PersistedState, SectionId, Settings, Direction } from './types'

const labels:Record<DrillId,string>={numbers:'Numbers',counters:'Counters',colors:'Colors',time:'Time',days:'Days'}
const icons:Record<DrillId,string>={numbers:'일',counters:'개',colors:'●',time:'시',days:'월'}
const today=()=>new Date().toLocaleDateString('en-CA')
const saveSession=(state:PersistedState,session:ActiveSession):PersistedState=>({...state,drillSessions:{...state.drillSessions,[session.drill]:session}})

export function App(){
  const [state,setState]=useState<PersistedState>(initialState)
  const [ready,setReady]=useState(false),[settingsOpen,setSettingsOpen]=useState(false)
  const view=state.view
  function setView(view:SectionId){setState(current=>({...current,view}))}
  const session=state.drillSessions[state.activeDrill]
  const flashcardLessonIds=state.flashcardSession.lessonIds,flashcardDirection=state.flashcardSession.direction
  const setFlashcardLessonIds=(lessonIds:string[])=>setState(s=>({...s,flashcardSession:createFlashcardSession(lessonIds,s.flashcardSession.direction)}))
  const setFlashcardDirection=(direction:FlashcardSession['direction'])=>setState(s=>({...s,flashcardSession:createFlashcardSession(s.flashcardSession.lessonIds,direction)}))
  const [keyboardOpen,setKeyboardOpen]=useState(false)
  const [installed,setInstalled]=useState(matchMedia('(display-mode: standalone)').matches)
  const inputRef=useRef<HTMLInputElement>(null)
  const stateRef=useRef(state); stateRef.current=state
  const {needRefresh:[needRefresh,setNeedRefresh],updateServiceWorker}=useRegisterSW({immediate:true,onRegisteredSW(){},onRegisterError(error){console.error('Service worker registration failed',error)}})

  useEffect(()=>{let active=true;repository.load().then(saved=>{if(active){setState(saved);setReady(true)}});return()=>{active=false}},[])
  useEffect(()=>{if(ready)repository.save(state)},[state,ready])
  useEffect(()=>{const media=matchMedia('(display-mode: standalone)'),standalone=()=>setInstalled(media.matches);media.addEventListener('change',standalone);return()=>media.removeEventListener('change',standalone)},[])
  useEffect(()=>{const viewport=window.visualViewport;if(!viewport)return;let fullHeight=viewport.height
    const sync=()=>{const inputFocused=document.activeElement===inputRef.current
      const keyboardVisible=matchMedia('(max-width: 600px)').matches&&inputFocused&&fullHeight-viewport.height>80
      if(!inputFocused)fullHeight=Math.max(fullHeight,viewport.height)
      document.documentElement.style.setProperty('--visual-viewport-height',`${viewport.height}px`)
      document.documentElement.style.setProperty('--visual-viewport-top',`${viewport.offsetTop}px`)
      document.documentElement.classList.toggle('keyboard-visible',keyboardVisible)
      setKeyboardOpen(keyboardVisible)
    }
    sync();viewport.addEventListener('resize',sync);viewport.addEventListener('scroll',sync);document.addEventListener('focusin',sync);document.addEventListener('focusout',sync)
    return()=>{viewport.removeEventListener('resize',sync);viewport.removeEventListener('scroll',sync);document.removeEventListener('focusin',sync);document.removeEventListener('focusout',sync);document.documentElement.classList.remove('keyboard-visible');document.documentElement.style.removeProperty('--visual-viewport-height');document.documentElement.style.removeProperty('--visual-viewport-top')}
  },[])

  const makeQuestion=useCallback((base:PersistedState,drill=base.activeDrill):ActiveSession=>{
    const previous=base.drillSessions[drill]
    const context={settings:base.settings,recentSubjectKeys:[...previous.recentSubjectKeys],counterBag:[...previous.counterBag]}
    const selection=adapters[drill].selectNext(context)
    const question=adapters[drill].buildQuestion(selection.subject,base.settings)
    const recentSubjectKeys=[question.subjectKey,...context.recentSubjectKeys].slice(0,12)
    return {drill,question,input:'',feedback:null,translationVisible:false,recentSubjectKeys,counterBag:selection.counterBag}
  },[])
  useEffect(()=>{if(ready&&!session.question)setState(s=>saveSession(s,makeQuestion(s)))},[ready,session.question,makeQuestion])

  function switchDrill(drill:DrillId){
    if(view===drill)return
    setState(s=>{const next={...s,view:drill,activeDrill:drill};return next.drillSessions[drill].question?next:saveSession(next,makeQuestion(next,drill))})
  }
  function submit(value=session.input){
    const q=session.question;if(!q||session.feedback||!value.trim())return
    const result=adapters[q.drill].checkAnswer(q,value)
    setState(s=>{const p=structuredClone(s.progress),score=p.byDrill[q.drill];result.correct?(score.correct++,p.lifetime.correct++):(score.incorrect++,p.lifetime.incorrect++)
      let day=p.daily.find(d=>d.date===today());if(!day){day={date:today(),completed:0,correct:0};p.daily.push(day)}day.completed++;if(result.correct)day.correct++
      if(!result.correct&&q.drill==='counters')p.counterMistakes[q.progressKey]=(p.counterMistakes[q.progressKey]??0)+1
      return saveSession({...s,progress:p},{...s.drillSessions[s.activeDrill],input:value,feedback:result})
    })
  }
  function next(){setState(s=>saveSession(s,makeQuestion(s)));requestAnimationFrame(()=>inputRef.current?.focus())}
  function keyDown(e:React.KeyboardEvent){if(view==='flashcards'||view==='alphabet')return;if(e.key==='Enter'){e.preventDefault();session.feedback?next():submit()}}
  function changeSettings(patch:Partial<Settings>){setState(s=>{if((Object.keys(patch) as (keyof Settings)[]).every(key=>Object.is(s.settings[key],patch[key])))return s;const settings={...s.settings,...patch},nextState={...s,settings}
    const adapt=(session:ActiveSession):ActiveSession=>{if(!session.question)return session;const question=updateQuestion(session.question,settings,s.settings);if(!question)return makeQuestion(nextState,session.drill);if(question===session.question)return session;return {...session,question,input:session.feedback?session.input:'',feedback:session.feedback?{...session.feedback,canonical:question.canonical}:null}}
    const drillSessions={...s.drillSessions}
    for(const drill of DRILLS)drillSessions[drill]=adapt(s.drillSessions[drill])
    return {...nextState,drillSessions}})}
  async function applyUpdate(){await repository.save(stateRef.current);await updateServiceWorker(true)}

  const q=session.question,score=state.progress.byDrill[session.drill],total=score.correct+score.incorrect
  if(!ready||!q)return <div className="loading" role="status"><img src="/logo.svg" alt=""/><p>Preparing your practice…</p></div>
  return <div className={`app-shell${keyboardOpen?' keyboard-open':''}${view==='flashcards'||view==='alphabet'?' flashcards-open':''}`} onKeyDown={keyDown}>
    <header className="topbar"><h1>{APP_NAME}<span className="wordmark-mark" aria-hidden="true"><svg viewBox="-300 -300 600 600"><path fill="#cd2e3a" d="M-150 259.808A300 300 0 0 0 300 0a225 225 0 0 0-450 0z"/><path fill="#0047a0" d="M-150-259.808a300 300 0 0 0 0 519.616A150 150 0 0 0 0 0z"/><path fill="#ffc224" d="M0 0a150 150 0 0 1 300 0 300 300 0 0 0-450-259.908A150 150 0 0 0 0 0z"/></svg></span></h1><button className="icon-button" onClick={()=>setSettingsOpen(true)} hidden={view==='alphabet'} aria-label="Open settings">⌘</button></header>
    {needRefresh&&<aside className="update-banner"><div><strong>Update available</strong><span>Your place has been saved.</span></div><button onClick={()=>setNeedRefresh(false)}>Later</button><button className="dark" onClick={applyUpdate}>Update</button></aside>}
    <div hidden={view!=='flashcards'}><Flashcards session={state.flashcardSession} onChange={flashcardSession=>setState(s=>({...s,flashcardSession}))}/></div>
    <div hidden={view!=='alphabet'}><Alphabet session={state.alphabetSession} onChange={alphabetSession=>setState(current=>({...current,alphabetSession}))}/></div>
    <main className="practice-view" hidden={view==='flashcards'||view==='alphabet'}>
      <section className="progress-row" aria-label="Progress"><div><b>{total?Math.round(score.correct/total*100):'—'}{total?'%':''}</b><span>{labels[session.drill]} accuracy</span></div><div><b>{score.correct}</b><span>correct answers</span></div></section>
      <section className="practice-card">
        <div className="question-meta"><span>{q.promptLabel}</span><span>{q.meta?.system||q.meta?.format||''}</span></div>
        <div className="prompt-area">{q.meta?.swatch&&<div className="swatch" style={{background:String(q.meta.hex)}} aria-label="Color swatch"/>}<div className={q.drill==='counters'?'sentence-prompt':'main-prompt'}>{q.prompt}</div></div>
        {q.translation&&<button className="translation-toggle" onClick={()=>setState(s=>saveSession(s,{...s.drillSessions[s.activeDrill],translationVisible:!s.drillSessions[s.activeDrill].translationVisible}))}>{session.translationVisible?q.translation:'Reveal English translation'}</button>}
        <div className="answer-area">
          {state.settings.answerMode==='typing'?<label className="input-wrap"><span>Your answer</span><input ref={inputRef} autoFocus autoComplete="off" autoCapitalize="off" value={session.input} disabled={!!session.feedback} onChange={e=>setState(s=>saveSession(s,{...s.drillSessions[s.activeDrill],input:e.target.value}))} placeholder={q.drill==='time'&&q.meta?.digital?'e.g. 9:05':'Type your answer'}/></label>:
          <div className="choices">{q.choices?.map(choice=><button key={choice} disabled={!!session.feedback} className={session.feedback?(adapters[q.drill].checkAnswer(q,choice).correct?'right':session.input===choice?'wrong':''):''} onClick={()=>{setState(s=>saveSession(s,{...s.drillSessions[s.activeDrill],input:choice}));submit(choice)}}>{choice}</button>)}</div>}
          {session.feedback?<div className={`feedback ${session.feedback.correct?'correct':'incorrect'}`}><div><strong>{session.feedback.correct?'맞아요 · Correct':'Not quite'}</strong>{!session.feedback.correct&&<span>Answer: <b>{q.canonical}</b></span>}{session.feedback.note&&<span>{session.feedback.note}</span>}</div><button className="primary" onClick={next}>Next <kbd>Enter</kbd></button></div>:
          <div className="question-actions"><button className="skip" onClick={next}>Skip</button>{state.settings.answerMode==='typing'&&<button className="primary check" onClick={()=>submit()} disabled={!session.input.trim()}>Check <kbd>Enter</kbd></button>}</div>}
        </div>
      </section>
    </main>
    <nav className="tabs" aria-label="Practice sections">{DRILLS.map(id=><button key={id} className={view===id?'active':''} onClick={()=>switchDrill(id)}><span>{icons[id]}</span>{labels[id]}</button>)}<button className={view==='flashcards'?'active':''} onClick={()=>setView('flashcards')}><span>단어</span>Vocab</button><button className={view==='alphabet'?'active':''} onClick={()=>setView('alphabet')}><span>한글</span>Alphabet</button></nav>
    {settingsOpen&&view!=='alphabet'&&<SettingsPanel view={view} settings={state.settings} flashcardLessonIds={flashcardLessonIds} setFlashcardLessonIds={setFlashcardLessonIds} flashcardDirection={flashcardDirection} setFlashcardDirection={setFlashcardDirection} close={()=>setSettingsOpen(false)} change={changeSettings} installed={installed}/>}
  </div>
}

export function Flashcards({session,onChange}:{session:FlashcardSession;onChange:(session:FlashcardSession)=>void}){
  const {index,revealed:flipped,order,direction}=session
  const cards=flashcardDeck(session.lessonIds)
  const card=cards.find(card=>card.key===order[index])!,lesson=card.lesson
  const showEnglish=direction==='english'?!flipped:flipped
  const visible=showEnglish?card.english:card.korean,nextLanguage=showEnglish?'Korean':'English'
  function setFlipped(revealed:boolean){onChange({...session,revealed})}
  function move(offset:number){onChange({...session,index:(index+offset+order.length)%order.length,revealed:false})}
  function shuffleCards(){onChange({...session,order:shuffle(order),index:0,revealed:false})}
  return <main className="flashcards-view">
    <header className="flashcards-header"><div><p className="eyebrow">Vocabulary deck</p><h2>Flashcards</h2></div><button className="shuffle-button" onClick={shuffleCards}>Shuffle</button></header>
    <section className="flashcard-study"><div className="card-meta"><span>Lesson {lesson.number} · {lesson.koreanTitle}</span><span>{index+1} of {order.length}</span></div>
      <button className={`flashcard ${flipped?'flipped':''}`} onClick={()=>setFlipped(!flipped)} aria-label={`${visible}. ${flipped?'Show':'Reveal'} ${nextLanguage}`}><span className="card-side-label">{showEnglish?'English':'한국어'}</span><strong>{visible}</strong><small>Tap to {flipped?'show':'reveal'} {nextLanguage}</small></button>
      <div className="card-navigation"><button onClick={()=>move(-1)} aria-label="Previous card">← Previous</button><button className="primary" onClick={()=>flipped?move(1):setFlipped(true)}>{flipped?'Next →':'Reveal'}</button></div>
    </section>
  </main>
}

function SettingsPanel({view,settings,flashcardLessonIds,setFlashcardLessonIds,flashcardDirection,setFlashcardDirection,close,change,installed}:{view:DrillId|'flashcards';settings:Settings;flashcardLessonIds:string[];setFlashcardLessonIds:(ids:string[])=>void;flashcardDirection:'korean'|'english';setFlashcardDirection:(direction:'korean'|'english')=>void;close:()=>void;change:(p:Partial<Settings>)=>void;installed:boolean}){
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
function SettingGroup({label,children}:{label:string;children:React.ReactNode}){return <div className="setting-group"><label>{label}</label>{children}</div>}
function Segment({value,options,onChange}:{value:string;options:[string,string][];onChange:(v:string)=>void}){return <div className="segment">{options.map(([v,label])=><button key={v} className={v===value?'selected':''} onClick={()=>onChange(v)}>{label}</button>)}</div>}
