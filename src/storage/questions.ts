import { colors } from '../content/colors'
import { counters } from '../content/counters'
import { days } from '../content/days'
import { adapters } from '../drills'
import { checkAnswer } from '../drills/answers'
import type { AcceptedAnswer, DrillId, Question, QuestionSubject, Settings } from '../types'

const record=(value:unknown):Record<string,unknown>=>value&&typeof value==='object'?value as Record<string,unknown>:{}
const integer=(value:unknown,min:number,max:number):value is number=>typeof value==='number'&&Number.isInteger(value)&&value>=min&&value<=max

// Legacy inference is confined to loading saved data. Runtime questions always have a typed subject.
function restoreSubject(raw:Record<string,unknown>,drill:DrillId):QuestionSubject|null {
  const saved=record(raw.subject),meta=record(raw.meta)
  if(raw.subject&&saved.drill!==drill)return null
  const id=typeof raw.id==='string'?raw.id:''
  const reverse=typeof saved.reverse==='boolean'?saved.reverse:typeof meta.reverse==='boolean'?meta.reverse:drill==='time'?meta.digital===true||/-digital-/.test(id):drill==='colors'?meta.swatch===false||/-en-/.test(id):raw.promptLabel==='Write the number'||raw.promptLabel==='Write the day in English'||/-reverse-/.test(id)||/-en-/.test(id)
  const entryId=typeof saved.entryId==='string'?saved.entryId:typeof raw.progressKey==='string'?raw.progressKey:typeof raw.subjectKey==='string'?raw.subjectKey.slice(raw.subjectKey.indexOf(':')+1):''
  switch(drill){
    case 'numbers':{
      const match=/^number-(native|sino)-(\d+)-/.exec(id)
      const system=saved.system??meta.system??match?.[1]
      const value=saved.value??meta.value??(match?Number(match[2]):undefined)
      if((system!=='native'&&system!=='sino')||!integer(value,0,system==='native'?99:999_999_999))return null
      const zeroWord=saved.zeroWord==='공'||raw.prompt==='공'||raw.canonical==='공'?'공':'영'
      return {drill,value,system,reverse,...(system==='native'&&value===0?{zeroWord}:{})}
    }
    case 'colors':return colors.some(entry=>entry.id===entryId)?{drill,entryId,reverse}:null
    case 'days':return days.some(entry=>entry.id===entryId)?{drill,entryId,reverse}:null
    case 'counters':{
      const entry=counters.find(entry=>entry.id===entryId)
      if(!entry)return null
      const exampleIndex=saved.exampleIndex??Math.max(0,entry.examples.findIndex(example=>example.sentence===raw.prompt))
      return integer(exampleIndex,0,entry.examples.length-1)?{drill,entryId,exampleIndex}:null
    }
    case 'time':{
      const match=/^time-(\d+)-(\d+)-(12|24)-/.exec(id)
      const hour=saved.hour??meta.hour??(match?Number(match[1]):undefined)
      const minute=saved.minute??meta.minute??(match?Number(match[2]):undefined)
      const format=saved.format??meta.format??match?.[3]
      return integer(hour,0,23)&&integer(minute,0,59)&&(format==='12'||format==='24')?{drill,hour,minute,format,reverse}:null
    }
  }
}
export function restoreQuestion(value:unknown,drill:DrillId,settings:Settings):Question|null {
  const raw=record(value)
  if(raw.drill!==drill||typeof raw.id!=='string'||!raw.id)return null
  const subject=restoreSubject(raw,drill)
  if(!subject)return null
  const fresh=adapters[drill].buildQuestion(subject,settings)
  // Preserve the displayed question and choices, including feedback-related aliases, across reloads.
  const accepted=Array.isArray(raw.accepted)?raw.accepted.filter((answer):answer is AcceptedAnswer=>{
    const item=record(answer)
    return typeof item.value==='string'&&(item.label===undefined||typeof item.label==='string')
  }):[]
  const savedCanonical=typeof raw.canonical==='string'?raw.canonical:fresh.canonical
  const savedAccepted=accepted.length?accepted:fresh.accepted
  const consistent=checkAnswer({canonical:savedCanonical,accepted:savedAccepted,normalization:fresh.normalization},savedCanonical).correct
  const canonical=consistent?savedCanonical:fresh.canonical
  return {...fresh,id:raw.id,prompt:typeof raw.prompt==='string'?raw.prompt:fresh.prompt,promptLabel:typeof raw.promptLabel==='string'?raw.promptLabel:fresh.promptLabel,canonical,accepted:consistent?savedAccepted:fresh.accepted,choices:Array.isArray(raw.choices)&&raw.choices.every(choice=>typeof choice==='string')?[...raw.choices]:fresh.choices,translation:typeof raw.translation==='string'?raw.translation:fresh.translation}
}
