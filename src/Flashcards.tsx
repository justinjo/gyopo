import { flashcardDeck, type FlashcardSession } from './content/flashcardSession'
import { shuffle } from './lib/normalize'

export function Flashcards({session,onChange}:{session:FlashcardSession;onChange:(session:FlashcardSession)=>void}){
  const {index,revealed:flipped,order,direction}=session
  const cards=flashcardDeck(session.lessonIds)
  const card=cards.find(card=>card.key===order[index])!,lesson=card.lesson
  const showEnglish=direction==='english'?!flipped:flipped
  const visible=showEnglish?card.english:card.korean,nextLanguage=showEnglish?'Korean':'English'
  function setFlipped(revealed:boolean){onChange({...session,revealed})}
  function move(offset:number){onChange({...session,index:(index+offset+order.length)%order.length,revealed:false})}
  function shuffleCards(){onChange({...session,order:shuffle(order),index:0,revealed:false})}
  return <main className="flashcards-view">
    <header className="flashcards-header"><div><p className="eyebrow">Vocabulary deck</p><h2>Flashcards</h2></div><button className="shuffle-button" onClick={shuffleCards}>Shuffle</button></header>
    <section className="flashcard-study"><div className="card-meta"><span>Lesson {lesson.number} · {lesson.koreanTitle}</span><span>{index+1} of {order.length}</span></div>
      <button className={`flashcard ${flipped?'flipped':''}`} onClick={()=>setFlipped(!flipped)} aria-label={`${visible}. ${flipped?'Show':'Reveal'} ${nextLanguage}`}><span className="card-side-label">{showEnglish?'English':'한국어'}</span><strong>{visible}</strong><small>Tap to {flipped?'show':'reveal'} {nextLanguage}</small></button>
      <div className="card-navigation"><button onClick={()=>move(-1)} aria-label="Previous card">← Previous</button><button className="primary" onClick={()=>flipped?move(1):setFlipped(true)}>{flipped?'Next →':'Reveal'}</button></div>
    </section>
  </main>
}
