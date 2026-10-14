import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const catalog=JSON.parse(readFileSync('tv-cinema-classics.json','utf8'));
const open=JSON.parse(readFileSync('tv-open-library.json','utf8'));
const audit=JSON.parse(readFileSync('cinema-source-audit.json','utf8'));
const found=new Map(audit.results.map(x=>[x.file,x]));
const records=[];
for(const film of catalog.titles){
 const a=found.get(film.mediaFile);
 const minutes=String(film.runtime||'').match(/^(?:~)?(\d+)\s*min/i);
 const n=minutes?Number(minutes[1]):null;
 const concerns=[];
 if(!a||a.status==='check_unavailable')concerns.push('source_check_unavailable');
 else if(a.status!=='media_present')concerns.push('source_not_verified');
 if(a?.bytes>2000000000)concerns.push('source_over_2gb');
 else if(a?.bytes>700000000)concerns.push('source_over_700mb');
 if(a?.licenseName&&/review|unknown|copyright|rights reserved|non[- ]free/i.test(a.licenseName))concerns.push('license_label_needs_review');
 if(/soundtrack|restor|edition|music|license review|uncertain|unverified/i.test(film.note||''))concerns.push('edition_or_audio_review');
 if(film.playbackStatus!=='user_confirmed_iphone_playing')concerns.push('iphone_playback_untested');
 concerns.push('tv_airplay_unverified');
 if(n===null)concerns.push('runtime_not_machine_readable');
 records.push({id:film.id,title:film.title,year:film.year,sourceFile:film.mediaFile,sourcePresent:a?.status==='media_present',bytes:a?.bytes??null,sourceLicenseLabel:a?.licenseName||null,kind:n===null?'length_unverified':n<40?'short_or_clip':'long_form',runtimeMinutes:n,playbackStatus:film.playbackStatus,rightsStatus:film.rightsStatus,concerns:[...new Set(concerns)]});
}
assert.equal(records.length,catalog.titles.length);
const count=issue=>records.filter(x=>x.concerns.includes(issue)).length;
const report={schema:'portal.tv.cinema.quality-triage.v1',generatedAt:new Date().toISOString(),sourceAuditStatus:audit.networkStatus,disclaimer:'Metadata risk triage, NOT a proof of legal rights, playable media, AirPlay compatibility, or complete films. Network failure produces unknown source checks.',catalog:{classics:records.length,openFilms:open.programs.length,overall:records.length+open.programs.length},summary:{shortsOrClips:records.filter(x=>x.kind==='short_or_clip').length,unknownDuration:records.filter(x=>x.kind==='length_unverified').length,largeOver700MB:count('source_over_700mb'),veryLargeOver2GB:count('source_over_2gb'),iphoneUntested:count('iphone_playback_untested'),tvAirplayUnverified:count('tv_airplay_unverified'),rightsReviewFlag:count('edition_or_audio_review'),sourceCheckUnavailable:count('source_check_unavailable')},records};
writeFileSync('cinema-quality-triage.json',JSON.stringify(report,null,2)+'\\n');
console.log('QUALITY TRIAGE: '+records.length+' Classics, '+report.summary.shortsOrClips+' identified shorts/clips, '+report.summary.unknownDuration+' unknown duration, '+report.summary.iphoneUntested+' iPhone untested, '+report.summary.veryLargeOver2GB+' source files >2GB. TV AirPlay remains unverified.');
