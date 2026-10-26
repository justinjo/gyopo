import { DRILLS, initialState } from '../config'
import type { PersistedState } from '../types'

const DB='gyopo-progress', STORE='state', KEY='main', DB_VERSION=2
const cloneInitial=()=>structuredClone(initialState)

export function migrate(raw: unknown): PersistedState {
  if(!raw||typeof raw!=='object')return cloneInitial()
  const old=raw as Partial<PersistedState>&{version?:number}
  const fresh=cloneInitial()
  return {
    ...fresh,...old,version:2,
    view:[...DRILLS,'flashcards','alphabet'].includes(old.view??'')?old.view!:old.session?.drill??fresh.view,
    settings:{...fresh.settings,...old.settings},
    progress:{...fresh.progress,...old.progress,lifetime:{...fresh.progress.lifetime,...old.progress?.lifetime},byDrill:{...fresh.progress.byDrill,...old.progress?.byDrill},daily:old.progress?.daily??[],counterMistakes:old.progress?.counterMistakes??{}},
    session:{...fresh.session,...old.session}
  }
}
function openDb():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{const request=indexedDB.open(DB,DB_VERSION);request.onupgradeneeded=()=>{const db=request.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE)};request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)})}
export const repository={
  async load():Promise<PersistedState>{try{const db=await openDb();const raw=await new Promise<unknown>((resolve,reject)=>{const tx=db.transaction(STORE);const req=tx.objectStore(STORE).get(KEY);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)});db.close();return migrate(raw)}catch{return cloneInitial()}},
  async save(state:PersistedState):Promise<void>{const db=await openDb();await new Promise<void>((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put(state,KEY);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)});db.close()}
}
