import type { DrillAdapter, DrillContext, Question, QuestionSubject, Settings } from '../types'
import { normalizeAnswer, normalizeTime, sample, shuffle, uniqueChoices } from '../lib/normalize'
import { parseIntegerAnswer, toFinancialChinese, toChinese } from '../lib/chineseNumbers'
import { colors } from '../content/colors'
import { counters } from '../content/counters'
import { digitalTime, digitalTimeAliases, chineseTime, timeAliases } from '../lib/time'

const check: DrillAdapter['checkAnswer'] = (q, input) => {
  const normalizer = q.meta?.digital ? normalizeTime : normalizeAnswer
  const value = normalizer(input)
  const accepted=q.accepted.find(a=>normalizer(a.value)===value)
  return { correct: !!accepted, canonical: q.canonical, normalizedInput: value, note: accepted?.label }
}
const actualDirection = (settings: Settings) => settings.direction === 'mixed' ? sample(['forward','reverse'] as const) : settings.direction

function sampleOutsideRecent<T extends {id:string}>(entries:readonly T[],recentIds:readonly string[],prefix:string):T {
  const recent=recentIds.filter(id=>id.startsWith(`${prefix}-`)).slice(0,2)
  return sample(entries.filter(entry=>!recent.some(id=>id.startsWith(`${prefix}-${entry.id}-`))))
}

function numberRange(s: Settings, _financial: boolean): [number, number] {
  if (s.numberPreset === 'custom') { const min=Math.max(0,s.customMin),max=Math.min(999_999_999,s.customMax);return min<=max?[min,max]:[0,9999] }
  return s.numberPreset === 'small' ? [0,99] : s.numberPreset === 'large' ? [0,999_999] : s.numberPreset === 'extra-large' ? [1_000_000,999_999_999] : [0,9999]
}
function nearbyNumbers(n:number,min:number,max:number): number[] {
  const offsets = shuffle([-100,-20,-10,-2,-1,1,2,10,20,100])
  return offsets.map(x=>n+x).filter(x=>x>=min&&x<=max)
}
const numbers: DrillAdapter = {
  id:'numbers',label:'Numbers',checkAnswer:check,
  selectNext({settings,counterBag}:DrillContext) {
    const financial=settings.numberSystem==='mixed'?Math.random()<.35:settings.numberSystem==='financial'
    const [min,max]=numberRange(settings,financial)
    return {subject:{drill:'numbers',value:min+Math.floor(Math.random()*(max-min+1)),system:financial?'financial':'standard',reverse:actualDirection(settings)==='reverse'},counterBag:[...counterBag]}
  },
  buildQuestion(subject:QuestionSubject,settings:Settings):Question {
    if(subject.drill!=='numbers')throw new Error('Expected a number subject')
    const {value:n,reverse}=subject,financial=subject.system==='financial'
    const [validMin,validMax]=numberRange(settings,financial)
    const word=financial?toFinancialChinese(n):toChinese(n)
    const direction=reverse?'reverse':'forward'
    const canonical = reverse ? String(n) : word
    const candidates = nearbyNumbers(n,validMin,validMax).map(x => reverse ? String(x) : financial ? toFinancialChinese(x) : toChinese(x))
    const accepted = [{value:canonical}]
    return { subject,id:`number-${financial?'financial':'standard'}-${n}-${direction}-${Date.now()}`,drill:'numbers',prompt:reverse?word:n.toLocaleString(),promptLabel:reverse?'Write the number':'Write it in Mandarin',canonical,accepted,choices:uniqueChoices(canonical,candidates),progressKey:financial?'financial':'standard',meta:{value:n,system:financial?'financial':'standard',reverse} }
  }
}

const colorAdapter: DrillAdapter = {
  id:'colors',label:'Colors',checkAnswer:check,
  selectNext({settings,recentIds,counterBag}:DrillContext) {
    const entry=sampleOutsideRecent(colors,recentIds,'color')
    return {subject:{drill:'colors',entryId:entry.id,reverse:actualDirection(settings)==='reverse'},counterBag:[...counterBag]}
  },
  buildQuestion(subject:QuestionSubject,settings:Settings):Question {
    if(subject.drill!=='colors')throw new Error('Expected a color subject')
    const entry=colors.find(c=>c.id===subject.entryId)!,reverse=subject.reverse
    const forms=(color:typeof entry)=>reverse?[color.english,...color.aliasesEn]:[color.chinese,...color.aliasesZh]
    const choiceForms=(color:typeof entry)=>reverse?forms(color):forms(color).filter(value=>value.endsWith('色'))
    const canonical=settings.answerMode==='choice'?sample(choiceForms(entry)):forms(entry)[0]!
    const accepted=(reverse?[entry.english,...entry.aliasesEn]:[entry.chinese,...entry.aliasesZh]).map(value=>({value}))
    const candidates=colors.filter(c=>c.id!==entry.id).map(c=>sample(choiceForms(c)))
    return {subject,id:`color-${entry.id}-${reverse?'en':'zh'}-${Date.now()}`,drill:'colors',prompt:reverse?entry.chinese:'',promptLabel:reverse?'Write the color in English':'Write the color in Mandarin',canonical,accepted,choices:uniqueChoices(canonical,candidates),progressKey:entry.id,meta:{hex:entry.hex,swatch:!reverse,reverse}}
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
  selectNext({settings,counterBag}:DrillContext) {
    const eligible=eligibleCounters(settings)
    const eligibleIds=new Set(eligible.map(c=>c.id))
    let bag=counterBag.filter(id=>eligibleIds.has(id))
    if(!bag.length)bag=shuffle(eligible.map(c=>c.id))
    const [id,...remaining]=bag,entry=eligible.find(c=>c.id===id)!
    return {subject:{drill:'counters',entryId:entry.id,exampleIndex:Math.floor(Math.random()*entry.examples.length)},counterBag:remaining}
  },
  buildQuestion(subject:QuestionSubject,settings:Settings):Question {
    if(subject.drill!=='counters')throw new Error('Expected a counter subject')
    const eligible=eligibleCounters(settings)
    const id=subject.entryId,entry=counters.find(c=>c.id===id)!,example=entry.examples[subject.exampleIndex]!
    const accepted=[entry.counter,...(example.aliases??[])].map(value=>({value}))
    const safeIds=new Set(counterDistractors(id).map(c=>c.id))
    let candidates=eligible.filter(c=>safeIds.has(c.id)).map(c=>c.counter)
    // A strict level filter can leave fewer than two distinct safe distractors.
    if(new Set(candidates).size<2)candidates=counterDistractors(id).map(c=>c.counter)
    return {subject,id:`counter-${id}-${Date.now()}`,drill:'counters',prompt:example.sentence,promptLabel:`Fill in the measure word · ${entry.gloss} · ${entry.level}`,canonical:entry.counter,accepted,choices:uniqueChoices(entry.counter,shuffle(candidates)),translation:example.translation,progressKey:id,meta:{gloss:entry.gloss}}
  }
}

const timeAdapter: DrillAdapter = {
  id:'time',label:'Time',checkAnswer:check,
  selectNext({settings,counterBag}:DrillContext) {
    const hour=Math.floor(Math.random()*24),minute=Math.floor(Math.random()*60)
    const format=settings.timeFormat==='mixed'?sample(['12','24'] as const):settings.timeFormat
    return {subject:{drill:'time',hour,minute,format,reverse:actualDirection(settings)==='reverse'},counterBag:[...counterBag]}
  },
  buildQuestion(subject:QuestionSubject,_settings:Settings):Question {
    if(subject.drill!=='time')throw new Error('Expected a time subject')
    const {hour,minute,format,reverse}=subject,digital=digitalTime(hour,minute,format),words=chineseTime(hour,minute,format)
    const canonical=reverse?digital:words
    const accepted=reverse?digitalTimeAliases(hour,minute,format).map(value=>({value})):timeAliases(hour,minute,format).map(value=>({value}))
    const alterfinancials=[1,2,5,10,15].map(x=>reverse?digitalTime((hour+x)%24,minute,format):chineseTime((hour+x)%24,minute,format))
    return {subject,id:`time-${hour}-${minute}-${format}-${directionLabel(reverse)}-${Date.now()}`,drill:'time',prompt:reverse?words:digital,promptLabel:reverse?'Write the digital time':`${format}-hour Mandarin reading`,canonical,accepted,choices:uniqueChoices(canonical,alterfinancials),progressKey:format,meta:{digital:reverse,format,hour,minute,reverse}}
  }
}
function directionLabel(reverse:boolean){return reverse?'digital':'chinese'}

export const adapters:Record<string,DrillAdapter>={numbers,counters:counterAdapter,colors:colorAdapter,time:timeAdapter}
export function validateCustomRange(min:number,max:number,system:Settings['numberSystem']):string|null {
  if(!Number.isInteger(min)||!Number.isInteger(max))return 'Use whole numbers.'
  if(min>max)return 'Minimum must be no greater than maximum.'
  if(min<0||max>999_999_999)return 'Range must stay between 0 and 999,999,999.'
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
    const financial=settings.numberSystem==='mixed'?question.meta?.system==='financial':settings.numberSystem==='financial'
    const [min,max]=numberRange(settings,financial),n=Number(question.meta?.value)
    if(n<min||n>max)return null
  }
  const directionChanged=settings.direction!==previous.direction
  const systemChanged=question.drill==='numbers'&&settings.numberSystem!==previous.numberSystem
  const formatChanged=question.drill==='time'&&settings.timeFormat!==previous.timeFormat
  const choicesChanged=question.drill==='colors'&&settings.answerMode!==previous.answerMode
  if(!directionChanged&&!systemChanged&&!formatChanged&&!choicesChanged)return question
  // Recover clock values from questions saved before source metadata was added.
  if(question.drill==='time'&&question.meta?.hour===undefined){const match=/^time-(\d+)-(\d+)-/.exec(question.id);if(!match)return question;question={...question,meta:{...question.meta,hour:Number(match[1]),minute:Number(match[2])}}}
  const subject=subjectFromQuestion(question)
  if('reverse' in subject&&settings.direction!=='mixed')subject.reverse=settings.direction==='reverse'
  if(subject.drill==='numbers'&&settings.numberSystem!=='mixed')subject.system=settings.numberSystem
  if(subject.drill==='time'&&settings.timeFormat!=='mixed')subject.format=settings.timeFormat
  const updated=adapters[question.drill].buildQuestion(subject,settings)
  return {...updated,id:question.id}
}

// Older saved questions predate explicit subjects. Reconstruct them without selecting anew.
export function subjectFromQuestion(question:Question):QuestionSubject {
  if(question.subject)return {...question.subject}
  const reverse=!!(question.meta?.reverse??(question.drill==='time'?question.meta?.digital:question.drill==='colors'?!question.meta?.swatch:question.promptLabel==='Write the number'))
  switch(question.drill){
    case 'numbers':return {drill:'numbers',value:Number(question.meta?.value),system:question.meta?.system==='financial'?'financial':'standard',reverse}
    case 'colors':return {drill:question.drill,entryId:question.progressKey,reverse}
    case 'time':return {drill:'time',hour:Number(question.meta?.hour),minute:Number(question.meta?.minute),format:question.meta?.format==='12'?'12':'24',reverse}
    case 'counters':{
      const entry=counters.find(c=>c.id===question.progressKey)!
      return {drill:'counters',entryId:entry.id,exampleIndex:Math.max(0,entry.examples.findIndex(example=>example.sentence===question.prompt))}
    }
  }
}
