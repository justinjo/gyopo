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
  return s.numberPreset === 'small' ? [0,99] : s.numberPreset === 'large' ? [10_000,999_999_999] : [0,9999]
}
function nearbyNumbers(n:number,min:number,max:number): number[] {
  const offsets = shuffle([-100,-20,-10,-2,-1,1,2,10,20,100])
  return offsets.map(x=>n+x).filter(x=>x>=min&&x<=max)
}
const numbers: DrillAdapter = {
  id:'numbers',label:'Numbers',checkAnswer:check,
  createQuestion({settings}:DrillContext):Question {
    const native = settings.numberSystem === 'mixed' ? Math.random()<.35 : settings.numberSystem === 'native'
    const [min,max] = numberRange(settings,native)
    const validMin = Math.min(min,max), validMax = Math.max(min,max)
    const n = validMin + Math.floor(Math.random()*(validMax-validMin+1))
    const word = native ? n === 0 ? sample(['영','공']) : toNativeKorean(n) : toSinoKorean(n)
    const direction = actualDirection(settings), reverse = direction==='reverse'
    const canonical = reverse ? String(n) : word
    const candidates = nearbyNumbers(n,validMin,validMax).map(x => reverse ? String(x) : native ? toNativeKorean(x) : toSinoKorean(x))
    const accepted = !reverse && native && n === 0 ? [{value:'영'},{value:'공'}] : [{value:canonical}]
    return { id:`number-${native?'native':'sino'}-${n}-${direction}-${Date.now()}`,drill:'numbers',prompt:reverse?word:n.toLocaleString(),promptLabel:reverse?'Write the number':'Write it in Korean',canonical,accepted,choices:uniqueChoices(canonical,candidates),progressKey:native?'native':'sino',meta:{value:n,system:native?'native':'sino'} }
  }
}

const colorAdapter: DrillAdapter = {
  id:'colors',label:'Colors',checkAnswer:check,
  createQuestion({settings}:DrillContext):Question {
    const entry=sample(colors), reverse=actualDirection(settings)==='reverse'
    const canonical=reverse?entry.english:entry.korean
    const accepted=(reverse?[entry.english,...entry.aliasesEn]:[entry.korean,...entry.aliasesKo]).map(value=>({value}))
    const candidates=colors.filter(c=>c.id!==entry.id).map(c=>reverse?c.english:c.korean)
    return {id:`color-${entry.id}-${reverse?'en':'ko'}-${Date.now()}`,drill:'colors',prompt:reverse?entry.korean:'',promptLabel:reverse?'Write the color in English':'Write the color in Korean',canonical,accepted,choices:uniqueChoices(canonical,candidates),progressKey:entry.id,meta:{hex:entry.hex,swatch:!reverse}}
  }
}

const counterAdapter: DrillAdapter = {
  id:'counters',label:'Counters',checkAnswer:check,
  createQuestion(context:DrillContext):Question {
    const eligible=counters.filter(c=>context.settings.counterLevel==='all'||(context.settings.counterLevel==='beginner'?['A1','A2']:['B1','B2']).includes(c.level))
    const eligibleIds=new Set(eligible.map(c=>c.id))
    context.counterBag=context.counterBag.filter(id=>eligibleIds.has(id))
    if(!context.counterBag.length) context.counterBag=shuffle(eligible.map(c=>c.id))
    const id=context.counterBag.shift()!, entry=eligible.find(c=>c.id===id)!, example=sample(entry.examples)
    const peopleAlternative=id==='people'?{value:'분',label:'Note: 분 is the honorific counter for people.'}:id==='people-honor'?{value:'명',label:'Note: 분 is the honorific counter and is preferred for guests.'}:null
    const accepted=[entry.counter,...(example.aliases??[])].map(value=>({value,label:undefined as string|undefined}));if(peopleAlternative)accepted.push(peopleAlternative)
    const peopleCounters=peopleAlternative?new Set(['명','분']):null
    const candidates=eligible.filter(c=>c.id!==id&&!peopleCounters?.has(c.counter)).map(c=>c.counter)
    return {id:`counter-${id}-${Date.now()}`,drill:'counters',prompt:example.sentence,promptLabel:`Fill in the counter · ${entry.level}`,canonical:entry.counter,accepted,choices:uniqueChoices(entry.counter,shuffle(candidates)),translation:example.translation,progressKey:id,meta:{gloss:entry.gloss}}
  }
}

const timeAdapter: DrillAdapter = {
  id:'time',label:'Time',checkAnswer:check,
  createQuestion({settings}:DrillContext):Question {
    const hour=Math.floor(Math.random()*24),minute=Math.floor(Math.random()*60)
    const format=settings.timeFormat==='mixed'?sample(['12','24'] as const):settings.timeFormat
    const reverse=actualDirection(settings)==='reverse', digital=digitalTime(hour,minute,format), words=koreanTime(hour,minute,format)
    const canonical=reverse?digital:words
    const accepted=reverse?digitalTimeAliases(hour,minute,format).map(value=>({value})):timeAliases(hour,minute,format).map(value=>({value}))
    const alternatives=[1,2,5,10,15].map(x=>reverse?digitalTime((hour+x)%24,minute,format):koreanTime((hour+x)%24,minute,format))
    return {id:`time-${hour}-${minute}-${format}-${directionLabel(reverse)}-${Date.now()}`,drill:'time',prompt:reverse?words:digital,promptLabel:reverse?'Write the digital time':`${format}-hour Korean reading`,canonical,accepted,choices:uniqueChoices(canonical,alternatives),progressKey:format,meta:{digital:reverse,format}}
  }
}
const dayAdapter: DrillAdapter = {
  id:'days',label:'Days',checkAnswer:check,
  createQuestion({settings}:DrillContext):Question {
    const entry=sample(days),reverse=actualDirection(settings)==='reverse'
    const canonical=reverse?entry.english:entry.korean
    const candidates=days.filter(day=>day.id!==entry.id).map(day=>reverse?day.english:day.korean)
    return {id:`day-${entry.id}-${reverse?'en':'ko'}-${Date.now()}`,drill:'days',prompt:reverse?entry.korean:entry.english,promptLabel:reverse?'Write the day in English':'Write the day in Korean',canonical,accepted:[{value:canonical}],choices:uniqueChoices(canonical,candidates),progressKey:entry.id}
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
