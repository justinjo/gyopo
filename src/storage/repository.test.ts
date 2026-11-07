import { createAlphabetSession } from '../content/alphabetSession'
import { describe,expect,it } from 'vitest'
import { DRILLS, initialState } from '../config'
import { createFlashcardSession, flashcardDeck } from '../content/flashcardSession'
import { adapters } from '../drills'
import { migrate,repository } from './repository'
describe('persistence',()=>{
  it('migrates partial old state without losing scores',()=>{const migrated=migrate({version:1,progress:{lifetime:{correct:12,incorrect:3}}});expect(migrated.version).toBe(4);expect(migrated.progress.lifetime.correct).toBe(12);expect(migrated.settings.answerMode).toBe('choice')})
  it('round trips IndexedDB state',async()=>{const state=structuredClone(initialState);state.progress.lifetime.correct=7;await repository.save(state);expect((await repository.load()).progress.lifetime.correct).toBe(7)})
})

describe('selected section persistence',()=>{
  it.each(['numbers','counters','colors','time','days','flashcards','alphabet'] as const)('restores %s after reloading',async view=>{
    const state={...structuredClone(initialState),view}
    await repository.save(state)
    expect((await repository.load()).view).toBe(view)
  })
  it('uses the active drill for saved data from before section persistence',()=>{
    expect(migrate({session:{drill:'days'}}).view).toBe('days')
  })
  it('falls back to the active drill for an invalid saved section',()=>{
    expect(migrate({view:'missing',session:{drill:'colors'}}).view).toBe('colors')
  })
})

describe('Hangul session persistence',()=>{
  it('round trips the shuffled deck and current position',async()=>{
    const state=structuredClone(initialState)
    state.view='alphabet'
    state.alphabetSession.order.reverse()
    state.alphabetSession.index=12
    state.alphabetSession.revealed=true
    await repository.save(state)
    expect((await repository.load()).alphabetSession).toEqual(state.alphabetSession)
  })
  it('gives older saves an all-letter study deck',()=>{
    const saved=migrate({version:2})
    expect(saved.alphabetSession.group).toBe('all')
    expect(saved.alphabetSession.study).toBe(true)
    expect(saved.alphabetSession.order).toHaveLength(40)
  })
  it('replaces invalid saved decks and out-of-range positions',()=>{
    const invalid={...initialState.alphabetSession,order:['missing']}
    expect(migrate({alphabetSession:invalid}).alphabetSession.order).toHaveLength(40)
    expect(migrate({alphabetSession:{...initialState.alphabetSession,index:50}}).alphabetSession.index).toBe(0)
  })
})

it('restores a 받침 deck without changing its order or position',()=>{
  const session=createAlphabetSession('batchim')
  session.index=4
  session.revealed=true
  expect(migrate({alphabetSession:session}).alphabetSession).toEqual(session)
})


it('migrates old question-ID history to stable subject keys without losing the active question',()=>{
  const old={session:{...initialState.drillSessions.colors,drill:'colors',recentSubjectKeys:undefined,recentIds:['color-red-en-123','color-blue-ko-124'],question:{id:'color-red-en-123',drill:'colors',progressKey:'red',canonical:'red'}}}
  const restored=migrate(old)
  expect(restored.drillSessions.colors.recentSubjectKeys).toEqual(['colors:red','colors:blue'])
  expect(restored.drillSessions.colors.question?.subjectKey).toBe('colors:red')
  expect(restored.drillSessions.colors.question?.canonical).toBe('red')
  expect(restored.drillSessions.colors).not.toHaveProperty('recentIds')
})


describe('per-section sessions',()=>{
  it('migrates the v2 active drill with question, answer, feedback, and progress intact',()=>{
    const question=adapters.days.buildQuestion({drill:'days',entryId:'monday',reverse:false},initialState.settings)
    const session={...initialState.drillSessions.days,question,input:'Monday',feedback:{correct:false,canonical:question.canonical,normalizedInput:'monday'},recentSubjectKeys:[question.subjectKey],translationVisible:true}
    const restored=migrate({version:2,view:'flashcards',session,progress:{lifetime:{correct:4,incorrect:1}}})
    expect(restored.activeDrill).toBe('days')
    expect(restored.drillSessions.days).toEqual(session)
    expect(restored.drillSessions.numbers.question).toBeNull()
    expect(restored.progress.lifetime).toEqual({correct:4,incorrect:1})
    expect(restored).not.toHaveProperty('session')
    expect(restored.flashcardSession.lessonIds).toEqual(['house-family'])
  })
  it('round trips every drill session including inactive questions and selection state',async()=>{
    const state=structuredClone(initialState)
    for(const drill of DRILLS){
      const selection=adapters[drill].selectNext({settings:state.settings,recentSubjectKeys:[],counterBag:[]})
      const question=adapters[drill].buildQuestion(selection.subject,state.settings)
      state.drillSessions[drill]={drill,question,input:question.canonical,feedback:adapters[drill].checkAnswer(question,question.canonical),translationVisible:true,recentSubjectKeys:[question.subjectKey],counterBag:selection.counterBag}
    }
    state.activeDrill='days'
    state.view='alphabet'
    await repository.save(state)
    const restored=await repository.load()
    expect(restored.drillSessions).toEqual(state.drillSessions)
    expect(restored.activeDrill).toBe('days')
  })
  it('round trips vocabulary selection, direction, shuffled order, position, and reveal',async()=>{
    const state=structuredClone(initialState)
    state.flashcardSession=createFlashcardSession(['animals-opinions','requests-obligations'],'english')
    state.flashcardSession.order.reverse()
    state.flashcardSession.index=31
    state.flashcardSession.revealed=true
    await repository.save(state)
    expect((await repository.load()).flashcardSession).toEqual(state.flashcardSession)
  })
  it('repairs stale vocabulary decks while retaining valid lesson choices and direction',()=>{
    const session=createFlashcardSession(['requests-obligations'],'english')
    session.order.pop()
    const restored=migrate({flashcardSession:{...session,lessonIds:['requests-obligations','removed-lesson'],index:20,revealed:true}}).flashcardSession
    expect(restored.lessonIds).toEqual(['requests-obligations'])
    expect(restored.direction).toBe('english')
    expect(restored.order).toEqual(flashcardDeck(restored.lessonIds).map(card=>card.key))
    expect(restored.index).toBe(0)
    expect(restored.revealed).toBe(false)
    expect(migrate({flashcardSession:{lessonIds:['missing'],order:[]}}).flashcardSession.lessonIds).toEqual(['house-family'])
  })
})


describe('per-drill direction settings',()=>{
  it('migrates an old global direction to every directional drill without retaining the global field',()=>{
    const restored=migrate({version:3,settings:{direction:'reverse',answerMode:'typing'}})
    expect(restored.settings.directions).toEqual({numbers:'reverse',colors:'reverse',time:'reverse',days:'reverse'})
    expect(restored.settings).not.toHaveProperty('direction')
    expect(restored.settings.answerMode).toBe('typing')
  })
  it('round trips independent directions and repairs invalid or partial direction maps',async()=>{
    const state=structuredClone(initialState)
    state.settings.directions={numbers:'forward',colors:'mixed',time:'reverse',days:'forward'}
    await repository.save(state)
    expect((await repository.load()).settings.directions).toEqual(state.settings.directions)
    expect(migrate({settings:{direction:'reverse',directions:{numbers:'forward',colors:'invalid'}}}).settings.directions).toEqual({numbers:'forward',colors:'reverse',time:'reverse',days:'reverse'})
    expect(migrate({settings:{direction:'invalid'}}).settings.directions).toEqual(initialState.settings.directions)
  })
})
