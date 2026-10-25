// Conservative USFM plain-text projection for the Living Scriptures preview.
// Never use this projection to overwrite source files.
export function projectUSFM(raw) {
 if(typeof raw!=='string') throw Error('Invalid USFM text');
 const notes=[];
 let text=raw.replace(/\\f\s+[\s\S]*?\\f\*/g, match=>{notes.push(match);return ' [note '+notes.length+']';})
 .replace(/\\x\s+[\s\S]*?\\x\*/g,' [cross-reference]');
 // Remove milestone-like metadata from marked words while preserving the literal words.
 text=text.replace(/\\(\+?w|wg|wh)\s+([^|\\]*?)\|[^\\]*?\\\1\*/g,(_,tag,word)=>word);
 // Known inline semantic wrappers preserve their enclosed text.
 text=text.replace(/\\(?:wj|add|nd|qt|em|bd|it|sc|sig|tl|pn|bk|k|pro|rb)\*?/g,'');
 // Known paragraph/poetry/section markers map to breaks.
 text=text.replace(/\\(?:p|m|mi|nb|b|q\d?|qr|qc|qm\d?|li\d?|s\d?|ms\d?|mt\d?)\s*/g,'\n');
 // Unknown tags must remain visible rather than silently losing source information.
 text=text.replace(/\\\+/g,'\\+');
 return {text:text.replace(/[ \t]+\n/g,'\n').trim(),notes,has_unresolved_markup:/\\[A-Za-z+]/.test(text)};
}
