import { describe,expect,it } from 'vitest'
import { initialState } from './config'
import { adapters, updateQuestion } from './drills'
import { changeSettings, makeQuestion, saveSession, submitAnswer } from './session'

describe('session transitions',()=>{
  it('records a counter mistake against its subject and grades each question once',()=>{
    const state=structuredClone(initialState)
    state.activeDrill='counters'
    const question=adapters.counters.buildQuestion({drill:'counters',entryId:'people',exampleIndex:0},state.settings)
    state.drillSessions.counters.question=question
    const submitted=submitAnswer(state,'wrong','2026-11-07')
    expect(submitted.progress.counterMistakes).toEqual({people:1})
    expect(submitted.progress.byDrill.counters.incorrect).toBe(1)
    expect(submitAnswer(submitted,'wrong','2026-11-07')).toBe(submitted)
    expect(state.progress.lifetime.incorrect).toBe(0)
  })
  it('counts skipped questions in cooldown history without changing accuracy',()=>{
    let state=structuredClone(initialState)
    state.activeDrill='days'
    for(let i=0;i<12;i++){
      const next=makeQuestion(state)
      expect(state.drillSessions.days.recentSubjectKeys.slice(0,2)).not.toContain(next.question!.subjectKey)
      state=saveSession(state,next)
    }
    expect(state.progress.lifetime).toEqual({correct:0,incorrect:0})
  })
  it('preserves a selected native-zero form through rendering, direction changes, and answer-style changes',()=>{
    const settings={...initialState.settings,numberSystem:'native' as const,numberPreset:'custom' as const,customMin:0,customMax:0}
    const subject={drill:'numbers' as const,value:0,system:'native' as const,reverse:true,zeroWord:'공' as const}
    const question=adapters.numbers.buildQuestion(subject,settings)
    expect(adapters.numbers.buildQuestion(subject,settings).prompt).toBe('공')
    const forward={...settings,directions:{...settings.directions,numbers:'forward' as const}}
    const korean=updateQuestion(question,forward,settings)!
    expect(korean.canonical).toBe('공')
    expect(adapters.numbers.checkAnswer(korean,'영').correct).toBe(true)
    expect(adapters.numbers.checkAnswer(korean,'공').correct).toBe(true)
    const reverse={...forward,directions:{...forward.directions,numbers:'reverse' as const}}
    expect(updateQuestion(korean,reverse,forward)?.prompt).toBe('공')
    const state=structuredClone(initialState)
    state.settings=settings
    state.drillSessions.numbers.question=question
    expect(changeSettings(state,{answerMode:'typing'}).drillSessions.numbers.question).toBe(question)
  })
})
