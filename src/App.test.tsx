import { cleanup,fireEvent,render,screen,waitFor,within } from '@testing-library/react'
import { afterEach,beforeEach,describe,expect,it,vi } from 'vitest'
import { initialState } from './config'
import { createFlashcardSession, flashcardDeck } from './content/flashcardSession'
import { adapters } from './drills'
import { repository } from './storage/repository'
import type { PersistedState } from './types'
import { App } from './App'

vi.mock('virtual:pwa-register/react',()=>({useRegisterSW:()=>({needRefresh:[false,vi.fn()],updateServiceWorker:vi.fn()})}))
vi.mock('./storage/repository',()=>({repository:{load:vi.fn(),save:vi.fn()}}))
let saved:PersistedState
beforeEach(()=>{
  saved=structuredClone(initialState)
  saved.settings={...saved.settings,answerMode:'typing',directions:{numbers:'forward',colors:'forward',time:'forward',days:'forward'},numberSystem:'sino',numberPreset:'custom',customMin:42,customMax:42}
  vi.mocked(repository.load).mockImplementation(async()=>structuredClone(saved))
  vi.mocked(repository.save).mockImplementation(async state=>{saved=structuredClone(state)})
  vi.stubGlobal('matchMedia',()=>({matches:false,addEventListener:vi.fn(),removeEventListener:vi.fn()}))
})
afterEach(()=>{cleanup();vi.unstubAllGlobals();vi.clearAllMocks()})
const tab=(name:string)=>within(screen.getByRole('navigation')).getByRole('button',{name:new RegExp(name)})
const input=()=>screen.getByRole('textbox',{name:'Your answer'})

describe('resuming section sessions',()=>{
  it('keeps inactive answers and submitted feedback through switching and reload',async()=>{
    render(<App/>)
    await screen.findByRole('textbox',{name:'Your answer'})
    fireEvent.change(input(),{target:{value:'draft number'}})
    fireEvent.click(tab('Days'))
    fireEvent.change(input(),{target:{value:'wrong day'}})
    fireEvent.click(screen.getByRole('button',{name:/Check/}))
    expect(screen.getByText('Not quite')).toBeInTheDocument()
    const dayQuestion=saved.drillSessions.days.question
    fireEvent.click(tab('Numbers'))
    expect(input()).toHaveValue('draft number')
    fireEvent.click(tab('Days'))
    expect(screen.getByText('Not quite')).toBeInTheDocument()
    await waitFor(()=>expect(saved.view).toBe('days'))
    cleanup()
    render(<App/>)
    await screen.findByText('Not quite')
    expect(saved.drillSessions.days.question).toEqual(dayQuestion)
    expect(saved.progress.lifetime.incorrect).toBe(1)
    fireEvent.click(tab('Numbers'))
    expect(input()).toHaveValue('draft number')
  })
  it('persists vocabulary direction, selection, shuffled position, and reveal through a reload',async()=>{
    saved.view='flashcards'
    saved.flashcardSession=createFlashcardSession(['requests-obligations'],'english')
    saved.flashcardSession.order.reverse()
    saved.flashcardSession.index=3
    const key=saved.flashcardSession.order[3]
    const card=flashcardDeck(saved.flashcardSession.lessonIds).find(card=>card.key===key)!
    render(<App/>)
    await screen.findByRole('button',{name:`${card.english}. Reveal Korean`})
    fireEvent.click(screen.getByRole('button',{name:'Reveal'}))
    expect(screen.getByRole('button',{name:`${card.korean}. Show English`})).toBeInTheDocument()
    fireEvent.click(tab('Days'))
    fireEvent.click(tab('Vocab'))
    await waitFor(()=>expect(saved.flashcardSession.revealed).toBe(true))
    cleanup()
    render(<App/>)
    await screen.findByRole('button',{name:`${card.korean}. Show English`})
    expect(saved.flashcardSession.lessonIds).toEqual(['requests-obligations'])
    expect(saved.flashcardSession.index).toBe(3)
  })
  it('keeps weekday direction local while preserving other questions across reload',async()=>{
    saved.activeDrill='days'
    saved.view='days'
    saved.drillSessions.numbers.question=adapters.numbers.buildQuestion({drill:'numbers',value:42,system:'sino',reverse:false},saved.settings)
    const numberQuestion=structuredClone(saved.drillSessions.numbers.question)
    render(<App/>)
    await screen.findByRole('textbox',{name:'Your answer'})
    const daySubject=saved.drillSessions.days.question?.subjectKey
    fireEvent.click(screen.getByRole('button',{name:'Open settings'}))
    fireEvent.click(screen.getByRole('button',{name:'From Korean'}))
    fireEvent.click(screen.getByRole('button',{name:'Close settings'}))
    fireEvent.click(tab('Numbers'))
    expect(saved.drillSessions.numbers.question).toEqual(numberQuestion)
    expect(saved.settings.directions).toEqual({numbers:'forward',colors:'forward',time:'forward',days:'reverse'})
    expect(saved.drillSessions.days.question?.subjectKey).toBe(daySubject)
    expect(saved.drillSessions.days.question?.subject).toMatchObject({drill:'days',reverse:true})
    cleanup()
    render(<App/>)
    await screen.findByRole('textbox',{name:'Your answer'})
    expect(saved.drillSessions.numbers.question).toEqual(numberQuestion)
    fireEvent.click(tab('Days'))
    expect(screen.getByText('Write the day in English')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button',{name:'Open settings'}))
    expect(screen.getByRole('button',{name:'From Korean'})).toHaveClass('selected')
    expect(screen.getByRole('region',{name:'Global settings'})).toHaveTextContent('Answer style')
  })
})
