import { classifyHands } from './HandLandmarks.js';
import { createGestureDebouncer } from './GestureDebouncer.js';

export async function createGestureTracker(onUpdate) {
  if(!navigator.mediaDevices?.getUserMedia)throw new Error('This browser cannot access a camera. Try a secure origin such as localhost or HTTPS.');
  let stream;
  try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:640},height:{ideal:480}},audio:false});}
  catch(error){
    const reason=error?.name==='NotAllowedError'?'Camera access was blocked. Allow camera permission in the browser and try again.':error?.name==='NotFoundError'?'No camera was found on this device.':`Camera could not start: ${error?.message||error?.name||'unknown error'}`;
    throw new Error(reason);
  }
  const video=document.createElement('video');video.autoplay=true;video.muted=true;video.playsInline=true;video.srcObject=stream;
  try{await video.play();}catch(error){stream.getTracks().forEach(track=>track.stop());throw new Error(`Camera video could not start: ${error?.message||'playback was blocked'}`);}

  let worker,alive=true,lastRun=0,pending=false,previous=null,raf=0;
  const debounce=createGestureDebouncer();
  let resolveReady,rejectReady;
  let initTimer;
  const ready=new Promise((resolve,reject)=>{resolveReady=resolve;rejectReady=reject;});
  try{
    worker=new Worker(new URL('./handLandmarker.worker.js',import.meta.url),{type:'module',name:'purpleverse-hand-landmarker'});
    worker.onmessage=(event)=>{
      const message=event.data;
      if(message.type==='ready'){resolveReady(message.delegate);return;}
      if(message.type==='init-error'){rejectReady(new Error(message.message));return;}
      if(message.type==='detection-error'){pending=false;return;}
      if(message.type!=='result')return;
      pending=false;
      const data=classifyHands({landmarks:message.landmarks,worldLandmarks:message.worldLandmarks,handedness:message.handedness},previous);
      data.trigger=debounce(data.label,performance.now());
      previous=data;onUpdate(data);
    };
    worker.onerror=(event)=>rejectReady(new Error(event.message||'MediaPipe worker failed.'));
    worker.postMessage({type:'init'});
    const delegate=await Promise.race([ready,new Promise((_,reject)=>{initTimer=setTimeout(()=>reject(new Error('Hand model loading timed out. Check the network and reload.')),30000);})]);
    clearTimeout(initTimer);
    let ended=false;
    const stop=()=>{if(ended)return;ended=true;alive=false;cancelAnimationFrame(raf);try{worker?.postMessage({type:'close'});}catch{}worker?.terminate();stream.getTracks().forEach(track=>track.stop());video.srcObject=null;};
    const loop=(time)=>{
      if(!alive)return;
      if(video.readyState>=2&&!pending&&time-lastRun>90){
        lastRun=time;pending=true;
        createImageBitmap(video).then(bitmap=>{if(!alive){bitmap.close();pending=false;return;}worker.postMessage({type:'frame',bitmap,timestamp:performance.now()},[bitmap]);}).catch(()=>{pending=false;});
      }
      raf=requestAnimationFrame(loop);
    };
    raf=requestAnimationFrame(loop);
    return{video,delegate,stop};
  }catch(error){clearTimeout(initTimer);alive=false;worker?.terminate();stream.getTracks().forEach(track=>track.stop());video.srcObject=null;throw new Error(`Hand tracking setup failed: ${error?.message||'MediaPipe could not initialize.'}`);}
}
