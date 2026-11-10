import recordings from './pronunciations.json'
export interface Recording {file:string;source:string;license:string;licenseUrl:string;speaker:string}
export const pronunciations:Record<string,Recording>=recordings
