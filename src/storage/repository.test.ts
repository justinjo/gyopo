import { describe,expect,it } from 'vitest'
import { initialState } from '../config'
import { migrate,repository } from './repository'
describe('persistence',()=>{
  it('migrates partial old state without losing scores',()=>{const migrated=migrate({version:1,progress:{lifetime:{correct:12,incorrect:3}}});expect(migrated.version).toBe(2);expect(migrated.progress.lifetime.correct).toBe(12);expect(migrated.settings.answerMode).toBe('typing')})
  it('round trips IndexedDB state',async()=>{const state=structuredClone(initialState);state.progress.lifetime.correct=7;await repository.save(state);expect((await repository.load()).progress.lifetime.correct).toBe(7)})
})
