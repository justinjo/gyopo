import { describe,expect,it } from 'vitest'
import { initialState } from '../config'
import { adapters, updateQuestion } from '../drills'
import { checkAnswer } from '../drills/answers'
import { migrate } from './repository'
import { restoreQuestion } from './questions'

describe('typed question restoration',()=>{
  it('recovers a legacy clock subject from its id while preserving the displayed question and feedback',()=>{
    const question=adapters.time.buildQuestion({drill:'time',hour:13,minute:5,format:'12',reverse:true},initialState.settings)
    const {subject,meta,subjectKey,progressGroup,normalization,...legacy}=question
    const feedback=checkAnswer(question,question.canonical)
    const restored=migrate({version:2,session:{drill:'time',question:legacy,input:question.canonical,feedback}})
    expect(restored.drillSessions.time.question).toEqual(question)
    expect(restored.drillSessions.time.feedback).toEqual(feedback)
    const settings={...restored.settings,timeFormat:'24' as const}
    expect(updateQuestion(restored.drillSessions.time.question!,settings,restored.settings)?.subject).toMatchObject({hour:13,minute:5,format:'24',reverse:true})
  })
  it('keeps saved color aliases and choice order instead of reshuffling on reload',()=>{
    const question=adapters.colors.buildQuestion({drill:'colors',entryId:'gray',reverse:true},initialState.settings)
    const saved={...question,canonical:'grey',choices:['red','grey','blue']}
    expect(restoreQuestion(saved,'colors',initialState.settings)).toEqual(saved)
  })
  it('rejects missing or malformed subjects without losing scores or other sections',()=>{
    const valid=adapters.days.buildQuestion({drill:'days',entryId:'monday',reverse:false},initialState.settings)
    const invalid=[
      {id:'unknown',drill:'numbers'},
      {id:'number-native-100-forward-1',drill:'numbers',subject:{drill:'numbers',value:100,system:'native',reverse:false}},
      {id:'time-24-99-12-digital-1',drill:'time'},
      {id:'counter-missing-1',drill:'counters',subject:{drill:'counters',entryId:'missing',exampleIndex:0}},
      {...valid,subject:{drill:'colors',entryId:'red',reverse:false}},
    ]
    for(const question of invalid){
      const state=migrate({activeDrill:question.drill,drillSessions:{[question.drill]:{question,feedback:{correct:true}},days:{question:valid}},progress:{lifetime:{correct:8,incorrect:2}}})
      if(question.drill!=='days')expect(state.drillSessions[question.drill as keyof typeof state.drillSessions].question).toBeNull()
      expect(state.progress.lifetime).toEqual({correct:8,incorrect:2})
    }
    expect(restoreQuestion(invalid[4],'days',initialState.settings)).toBeNull()
  })
  it('repairs malformed accepted answers so the canonical answer remains answerable',()=>{
    const question=adapters.days.buildQuestion({drill:'days',entryId:'monday',reverse:false},initialState.settings)
    const restored=restoreQuestion({...question,canonical:'invalid',accepted:[null,{value:12},{value:'other'}]},'days',initialState.settings)!
    expect(checkAnswer(restored,restored.canonical).correct).toBe(true)
    expect(restored.canonical).toBe(question.canonical)
    expect(migrate({drillSessions:{days:{question,feedback:{correct:true,canonical:{}}}}}).drillSessions.days.feedback).toBeNull()
  })
})
