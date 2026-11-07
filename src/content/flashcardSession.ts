import { flashcardLessons } from './flashcards'

export interface FlashcardSession {
  lessonIds:string[]
  direction:'korean'|'english'
  order:string[]
  index:number
  revealed:boolean
}
export function flashcardDeck(lessonIds:readonly string[]) {
  return flashcardLessons.filter(lesson=>lessonIds.includes(lesson.id)).flatMap(lesson=>lesson.cards.map(card=>({...card,lesson,key:`${lesson.id}:${card.korean}`})))
}
function validLessons(raw:unknown):string[] {
  const selected=Array.isArray(raw)?flashcardLessons.filter(lesson=>raw.includes(lesson.id)).map(lesson=>lesson.id):[]
  return selected.length?selected:[flashcardLessons[0].id]
}
export function createFlashcardSession(lessonIds:readonly string[]=[flashcardLessons[0].id],direction:FlashcardSession['direction']='korean'):FlashcardSession {
  const selected=validLessons(lessonIds)
  return {lessonIds:selected,direction,order:flashcardDeck(selected).map(card=>card.key),index:0,revealed:false}
}
export function restoreFlashcardSession(raw:unknown):FlashcardSession {
  if(!raw||typeof raw!=='object')return createFlashcardSession()
  const saved=raw as Partial<FlashcardSession>
  const fresh=createFlashcardSession(validLessons(saved.lessonIds),saved.direction==='english'?'english':'korean')
  const expected=new Set(fresh.order)
  if(!Array.isArray(saved.order)||saved.order.length!==expected.size||new Set(saved.order).size!==expected.size||!saved.order.every(key=>expected.has(key)))return fresh
  const validIndex=Number.isInteger(saved.index)&&saved.index!>=0&&saved.index!<saved.order.length
  return {...fresh,order:[...saved.order],index:validIndex?saved.index!:0,revealed:validIndex&&saved.revealed===true}
}
