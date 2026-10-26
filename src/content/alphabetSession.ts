import { alphabet, letterGroups, type LetterGroup } from './alphabet'
import { shuffle } from '../lib/normalize'

export interface AlphabetSession {
  group:LetterGroup|'all'
  study:boolean
  order:string[]
  index:number
  revealed:boolean
}
export function createAlphabetSession(group:AlphabetSession['group']='all',study=true):AlphabetSession {
  const letters=alphabet.filter(letter=>group==='all'||letter.group===group).map(letter=>letter.letter)
  return {group,study,order:study?shuffle(letters):letters,index:0,revealed:false}
}
export function restoreAlphabetSession(raw:unknown):AlphabetSession {
  if(!raw||typeof raw!=='object')return createAlphabetSession()
  const saved=raw as Partial<AlphabetSession>
  const group=saved.group==='all'||letterGroups.some(item=>item.id===saved.group)?saved.group!:'all'
  const study=typeof saved.study==='boolean'?saved.study:true
  const expected=alphabet.filter(letter=>group==='all'||letter.group===group).map(letter=>letter.letter)
  if(!Array.isArray(saved.order)||saved.order.length!==expected.length||new Set(saved.order).size!==expected.length||!saved.order.every(letter=>expected.includes(letter)))return createAlphabetSession(group,study)
  return {group,study,order:saved.order,index:Number.isInteger(saved.index)&&saved.index!>=0&&saved.index!<expected.length?saved.index!:0,revealed:saved.revealed===true}
}
