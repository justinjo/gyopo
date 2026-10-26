import { describe,expect,it,vi } from 'vitest'
import { counters } from '../content/counters'
import { adapters,counterDistractors,validateCustomRange } from '.'
import { initialState } from '../config'
describe('drill adapters',()=>{
  it('validates number ranges',()=>{expect(validateCustomRange(5,2,'sino')).toMatch(/Minimum/);expect(validateCustomRange(0,99,'native')).toBeNull();expect(validateCustomRange(0,100,'native')).toMatch(/Native/)})
  it('accepts aliases and creates unique choices',()=>{const context={settings:initialState.settings,recentIds:[],counterBag:[]};for(const adapter of Object.values(adapters)){const q=adapter.createQuestion(context);expect(q.choices).toHaveLength(3);expect(new Set(q.choices).size).toBe(3);expect(adapter.checkAnswer(q,q.canonical).correct).toBe(true)}})
  it('accepts both Korean zero readings in native-number drills',()=>{const context={settings:{...initialState.settings,numberSystem:'native' as const,numberPreset:'custom' as const,customMin:0,customMax:0,direction:'forward' as const},recentIds:[],counterBag:[]};const q=adapters.numbers.createQuestion(context);expect(q.prompt).toBe('0');expect(adapters.numbers.checkAnswer(q,'영').correct).toBe(true);expect(adapters.numbers.checkAnswer(q,'공').correct).toBe(true)})
  it('cycles full Korean color aliases into choices while keeping shorthand typing-only',()=>{const random=vi.spyOn(Math,'random').mockReturnValue(.85);const base={...initialState.settings,direction:'forward' as const};const choice=adapters.colors.createQuestion({settings:{...base,answerMode:'choice' as const},recentIds:[],counterBag:[]});expect(choice.canonical).toBe('하얀색');expect(choice.choices).toContain('하얀색');expect(choice.choices?.every(value=>value.endsWith('색'))).toBe(true);expect(adapters.colors.checkAnswer(choice,'하양').correct).toBe(true);const typing=adapters.colors.createQuestion({settings:{...base,answerMode:'typing' as const},recentIds:[],counterBag:[]});expect(typing.canonical).toBe('흰색');random.mockRestore()})
  it('exhausts the counter bag before repeating',()=>{const context={settings:{...initialState.settings,counterLevel:'beginner' as const},recentIds:[],counterBag:[]};const ids=new Set<string>();for(let i=0;i<16;i++)ids.add(adapters.counters.createQuestion(context).progressKey);expect(ids.size).toBe(16);expect(context.counterBag).toHaveLength(0)})
  it.each([['people','명','분'],['people-honor','분','명']])('accepts both people counters for %s with guidance',(id,canonical,alternate)=>{const context={settings:initialState.settings,recentIds:[],counterBag:[id]};const q=adapters.counters.createQuestion(context);expect(q.canonical).toBe(canonical);const result=adapters.counters.checkAnswer(q,alternate);expect(result.correct).toBe(true);expect(result.note).toContain('명');expect(result.note).toContain('분');expect(q.choices).not.toContain(alternate)})
  it('does not confuse the minutes counter with a people counter',()=>{const context={settings:initialState.settings,recentIds:[],counterBag:['minutes']};const q=adapters.counters.createQuestion(context);expect(q.canonical).toBe('분');expect(adapters.counters.checkAnswer(q,'명').correct).toBe(false)})
  it('accepts bottles for the water-drinking prompt with a unit note',()=>{const context={settings:initialState.settings,recentIds:[],counterBag:['mouthfuls']};const q=adapters.counters.createQuestion(context);const result=adapters.counters.checkAnswer(q,'병');expect(result.correct).toBe(true);expect(result.note).toContain('모금');expect(result.note).toContain('병');expect(q.choices).not.toContain('병')})
  it('keeps the bottle request specific to bottles',()=>{const context={settings:initialState.settings,recentIds:[],counterBag:['bottles']};const q=adapters.counters.createQuestion(context);expect(adapters.counters.checkAnswer(q,'모금').correct).toBe(false)})
})

describe('unambiguous counter choices',()=>{
  it.each(['all','beginner','intermediate'] as const)('provides three safe choices for every %s counter',counterLevel=>{
    const eligible=counters.filter(c=>counterLevel==='all'||(counterLevel==='beginner'?['A1','A2']:['B1','B2']).includes(c.level))
    for(const entry of eligible){
      const q=adapters.counters.createQuestion({settings:{...initialState.settings,counterLevel},recentIds:[],counterBag:[entry.id]})
      expect(q.choices).toHaveLength(3)
      expect(q.choices!.filter(choice=>adapters.counters.checkAnswer(q,choice).correct)).toEqual([q.canonical])
      const safe=new Set(counterDistractors(entry.id).map(c=>c.counter))
      expect(q.choices!.filter(choice=>choice!==q.canonical).every(choice=>safe.has(choice))).toBe(true)
    }
  })
  it.each(['years','months','days','hours','minutes'])('excludes alternative durations for %s',id=>{
    expect(counterDistractors(id).every(c=>!['년','개월','일','시간','분'].includes(c.counter))).toBe(true)
  })
})
