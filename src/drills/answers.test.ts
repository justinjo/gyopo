import { describe,expect,it } from 'vitest'
import { initialState } from '../config'
import { colors } from '../content/colors'
import { days } from '../content/days'
import { adapters, updateQuestion } from '.'
import { buildChoices, checkAnswer, effectiveAnswerMode, hasValidChoices } from './answers'
import { normalizeAnswer, normalizeTime } from '../lib/normalize'

describe('validated multiple choice',()=>{
  it('excludes aliases and normalized duplicates using the grading rules',()=>{
    const spec={canonical:'gray',accepted:[{value:'gray'},{value:'grey'}]}
    const choices=buildChoices(spec,['GREY!',' blue ','BLUE','red','red.'])
    expect(new Set(choices.map(normalizeAnswer))).toEqual(new Set(['gray','blue','red']))
    expect(choices.filter(choice=>checkAnswer(spec,choice).correct)).toEqual(['gray'])
    expect(buildChoices(spec,['grey','gray','blue'])).toEqual([])
  })
  it('uses digital time normalization when filtering equivalent answers',()=>{
    const spec={canonical:'3:05 PM',accepted:[{value:'3:05 PM'},{value:'15:05'}],normalization:'time' as const}
    const choices=buildChoices(spec,['15:5','03:05 pm','4:05 PM','16:05','5:05 PM'])
    expect(new Set(choices.map(normalizeTime))).toEqual(new Set(['15:05','16:05','17:05']))
    expect(choices.filter(choice=>checkAnswer(spec,choice).correct)).toHaveLength(1)
  })
  it.each([0,1])('falls back to typing for a range with %i extra values without changing the preference',extra=>{
    const settings={...initialState.settings,numberSystem:'sino' as const,numberPreset:'custom' as const,customMin:42,customMax:42+extra}
    const q=adapters.numbers.buildQuestion({drill:'numbers',value:42,system:'sino',reverse:false},settings)
    expect(q.choices).toEqual([])
    expect(effectiveAnswerMode('choice',q)).toBe('typing')
    expect(settings.answerMode).toBe('choice')
  })
  it.each(['sino','native'] as const)('keeps three valid choices within %s ranges at both boundaries',system=>{
    for(const [min,max] of [[0,2],[42,44],[97,99],...(system==='sino'?[[999_999_997,999_999_999],[0,999_999_999]]:[])]){
      const settings={...initialState.settings,numberSystem:system,numberPreset:'custom' as const,customMin:min,customMax:max}
      for(const value of [min,max])for(const reverse of [false,true]){
        const question=adapters.numbers.buildQuestion({drill:'numbers',value,system,reverse},settings)
        expect(hasValidChoices(question)).toBe(true)
        if(reverse)expect(question.choices!.every(choice=>Number(choice)>=min&&Number(choice)<=max)).toBe(true)
      }
    }
  })
  it('rebuilds range-bound choices without changing the selected number and restores choice mode',()=>{
    const settings={...initialState.settings,numberSystem:'sino' as const,numberPreset:'custom' as const,customMin:42,customMax:44}
    const q=adapters.numbers.buildQuestion({drill:'numbers',value:42,system:'sino',reverse:true},settings)
    const narrow={...settings,customMax:43}
    const typing=updateQuestion(q,narrow,settings)!
    expect(typing.id).toBe(q.id)
    expect(typing.subjectKey).toBe(q.subjectKey)
    expect(effectiveAnswerMode('choice',typing)).toBe('typing')
    const restored=updateQuestion(typing,settings,narrow)!
    expect(effectiveAnswerMode('choice',restored)).toBe('choice')
    expect(new Set(restored.choices)).toEqual(new Set(['42','43','44']))
  })
  it('provides one correct answer for every color/day and representative clock values in either direction',()=>{
    for(const reverse of [false,true]){
      for(const entry of colors)expect(hasValidChoices(adapters.colors.buildQuestion({drill:'colors',entryId:entry.id,reverse},initialState.settings))).toBe(true)
      for(const entry of days)expect(hasValidChoices(adapters.days.buildQuestion({drill:'days',entryId:entry.id,reverse},initialState.settings))).toBe(true)
      for(let hour=0;hour<24;hour++)for(const minute of [0,5,30,59])for(const format of ['12','24'] as const){
        const question=adapters.time.buildQuestion({drill:'time',hour,minute,format,reverse},initialState.settings)
        expect(hasValidChoices(question)).toBe(true)
      }
    }
  })
  it('rejects partial, duplicate, ambiguous, and unanswerable saved choice sets',()=>{
    const q=adapters.days.buildQuestion({drill:'days',entryId:'monday',reverse:true},initialState.settings)
    for(const choices of [undefined,['Monday'],['Monday','Tuesday','TUESDAY!'],['Tuesday','Wednesday','Thursday'],['Monday','Tuesday','Wednesday','Thursday']]){
      expect(effectiveAnswerMode('choice',{...q,choices})).toBe('typing')
    }
    const gray=adapters.colors.buildQuestion({drill:'colors',entryId:'gray',reverse:true},initialState.settings)
    expect(effectiveAnswerMode('choice',{...gray,choices:['gray','grey','blue']})).toBe('typing')
    expect(effectiveAnswerMode('typing',q)).toBe('typing')
  })
})
