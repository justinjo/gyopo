import type { AnswerMode, AnswerResult, Question } from '../types'
import { normalizeAnswer, normalizeTime, shuffle } from '../lib/normalize'

type AnswerSpec = Pick<Question, 'canonical' | 'accepted'> & {normalization?:Question['normalization']}
const normalizerFor = (question:AnswerSpec) => question.normalization==='time' ? normalizeTime : normalizeAnswer

export function checkAnswer(question:AnswerSpec,input:string):AnswerResult {
  const normalize=normalizerFor(question),normalizedInput=normalize(input)
  const accepted=question.accepted.find(answer=>normalize(answer.value)===normalizedInput)
  return {correct:!!accepted,canonical:question.canonical,normalizedInput,note:accepted?.label}
}

// No partial sets: a choice question always has three distinct options and one accepted answer.
export function hasValidChoices(question:AnswerSpec & Pick<Question,'choices'>):boolean {
  const choices=question.choices
  if(!choices||choices.length!==3)return false
  const normalize=normalizerFor(question)
  return choices.every(choice=>normalize(choice)!=='')&&new Set(choices.map(normalize)).size===3&&choices.filter(choice=>checkAnswer(question,choice).correct).length===1
}

export function buildChoices(question:AnswerSpec,candidates:readonly string[]):string[] {
  if(!checkAnswer(question,question.canonical).correct)return []
  const normalize=normalizerFor(question),seen=new Set([normalize(question.canonical)])
  const distractors=shuffle(candidates).filter(candidate=>{
    const key=normalize(candidate)
    if(!key||seen.has(key)||checkAnswer(question,candidate).correct)return false
    seen.add(key)
    return true
  }).slice(0,2)
  return distractors.length===2?shuffle([question.canonical,...distractors]):[]
}

export function effectiveAnswerMode(preferred:AnswerMode,question:Question):AnswerMode {
  return preferred==='choice'&&!hasValidChoices(question)?'typing':preferred
}
