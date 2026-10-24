import { describe, expect, it } from 'vitest'
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
