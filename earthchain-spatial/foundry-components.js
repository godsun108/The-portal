// Illustrative component data transcribed from the public Reality Foundry viewer.
// This is not CAD, measured geometry, or a mechanical simulation.
export const foundryParts = [
["Mainspring barrel",[0,0,0],1.2],
["Gear train",[-1.5,.5,.1],.72],
["Escape wheel",[-2.8,1,.2],.48],
["Pallet lever",[-2.1,2.2,.5],.43],
["Pallet stones",[-2.1,2.5,.8],.16],
["Fork horns",[-1.7,2.9,.6],.2],
["Balance",[-.7,3.5,.4],1.05],
["Impulse jewel",[-.8,3.4,1],.13],
["Hairspring",[.2,3.5,.3],.8]
].map(([name,position,scale],i)=>({id:"foundry-part-"+i,name,position,scale,visible:true}));
