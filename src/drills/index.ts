import type { DrillAdapter, DrillContext, Question, Settings } from '../types'
import { normalizeAnswer, normalizeTime, sample, shuffle, uniqueChoices } from '../lib/normalize'
import { parseIntegerAnswer, toNativeKorean, toSinoKorean } from '../lib/koreanNumbers'
import { colors } from '../content/colors'
import { counters } from '../content/counters'
import { days } from '../content/days'
import { digitalTime, digitalTimeAliases, koreanTime, timeAliases } from '../lib/time'

const check: DrillAdapter['checkAnswer'] = (q, input) => {
  const normalizer = q.meta?.digital ? normalizeTime : normalizeAnswer
  const value = normalizer(input)
  const accepted=q.accepted.find(a=>normalizer(a.value)===value)
  return { correct: !!accepted, canonical: q.canonical, normalizedInput: value, note: accepted?.label }
}
const actualDirection = (settings: Settings) => settings.direction === 'mixed' ? sample(['forward','reverse'] as const) : settings.direction

function numberRange(s: Settings, native: boolean): [number, number] {
  if (native) {
    const min=Math.max(0, s.numberPreset === 'custom' ? s.customMin : 0),max=Math.min(99, s.numberPreset === 'custom' ? s.customMax : 99)
    return min<=max?[min,max]:[0,99]
  }
  if (s.numberPreset === 'custom') { const min=Math.max(0,s.customMin),max=Math.min(999_999_999,s.customMax);return min<=max?[min,max]:[0,9999] }
  return s.numberPreset === 'small' ? [0,99] : s.numberPreset === 'large' ? [0,999_999] : s.numberPreset === 'extra-large' ? [1_000_000,999_999_999] : [0,9999]
}
function nearbyNumbers(n:number,min:number,max:number): number[] {
  const offsets = shuffle([-100,-20,-10,-2,-1,1,2,10,20,100])
  return offsets.map(x=>n+x).filter(x=>x>=min&&x<=max)
}
const numbers: DrillAdapter = {
  id:'numbers',label:'Numbers',checkAnswer:check,
  createQuestion({settings,question}:DrillContext):Question {
    const native = settings.numberSystem === 'mixed' ? question ? question.meta?.system==='native' : Math.random()<.35 : settings.numberSystem === 'native'
    const [min,max] = numberRange(settings,native)
    const validMin = Math.min(min,max), validMax = Math.max(min,max)
    const n = question ? Number(question.meta?.value) : validMin + Math.floor(Math.random()*(validMax-validMin+1))
    const word = native ? n === 0 ? sample(['영','공']) : toNativeKorean(n) : toSinoKorean(n)
    const direction = (question&&settings.direction==='mixed'?(question.meta?.reverse?'reverse':'forward'):actualDirection(settings)), reverse = direction==='reverse'
    const canonical = reverse ? String(n) : word
    const candidates = nearbyNumbers(n,validMin,validMax).map(x => reverse ? String(x) : native ? toNativeKorean(x) : toSinoKorean(x))
    const accepted = !reverse && native && n === 0 ? [{value:'영'},{value:'공'}] : [{value:canonical}]
    return { id:`number-${native?'native':'sino'}-${n}-${direction}-${Date.now()}`,drill:'numbers',prompt:reverse?word:n.toLocaleString(),promptLabel:reverse?'Write the number':'Write it in Korean',canonical,accepted,choices:uniqueChoices(canonical,candidates),progressKey:native?'native':'sino',meta:{value:n,system:native?'native':'sino',reverse} }
  }
}

const colorAdapter: DrillAdapter = {
  id:'colors',label:'Colors',checkAnswer:check,
  createQuestion({settings,question}:DrillContext):Question {
    const entry=question?colors.find(c=>c.id===question.progressKey)!:sample(colors), reverse=(question&&settings.direction==='mixed'?(question.meta?.reverse?'reverse':'forward'):actualDirection(settings))==='reverse'
    const forms=(color:typeof entry)=>reverse?[color.english,...color.aliasesEn]:[color.korean,...color.aliasesKo]
    const choiceForms=(color:typeof entry)=>reverse?forms(color):forms(color).filter(value=>value.endsWith('색'))
    const canonical=settings.answerMode==='choice'?sample(choiceForms(entry)):forms(entry)[0]!
    const accepted=(reverse?[entry.english,...entry.aliasesEn]:[entry.korean,...entry.aliasesKo]).map(value=>({value}))
    const candidates=colors.filter(c=>c.id!==entry.id).map(c=>sample(choiceForms(c)))
    return {id:`color-${entry.id}-${reverse?'en':'ko'}-${Date.now()}`,drill:'colors',prompt:reverse?entry.korean:'',promptLabel:reverse?'Write the color in English':'Write the color in Korean',canonical,accepted,choices:uniqueChoices(canonical,candidates),progressKey:entry.id,meta:{hex:entry.hex,swatch:!reverse,reverse}}
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

const counterAdapter: DrillAdapter = {
  id:'counters',label:'Counters',checkAnswer:check,
  createQuestion(context:DrillContext):Question {
    const eligible=counters.filter(c=>context.settings.counterLevel==='all'||(context.settings.counterLevel==='beginner'?['A1','A2']:['B1','B2']).includes(c.level))
    const eligibleIds=new Set(eligible.map(c=>c.id))
    context.counterBag=context.counterBag.filter(id=>eligibleIds.has(id))
    if(!context.counterBag.length) context.counterBag=shuffle(eligible.map(c=>c.id))
    const id=context.counterBag.shift()!, entry=eligible.find(c=>c.id===id)!, example=sample(entry.examples)
    const alternative=id==='people'?{value:'분',label:'Note: 명 is the neutral people counter; 분 is the honorific people counter.'}:id==='people-honor'?{value:'명',label:'Note: 명 is the neutral people counter; 분 is the honorific people counter.'}:id==='mouthfuls'?{value:'병',label:'Note: 모금 counts sips; 병 counts bottles.'}:null
    const accepted=[entry.counter,...(example.aliases??[])].map(value=>({value,label:undefined as string|undefined}));if(alternative)accepted.push(alternative)
    const equivalentCounters=alternative?new Set([entry.counter,alternative.value]):null
    const safeIds=new Set(counterDistractors(id).map(c=>c.id))
    let candidates=eligible.filter(c=>safeIds.has(c.id)&&!equivalentCounters?.has(c.counter)).map(c=>c.counter)
    // A strict level filter can leave fewer than two distinct safe distractors.
    if(new Set(candidates).size<2)candidates=counterDistractors(id).filter(c=>!equivalentCounters?.has(c.counter)).map(c=>c.counter)
    return {id:`counter-${id}-${Date.now()}`,drill:'counters',prompt:example.sentence,promptLabel:`Fill in the counter · ${entry.level}`,canonical:entry.counter,accepted,choices:uniqueChoices(entry.counter,shuffle(candidates)),translation:example.translation,progressKey:id,meta:{gloss:entry.gloss}}
  }
}

const timeAdapter: DrillAdapter = {
  id:'time',label:'Time',checkAnswer:check,
  createQuestion({settings,question}:DrillContext):Question {
    const hour=question?Number(question.meta?.hour):Math.floor(Math.random()*24),minute=question?Number(question.meta?.minute):Math.floor(Math.random()*60)
    const format=settings.timeFormat==='mixed'?(question?question.meta?.format as '12'|'24':sample(['12','24'] as const)):settings.timeFormat
    const reverse=(question&&settings.direction==='mixed'?(question.meta?.reverse?'reverse':'forward'):actualDirection(settings))==='reverse', digital=digitalTime(hour,minute,format), words=koreanTime(hour,minute,format)
    const canonical=reverse?digital:words
    const accepted=reverse?digitalTimeAliases(hour,minute,format).map(value=>({value})):timeAliases(hour,minute,format).map(value=>({value}))
    const alternatives=[1,2,5,10,15].map(x=>reverse?digitalTime((hour+x)%24,minute,format):koreanTime((hour+x)%24,minute,format))
    return {id:`time-${hour}-${minute}-${format}-${directionLabel(reverse)}-${Date.now()}`,drill:'time',prompt:reverse?words:digital,promptLabel:reverse?'Write the digital time':`${format}-hour Korean reading`,canonical,accepted,choices:uniqueChoices(canonical,alternatives),progressKey:format,meta:{digital:reverse,format,hour,minute,reverse}}
  }
}
const dayAdapter: DrillAdapter = {
  id:'days',label:'Days',checkAnswer:check,
  createQuestion({settings,question}:DrillContext):Question {
    const entry=question?days.find(day=>day.id===question.progressKey)!:sample(days),reverse=(question&&settings.direction==='mixed'?(question.meta?.reverse?'reverse':'forward'):actualDirection(settings))==='reverse'
    const canonical=reverse?entry.english:entry.korean
    const candidates=days.filter(day=>day.id!==entry.id).map(day=>reverse?day.english:day.korean)
    return {id:`day-${entry.id}-${reverse?'en':'ko'}-${Date.now()}`,drill:'days',prompt:reverse?entry.korean:entry.english,promptLabel:reverse?'Write the day in English':'Write the day in Korean',canonical,accepted:[{value:canonical}],choices:uniqueChoices(canonical,candidates),progressKey:entry.id,meta:{reverse}}
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
  const directionChanged=settings.direction!==previous.direction
  const systemChanged=question.drill==='numbers'&&settings.numberSystem!==previous.numberSystem
  const formatChanged=question.drill==='time'&&settings.timeFormat!==previous.timeFormat
  const choicesChanged=question.drill==='colors'&&settings.answerMode!==previous.answerMode
  if(!directionChanged&&!systemChanged&&!formatChanged&&!choicesChanged)return question
  // Recover clock values from questions saved before source metadata was added.
  if(question.drill==='time'&&question.meta?.hour===undefined){const match=/^time-(\d+)-(\d+)-/.exec(question.id);if(!match)return question;question={...question,meta:{...question.meta,hour:Number(match[1]),minute:Number(match[2])}}}
  const source={...question,meta:{...question.meta,reverse:question.meta?.reverse??(question.drill==='time'?!!question.meta?.digital:question.drill==='colors'?!question.meta?.swatch:question.promptLabel==='Write the number'||question.promptLabel==='Write the day in English')}}
  const updated=adapters[question.drill].createQuestion({settings,question:source,recentIds:[],counterBag:[]})
  return {...updated,id:question.id}
}
