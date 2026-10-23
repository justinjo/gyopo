import type { PersistedState } from './types'
export const APP_NAME = 'Gyopo'
export const APP_VERSION = '1.0.0'
export const DRILLS = ['numbers', 'counters', 'colors', 'time'] as const
export const initialState: PersistedState = {
  version: 2,
  settings: { answerMode: 'typing', direction: 'mixed', numberSystem: 'mixed', numberPreset: 'medium', customMin: 0, customMax: 9999, counterLevel: 'all', timeFormat: 'mixed' },
  progress: { lifetime: { correct: 0, incorrect: 0 }, byDrill: { numbers: { correct: 0, incorrect: 0 }, counters: { correct: 0, incorrect: 0 }, colors: { correct: 0, incorrect: 0 }, time: { correct: 0, incorrect: 0 } }, daily: [], counterMistakes: {} },
  session: { drill: 'numbers', question: null, input: '', feedback: null, translationVisible: false, recentIds: [], counterBag: [] }
}
