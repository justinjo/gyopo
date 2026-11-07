import { DRILLS } from './config'
import { adapters, updateQuestion } from './drills'
import type { ActiveSession, DrillId, PersistedState, Settings } from './types'

export function saveSession(state:PersistedState,session:ActiveSession):PersistedState {
  return {...state,drillSessions:{...state.drillSessions,[session.drill]:session}}
}
export function makeQuestion(state:PersistedState,drill:DrillId=state.activeDrill):ActiveSession {
  const previous=state.drillSessions[drill]
  const selection=adapters[drill].selectNext({settings:state.settings,recentSubjectKeys:previous.recentSubjectKeys,counterBag:previous.counterBag})
  const question=adapters[drill].buildQuestion(selection.subject,state.settings)
  return {drill,question,input:'',feedback:null,translationVisible:false,recentSubjectKeys:[question.subjectKey,...previous.recentSubjectKeys].slice(0,12),counterBag:selection.counterBag}
}
export function selectDrill(state:PersistedState,drill:DrillId):PersistedState {
  if(state.view===drill)return state
  const next={...state,view:drill,activeDrill:drill}
  return next.drillSessions[drill].question?next:saveSession(next,makeQuestion(next,drill))
}
export function submitAnswer(state:PersistedState,value:string,date=new Date().toLocaleDateString('en-CA')):PersistedState {
  const session=state.drillSessions[state.activeDrill],question=session.question
  if(!question||session.feedback||!value.trim())return state
  const result=adapters[question.drill].checkAnswer(question,value)
  const progress=structuredClone(state.progress),score=progress.byDrill[question.drill]
  if(result.correct){score.correct++;progress.lifetime.correct++}else{score.incorrect++;progress.lifetime.incorrect++}
  let activity=progress.daily.find(day=>day.date===date)
  if(!activity){activity={date,completed:0,correct:0};progress.daily.push(activity)}
  activity.completed++;if(result.correct)activity.correct++
  if(!result.correct&&question.drill==='counters'){
    const id=question.subject.entryId
    progress.counterMistakes[id]=(progress.counterMistakes[id]??0)+1
  }
  return saveSession({...state,progress},{...session,input:value,feedback:result})
}
export function changeSettings(state:PersistedState,patch:Partial<Settings>):PersistedState {
  if((Object.keys(patch) as (keyof Settings)[]).every(key=>Object.is(state.settings[key],patch[key])))return state
  const settings={...state.settings,...patch},next={...state,settings}
  const drillSessions={...state.drillSessions}
  for(const drill of DRILLS){
    const session=state.drillSessions[drill]
    if(!session.question)continue
    const question=updateQuestion(session.question,settings,state.settings)
    if(!question)drillSessions[drill]=makeQuestion(next,drill)
    else if(question!==session.question)drillSessions[drill]={...session,question,input:session.feedback?session.input:'',feedback:session.feedback?{...session.feedback,canonical:question.canonical}:null}
  }
  return {...next,drillSessions}
}
