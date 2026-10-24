/* Source-preserving browser projection. Stored USFM remains unchanged. */
(function(){
function projectUSFM(raw) {
 if(typeof raw!=='string')throw Error('Invalid USFM text');
 const notes=[];
 let text=raw.replace(/\\f\s+[\s\S]*?\\f\*/g,match=>{notes.push(match);return ' [note '+notes.length+']';})
 .replace(/\\x\s+[\s\S]*?\\x\*/g,' [cross-reference]');
 text=text.replace(/\\(\+?w|wg|wh)\s+([^|\\]*?)\|[^\\]*?\\\1\*/g,(_,tag,word)=>word);
 text=text.replace(/\\(?:wj|add|nd|qt|em|bd|it|sc|sig|tl|pn|bk|k|pro|rb)\*?/g,'');
 text=text.replace(/\\(?:p|m|mi|nb|b|q\d?|qr|qc|qm\d?|li\d?|s\d?|ms\d?|mt\d?)\s*/g,'\n');
 return {text:text.replace(/[ \t]+\n/g,'\n').trim(),notes,has_unresolved_markup:/\\[A-Za-z+]/.test(text)};
}
globalThis.ScriptureFormat={projectUSFM};
})();
