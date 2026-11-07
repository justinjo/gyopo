import type { AlphabetSession } from './content/alphabetSession'
import type { FlashcardSession } from './content/flashcardSession'
export type DrillId = 'numbers' | 'counters' | 'colors' | 'time' | 'days'
export type DirectionalDrillId = Exclude<DrillId, 'counters'>
export type SectionId = DrillId | 'flashcards' | 'alphabet'
export type AnswerMode = 'typing' | 'choice'
export type Direction = 'forward' | 'reverse' | 'mixed'
export type LevelFilter = 'all' | 'beginner' | 'intermediate'

export interface AcceptedAnswer { value: string; label?: string }
export type QuestionSubject =
  | {drill:'numbers'; value:number; system:'native'|'sino'; reverse:boolean}
  | {drill:'colors'|'days'; entryId:string; reverse:boolean}
  | {drill:'counters'; entryId:string; exampleIndex:number}
  | {drill:'time'; hour:number; minute:number; format:'12'|'24'; reverse:boolean}
export interface SubjectSelection { subject:QuestionSubject; counterBag:string[] }
export interface Question {
  id: string
  subjectKey: string
  subject?: QuestionSubject
  drill: DrillId
  prompt: string
  promptLabel: string
  canonical: string
  accepted: AcceptedAnswer[]
  choices?: string[]
  translation?: string
  progressKey: string
  meta?: Record<string, string | number | boolean>
}
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
  version: 4
  view: SectionId
  alphabetSession: AlphabetSession
  settings: Settings
  progress: ProgressSnapshot
  activeDrill: DrillId
  drillSessions: Record<DrillId, ActiveSession>
  flashcardSession: FlashcardSession
}
