import { HandLandmarker } from '@mediapipe/tasks-vision';
import wasmLoaderPath from '@mediapipe/tasks-vision/vision_wasm_module_internal.js?url';
import wasmBinaryPath from '@mediapipe/tasks-vision/vision_wasm_module_internal.wasm?url';

let landmarker=null;
self.onmessage=async(event)=>{
  const data=event.data;
  if(data.type==='init'){
    try{
      // Keep the WASM runtime on the same origin as the application. The version is
      // pinned by package.json and Vite emits these assets alongside the worker.
      const vision={wasmLoaderPath,wasmBinaryPath};
      const modelResponse=await fetch('/mediapipe/hand_landmarker.task');if(!modelResponse.ok)throw new Error(`Hand model request returned HTTP ${modelResponse.status}.`);
      const modelAssetBuffer=new Uint8Array(await modelResponse.arrayBuffer());
      const options={baseOptions:{modelAssetBuffer,delegate:'GPU'},runningMode:'VIDEO',numHands:2,minHandDetectionConfidence:.58,minHandPresenceConfidence:.58,minTrackingConfidence:.58};
      try{landmarker=await HandLandmarker.createFromOptions(vision,options);self.postMessage({type:'ready',delegate:'GPU'});}
      catch(gpuError){landmarker=await HandLandmarker.createFromOptions(vision,{...options,baseOptions:{modelAssetBuffer,delegate:'CPU'}});self.postMessage({type:'ready',delegate:'CPU'});}
    }catch(error){self.postMessage({type:'init-error',message:`${error?.name||'MediaPipe'}: ${error?.message||'model/WASM failed to load'}`});}
  }else if(data.type==='frame'){
    const bitmap=data.bitmap;
    try{
      if(!landmarker)throw new Error('Landmarker is not initialized.');
      const result=landmarker.detectForVideo(bitmap,data.timestamp);
      self.postMessage({type:'result',timestamp:data.timestamp,landmarks:result.landmarks||[],worldLandmarks:result.worldLandmarks||[],handedness:result.handedness||[]});
    }catch(error){self.postMessage({type:'detection-error',message:error?.message||'Detection failed'});}
    finally{bitmap?.close();}
  }else if(data.type==='close'){
    landmarker?.close();landmarker=null;self.close();
  }
};
