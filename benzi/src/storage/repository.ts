import { DRILLS, initialState } from '../config'
import type { PersistedState } from '../types'

const DB='benzi-progress', STORE='state', KEY='main', DB_VERSION=2
const cloneInitial=()=>structuredClone(initialState)

export function migrate(raw: unknown): PersistedState {
  if(!raw||typeof raw!=='object')return cloneInitial()
  const old=raw as Omit<Partial<PersistedState>,'view'>&{version?:number;view?:string}
  const fresh=cloneInitial()
  const session=old.session&&DRILLS.includes(old.session.drill)?{...fresh.session,...old.session}:fresh.session
  return {
    ...fresh,...old,version:2,
    view:old.view==='alphabet'?'flashcards':[...DRILLS,'flashcards'].includes(old.view??'')?old.view as PersistedState['view']:session.drill,
    settings:{...fresh.settings,...old.settings},
    progress:{...fresh.progress,...old.progress,lifetime:{...fresh.progress.lifetime,...old.progress?.lifetime},byDrill:{...fresh.progress.byDrill,...old.progress?.byDrill},daily:old.progress?.daily??[],counterMistakes:old.progress?.counterMistakes??{}},
    session
  }
}
function openDb():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{const request=indexedDB.open(DB,DB_VERSION);request.onupgradeneeded=()=>{const db=request.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE)};request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)})}
export const repository={
  async load():Promise<PersistedState>{try{const db=await openDb();const raw=await new Promise<unknown>((resolve,reject)=>{const tx=db.transaction(STORE);const req=tx.objectStore(STORE).get(KEY);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)});db.close();return migrate(raw)}catch{return cloneInitial()}},
  async save(state:PersistedState):Promise<void>{const db=await openDb();await new Promise<void>((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put(state,KEY);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)});db.close()}
}
