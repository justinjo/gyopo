import { describe,expect,it } from 'vitest'
import { initialState } from '../config'
import { migrate,repository } from './repository'
describe('persistence',()=>{
  it('migrates partial old state without losing scores',()=>{const migrated=migrate({version:1,progress:{lifetime:{correct:12,incorrect:3}}});expect(migrated.version).toBe(2);expect(migrated.progress.lifetime.correct).toBe(12);expect(migrated.settings.answerMode).toBe('choice')})
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
