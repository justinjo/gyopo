import type { DirectionalDrillId, DrillAdapter, DrillContext, Question, QuestionSubject, Settings } from '../types'
import { sample, shuffle } from '../lib/normalize'
import { parseIntegerAnswer, toNativeKorean, toSinoKorean } from '../lib/koreanNumbers'
import { colors } from '../content/colors'
import { counters } from '../content/counters'
import { days } from '../content/days'
import { randomInteger, selectFromBag, selectRandom, subjectKey } from './selection'
import { buildChoices, checkAnswer as check } from './answers'
import { digitalTime, digitalTimeAliases, koreanTime, timeAliases } from '../lib/time'

const actualDirection = (settings: Settings, drill:DirectionalDrillId) => settings.directions[drill] === 'mixed' ? sample(['forward','reverse'] as const) : settings.directions[drill]

function numberRange(s: Settings, native: boolean): [number, number] {
  if(s.numberPreset==='custom'&&(!Number.isInteger(s.customMin)||!Number.isInteger(s.customMax)))return native?[0,99]:[0,9999]
  if (native) {
    const min=Math.max(0, s.numberPreset === 'custom' ? s.customMin : 0),max=Math.min(99, s.numberPreset === 'custom' ? s.customMax : 99)
    return min<=max?[min,max]:[0,99]
  }
  if (s.numberPreset === 'custom') { const min=Math.max(0,s.customMin),max=Math.min(999_999_999,s.customMax);return min<=max?[min,max]:[0,9999] }
  return s.numberPreset === 'small' ? [0,99] : s.numberPreset === 'large' ? [0,999_999] : s.numberPreset === 'extra-large' ? [1_000_000,999_999_999] : [0,9999]
}
function nearbyNumbers(n:number,min:number,max:number): number[] {
  const offsets = shuffle([-100,-20,-10,-2,-1,1,2,10,20,100])
  return [...offsets.map(x=>n+x),min,min+1,max-1,max].filter(x=>x!==n&&x>=min&&x<=max)
}
const numbers: DrillAdapter = {
  id:'numbers',label:'Numbers',checkAnswer:check,
  selectNext({settings,counterBag}:DrillContext) {
    const native=settings.numberSystem==='mixed'?Math.random()<.35:settings.numberSystem==='native'
    const [min,max]=numberRange(settings,native)
    return {subject:{drill:'numbers',value:randomInteger(min,max),system:native?'native':'sino',reverse:actualDirection(settings,'numbers')==='reverse'},counterBag:[...counterBag]}
  },
  buildQuestion(subject:QuestionSubject,settings:Settings):Question {
    if(subject.drill!=='numbers')throw new Error('Expected a number subject')
    const {value:n,reverse}=subject,native=subject.system==='native'
    const [validMin,validMax]=numberRange(settings,native)
    const word=native?n===0?sample(['영','공']):toNativeKorean(n):toSinoKorean(n)
    const direction=reverse?'reverse':'forward'
    const canonical = reverse ? String(n) : word
    const candidates = nearbyNumbers(n,validMin,validMax).map(x => reverse ? String(x) : native ? toNativeKorean(x) : toSinoKorean(x))
    const accepted = !reverse && native && n === 0 ? [{value:'영'},{value:'공'}] : [{value:canonical}]
    return { subject,subjectKey:subjectKey(subject),id:`number-${native?'native':'sino'}-${n}-${direction}-${Date.now()}`,drill:'numbers',prompt:reverse?word:n.toLocaleString(),promptLabel:reverse?'Write the number':'Write it in Korean',canonical,accepted,choices:buildChoices({canonical,accepted},candidates),progressKey:native?'native':'sino',meta:{value:n,system:native?'native':'sino',reverse} }
  }
}

const colorAdapter: DrillAdapter = {
  id:'colors',label:'Colors',checkAnswer:check,
  selectNext({settings,recentSubjectKeys,counterBag}:DrillContext) {
    const entry=selectRandom(colors,entry=>`colors:${entry.id}`,recentSubjectKeys.filter(key=>key.startsWith('colors:')),2)
    return {subject:{drill:'colors',entryId:entry.id,reverse:actualDirection(settings,'colors')==='reverse'},counterBag:[...counterBag]}
  },
  buildQuestion(subject:QuestionSubject,settings:Settings):Question {
    if(subject.drill!=='colors')throw new Error('Expected a color subject')
    const entry=colors.find(c=>c.id===subject.entryId)!,reverse=subject.reverse
    const forms=(color:typeof entry)=>reverse?[color.english,...color.aliasesEn]:[color.korean,...color.aliasesKo]
    const choiceForms=(color:typeof entry)=>reverse?forms(color):forms(color).filter(value=>value.endsWith('색'))
    const canonical=settings.answerMode==='choice'?sample(choiceForms(entry)):forms(entry)[0]!
    const accepted=(reverse?[entry.english,...entry.aliasesEn]:[entry.korean,...entry.aliasesKo]).map(value=>({value}))
    const candidates=colors.filter(c=>c.id!==entry.id).map(c=>sample(choiceForms(c)))
    return {subject,subjectKey:subjectKey(subject),id:`color-${entry.id}-${reverse?'en':'ko'}-${Date.now()}`,drill:'colors',prompt:reverse?entry.korean:'',promptLabel:reverse?'Write the color in English':'Write the color in Korean',canonical,accepted,choices:buildChoices({canonical,accepted},candidates),progressKey:entry.id,meta:{hex:entry.hex,swatch:!reverse,reverse}}
  }
}

// Exclude units that can plausibly fill the same sentence, even when their
// meaning differs from the example translation (which is hidden by default).
const ambiguousCounterGroups = [
  ['years','months','days','hours','minutes'],
  ['people','people-honor'],
  ['things','animals','books','bottles','cups','sheets','vehicles','clothes','pairs','houses','flowers','trees','pieces','drops','spoonfuls','mouthfuls','songs','films','letters','meals'],
  ['bottles','cups','drops','spoonfuls','mouthfuls'],
  ['times','films','books','songs','chapters','years','months','days','hours','minutes'],
]
export function counterDistractors(id:string) {
  const excluded=new Set(ambiguousCounterGroups.filter(group=>group.includes(id)).flat())
  excluded.add(id)
  const excludedForms=new Set(counters.filter(entry=>excluded.has(entry.id)).map(entry=>entry.counter))
  return counters.filter(entry=>!excludedForms.has(entry.counter))
}

function eligibleCounters(settings:Settings) {
  return counters.filter(c=>settings.counterLevel==='all'||(settings.counterLevel==='beginner'?['A1','A2']:['B1','B2']).includes(c.level))
}

const counterAdapter: DrillAdapter = {
  id:'counters',label:'Counters',checkAnswer:check,
  selectNext({settings,recentSubjectKeys,counterBag}:DrillContext) {
    const eligible=eligibleCounters(settings)
    const previous=recentSubjectKeys.find(key=>key.startsWith('counters:'))?.slice('counters:'.length)
    const {item:id,remaining}=selectFromBag(eligible.map(c=>c.id),counterBag,previous)
    const entry=eligible.find(c=>c.id===id)!
    return {subject:{drill:'counters',entryId:entry.id,exampleIndex:randomInteger(0,entry.examples.length-1)},counterBag:remaining}
  },
  buildQuestion(subject:QuestionSubject,settings:Settings):Question {
    if(subject.drill!=='counters')throw new Error('Expected a counter subject')
    const eligible=eligibleCounters(settings)
    const id=subject.entryId,entry=counters.find(c=>c.id===id)!,example=entry.examples[subject.exampleIndex]!
    const alternative=id==='people'?{value:'분',label:'Note: 명 is the neutral people counter; 분 is the honorific people counter.'}:id==='people-honor'?{value:'명',label:'Note: 명 is the neutral people counter; 분 is the honorific people counter.'}:id==='mouthfuls'?{value:'병',label:'Note: 모금 counts sips; 병 counts bottles.'}:null
    const accepted=[entry.counter,...(example.aliases??[])].map(value=>({value,label:undefined as string|undefined}));if(alternative)accepted.push(alternative)
    const equivalentCounters=alternative?new Set([entry.counter,alternative.value]):null
    const safeIds=new Set(counterDistractors(id).map(c=>c.id))
    let candidates=eligible.filter(c=>safeIds.has(c.id)&&!equivalentCounters?.has(c.counter)).map(c=>c.counter)
    // A strict level filter can leave fewer than two distinct safe distractors.
    if(new Set(candidates).size<2)candidates=counterDistractors(id).filter(c=>!equivalentCounters?.has(c.counter)).map(c=>c.counter)
    return {subject,subjectKey:subjectKey(subject),id:`counter-${id}-${Date.now()}`,drill:'counters',prompt:example.sentence,promptLabel:`Fill in the counter · ${entry.level}`,canonical:entry.counter,accepted,choices:buildChoices({canonical:entry.counter,accepted},candidates),translation:example.translation,progressKey:id,meta:{gloss:entry.gloss}}
  }
}

const timeAdapter: DrillAdapter = {
  id:'time',label:'Time',checkAnswer:check,
  selectNext({settings,counterBag}:DrillContext) {
    const hour=randomInteger(0,23),minute=randomInteger(0,59)
    const format=settings.timeFormat==='mixed'?sample(['12','24'] as const):settings.timeFormat
    return {subject:{drill:'time',hour,minute,format,reverse:actualDirection(settings,'time')==='reverse'},counterBag:[...counterBag]}
  },
  buildQuestion(subject:QuestionSubject,_settings:Settings):Question {
    if(subject.drill!=='time')throw new Error('Expected a time subject')
    const {hour,minute,format,reverse}=subject,digital=digitalTime(hour,minute,format),words=koreanTime(hour,minute,format)
    const canonical=reverse?digital:words
    const accepted=reverse?digitalTimeAliases(hour,minute,format).map(value=>({value})):timeAliases(hour,minute,format).map(value=>({value}))
    const alternatives=[1,2,5,10,15].map(x=>reverse?digitalTime((hour+x)%24,minute,format):koreanTime((hour+x)%24,minute,format))
    return {subject,subjectKey:subjectKey(subject),id:`time-${hour}-${minute}-${format}-${directionLabel(reverse)}-${Date.now()}`,drill:'time',prompt:reverse?words:digital,promptLabel:reverse?'Write the digital time':`${format}-hour Korean reading`,canonical,accepted,choices:buildChoices({canonical,accepted,meta:{digital:reverse}},alternatives),progressKey:format,meta:{digital:reverse,format,hour,minute,reverse}}
  }
}
const dayAdapter: DrillAdapter = {
  id:'days',label:'Days',checkAnswer:check,
  selectNext({settings,recentSubjectKeys,counterBag}:DrillContext) {
    const entry=selectRandom(days,entry=>`days:${entry.id}`,recentSubjectKeys.filter(key=>key.startsWith('days:')),2)
    return {subject:{drill:'days',entryId:entry.id,reverse:actualDirection(settings,'days')==='reverse'},counterBag:[...counterBag]}
  },
  buildQuestion(subject:QuestionSubject,_settings:Settings):Question {
    if(subject.drill!=='days')throw new Error('Expected a weekday subject')
    const entry=days.find(day=>day.id===subject.entryId)!,reverse=subject.reverse
    const canonical=reverse?entry.english:entry.korean
    const candidates=days.filter(day=>day.id!==entry.id).map(day=>reverse?day.english:day.korean)
    const accepted=[{value:canonical}]
    return {subject,subjectKey:subjectKey(subject),id:`day-${entry.id}-${reverse?'en':'ko'}-${Date.now()}`,drill:'days',prompt:reverse?entry.korean:entry.english,promptLabel:reverse?'Write the day in English':'Write the day in Korean',canonical,accepted,choices:buildChoices({canonical,accepted},candidates),progressKey:entry.id,meta:{reverse}}
  }
}
function directionLabel(reverse:boolean){return reverse?'digital':'korean'}

export const adapters:Record<string,DrillAdapter>={numbers,counters:counterAdapter,colors:colorAdapter,time:timeAdapter,days:dayAdapter}
export function validateCustomRange(min:number,max:number,system:Settings['numberSystem']):string|null {
  if(!Number.isInteger(min)||!Number.isInteger(max))return 'Use whole numbers.'
  if(min>max)return 'Minimum must be no greater than maximum.'
  if(min<0||max>999_999_999)return 'Range must stay between 0 and 999,999,999.'
  if(system==='native'&&(min<0||max>99))return 'Native Korean numbers range from 0 to 99.'
  return null
}
export { parseIntegerAnswer }

// Return null only when the current subject no longer fits the selected settings.
export function updateQuestion(question:Question,settings:Settings,previous:Settings):Question|null {
  if(question.drill==='counters') {
    const entry=counters.find(c=>c.id===question.progressKey)
    return settings.counterLevel==='all'||entry&&(settings.counterLevel==='beginner'?['A1','A2']:['B1','B2']).includes(entry.level)?question:null
  }
  if(question.drill==='numbers') {
    const native=settings.numberSystem==='mixed'?question.meta?.system==='native':settings.numberSystem==='native'
    const [min,max]=numberRange(settings,native),n=Number(question.meta?.value)
    if(n<min||n>max)return null
  }
  const direction=settings.directions[question.drill]
  const directionChanged=direction!==previous.directions[question.drill]
  const systemChanged=question.drill==='numbers'&&settings.numberSystem!==previous.numberSystem
  const formatChanged=question.drill==='time'&&settings.timeFormat!==previous.timeFormat
  const choicesChanged=question.drill==='colors'&&settings.answerMode!==previous.answerMode
  const rangeChanged=question.drill==='numbers'&&(settings.numberPreset!==previous.numberPreset||settings.customMin!==previous.customMin||settings.customMax!==previous.customMax)
  if(!directionChanged&&!systemChanged&&!formatChanged&&!choicesChanged&&!rangeChanged)return question
  // Recover clock values from questions saved before source metadata was added.
  if(question.drill==='time'&&question.meta?.hour===undefined){const match=/^time-(\d+)-(\d+)-/.exec(question.id);if(!match)return question;question={...question,meta:{...question.meta,hour:Number(match[1]),minute:Number(match[2])}}}
  const subject=subjectFromQuestion(question)
  if('reverse' in subject&&direction!=='mixed')subject.reverse=direction==='reverse'
  if(subject.drill==='numbers'&&settings.numberSystem!=='mixed')subject.system=settings.numberSystem
  if(subject.drill==='time'&&settings.timeFormat!=='mixed')subject.format=settings.timeFormat
  const updated=adapters[question.drill].buildQuestion(subject,settings)
  return {...updated,id:question.id}
}

// Older saved questions predate explicit subjects. Reconstruct them without selecting anew.
export function subjectFromQuestion(question:Question):QuestionSubject {
  if(question.subject)return {...question.subject}
  const reverse=!!(question.meta?.reverse??(question.drill==='time'?question.meta?.digital:question.drill==='colors'?!question.meta?.swatch:question.promptLabel==='Write the number'||question.promptLabel==='Write the day in English'))
  switch(question.drill){
    case 'numbers':return {drill:'numbers',value:Number(question.meta?.value),system:question.meta?.system==='native'?'native':'sino',reverse}
    case 'colors':case 'days':return {drill:question.drill,entryId:question.progressKey,reverse}
    case 'time':return {drill:'time',hour:Number(question.meta?.hour),minute:Number(question.meta?.minute),format:question.meta?.format==='12'?'12':'24',reverse}
    case 'counters':{
      const entry=counters.find(c=>c.id===question.progressKey)!
      return {drill:'counters',entryId:entry.id,exampleIndex:Math.max(0,entry.examples.findIndex(example=>example.sentence===question.prompt))}
    }
  }
}
