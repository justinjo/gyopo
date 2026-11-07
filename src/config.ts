import { createAlphabetSession } from './content/alphabetSession'
import { createFlashcardSession } from './content/flashcardSession'
import type { ActiveSession, DrillId, PersistedState } from './types'
export const APP_NAME = 'gyopo'
export const APP_VERSION = '1.0.0'
export const DRILLS = ['numbers', 'counters', 'colors', 'time', 'days'] as const
export function createDrillSession(drill:DrillId):ActiveSession {
  return {drill,question:null,input:'',feedback:null,translationVisible:false,recentSubjectKeys:[],counterBag:[]}
}
export const initialState: PersistedState = {
  version: 5,
  view: 'numbers',
  alphabetSession: createAlphabetSession(),
  settings: { answerMode: 'choice', directions: {numbers:'mixed',colors:'mixed',time:'mixed',days:'mixed'}, numberSystem: 'mixed', numberPreset: 'medium', customMin: 0, customMax: 9999, counterLevel: 'all', timeFormat: 'mixed' },
  progress: { lifetime: { correct: 0, incorrect: 0 }, byDrill: { numbers: { correct: 0, incorrect: 0 }, counters: { correct: 0, incorrect: 0 }, colors: { correct: 0, incorrect: 0 }, time: { correct: 0, incorrect: 0 }, days: { correct: 0, incorrect: 0 } }, daily: [], counterMistakes: {} },
  activeDrill:'numbers',
  drillSessions:{numbers:createDrillSession('numbers'),counters:createDrillSession('counters'),colors:createDrillSession('colors'),time:createDrillSession('time'),days:createDrillSession('days')},
  flashcardSession:createFlashcardSession()
}
