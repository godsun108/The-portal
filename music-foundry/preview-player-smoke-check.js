
(() => {
 const input=document.getElementById('audioFile');
 const player=document.getElementById('player');
 const status=document.getElementById('status');
 const details=document.getElementById('details');
 const clear=document.getElementById('clear');
 let objectUrl=null;
 function release(){if(objectUrl){URL.revokeObjectURL(objectUrl);objectUrl=null;}player.pause();player.removeAttribute('src');player.load();}
 input.addEventListener('change',()=>{
   const file=input.files&&input.files[0];
   release();
   if(!file){status.textContent='No file selected.';details.textContent='Choose a WAV file saved on this device.';return;}
   if(file.size===0){status.textContent='That file is empty. Choose another audio file.';return;}
   objectUrl=URL.createObjectURL(file);
   player.src=objectUrl;
   const mb=(file.size/1048576).toFixed(2);
   status.textContent='Ready to audition.';
   details.textContent=file.name+' · '+mb+' MB · local browser playback';
 });
 clear.addEventListener('click',()=>{release();input.value='';status.textContent='Selection cleared.';details.textContent='Choose a WAV file saved on this device.';});
 window.addEventListener('pagehide',release);
})();
