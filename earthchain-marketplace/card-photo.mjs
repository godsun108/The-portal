/** Local-first image preview only. No uploads, network, identification claims or retained photos. */
export function isSupportedCardPhoto(file){
 return !!file && ['image/jpeg','image/png','image/webp'].includes(file.type) && file.size>0 && file.size<=8*1024*1024;
}
export function previewCardPhoto(file,{createObjectURL=URL.createObjectURL}={}){
 if(!isSupportedCardPhoto(file))throw Error('Choose a JPEG, PNG or WebP image up to 8 MB');
 return createObjectURL(file);
}
