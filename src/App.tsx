import { useCallback, useEffect, useRef, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { adapters, validateCustomRange } from './drills'
import { APP_NAME, APP_VERSION, DRILLS, initialState } from './config'
import { flashcardLessons } from './content/flashcards'
import { repository } from './storage/repository'
import type { ActiveSession, DrillId, PersistedState, Settings } from './types'

const labels:Record<DrillId,string>={numbers:'Numbers',counters:'Counters',colors:'Colors',time:'Time',days:'Days'}
const icons:Record<DrillId,string>={numbers:'일',counters:'개',colors:'●',time:'시',days:'월'}
const today=()=>new Date().toLocaleDateString('en-CA')

export function App(){
  const [state,setState]=useState<PersistedState>(initialState)
  const [ready,setReady]=useState(false),[settingsOpen,setSettingsOpen]=useState(false)
  const [view,setView]=useState<DrillId|'flashcards'>('numbers')
  const [keyboardOpen,setKeyboardOpen]=useState(false)
  const [installed,setInstalled]=useState(matchMedia('(display-mode: standalone)').matches)
  const inputRef=useRef<HTMLInputElement>(null)
  const drillSessions=useRef<Partial<Record<DrillId,ActiveSession>>>({})
  const stateRef=useRef(state); stateRef.current=state
  const {needRefresh:[needRefresh,setNeedRefresh],updateServiceWorker}=useRegisterSW({immediate:true,onRegisteredSW(){},onRegisterError(error){console.error('Service worker registration failed',error)}})

  useEffect(()=>{repository.load().then(saved=>{setState(saved);setView(saved.session.drill);setReady(true)})},[])
  useEffect(()=>{if(ready)repository.save(state)},[state,ready])
  useEffect(()=>{const media=matchMedia('(display-mode: standalone)'),standalone=()=>setInstalled(media.matches);media.addEventListener('change',standalone);return()=>media.removeEventListener('change',standalone)},[])
  useEffect(()=>{const viewport=window.visualViewport;if(!viewport)return;let fullHeight=viewport.height
    const sync=()=>{const focused=document.activeElement instanceof HTMLInputElement,open=focused&&fullHeight-viewport.height>150
      if(!open)fullHeight=Math.max(fullHeight,viewport.height)
      document.documentElement.style.setProperty('--visual-viewport-height',`${viewport.height}px`)
      document.documentElement.classList.toggle('keyboard-visible',open)
      setKeyboardOpen(open)
      if(open)requestAnimationFrame(()=>window.scrollTo({top:0,left:0,behavior:'instant'}))
    }
    sync();viewport.addEventListener('resize',sync);viewport.addEventListener('scroll',sync);document.addEventListener('focusin',sync);document.addEventListener('focusout',sync)
    return()=>{viewport.removeEventListener('resize',sync);viewport.removeEventListener('scroll',sync);document.removeEventListener('focusin',sync);document.removeEventListener('focusout',sync);document.documentElement.classList.remove('keyboard-visible');document.documentElement.style.removeProperty('--visual-viewport-height')}
  },[])

  const makeQuestion=useCallback((base:PersistedState,drill=base.session.drill):ActiveSession=>{
    const context={settings:base.settings,recentIds:[...base.session.recentIds],counterBag:[...base.session.counterBag]}
    const question=adapters[drill].createQuestion(context)
    const recentIds=[question.id,...context.recentIds].slice(0,12)
    return {drill,question,input:'',feedback:null,translationVisible:false,recentIds,counterBag:context.counterBag}
  },[])
  useEffect(()=>{if(ready&&!state.session.question)setState(s=>({...s,session:makeQuestion(s)}))},[ready,state.session.question,makeQuestion])
  useEffect(()=>{if(state.session.question)drillSessions.current[state.session.drill]=state.session},[state.session])

  function switchDrill(drill:DrillId){
    if(view===drill)return
    setView(drill)
    setState(s=>{
      if(s.session.drill===drill)return s
      drillSessions.current[s.session.drill]=s.session
      const remembered=drillSessions.current[drill]
      return {...s,session:remembered??makeQuestion({...s,session:{...s.session,drill}},drill)}
    })
  }
  function submit(value=state.session.input){
    const q=state.session.question;if(!q||state.session.feedback||!value.trim())return
    const result=adapters[q.drill].checkAnswer(q,value)
    setState(s=>{const p=structuredClone(s.progress),score=p.byDrill[q.drill];result.correct?(score.correct++,p.lifetime.correct++):(score.incorrect++,p.lifetime.incorrect++)
      let day=p.daily.find(d=>d.date===today());if(!day){day={date:today(),completed:0,correct:0};p.daily.push(day)}day.completed++;if(result.correct)day.correct++
      if(!result.correct&&q.drill==='counters')p.counterMistakes[q.progressKey]=(p.counterMistakes[q.progressKey]??0)+1
      return {...s,progress:p,session:{...s.session,input:value,feedback:result}}
    })
  }
  function next(){setState(s=>({...s,session:makeQuestion(s)}));requestAnimationFrame(()=>inputRef.current?.focus())}
  function keyDown(e:React.KeyboardEvent){if(e.key==='Enter'){e.preventDefault();state.session.feedback?next():submit()}}
  function changeSettings(patch:Partial<Settings>){setState(s=>{const nextState={...s,settings:{...s.settings,...patch}};drillSessions.current={};return {...nextState,session:makeQuestion(nextState)}})}
  async function applyUpdate(){await repository.save(stateRef.current);await updateServiceWorker(true)}

  const q=state.session.question,score=state.progress.byDrill[state.session.drill],total=score.correct+score.incorrect
  if(!ready||!q)return <div className="loading"><span>교</span><p>Preparing your practice…</p></div>
  return <div className={`app-shell${keyboardOpen?' keyboard-open':''}`} onKeyDown={keyDown}>
    <header className="topbar"><h1>{APP_NAME}<span className="wordmark-mark" aria-hidden="true"><svg viewBox="-300 -300 600 600"><path fill="#cd2e3a" d="M-150 259.808A300 300 0 0 0 300 0a225 225 0 0 0-450 0z"/><path fill="#0047a0" d="M-150-259.808a300 300 0 0 0 0 519.616A150 150 0 0 0 0 0z"/><path fill="#ffc224" d="M0 0a150 150 0 0 1 300 0 300 300 0 0 0-450-259.908A150 150 0 0 0 0 0z"/></svg></span></h1><button className="icon-button" onClick={()=>setSettingsOpen(true)} aria-label="Open settings">⌘</button></header>
    {needRefresh&&<aside className="update-banner"><div><strong>Update available</strong><span>Your place has been saved.</span></div><button onClick={()=>setNeedRefresh(false)}>Later</button><button className="dark" onClick={applyUpdate}>Update</button></aside>}
    <div hidden={view!=='flashcards'}><Flashcards/></div>
    <main className="practice-view" hidden={view==='flashcards'}>
      <section className="progress-row" aria-label="Progress"><div><b>{total?Math.round(score.correct/total*100):'—'}{total?'%':''}</b><span>{labels[state.session.drill]} accuracy</span></div><div><b>{state.progress.lifetime.correct}</b><span>correct answers</span></div></section>
      <section className="practice-card">
        <div className="question-meta"><span>{q.promptLabel}</span><span>{q.meta?.system||q.meta?.gloss||q.meta?.format||''}</span></div>
        <div className="prompt-area">{q.meta?.swatch&&<div className="swatch" style={{background:String(q.meta.hex)}} aria-label="Color swatch"/>}<div className={q.drill==='counters'?'sentence-prompt':'main-prompt'}>{q.prompt}</div></div>
        {q.translation&&<button className="translation-toggle" onClick={()=>setState(s=>({...s,session:{...s.session,translationVisible:!s.session.translationVisible}}))}>{state.session.translationVisible?q.translation:'Reveal English translation'}</button>}
        <div className="answer-area">
          {state.settings.answerMode==='typing'?<label className="input-wrap"><span>Your answer</span><input ref={inputRef} autoFocus autoComplete="off" autoCapitalize="off" value={state.session.input} disabled={!!state.session.feedback} onChange={e=>setState(s=>({...s,session:{...s.session,input:e.target.value}}))} placeholder={q.drill==='time'&&q.meta?.digital?'e.g. 9:05':'Type your answer'}/></label>:
          <div className="choices">{q.choices?.map(choice=><button key={choice} disabled={!!state.session.feedback} className={state.session.feedback?(adapters[q.drill].checkAnswer(q,choice).correct?'right':state.session.input===choice?'wrong':''):''} onClick={()=>{setState(s=>({...s,session:{...s.session,input:choice}}));submit(choice)}}>{choice}</button>)}</div>}
          {state.session.feedback?<div className={`feedback ${state.session.feedback.correct?'correct':'incorrect'}`}><div><strong>{state.session.feedback.correct?'맞아요 · Correct':'Not quite'}</strong>{!state.session.feedback.correct&&<span>Answer: <b>{q.canonical}</b></span>}{state.session.feedback.note&&<span>{state.session.feedback.note}</span>}</div><button className="primary" onClick={next}>Next <kbd>Enter</kbd></button></div>:
          <div className="question-actions"><button className="skip" onClick={next}>Skip</button>{state.settings.answerMode==='typing'&&<button className="primary check" onClick={()=>submit()} disabled={!state.session.input.trim()}>Check <kbd>Enter</kbd></button>}</div>}
        </div>
      </section>
    </main>
    <nav className="tabs" aria-label="Practice sections">{DRILLS.map(id=><button key={id} className={view===id?'active':''} onClick={()=>switchDrill(id)}><span>{icons[id]}</span>{labels[id]}</button>)}<button className={view==='flashcards'?'active':''} onClick={()=>setView('flashcards')}><span>단어</span>Vocab</button></nav>
    {settingsOpen&&<SettingsPanel settings={state.settings} close={()=>setSettingsOpen(false)} change={changeSettings} installed={installed}/>} 
  </div>
}

function Flashcards(){
  const [lessonId,setLessonId]=useState(flashcardLessons[0].id),[index,setIndex]=useState(0),[flipped,setFlipped]=useState(false),[order,setOrder]=useState(()=>flashcardLessons[0].cards.map((_,i)=>i))
  const lesson=flashcardLessons.find(item=>item.id===lessonId)!,card=lesson.cards[order[index]]
  function chooseLesson(id:string){const next=flashcardLessons.find(item=>item.id===id)!;setLessonId(id);setOrder(next.cards.map((_,i)=>i));setIndex(0);setFlipped(false)}
  function move(offset:number){setIndex(current=>(current+offset+order.length)%order.length);setFlipped(false)}
  function shuffleCards(){setOrder(current=>{const next=[...current];for(let i=next.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[next[i],next[j]]=[next[j],next[i]]}return next});setIndex(0);setFlipped(false)}
  return <main className="flashcards-view">
    <header className="flashcards-header"><div><p className="eyebrow">Vocabulary deck</p><h2>Flashcards</h2></div><button className="shuffle-button" onClick={shuffleCards}>Shuffle</button></header>
    <div className="lesson-tabs" aria-label="Flashcard lessons">{flashcardLessons.map(item=><button key={item.id} className={item.id===lessonId?'selected':''} onClick={()=>chooseLesson(item.id)}><b>Lesson {item.number}</b><span>{item.title}</span></button>)}</div>
    <section className="flashcard-study"><div className="card-meta"><span>Lesson {lesson.number} · {lesson.koreanTitle}</span><span>{index+1} of {order.length}</span></div>
      <button className={`flashcard ${flipped?'flipped':''}`} onClick={()=>setFlipped(value=>!value)} aria-label={flipped?`${card.english}. Show Korean`:`${card.korean}. Reveal English`}><span className="card-side-label">{flipped?'English':'한국어'}</span><strong>{flipped?card.english:card.korean}</strong><small>{flipped?'Tap to show Korean':'Tap to reveal English'}</small></button>
      <div className="card-navigation"><button onClick={()=>move(-1)} aria-label="Previous card">← Previous</button><button className="primary" onClick={()=>flipped?move(1):setFlipped(true)}>{flipped?'Next →':'Reveal'}</button></div>
    </section>
  </main>
}

function SettingsPanel({settings,close,change,installed}:{settings:Settings;close:()=>void;change:(p:Partial<Settings>)=>void;installed:boolean}){
  const rangeError=validateCustomRange(settings.customMin,settings.customMax,settings.numberSystem)
  return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)close()}}><section className="settings-panel" role="dialog" aria-modal="true" aria-label="Settings"><header><div><p className="eyebrow">Make it yours</p><h2>Practice settings</h2></div><button className="icon-button" onClick={close} aria-label="Close settings">×</button></header>
    <SettingGroup label="Answer style"><Segment value={settings.answerMode} options={[['typing','Typing'],['choice','3 choices']]} onChange={answerMode=>change({answerMode:answerMode as Settings['answerMode']})}/></SettingGroup>
    <SettingGroup label="Direction"><Segment value={settings.direction} options={[['mixed','Mixed'],['forward','To Korean'],['reverse','From Korean']]} onChange={direction=>change({direction:direction as Settings['direction']})}/></SettingGroup>
    <SettingGroup label="Number system"><Segment value={settings.numberSystem} options={[['mixed','Mixed'],['sino','Sino'],['native','Native']]} onChange={numberSystem=>change({numberSystem:numberSystem as Settings['numberSystem']})}/><select value={settings.numberPreset} onChange={e=>change({numberPreset:e.target.value as Settings['numberPreset']})}><option value="small">Small · 0–99</option><option value="medium">Medium · 0–9,999</option><option value="large">Large · 10,000–999m</option><option value="custom">Custom range</option></select>{settings.numberPreset==='custom'&&<><div className="range"><input type="number" value={settings.customMin} onChange={e=>change({customMin:Number(e.target.value)})}/><span>to</span><input type="number" value={settings.customMax} onChange={e=>change({customMax:Number(e.target.value)})}/></div>{rangeError&&<p className="error">{rangeError}</p>}</>}</SettingGroup>
    <SettingGroup label="Counter level"><Segment value={settings.counterLevel} options={[['all','All'],['beginner','A1–A2'],['intermediate','B1–B2']]} onChange={counterLevel=>change({counterLevel:counterLevel as Settings['counterLevel']})}/></SettingGroup>
    <SettingGroup label="Time format"><Segment value={settings.timeFormat} options={[['mixed','Mixed'],['12','12 hour'],['24','24 hour']]} onChange={timeFormat=>change({timeFormat:timeFormat as Settings['timeFormat']})}/></SettingGroup>
    <footer><span>v{APP_VERSION} · {installed?'Installed':'Web app'}</span><p>Progress stays on this device. Uninstalling or clearing site data can remove it.</p></footer>
  </section></div>
}
function SettingGroup({label,children}:{label:string;children:React.ReactNode}){return <div className="setting-group"><label>{label}</label>{children}</div>}
function Segment({value,options,onChange}:{value:string;options:[string,string][];onChange:(v:string)=>void}){return <div className="segment">{options.map(([v,label])=><button key={v} className={v===value?'selected':''} onClick={()=>onChange(v)}>{label}</button>)}</div>}
