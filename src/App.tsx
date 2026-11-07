import { Alphabet } from './Alphabet'
import { useEffect, useRef, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { effectiveAnswerMode } from './drills/answers'
import { adapters } from './drills'
import { APP_NAME, DRILLS, initialState } from './config'
import { createFlashcardSession, type FlashcardSession } from './content/flashcardSession'
import { repository } from './storage/repository'
import type { DrillId, PersistedState, SectionId, Settings } from './types'
import { Flashcards } from './Flashcards'
import { SettingsPanel } from './SettingsPanel'
import { drillLabels as labels, drillIcons as icons } from './drillPresentation'
import { changeSettings as updateSettings, makeQuestion, saveSession, selectDrill, submitAnswer } from './session'

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

  useEffect(()=>{if(ready&&!session.question)setState(s=>saveSession(s,makeQuestion(s)))},[ready,session.question])

  function switchDrill(drill:DrillId){setState(s=>selectDrill(s,drill))}
  function submit(value=session.input){setState(s=>submitAnswer(s,value))}
  function next(){setState(s=>saveSession(s,makeQuestion(s)));requestAnimationFrame(()=>inputRef.current?.focus())}
  function keyDown(e:React.KeyboardEvent){if(view==='flashcards'||view==='alphabet')return;if(e.key==='Enter'){e.preventDefault();session.feedback?next():submit()}}
  function changeSettings(patch:Partial<Settings>){setState(s=>updateSettings(s,patch))}
  async function applyUpdate(){await repository.save(stateRef.current);await updateServiceWorker(true)}

  const q=session.question,score=state.progress.byDrill[session.drill],total=score.correct+score.incorrect
  const answerMode=q?effectiveAnswerMode(state.settings.answerMode,q):state.settings.answerMode
  if(!ready||!q)return <div className="loading" role="status"><img src="/logo.svg" alt=""/><p>Preparing your practice…</p></div>
  return <div className={`app-shell${keyboardOpen?' keyboard-open':''}${view==='flashcards'||view==='alphabet'?' flashcards-open':''}`} onKeyDown={keyDown}>
    <header className="topbar"><h1>{APP_NAME}<span className="wordmark-mark" aria-hidden="true"><svg viewBox="-300 -300 600 600"><path fill="#cd2e3a" d="M-150 259.808A300 300 0 0 0 300 0a225 225 0 0 0-450 0z"/><path fill="#0047a0" d="M-150-259.808a300 300 0 0 0 0 519.616A150 150 0 0 0 0 0z"/><path fill="#ffc224" d="M0 0a150 150 0 0 1 300 0 300 300 0 0 0-450-259.908A150 150 0 0 0 0 0z"/></svg></span></h1><button className="icon-button" onClick={()=>setSettingsOpen(true)} hidden={view==='alphabet'} aria-label="Open settings">⌘</button></header>
    {needRefresh&&<aside className="update-banner"><div><strong>Update available</strong><span>Your place has been saved.</span></div><button onClick={()=>setNeedRefresh(false)}>Later</button><button className="dark" onClick={applyUpdate}>Update</button></aside>}
    <div hidden={view!=='flashcards'}><Flashcards session={state.flashcardSession} onChange={flashcardSession=>setState(s=>({...s,flashcardSession}))}/></div>
    <div hidden={view!=='alphabet'}><Alphabet session={state.alphabetSession} onChange={alphabetSession=>setState(current=>({...current,alphabetSession}))}/></div>
    <main className="practice-view" hidden={view==='flashcards'||view==='alphabet'}>
      <section className="progress-row" aria-label="Progress"><div><b>{total?Math.round(score.correct/total*100):'—'}{total?'%':''}</b><span>{labels[session.drill]} accuracy</span></div><div><b>{score.correct}</b><span>correct answers</span></div></section>
      <section className="practice-card">
        <div className="question-meta"><span>{q.promptLabel}</span><span>{q.drill==='numbers'?q.meta.system:q.drill==='time'?q.meta.format:''}</span></div>
        <div className="prompt-area">{q.drill==='colors'&&q.meta.swatch&&<div className="swatch" style={{background:q.meta.hex}} aria-label="Color swatch"/>}<div className={q.drill==='counters'?'sentence-prompt':'main-prompt'}>{q.prompt}</div></div>
        {q.translation&&<button className="translation-toggle" onClick={()=>setState(s=>saveSession(s,{...s.drillSessions[s.activeDrill],translationVisible:!s.drillSessions[s.activeDrill].translationVisible}))}>{session.translationVisible?q.translation:'Reveal English translation'}</button>}
        <div className="answer-area">
          {answerMode!==state.settings.answerMode&&<p role="status">Type your answer for this question; three distinct choices aren’t available.</p>}
          {answerMode==='typing'?<label className="input-wrap"><span>Your answer</span><input ref={inputRef} autoFocus autoComplete="off" autoCapitalize="off" value={session.input} disabled={!!session.feedback} onChange={e=>setState(s=>saveSession(s,{...s.drillSessions[s.activeDrill],input:e.target.value}))} placeholder={q.drill==='time'&&q.meta.digital?'e.g. 9:05':'Type your answer'}/></label>:
          <div className="choices">{q.choices?.map(choice=><button key={choice} disabled={!!session.feedback} className={session.feedback?(adapters[q.drill].checkAnswer(q,choice).correct?'right':session.input===choice?'wrong':''):''} onClick={()=>{setState(s=>saveSession(s,{...s.drillSessions[s.activeDrill],input:choice}));submit(choice)}}>{choice}</button>)}</div>}
          {session.feedback?<div className={`feedback ${session.feedback.correct?'correct':'incorrect'}`}><div><strong>{session.feedback.correct?'맞아요 · Correct':'Not quite'}</strong>{!session.feedback.correct&&<span>Answer: <b>{q.canonical}</b></span>}{session.feedback.note&&<span>{session.feedback.note}</span>}</div><button className="primary" onClick={next}>Next <kbd>Enter</kbd></button></div>:
          <div className="question-actions"><button className="skip" onClick={next}>Skip</button>{answerMode==='typing'&&<button className="primary check" onClick={()=>submit()} disabled={!session.input.trim()}>Check <kbd>Enter</kbd></button>}</div>}
        </div>
      </section>
    </main>
    <nav className="tabs" aria-label="Practice sections">{DRILLS.map(id=><button key={id} className={view===id?'active':''} onClick={()=>switchDrill(id)}><span>{icons[id]}</span>{labels[id]}</button>)}<button className={view==='flashcards'?'active':''} onClick={()=>setView('flashcards')}><span>단어</span>Vocab</button><button className={view==='alphabet'?'active':''} onClick={()=>setView('alphabet')}><span>한글</span>Alphabet</button></nav>
    {settingsOpen&&view!=='alphabet'&&<SettingsPanel view={view} settings={state.settings} flashcardLessonIds={flashcardLessonIds} setFlashcardLessonIds={setFlashcardLessonIds} flashcardDirection={flashcardDirection} setFlashcardDirection={setFlashcardDirection} close={()=>setSettingsOpen(false)} change={changeSettings} installed={installed}/>}
  </div>
}
