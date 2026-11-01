const ACTIONS={
  'open palm · gather':'next screenshot',
  'fist · release':'dissolve screenshot',
  'victory burst':'victory burst',
  'spread fingers':'spread fingers'
};

export function createGestureDebouncer({stableFrames=3,cooldownMs=1400}={}){
  let candidate='',candidateCount=0,stable='',lastTrigger=-Infinity;
  return(label,time)=>{
    candidateCount=label===candidate?candidateCount+1:1;candidate=label;
    if(candidateCount<stableFrames||stable===label)return null;
    stable=label;
    const action=ACTIONS[label];
    if(!action||time-lastTrigger<cooldownMs)return null;
    lastTrigger=time;return action;
  };
}
