import { useState } from 'react'
import { alphabet, letterGroups, type LetterGroup } from './content/alphabet'

export function Alphabet(){
  const [group,setGroup]=useState<LetterGroup>('consonants')
  const [index,setIndex]=useState(0),[study,setStudy]=useState(false),[revealed,setRevealed]=useState(false)
  const letters=alphabet.filter(letter=>letter.group===group),letter=letters[index]
  function move(offset:number){setIndex(value=>(value+offset+letters.length)%letters.length);setRevealed(false)}
  return <main className="flashcards-view alphabet-view">
    <header className="flashcards-header"><div><p className="eyebrow">Learn to read Korean</p><h2>Hangul alphabet</h2></div><button className="shuffle-button" onClick={()=>{setStudy(value=>!value);setRevealed(false)}}>{study?'Reference':'Study cards'}</button></header>
    <p className="alphabet-intro">Hangul letters form syllable blocks. In 한, ㅎ + ㅏ + ㄴ make one syllable. Start with the basic consonants and vowels, then try the combined letters.</p>
    <div className="alphabet-groups" role="group" aria-label="Letter groups">{letterGroups.map(item=><button key={item.id} aria-pressed={group===item.id} onClick={()=>{setGroup(item.id);setIndex(0);setRevealed(false)}}>{item.label}</button>)}</div>
    {!study&&<div className="alphabet-grid" aria-label="Letters">{letters.map((item,i)=><button key={item.letter} aria-label={`${item.letter} ${item.name}`} aria-pressed={i===index} onClick={()=>setIndex(i)}>{item.letter}</button>)}</div>}
    <section className="flashcard-study" aria-label="Letter details">
      <div className="card-meta"><span>{letterGroups.find(item=>item.id===group)!.label}</span><span>{index+1} of {letters.length}</span></div>
      <div className="flashcard alphabet-card"><span className="card-side-label">{study?'Recall the sound':'Letter and sound'}</span><strong>{letter.letter}</strong>
        {(!study||revealed)?<div className="letter-details"><h3>{letter.name}</h3><p>{letter.sound}</p><p><b>{letter.example}</b> · {letter.meaning}</p></div>:<button className="shuffle-button" onClick={()=>setRevealed(true)}>Reveal sound</button>}
      </div>
      <div className="card-navigation"><button onClick={()=>move(-1)} aria-label="Previous letter">← Previous</button><button className="primary" onClick={()=>move(1)}>Next letter →</button></div>
    </section>
    <p className="alphabet-intro">English sound guides are approximate. Consonant sounds change with position; aspirated consonants use a puff of air, while double consonants are tense. Many speakers pronounce ㅐ and ㅔ alike.</p>
  </main>
}
