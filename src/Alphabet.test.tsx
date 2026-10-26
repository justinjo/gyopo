import { cleanup,fireEvent,render,screen } from '@testing-library/react'
import { afterEach,describe,expect,it } from 'vitest'
import { Alphabet } from './Alphabet'
import { alphabet } from './content/alphabet'
afterEach(cleanup)
describe('alphabet learning',()=>{
  it('includes all 40 distinct modern letters',()=>{
    expect(alphabet).toHaveLength(40)
    expect(new Set(alphabet.map(item=>item.letter)).size).toBe(40)
  })
  it('lets learners select letters and switch groups',()=>{
    render(<Alphabet/> )
    fireEvent.click(screen.getByRole('button',{name:'ㅇ 이응'}))
    expect(screen.getByText('silent at the start; ng at the end')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button',{name:'Basic vowels'}))
    expect(screen.getByRole('button',{name:'ㅏ 아'})).toHaveAttribute('aria-pressed','true')
    expect(screen.getByText('1 of 10')).toBeInTheDocument()
  })
  it('hides study answers until revealed and resets them for the next letter',()=>{
    render(<Alphabet/> )
    fireEvent.click(screen.getByRole('button',{name:'Study cards'}))
    expect(screen.queryByText('g / k')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button',{name:'Reveal sound'}))
    expect(screen.getByText('g / k')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button',{name:'Next letter →'}))
    expect(screen.queryByText('n')).not.toBeInTheDocument()
    expect(screen.getByRole('button',{name:'Reveal sound'})).toBeInTheDocument()
  })
})
