import { describe, expect, it, vi } from 'vitest'
import { randomInteger, restoreRecentSubjectKeys, selectFromBag, selectRandom, subjectKey } from './selection'

describe('subject selection policies',()=>{
  it('keeps subject identity independent of direction and time format',()=>{
    expect(subjectKey({drill:'colors',entryId:'red',reverse:false})).toBe(subjectKey({drill:'colors',entryId:'red',reverse:true}))
    expect(subjectKey({drill:'time',hour:13,minute:5,format:'12',reverse:false})).toBe(subjectKey({drill:'time',hour:13,minute:5,format:'24',reverse:true}))
    expect(subjectKey({drill:'counters',entryId:'people',exampleIndex:0})).toBe(subjectKey({drill:'counters',entryId:'people',exampleIndex:1}))
  })
  it('relaxes only the oldest cooldown exclusion when the pool is too small',()=>{
    expect(selectRandom(['a','b'],id=>id,['a','b'],2)).toBe('b')
    expect(selectRandom(['a'],id=>id,['a','a'],2)).toBe('a')
    expect(()=>selectRandom([],String)).toThrow(RangeError)
  })
  it('avoids an immediate repeat when refilling without losing an item',()=>{
    const random=vi.spyOn(Math,'random').mockReturnValue(1-Number.EPSILON)
    try {
      const selected=selectFromBag(['a','b','c'],[],'a')
      expect(selected.item).not.toBe('a')
      expect(new Set([selected.item,...selected.remaining])).toEqual(new Set(['a','b','c']))
    } finally {random.mockRestore()}
  })
  it('filters stale bag entries without mutating the old bag and permits a singleton',()=>{
    const remaining=Object.freeze(['stale','b','b','a'])
    expect(selectFromBag(['a','b'],remaining)).toEqual({item:'b',remaining:['a']})
    expect(remaining).toEqual(['stale','b','b','a'])
    expect(selectFromBag(['a'],[],'a')).toEqual({item:'a',remaining:[]})
    expect(()=>selectFromBag([],[])).toThrow(RangeError)
  })
  it('samples the full inclusive integer range',()=>{
    const random=vi.spyOn(Math,'random')
    try {
      random.mockReturnValue(0)
      expect(randomInteger(5,9)).toBe(5)
      random.mockReturnValue(1-Number.EPSILON)
      expect(randomInteger(5,9)).toBe(9)
      expect(randomInteger(7,7)).toBe(7)
    } finally {random.mockRestore()}
  })
  it('restores old timestamped IDs, including hyphenated counter IDs',()=>{
    expect(restoreRecentSubjectKeys(['color-red-ko-123','day-monday-en-456','counter-people-honor-789','number-native-42-forward-12','time-13-5-12-digital-44','colors:blue',null,'unknown'])).toEqual(['colors:red','days:monday','counters:people-honor','numbers:native:42','time:13:5','colors:blue'])
  })
})
