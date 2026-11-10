import { toChinese } from './chineseNumbers'
export function digitalTime(hour: number, minute: number, format: '12' | '24' = '24'): string {
  const minutes = String(minute).padStart(2, '0')
  if (format === '24') return `${String(hour).padStart(2, '0')}:${minutes}`
  return `${hour % 12 || 12}:${minutes} ${hour < 12 ? 'AM' : 'PM'}`
}

export function digitalTimeAliases(hour: number, minute: number, format: '12' | '24'): string[] {
  const twentyFourHour = digitalTime(hour, minute)
  if (format === '24') return [twentyFourHour, `${hour}:${String(minute).padStart(2, '0')}`]
  const twelveHour = digitalTime(hour, minute, '12')
  return [twelveHour, twelveHour.replace(/ (?:AM|PM)$/, ''), twentyFourHour]
}
export function chineseTime(hour:number,minute:number,format:'12'|'24'):string {
 const h=format==='12'?hour%12||12:hour
 const reading=(h===2?'两':toChinese(h))+'点'+(minute?(minute<10?'零':'')+toChinese(minute)+'分':'整')
 return (format==='12'?(hour<12?'上午':'下午'):'')+reading
}
export function timeAliases(hour:number,minute:number,format:'12'|'24'):string[] {
 const primary=chineseTime(hour,minute,format)
 const aliases=[primary]
 if(minute===0)aliases.push(primary.replace(/整$/,''))
 if(minute===30)aliases.push(primary.replace('三十分','半'))
 if(format==='12'&&hour===0&&minute===0)aliases.push('午夜')
 if(format==='12'&&hour===12&&minute===0)aliases.push('中午十二点','中午十二点整')
 return aliases
}
