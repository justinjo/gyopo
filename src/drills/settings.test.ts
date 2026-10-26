import { describe, expect, it, vi } from 'vitest'
import { initialState } from '../config'
import { adapters, updateQuestion } from './index'
import type { DrillId, Settings } from '../types'
const settings:Settings={...initialState.settings,direction:'forward',numberSystem:'sino',numberPreset:'custom',customMin:42,customMax:42}
const create=(drill:DrillId,s=settings)=>adapters[drill].createQuestion({settings:s,recentIds:[],counterBag:[]})
describe('updating a current question',()=>{
  it.each(['numbers','counters','colors','time','days'] as const)('keeps the same %s problem when switching answer style',drill=>{
    const typing={...settings,answerMode:'typing' as const},q=create(drill,typing)
    const updated=updateQuestion(q,settings,typing)!
    expect(updated.id).toBe(q.id)
    expect(updated.prompt).toBe(q.prompt)
    expect(updated.progressKey).toBe(q.progressKey)
    expect(updated.choices?.some(choice=>adapters[drill].checkAnswer(updated,choice).correct)).toBe(true)
  })
  it('replaces a number only when it falls outside the new range',()=>{
    const q=create('numbers')
    expect(updateQuestion(q,{...settings,customMin:0,customMax:50},settings)).toBe(q)
    expect(updateQuestion(q,{...settings,customMin:0,customMax:10},settings)).toBeNull()
  })
  it('changes number system and direction while keeping the number',()=>{
    const q=create('numbers'),updated=updateQuestion(q,{...settings,numberSystem:'native',direction:'reverse'},settings)!
    expect(updated.meta?.value).toBe(42)
    expect(updated.meta?.system).toBe('native')
    expect(updated.canonical).toBe('42')
    expect(updated.id).toBe(q.id)
  })
  it('replaces a counter only when its level is excluded',()=>{
    const beginner={...settings,counterLevel:'beginner' as const},q=create('counters',beginner)
    expect(updateQuestion(q,{...beginner,counterLevel:'all'},beginner)).toBe(q)
    expect(updateQuestion(q,{...beginner,counterLevel:'intermediate'},beginner)).toBeNull()
  })
  it('keeps the clock values when changing time format and direction',()=>{
    const previous={...settings,timeFormat:'12' as const},q=create('time',previous)
    const updated=updateQuestion(q,{...previous,timeFormat:'24',direction:'reverse'},previous)!
    expect(updated.id).toBe(q.id)
    expect(updated.meta?.hour).toBe(q.meta?.hour)
    expect(updated.meta?.minute).toBe(q.meta?.minute)
    expect(updated.meta?.format).toBe('24')
    expect(updated.meta?.digital).toBe(true)
  })
})

describe('number range presets',()=>{
  it.each([
    ['small',0,99],['medium',0,9999],['large',0,999_999],['extra-large',1_000_000,999_999_999],
  ] as const)('generates the full %s range', (numberPreset,min,max)=>{
    const random=vi.spyOn(Math,'random')
    try {
      const preset={...settings,numberPreset}
      random.mockReturnValue(0)
      expect(create('numbers',preset).meta?.value).toBe(min)
      random.mockReturnValue(1-Number.EPSILON)
      expect(create('numbers',preset).meta?.value).toBe(max)
    } finally {random.mockRestore()}
  })
  it('replaces an extra large question when switching to large',()=>{
    const previous={...settings,numberPreset:'custom' as const,customMin:1_000_000,customMax:1_000_000}
    const q=create('numbers',previous)
    expect(updateQuestion(q,{...settings,numberPreset:'large'},previous)).toBeNull()
    expect(updateQuestion(q,{...settings,numberPreset:'extra-large'},previous)).toBe(q)
  })
})
