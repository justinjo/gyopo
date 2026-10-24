export type DrillId = 'numbers' | 'counters' | 'colors' | 'time' | 'days'
export type AnswerMode = 'typing' | 'choice'
export type Direction = 'forward' | 'reverse' | 'mixed'
export type LevelFilter = 'all' | 'beginner' | 'intermediate'

export interface AcceptedAnswer { value: string; label?: string }
export interface Question {
  id: string
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
export interface DrillContext { settings: Settings; recentIds: string[]; counterBag: string[] }
export interface DrillAdapter {
  id: DrillId
  label: string
  createQuestion(context: DrillContext): Question
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
  direction: Direction
  numberSystem: 'sino' | 'native' | 'mixed'
  numberPreset: 'small' | 'medium' | 'large' | 'custom'
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
  recentIds: string[]
  counterBag: string[]
}
export interface PersistedState {
  version: 2
  settings: Settings
  progress: ProgressSnapshot
  session: ActiveSession
}
