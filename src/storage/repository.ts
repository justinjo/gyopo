import { restoreFlashcardSession } from '../content/flashcardSession'
import { restoreAlphabetSession } from '../content/alphabetSession'
import { restoreRecentSubjectKeys, subjectKey } from '../drills/selection'
import { createDrillSession, DRILLS, initialState } from '../config'
import type { ActiveSession, Direction, DrillId, PersistedState, Settings } from '../types'

const DB='gyopo-progress', STORE='state', KEY='main', DB_VERSION=2
const cloneInitial=()=>structuredClone(initialState)

function isDrill(value:unknown):value is DrillId {return DRILLS.includes(value as DrillId)}
function restoreDrillSession(raw:unknown,drill:DrillId):ActiveSession {
  const fresh=createDrillSession(drill)
  if(!raw||typeof raw!=='object')return fresh
  const saved=raw as Partial<ActiveSession>&{recentIds?:unknown}
  const question=saved.question?.drill===drill?saved.question:null
  const restoredQuestion=question?{...question,subjectKey:question.subjectKey??(question.subject?subjectKey(question.subject):restoreRecentSubjectKeys([question.id])[0]??'')}:null
  return {...fresh,question:restoredQuestion,input:typeof saved.input==='string'?saved.input:'',feedback:restoredQuestion?saved.feedback??null:null,translationVisible:saved.translationVisible===true,recentSubjectKeys:restoreRecentSubjectKeys(saved.recentSubjectKeys??saved.recentIds),counterBag:Array.isArray(saved.counterBag)?saved.counterBag.filter(id=>typeof id==='string'):[]}
}
function restoreSettings(raw:unknown):Settings {
  const fresh=initialState.settings
  if(!raw||typeof raw!=='object')return structuredClone(fresh)
  const {direction:legacyDirection,directions:savedDirections,...saved}=raw as Partial<Settings>&{direction?:unknown}
  const valid=(value:unknown):value is Direction=>value==='forward'||value==='reverse'||value==='mixed'
  const fallback=valid(legacyDirection)?legacyDirection:'mixed'
  const directions={...fresh.directions}
  for(const drill of Object.keys(directions) as (keyof Settings['directions'])[]){
    const value=savedDirections?.[drill]
    directions[drill]=valid(value)?value:fallback
  }
  return {...fresh,...saved,directions}
}
export function migrate(raw: unknown): PersistedState {
  if(!raw||typeof raw!=='object')return cloneInitial()
  const old=raw as Partial<Omit<PersistedState,'version'>>&{version?:number;session?:Partial<ActiveSession>}
  const fresh=cloneInitial()
  const activeDrill=isDrill(old.activeDrill)?old.activeDrill:isDrill(old.session?.drill)?old.session.drill:fresh.activeDrill
  const drillSessions={...fresh.drillSessions}
  for(const drill of DRILLS)drillSessions[drill]=restoreDrillSession(old.drillSessions?.[drill]??(old.session?.drill===drill?old.session:undefined),drill)
  return {
    version:4,
    view:[...DRILLS,'flashcards','alphabet'].includes(old.view??'')?old.view!:activeDrill,
    activeDrill,drillSessions,
    alphabetSession:restoreAlphabetSession(old.alphabetSession),
    flashcardSession:restoreFlashcardSession(old.flashcardSession),
    settings:restoreSettings(old.settings),
    progress:{...fresh.progress,...old.progress,lifetime:{...fresh.progress.lifetime,...old.progress?.lifetime},byDrill:{...fresh.progress.byDrill,...old.progress?.byDrill},daily:old.progress?.daily??[],counterMistakes:old.progress?.counterMistakes??{}},
  }
}
function openDb():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{const request=indexedDB.open(DB,DB_VERSION);request.onupgradeneeded=()=>{const db=request.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE)};request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)})}
export const repository={
  async load():Promise<PersistedState>{try{const db=await openDb();const raw=await new Promise<unknown>((resolve,reject)=>{const tx=db.transaction(STORE);const req=tx.objectStore(STORE).get(KEY);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)});db.close();return migrate(raw)}catch{return cloneInitial()}},
  async save(state:PersistedState):Promise<void>{const db=await openDb();await new Promise<void>((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put(state,KEY);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)});db.close()}
}
