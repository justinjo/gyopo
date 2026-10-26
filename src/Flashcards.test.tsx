import { fireEvent,render,screen,cleanup } from '@testing-library/react'
import { afterEach,describe,expect,it,vi } from 'vitest'
vi.mock('virtual:pwa-register/react',()=>({useRegisterSW:vi.fn()}))
import { Flashcards } from './App'
afterEach(cleanup)
describe('flashcard study',()=>{
  it('starts with English and reveals Korean in the reversed direction',()=>{
    render(<Flashcards lessonIds={['house-family']} direction="english"/> )
    expect(screen.getByRole('button',{name:'apartment. Reveal Korean'})).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button',{name:'Reveal'}))
    expect(screen.getByRole('button',{name:'아파트. Show English'})).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button',{name:'Next →'}))
    expect(screen.getByRole('button',{name:'living room. Reveal Korean'})).toBeInTheDocument()
  })
  it('studies selected lessons together and shows the source lesson',()=>{
    render(<Flashcards lessonIds={['house-family','animals-opinions']} direction="korean"/> )
    expect(screen.getByText('1 of 50')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button',{name:'Previous card'}))
    expect(screen.getByText('50 of 50')).toBeInTheDocument()
    expect(screen.getByText('Lesson 2 · 동물과 생각')).toBeInTheDocument()
    expect(screen.getByRole('button',{name:'외향적이다. Reveal English'})).toBeInTheDocument()
  })
})
