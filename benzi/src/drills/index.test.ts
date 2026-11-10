import { describe,expect,it,vi } from 'vitest'
import { counters } from '../content/counters'
import { adapters,counterDistractors,validateCustomRange } from '.'
import { initialState } from '../config'
import type { DrillAdapter, DrillContext } from '../types'
const createQuestion=(adapter:DrillAdapter,context:DrillContext)=>adapter.buildQuestion(adapter.selectNext(context).subject,context.settings)
describe('drill adapters',()=>{
  it('validates number ranges',()=>{expect(validateCustomRange(5,2,'standard')).toMatch(/Minimum/);expect(validateCustomRange(0,99,'financial')).toBeNull();expect(validateCustomRange(0,100,'financial')).toBeNull()})
  it('accepts aliases and creates unique choices',()=>{const context={settings:initialState.settings,recentIds:[],counterBag:[]};for(const adapter of Object.values(adapters)){const q=createQuestion(adapter,context);expect(q.choices).toHaveLength(3);expect(new Set(q.choices).size).toBe(3);expect(adapter.checkAnswer(q,q.canonical).correct).toBe(true)}})
  it('uses simplified zero in both numeral systems',()=>{for(const numberSystem of ['standard','financial'] as const){const q=adapters.numbers.buildQuestion({drill:'numbers',value:0,system:numberSystem,reverse:false},initialState.settings);expect(q.canonical).toBe('零')}})
  it('accepts short color names',()=>{const q=adapters.colors.buildQuestion({drill:'colors',entryId:'red',reverse:false},initialState.settings);expect(adapters.colors.checkAnswer(q,'红').correct).toBe(true);expect(q.choices?.every(value=>value.endsWith('色'))).toBe(true)})
  it('exhausts the counter bag before repeating',()=>{const context={settings:{...initialState.settings,counterLevel:'beginner' as const},recentIds:[],counterBag:[] as string[]};const ids=new Set<string>();for(let i=0;i<16;i++){const selected=adapters.counters.selectNext(context);context.counterBag=selected.counterBag;ids.add(adapters.counters.buildQuestion(selected.subject,context.settings).progressKey)};expect(ids.size).toBe(16);expect(context.counterBag).toHaveLength(0)})
  it('accepts polite and general people classifiers',()=>{const q=adapters.counters.buildQuestion({drill:'counters',entryId:'people',exampleIndex:0},initialState.settings);expect(adapters.counters.checkAnswer(q,'位').correct).toBe(true);expect(q.choices).not.toContain('位')})

})

describe('unambiguous counter choices',()=>{
  it.each(['all','beginner','intermediate'] as const)('provides three safe choices for every %s counter',counterLevel=>{
    const eligible=counters.filter(c=>counterLevel==='all'||(counterLevel==='beginner'?['A1','A2']:['B1','B2']).includes(c.level))
    for(const entry of eligible){
      const q=createQuestion(adapters.counters,{settings:{...initialState.settings,counterLevel},recentIds:[],counterBag:[entry.id]})
      expect(q.choices).toHaveLength(3)
      expect(q.choices!.filter(choice=>adapters.counters.checkAnswer(q,choice).correct)).toEqual([q.canonical])
      const safe=new Set(counterDistractors(entry.id).map(c=>c.counter))
      expect(q.choices!.filter(choice=>choice!==q.canonical).every(choice=>safe.has(choice))).toBe(true)
    }
  })
  it.each(['years','months','hours','minutes'])('excludes alternative durations for %s',id=>{
    expect(counterDistractors(id).every(c=>!['年','天','分钟'].includes(c.counter))).toBe(true)
  })
})

describe('recent color questions',()=>{
  it.each(['colors'] as const)('leaves two intervening questions before repeating a %s item',drill=>{
    const random=vi.spyOn(Math,'random').mockReturnValue(0)
    try {
      let recentIds:string[]=[]
      const keys:string[]=[]
      for(let i=0;i<12;i++){
        const settings={...initialState.settings,direction:i%2?'reverse' as const:'forward' as const}
        const question=createQuestion(adapters[drill],{settings,recentIds,counterBag:[]})
        expect(keys.slice(-2)).not.toContain(question.progressKey)
        keys.push(question.progressKey)
        recentIds=[question.id,...recentIds].slice(0,12)
        const refreshed=adapters[drill].buildQuestion(question.subject!,settings)
        expect(refreshed.progressKey).toBe(question.progressKey)
      }
      expect(keys[3]).toBe(keys[0])
    } finally { random.mockRestore() }
  })
})


describe('selection and rendering',()=>{
  it('returns the next counter bag without mutating the selection context',()=>{
    const bag=Object.freeze(['people','animals'])
    const context=Object.freeze({settings:initialState.settings,recentIds:Object.freeze([]),counterBag:bag})
    const selected=adapters.counters.selectNext(context)
    expect(selected.subject).toMatchObject({drill:'counters',entryId:'people'})
    expect(selected.counterBag).toEqual(['animals'])
    expect(context.counterBag).toEqual(['people','animals'])
    const question=adapters.counters.buildQuestion(selected.subject,context.settings)
    expect(question.progressKey).toBe('people')
    expect(selected.counterBag).toEqual(['animals'])
  })
  it.each(['numbers','counters','colors','time'] as const)('rebuilds the selected %s subject without selecting again',drill=>{
    const context={settings:initialState.settings,recentIds:[],counterBag:[]}
    const selected=adapters[drill].selectNext(context)
    const first=adapters[drill].buildQuestion(selected.subject,context.settings)
    const rebuilt=adapters[drill].buildQuestion(selected.subject,{...context.settings,answerMode:'typing'})
    expect(rebuilt.subject).toEqual(first.subject)
    expect(rebuilt.prompt).toBe(first.prompt)
    expect(rebuilt.translation).toBe(first.translation)
    expect(rebuilt.progressKey).toBe(first.progressKey)
  })
})
