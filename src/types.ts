import type { AlphabetSession } from './content/alphabetSession'
import type { FlashcardSession } from './content/flashcardSession'
export type DrillId = 'numbers' | 'counters' | 'colors' | 'time' | 'days'
export type DirectionalDrillId = Exclude<DrillId, 'counters'>
export type SectionId = DrillId | 'flashcards' | 'alphabet'
export type AnswerMode = 'typing' | 'choice'
export type Direction = 'forward' | 'reverse' | 'mixed'
export type LevelFilter = 'all' | 'beginner' | 'intermediate'

export interface AcceptedAnswer { value: string; label?: string }
export interface NumberSubject {drill:'numbers'; value:number; system:'native'|'sino'; reverse:boolean; zeroWord?:'영'|'공'}
export interface ColorSubject {drill:'colors'; entryId:string; reverse:boolean}
export interface DaySubject {drill:'days'; entryId:string; reverse:boolean}
export interface CounterSubject {drill:'counters'; entryId:string; exampleIndex:number}
export interface TimeSubject {drill:'time'; hour:number; minute:number; format:'12'|'24'; reverse:boolean}
export type QuestionSubject = NumberSubject | ColorSubject | DaySubject | CounterSubject | TimeSubject
export interface SubjectSelection { subject:QuestionSubject; counterBag:string[] }
interface QuestionBase {
  id:string
  subjectKey:string
  prompt:string
  promptLabel:string
  canonical:string
  accepted:AcceptedAnswer[]
  choices?:string[]
  translation?:string
  normalization:'text'|'time'
}
export type NumberQuestion = QuestionBase & {
  drill:'numbers'; subject:NumberSubject
  meta:{value:number; system:'native'|'sino'; reverse:boolean}
  progressGroup:{kind:'number-system'; value:'native'|'sino'}
}
export type ColorQuestion = QuestionBase & {
  drill:'colors'; subject:ColorSubject
  meta:{hex:string; swatch:boolean; reverse:boolean}
  progressGroup:{kind:'drill'; value:'colors'}
}
export type CounterQuestion = QuestionBase & {
  drill:'counters'; subject:CounterSubject
  meta:{gloss:string}
  progressGroup:{kind:'drill'; value:'counters'}
}
export type TimeQuestion = QuestionBase & {
  drill:'time'; subject:TimeSubject
  meta:{digital:boolean; format:'12'|'24'; hour:number; minute:number; reverse:boolean}
  progressGroup:{kind:'time-format'; value:'12'|'24'}
}
export type DayQuestion = QuestionBase & {
  drill:'days'; subject:DaySubject
  meta:{reverse:boolean}
  progressGroup:{kind:'drill'; value:'days'}
}
export type Question = NumberQuestion | ColorQuestion | CounterQuestion | TimeQuestion | DayQuestion
export interface AnswerResult { correct: boolean; canonical: string; normalizedInput: string; note?: string }
export interface DrillContext { settings: Settings; recentSubjectKeys: readonly string[]; counterBag: readonly string[] }
export interface DrillAdapter {
  id: DrillId
  label: string
  selectNext(context: DrillContext): SubjectSelection
  buildQuestion(subject: QuestionSubject, settings: Settings): Question
  checkAnswer(question: Question, input: string): AnswerResult
}
export interface DrillScore { correct: number; incorrect: number }
export interface DailyActivity { date: string; completed: number; correct: number }
export interface ProgressSnapshot {
  lifetime: DrillScore
  byDrill: Record<DrillId, DrillScore>
  daily: DailyActivity[]
  counterMistakes: Record<string, number>
}
export interface Settings {
  answerMode: AnswerMode
  directions: Record<DirectionalDrillId, Direction>
  numberSystem: 'sino' | 'native' | 'mixed'
  numberPreset: 'small' | 'medium' | 'large' | 'extra-large' | 'custom'
  customMin: number
  customMax: number
  counterLevel: LevelFilter
  timeFormat: '12' | '24' | 'mixed'
}
export interface ActiveSession {
  drill: DrillId
  question: Question | null
  input: string
  feedback: AnswerResult | null
  translationVisible: boolean
  recentSubjectKeys: string[]
  counterBag: string[]
}
export interface PersistedState {
  version: 5
  view: SectionId
  alphabetSession: AlphabetSession
  settings: Settings
  progress: ProgressSnapshot
  activeDrill: DrillId
  drillSessions: Record<DrillId, ActiveSession>
  flashcardSession: FlashcardSession
}
