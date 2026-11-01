import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Experience from './scene/Experience.jsx';
import { createGestureTracker } from './gestures/HandTracker.js';
import AirWritingCanvas from './gestures/AirWritingCanvas.jsx';
import { AudioManager } from './audio/AudioManager.js';
import manifest from './data/screenshotManifest.json';
import './styles.css';

const FRAMES=manifest.sequence;

function App() {
  const [started,setStarted]=useState(true),[scene,setScene]=useState(0),[playback,setPlayback]=useState('manual');
  const [camera,setCamera]=useState('off'),[cameraError,setCameraError]=useState(''),[assetError,setAssetError]=useState('');
  const [gesture,setGesture]=useState('mouse ready'),[audioOn,setAudioOn]=useState(false),[volume,setVolume]=useState(.35),[muted,setMuted]=useState(false);
  const [showHelp,setShowHelp]=useState(false),[audioName,setAudioName]=useState('');
  const experienceRef=useRef(null),trackerRef=useRef(null),audioRef=useRef(null),fileRef=useRef(null),sceneRef=useRef(0),writingRef=useRef(null);
  const isAirWritingScene=scene>=FRAMES.length;
  const frame=FRAMES[Math.min(scene,FRAMES.length-1)];

  useEffect(()=>{audioRef.current=new AudioManager();return()=>{trackerRef.current?.stop();audioRef.current?.dispose();};},[]);
  const chooseScene=useCallback((index)=>{
    const next=Math.max(0,Math.min(FRAMES.length,index));sceneRef.current=next;setScene(next);return next;
  },[]);
  const nextScene=useCallback(()=>chooseScene(sceneRef.current+1),[chooseScene]);
  const previousScene=useCallback(()=>chooseScene(sceneRef.current-1),[chooseScene]);
  const onGesture=useCallback((data)=>{
    setGesture(sceneRef.current===FRAMES.length&&data.writing?'air write · index finger':data.label||'hands found');experienceRef.current?.setGesture(data);writingRef.current?.updateFromHand(data);
    if(data.trigger==='next screenshot'||data.trigger==='dissolve screenshot')nextScene();
  },[nextScene]);

  useEffect(()=>{experienceRef.current?.setScene(frame.groupIndex);},[frame.groupIndex]);
  useEffect(()=>{if(!isAirWritingScene)experienceRef.current?.setImage(scene);},[scene,isAirWritingScene]);
  useEffect(()=>{
    if(!started||playback!=='auto')return undefined;
    const timer=window.setTimeout(()=>{if(sceneRef.current>=FRAMES.length-1){setPlayback('manual');return;}nextScene();},7600);return()=>window.clearTimeout(timer);
  },[started,playback,scene,nextScene]);
  useEffect(()=>{
    const keydown=(event)=>{
      if(event.target instanceof HTMLElement&&['INPUT','TEXTAREA','SELECT'].includes(event.target.tagName))return;
      if(event.key==='ArrowRight'){event.preventDefault();nextScene();}
      else if(event.key==='ArrowLeft'){event.preventDefault();previousScene();}
      else if(event.code==='Space'&&started){event.preventDefault();nextScene();}
      else if(event.key==='Escape')setShowHelp(false);
    };
    window.addEventListener('keydown',keydown);return()=>window.removeEventListener('keydown',keydown);
  },[started,nextScene,previousScene]);

  const enableCamera=async()=>{
    setCamera('starting');setCameraError('');
    try{const tracker=await createGestureTracker(onGesture);trackerRef.current=tracker;setCamera('live');}
    catch(error){setCamera('error');setCameraError(error?.message||'Camera could not start.');}
  };
  const disableCamera=()=>{trackerRef.current?.stop();trackerRef.current=null;setCamera('off');setGesture('mouse ready');experienceRef.current?.setGesture({active:false});};
  const togglePlayback=()=>{const next=playback==='auto'?'manual':'auto';setPlayback(next);experienceRef.current?.setAuto(next==='auto');};
  const toggleAudio=async()=>{const manager=audioRef.current;if(!manager?.hasAudio){fileRef.current?.click();return;}const on=await manager.toggle();setAudioOn(on);};
  const loadAudio=async(event)=>{const file=event.target.files?.[0];if(!file)return;try{await audioRef.current.load(file);setAudioName(file.name);setAudioOn(true);await audioRef.current.toggle(true);}catch(error){setCameraError(`Audio could not load: ${error?.message||'unsupported file'}`);}};
  const changeVolume=(value)=>{const next=Number(value);setVolume(next);audioRef.current?.setVolume(next);setMuted(next===0);};

  return <main className="experience-shell">
    <Experience ref={experienceRef} scene={frame.groupIndex} imageIndex={scene} started={started} audio={audioRef} onAssetError={setAssetError}/>
    <div className={`vignette ${started?'vignette-clear':''}`} aria-hidden="true"/>
    <div className={`grain ${started?'grain-clear':''}`} aria-hidden="true"/>
    <AirWritingCanvas ref={writingRef} active={started&&isAirWritingScene} cameraLive={camera==='live'}/>
    {!started?<section className="intro-screen">
      <div className="intro-copy">
        <p className="eyebrow">AN INTERACTIVE COSMIC TRIBUTE</p>
        <h1>PURPLEVERSE<span>THE ETERNAL</span></h1>
        <p className="intro-note">Twenty-one original frames. One journey held in starlight.</p>
        <button className="start-button" onClick={()=>setStarted(true)}><span className="play-mark">↗</span> ENTER THE STORY</button>
        <p className="intro-foot">ORIGINAL FRAMES · SOUND OPTIONAL · CAMERA OPT-IN</p>
      </div>
      <div className="intro-orbit orbit-one"/><div className="intro-orbit orbit-two"/>
    </section>:<>
      {!isAirWritingScene&&<>
      <header className="topline"><span className="brand">PURPLEVERSE <i>·</i> THE ETERNAL</span><span className="chapter"><b>{String(scene+1).padStart(2,'0')} / {String(FRAMES.length+1).padStart(2,'0')}</b><i> — </i>{frame.group}<i> · </i>{frame.title}</span></header>
      <div className="story-progress" aria-label={`Frame ${scene+1} of ${FRAMES.length+1}`}><span style={{width:`${((scene+1)/(FRAMES.length+1))*100}%`}}/></div>
      <div className="toolbar">
        <div className="toolbar-left"><div className="status-pill"><span className={`status-led ${camera==='live'?'active':''}`}/><span>{camera==='live'?'GESTURE LIVE':camera==='starting'?'CONNECTING':playback==='auto'?'AUTO PLAY':'READY'}</span></div>{camera==='live'&&<span className="gesture-label">{gesture}</span>}</div>
        <div className="toolbar-right">
          <button className={`tool-button ${playback==='auto'?'selected':''}`} onClick={togglePlayback} title={playback==='auto'?'Pause playback':'Play all 21 frames'} aria-label={playback==='auto'?'Pause playback':'Play all 21 frames'}><span className="cursor-icon">{playback==='auto'?'Ⅱ':'▷'}</span></button>
          {camera!=='live'?<button className="tool-button camera-button" aria-label="Enable camera" title="Enable camera" disabled={camera==='starting'} onClick={enableCamera}><span className="camera-icon">◉</span></button>:<button className="tool-button" aria-label="Disable camera" title="Camera on · disable" onClick={disableCamera}><span>◉</span></button>}
          <button className="tool-button audio-button" aria-label={audioOn?'Pause audio':'Load audio'} onClick={toggleAudio} title={audioName||'Load a local audio file'}><span>{audioOn?'Ⅱ':'♫'}</span></button>
          <button className="tool-icon" aria-label="Audio volume" onClick={()=>changeVolume(muted?0.35:0)}>{muted?'⌁':'◖'}</button>
          <input className="volume-slider" type="range" min="0" max="1" step=".01" value={volume} onChange={e=>changeVolume(e.target.value)} aria-label="Volume"/>
          <button className="tool-icon help-button" aria-label="Gesture help" title="Gesture guide" onClick={()=>setShowHelp(!showHelp)}>?</button>
          <input ref={fileRef} type="file" accept="audio/*" hidden onChange={loadAudio}/>
        </div>
      </div>
      <nav className="frame-nav" aria-label="Storyboard navigation">
        <button className="frame-arrow" aria-label="Previous screenshot" title="Previous frame · ←" disabled={scene===0} onClick={previousScene}>←</button>
        <button className="next-scene" onClick={nextScene} aria-label={scene===FRAMES.length-1?'Open air-writing canvas':'Next screenshot'} disabled={scene>=FRAMES.length}><span>{scene===FRAMES.length-1?'WRITE IN STARLIGHT':'NEXT FRAME'}</span><b>↗</b></button>
      </nav>
      {cameraError&&<div className="camera-error" role="alert">{cameraError}<button onClick={()=>setCameraError('')}>×</button></div>}
      {assetError&&<div className="camera-error" role="alert">{assetError}<button onClick={()=>setAssetError('')}>×</button></div>}
      {showHelp&&<aside className="help-panel"><button className="close-help" onClick={()=>setShowHelp(false)}>×</button><span className="scene-kicker">MOVE WITH INTENTION</span><h3>Let your hands lead.</h3><p>Open palm reveals the next frame · fist dissolves forward · pinch attracts nearby light · spread fingers sends particles outward. Move to steer the field. Bring hands together or apart to compress or expand it. Victory triggers a violet burst.</p><p className="help-foot">Camera stays off until you choose Enable Camera. Without it, use ← / →, Space, pointer movement and click.</p></aside>}
      <footer className="bottom-note"><span>ORIGINAL STORYBOARD · {frame.title.toUpperCase()}</span><span>← PREVIOUS · SPACE / → NEXT</span></footer>
     </>}
      {isAirWritingScene&&<>
        <section className="writing-epilogue-screen" aria-label="Empty air-writing space">
          <img className="writing-epilogue-art" src="/assets/air-writing-background.png" alt=""/>
        </section>
        <header className="writing-epilogue-header">
          <span className="brand">PURPLEVERSE <i>·</i> THE ETERNAL</span>
          <span className="writing-epilogue-count">EPILOGUE <b>22 / 22</b></span>
          <div className="writing-epilogue-controls">
            <button className="epilogue-back" onClick={previousScene}>← &nbsp; BACK TO THE REUNION</button>
            {camera!=='live'?<button className="epilogue-camera" onClick={enableCamera} disabled={camera==='starting'}>{camera==='starting'?'CONNECTING…':'ENABLE HAND WRITING'}</button>:<button className="epilogue-camera" onClick={disableCamera}>CAMERA ON · TURN OFF</button>}
          </div>
        </header>
        <div className="writing-epilogue-title"><span className="air-writing-kicker">THE STORY CONTINUES WITH YOU</span><h2>Leave a little light.</h2><p>Raise one finger to write in violet light. Lower it to pause.</p></div>
        {cameraError&&<div className="camera-error" role="alert">{cameraError}<button onClick={()=>setCameraError('')}>×</button></div>}
      </>}
    </>}
  </main>;
}

const root=createRoot(document.getElementById('root'));
root.render(<App/>);
if(import.meta.hot)import.meta.hot.dispose(()=>root.unmount());
