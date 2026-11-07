import { shuffle } from '../lib/normalize'
import type { QuestionSubject } from '../types'

// Subject identity ignores presentation direction, answer style, and timestamps.
export function subjectKey(subject:QuestionSubject):string {
  switch(subject.drill){
    case 'numbers':return `numbers:${subject.system}:${subject.value}`
    case 'time':return `time:${subject.hour}:${subject.minute}`
    default:return `${subject.drill}:${subject.entryId}`
  }
}

export function randomInteger(min:number,max:number):number {
  if(!Number.isInteger(min)||!Number.isInteger(max)||max<min)throw new RangeError('Expected a nonempty integer range')
  return min+Math.floor(Math.random()*(max-min+1))
}

// History is newest first. Relax the oldest exclusion first for tiny pools.
export function selectRandom<T>(items:readonly T[],key:(item:T)=>string,recent:readonly string[]=[],cooldown=0):T {
  if(!items.length)throw new RangeError('Cannot select from an empty pool')
  for(let count=Math.min(cooldown,recent.length);count>=0;count--){
    const excluded=new Set(recent.slice(0,count))
    const eligible=items.filter(item=>!excluded.has(key(item)))
    if(eligible.length)return eligible[randomInteger(0,eligible.length-1)]!
  }
  throw new Error('No eligible item')
}

export function selectFromBag(eligible:readonly string[],remaining:readonly string[],previous?:string):{item:string;remaining:string[]} {
  if(!eligible.length)throw new RangeError('Cannot select from an empty pool')
  const allowed=new Set(eligible)
  let bag=[...new Set(remaining.filter(id=>allowed.has(id)))]
  if(!bag.length)bag=shuffle([...allowed])
  // Avoid a repeat at a refill boundary without discarding any subjects.
  if(bag[0]===previous&&bag.length>1){
    const next=bag.findIndex(id=>id!==previous)
    const first=bag[0]!
    bag[0]=bag[next]!
    bag[next]=first
  }
  return {item:bag[0]!,remaining:bag.slice(1)}
}

// Compatibility belongs at the storage boundary; generators only see subject keys.
export function restoreRecentSubjectKeys(raw:unknown):string[] {
  if(!Array.isArray(raw))return []
  return raw.flatMap(value=>{
    if(typeof value!=='string')return []
    if(/^(numbers:(native|sino):\d+|time:\d+:\d+|(colors|days|counters):[^:]+)$/.test(value))return [value]
    let match=/^number-(native|sino)-(\d+)-(?:forward|reverse)-\d+$/.exec(value)
    if(match)return [`numbers:${match[1]}:${match[2]}`]
    match=/^time-(\d+)-(\d+)-(?:12|24)-(?:digital|korean)-\d+$/.exec(value)
    if(match)return [`time:${Number(match[1])}:${Number(match[2])}`]
    match=/^(color|day)-(.+)-(?:en|ko)-\d+$/.exec(value)
    if(match)return [`${match[1]==='color'?'colors':'days'}:${match[2]}`]
    match=/^counter-(.+)-\d+$/.exec(value)
    return match?[`counters:${match[1]}`]:[]
  }).slice(0,12)
}
