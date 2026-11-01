import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import silhouetteData from '../../public/assets/silhouettes/reference-seven.json';
import { createWorldEnvironments } from './WorldEnvironments.js';
import { ScreenshotStage } from './ScreenshotStage.js';
import '../error.css';

const COUNT = 14000;
const vertexShader = /* glsl */`
precision highp float;
attribute vec3 aCosmic;
attribute vec3 aSeven;
attribute vec3 aRun;
attribute vec3 aSea;
attribute vec3 aEternal;
attribute float aSize;
uniform float uTime;
uniform float uScene;
uniform float uBurst;
uniform float uPinch;
uniform float uRelease;
uniform float uGather;
uniform float uSeaDissolve;
uniform float uMotion;
uniform float uAudio;
uniform vec3 uPointer;
uniform float uPointerActive;
uniform float uHandsApart;
varying float vAlpha;
varying float vSeed;
varying float vDepth;

vec3 scenePosition(float id) {
  vec3 p = aSeven;
  p = mix(p, aRun, smoothstep(0.0, 1.0, id));
  p = mix(p, aSea, smoothstep(1.0, 2.0, id));
  p = mix(p, aSeven, smoothstep(2.0, 3.0, id));
  p = mix(p, aEternal, smoothstep(3.0, 4.0, id));
  return p;
}
void main() {
  vec3 target = scenePosition(uScene);
  target = mix(target, aSeven, uGather);
  float seed = fract(sin(dot(aCosmic.xy, vec2(127.1,311.7))) * 43758.5453);
  float time = uTime * (0.11 + seed * 0.3);
  float runWeight=1.0-smoothstep(.12,.88,abs(uScene-1.0));
  float legWeight=1.0-smoothstep(-3.35,-2.45,target.y);
  vec3 drift = vec3(sin(time + seed*19.0), cos(time*0.74 + seed*13.0), sin(time*0.5 + seed*31.0)) * 0.035 * uMotion;
  target.x+=sin(uTime*7.2+seed*20.0)*.12*runWeight*legWeight;
  target.y+=sin(uTime*14.4+seed*10.0)*.04*runWeight;
  float seaWeight = 1.0 - smoothstep(1.1, 2.05, abs(uScene - 2.0));
  drift.y += seaWeight * (0.13 + seed * .22);
  target += drift;
  vec3 radial = normalize(target + vec3(.001));
  target += radial * (uBurst + uRelease*.4) * (0.85 + seed * 3.4);
  float apart = uHandsApart;
  target.xy += normalize(target.xy + vec2(.001)) * apart * .9;
  float influence = uPointerActive * (0.85 + uPinch * 1.5);
  vec3 delta = target - uPointer;
  float force = exp(-dot(delta,delta) * (uPinch > 0.1 ? 2.1 : 0.48));
  target -= normalize(delta + vec3(.0001)) * force * influence * (uPinch > .1 ? .55 : -.32);
  float silhouetteMask = (1.0 - smoothstep(1.1, 1.8, abs(aSea.x))) * smoothstep(-1.8, -.8, aSea.y) * (1.0 - smoothstep(.9, 1.5, aSea.y));
  target = mix(target, aCosmic, seaWeight * uSeaDissolve * silhouetteMask * .6);
  target.y += seaWeight * uPointerActive * uPointer.y * .32;
  vec4 mv = modelViewMatrix * vec4(target, 1.0);
  float audioGlow = 1.0 + uAudio * 1.8;
  gl_PointSize = clamp(aSize * audioGlow * (300.0 / max(1.0, -mv.z)), 0.9, 9.5);
  gl_Position = projectionMatrix * mv;
  vAlpha = (0.42 + seed * .58) * smoothstep(-23.0, -2.0, mv.z);
  float underwater = 1.0 - smoothstep(1.12, 1.92, abs(uScene - 2.0));
  vAlpha *= mix(1.0, 0.11, underwater);
  vSeed = seed;
  vDepth = -mv.z;
}`;

const fragmentShader = /* glsl */`
precision highp float;
uniform float uTime;
uniform float uScene;
uniform float uAudio;
uniform float uMotion;
varying float vAlpha;
varying float vSeed;
varying float vDepth;
void main() {
  vec2 uv = gl_PointCoord - .5;
  float r = length(uv) * 2.0;
  if (r > 1.0) discard;
  float core = exp(-r*r*13.0);
  float halo = exp(-r*r*4.3) * .45;
  vec3 violet = vec3(.60, .27, 1.0);
  vec3 lavender = vec3(.79, .68, 1.0);
  vec3 pink = vec3(1.0, .52, .83);
  vec3 ocean = vec3(.48, .31, .88);
  float sea = 1.0 - smoothstep(1.15, 1.95, abs(uScene - 2.0));
  vec3 tint = mix(mix(violet, lavender, vSeed*.48), ocean, sea*.72);
  tint = mix(tint, pink, smoothstep(.88,.99,vSeed)*.3);
  float flicker = .9 + .1 * uMotion * sin(uTime*(1.0+vSeed*3.0)+vSeed*60.0);
  float silhouetteScene=max(1.0-smoothstep(.05,.35,abs(uScene)),1.0-smoothstep(.05,.35,abs(uScene-3.0)));
  float runnerScene=1.0-smoothstep(.08,.65,abs(uScene-1.0));
  float narrativeFade=mix(1.0,.12,silhouetteScene)*mix(1.0,.22,runnerScene);
  float alpha = (core + halo) * vAlpha * flicker * narrativeFade;
  gl_FragColor = vec4(tint * (1.0 + core*.9 + uAudio*.8), alpha);
}`;

const mulberry32 = (seed) => () => { let t = seed += 0x6D2B79F5; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const poses = [
  { arms: [[-.22,.56],[-.35,.29]], legs: [[-.10,-.35],[-.22,-.78]] },
  { arms: [[-.24,.52],[-.52,.41]], legs: [[-.12,-.34],[-.37,-.75]] },
  { arms: [[-.22,.53],[-.10,.78]], legs: [[-.12,-.36],[-.08,-.79]] },
  { arms: [[-.22,.53],[-.50,.76]], legs: [[-.12,-.35],[.05,-.76]] },
  { arms: [[-.22,.55],[-.37,.77]], legs: [[-.12,-.36],[-.25,-.78]] },
  { arms: [[-.20,.55],[-.12,.79]], legs: [[-.10,-.34],[-.18,-.77]] },
  { arms: [[-.25,.53],[-.45,.29]], legs: [[-.12,-.35],[-.06,-.80]] }
];
function sampleFigure(r, index, pose) {
  const width = [.78,.68,.73,.84,.68,.76,.81][index];
  const segments = [
    [[0,.52],[0,.11],.155], [[0,.06],pose.arms[0],.067], [pose.arms[0],pose.arms[1],.05],
    [[0,.06],[0,-.34],.11], [[0,-.30],pose.legs[0],.08], [pose.legs[0],pose.legs[1],.065]
  ];
  const choice = r();
  if (choice < .18) { const a=r()*Math.PI*2; const rad=.115*Math.sqrt(r()); return [Math.cos(a)*rad, .70+Math.sin(a)*rad, (r()-.5)*.08]; }
  const p = segments[Math.floor(r()*segments.length)]; const t=r(); const spread=(r()-.5)*p[2]*2;
  return [(p[0][0]+(p[1][0]-p[0][0])*t+spread)*width, p[0][1]+(p[1][1]-p[0][1])*t, (r()-.5)*.10];
}
function createTargets() {
  const r = mulberry32(501); const arrays = Array.from({ length: 5 }, () => new Float32Array(COUNT*3)); const sizes = new Float32Array(COUNT);
  for (let i=0; i<COUNT; i++) {
    const f = Math.floor(i / (COUNT/7)); const local = i % Math.ceil(COUNT/7); const k=i*3;
    arrays[0][k]=(r()-.5)*17; arrays[0][k+1]=(r()-.5)*10; arrays[0][k+2]=(r()-.5)*11;
    const pose=poses[f], x=(f-3)*1.16, ref=silhouetteData.characters[f], mask=ref.points[Math.floor((local/Math.ceil(COUNT/7))*ref.points.length)%ref.points.length];
    const sx=mask[0]*1.36, sy=mask[1]*1.36-2.48;
    arrays[1][k]=x+sx; arrays[1][k+1]=sy; arrays[1][k+2]=.12;
    arrays[2][k]=x+sx-(.2+r()*.7); arrays[2][k+1]=sy+(r()-.5)*.025; arrays[2][k+2]=.12-(local%40)*.004;
    if (i % 4 === 0) { const mask=silhouetteData.characters[2].points[local%silhouetteData.characters[2].points.length];arrays[3][k]=mask[0]*1.36;arrays[3][k+1]=mask[1]*1.36-2.46;arrays[3][k+2]=.1+(r()-.5)*.1; }
    else { arrays[3][k]=(r()-.5)*12; arrays[3][k+1]=(r()-.5)*8; arrays[3][k+2]=(r()-.5)*7; }
    const ring=Math.sqrt(r())*7.1; const angle=r()*Math.PI*2;
    arrays[4][k]=Math.cos(angle)*ring; arrays[4][k+1]=Math.sin(angle)*ring*.66; arrays[4][k+2]=(r()-.5)*2.8;
    sizes[i]=.8+r()*2.4;
  }
  return { arrays, sizes };
}

const Experience = forwardRef(function Experience({ scene, imageIndex=0, started, audio, onAssetError }, ref) {
  const hostRef=useRef(null); const api=useRef({});
  useImperativeHandle(ref, () => ({ setScene: (n) => api.current.setScene?.(n), setImage: (n) => api.current.setImage?.(n), setGesture: (g) => api.current.setGesture?.(g), setAuto: (v) => api.current.setAuto?.(v) }), []);
  useEffect(() => {
    const host=hostRef.current; if (!host) return;
    let renderer, geometry, material, points, observer, pointerMove, pointerDown, pointerUp, resize, contextLost, screenshotStage;
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scene3d=new THREE.Scene(); scene3d.background=new THREE.Color('#08060f');
    const camera=new THREE.PerspectiveCamera(51,1,.1,90); camera.position.set(0,.15,12.6);
    try { renderer=new THREE.WebGLRenderer({ antialias:true, alpha:false, powerPreference:'high-performance' }); }
    catch { host.dataset.error='WebGL is not available in this browser.'; return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7)); renderer.setSize(host.clientWidth,host.clientHeight,false);
    renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.12;
    renderer.domElement.className='three-canvas'; renderer.domElement.setAttribute('aria-label','Interactive purple particle universe'); host.appendChild(renderer.domElement);
    renderer.domElement.addEventListener('webglcontextlost', contextLost = e => { e.preventDefault(); host.dataset.error='Graphics paused. Please reload to restore the universe.'; });
    const environments=createWorldEnvironments(scene3d);
    screenshotStage=new ScreenshotStage(scene3d,camera,onAssetError);
    screenshotStage.enter(imageIndex);
    const silhouetteGroup=new THREE.Group(); silhouetteGroup.name='anonymous-reference-silhouettes'; scene3d.add(silhouetteGroup);
    const silhouetteMaterials=[];
    const silhouetteVertex=/* glsl */`attribute float aPhase; attribute float aHeight; attribute float aSide; uniform float uTime; uniform float uScene; uniform float uMember; varying float vAlpha; void main(){vec3 p=position;float run=smoothstep(.08,.86,1.0-abs(uScene-1.0));float sea=smoothstep(.08,.86,1.0-abs(uScene-2.0));float legs=1.0-smoothstep(-.34,-.08,aHeight);float arms=smoothstep(.04,.14,aHeight)*(1.0-smoothstep(.36,.48,aHeight));p.x+=sin(uTime*7.2+aPhase+sign(aSide)*1.57)*.25*run*legs;p.x+=sin(uTime*7.2+aPhase+sign(aSide)*1.57+3.14)*.11*run*arms;p.x+=run*max(aHeight,0.0)*.22;p.y+=sin(uTime*14.4+aPhase*2.0)*.055*run*(.45+legs*.55);p.x+=sin(uTime*.9+aPhase)*.012;p.y-=sea*(.28+min(uTime*.018,2.2));vec4 mv=modelViewMatrix*vec4(p,1.0);gl_PointSize=clamp(2.0*(300.0/max(1.0,-mv.z)),1.0,8.0);gl_Position=projectionMatrix*mv;float selected=1.0-step(.5,abs(uMember-2.0));float solo=mix(1.0,selected,sea);vAlpha=solo*(.86+.14*sin(uTime*1.7+uMember*3.0));}`;
    const silhouetteFragment=/* glsl */`uniform float uScene; varying float vAlpha; void main(){vec2 q=gl_PointCoord-.5;float edge=smoothstep(.5,.26,length(q));if(edge<.03)discard;float intro=1.0-smoothstep(.08,.9,1.0-abs(uScene));vec3 col=mix(vec3(.018,.009,.028),vec3(.075,.035,.105),intro*.55);gl_FragColor=vec4(col,vAlpha*edge);}`;
    silhouetteData.characters.forEach((character,index)=>{
      const pts=character.points, pos=new Float32Array(pts.length*3),phase=new Float32Array(pts.length),height=new Float32Array(pts.length),centerX=(index-3)*1.16,scale=1.36;
      pts.forEach(([x,y],i)=>{pos[i*3]=centerX+x*scale;pos[i*3+1]=y*scale-2.46;pos[i*3+2]=.16+(index%2)*.015;phase[i]=(index*.91+i*.003)%6.28;height[i]=y*scale;});
      const side=new Float32Array(pts.length);pts.forEach(([x],i)=>side[i]=x);const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('aPhase',new THREE.BufferAttribute(phase,1));geo.setAttribute('aHeight',new THREE.BufferAttribute(height,1));geo.setAttribute('aSide',new THREE.BufferAttribute(side,1));
      const mat=new THREE.ShaderMaterial({vertexShader:silhouetteVertex,fragmentShader:silhouetteFragment,transparent:true,depthWrite:false,uniforms:{uTime:{value:0},uScene:{value:scene},uMember:{value:index}}});const figure=new THREE.Points(geo,mat);figure.frustumCulled=false;silhouetteGroup.add(figure);silhouetteMaterials.push(mat);
    });
    const {arrays,sizes}=createTargets(); geometry=new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.BufferAttribute(arrays[0],3));
    ['aCosmic','aRun','aSea','aSeven','aEternal'].forEach((name,i)=>geometry.setAttribute(name,new THREE.BufferAttribute(arrays[[0,2,3,1,4][i]],3)));
    geometry.setAttribute('aSize',new THREE.BufferAttribute(sizes,1));
    material=new THREE.ShaderMaterial({ vertexShader, fragmentShader, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending, uniforms:{ uTime:{value:0},uScene:{value:scene},uBurst:{value:0},uRelease:{value:0},uGather:{value:0},uSeaDissolve:{value:0},uMotion:{value:reduced?0:1},uPinch:{value:0},uAudio:{value:0},uPointer:{value:new THREE.Vector3()},uPointerActive:{value:0},uHandsApart:{value:0} } });
    points=new THREE.Points(geometry,material); points.frustumCulled=false; scene3d.add(points);
    const ambient=new THREE.PointLight('#8954ff',22,30); ambient.position.set(-1,2,2); scene3d.add(ambient);
    const blue=new THREE.PointLight('#6538a7',0,24); blue.position.set(4,-2,-1); scene3d.add(blue);
    const haloMat=new THREE.MeshBasicMaterial({ color:'#7a35c7', transparent:true, opacity:.11, side:THREE.DoubleSide, blending:THREE.AdditiveBlending, depthWrite:false });
    const halos=[]; for(let i=0;i<3;i++){ const mesh=new THREE.Mesh(new THREE.TorusGeometry(2.4+i*.57,.009,4,150),haloMat.clone()); mesh.position.z=-2-i*.4; mesh.rotation.x=.24+i*.17; mesh.rotation.y=i*.5; scene3d.add(mesh); halos.push(mesh); }
    const starsGeo=new THREE.BufferGeometry(); const starPos=new Float32Array(1200*3); const rand=mulberry32(822);
    for(let i=0;i<starPos.length;i+=3){ starPos[i]=(rand()-.5)*42; starPos[i+1]=(rand()-.5)*24; starPos[i+2]=-10-rand()*22; }
    starsGeo.setAttribute('position',new THREE.BufferAttribute(starPos,3));
    const stars=new THREE.Points(starsGeo,new THREE.PointsMaterial({color:'#9a7dd1',size:.018,transparent:true,opacity:.55,depthWrite:false}));scene3d.add(stars);
    const targetScene=material.uniforms.uScene; let auto=true, last=performance.now(), seaElapsed=0, pointerActive=0, pointer=new THREE.Vector3(), smoothPointer=new THREE.Vector3(), burst=0, pinch=0, handApart=0, handTargetApart=0;
    let handX=0,handY=0, handActive=false;
    const setScene = n => { seaElapsed=0; environments.setScene(n); if(reduced) targetScene.value=n; else {gsap.to(targetScene,{value:n,duration:2.6,ease:'power2.inOut',overwrite:true});if(n===4)gsap.fromTo(material.uniforms.uBurst,{value:.7},{value:0,duration:3.4,ease:'power2.out',overwrite:true});} };
    const setImage = n => screenshotStage.show(n);
    const setAuto = value => { auto=value; };
    const setGesture = g => {
      handActive=!!g?.active;screenshotStage.setGesture(g);
      if (handActive) { handX=(g.center?.x ?? .5); handY=(g.center?.y ?? .5); const focal=g.pinch?(g.tip||g.center):g.center; pointer.set(((focal?.x ?? .5)-.5)*11,(.5-(focal?.y ?? .5))*7,1.0); pinch=g.pinch?1:0; handTargetApart=g.twoHandDistance==null?0:THREE.MathUtils.clamp((g.twoHandDistance-.24)*4,-.9,2.2); pointerActive=1; gsap.to(material.uniforms.uGather,{value:g.open&&!g.fist?1:0,duration:.65,overwrite:true}); if(g.fist) gsap.to(material.uniforms.uRelease,{value:1,duration:.2,overwrite:true}); else gsap.to(material.uniforms.uRelease,{value:0,duration:.65,overwrite:true}); if(g.trigger==='victory burst'||g.trigger==='spread fingers') { gsap.fromTo(material.uniforms.uBurst,{value:1.3},{value:0,duration:1.1,ease:'power2.out'}); } }
      else { pinch=0; handTargetApart=0; pointerActive=0; gsap.to(material.uniforms.uGather,{value:0,duration:.5,overwrite:true}); gsap.to(material.uniforms.uRelease,{value:0,duration:.5,overwrite:true}); }
    };
    api.current={setScene,setImage,setAuto,setGesture};
    pointerMove=e=>{ const rect=renderer.domElement.getBoundingClientRect(); const x=(e.clientX-rect.left)/rect.width, y=(e.clientY-rect.top)/rect.height; pointer.set((x-.5)*11,(.5-y)*7,1.0); smoothPointer.set((x-.5)*11,(.5-y)*7,1.0); pointerActive=1;screenshotStage.setPointer(x,y,true); };
    pointerDown=e=>{pointerMove(e); gsap.fromTo(material.uniforms.uBurst,{value:.8},{value:0,duration:1.2,ease:'power2.out'});};
    pointerUp=()=>{if(!handActive){pointerActive=0;screenshotStage.setPointer(0,0,false);}};
    renderer.domElement.addEventListener('pointermove',pointerMove);renderer.domElement.addEventListener('pointerdown',pointerDown);renderer.domElement.addEventListener('pointerleave',pointerUp);
    resize=()=>{const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);screenshotStage.resize();};
    observer=new ResizeObserver(resize);observer.observe(host);
    const animate=now=>{const dt=Math.min((now-last)/1000,.05);last=now;const u=material.uniforms;u.uTime.value=now*.001;const inSea=u.uScene.value>1.5&&u.uScene.value<2.5;seaElapsed=inSea&&!reduced?seaElapsed+dt:0;u.uSeaDissolve.value=THREE.MathUtils.clamp(seaElapsed/22,.0,.85);u.uPointerActive.value=THREE.MathUtils.damp(u.uPointerActive.value,pointerActive,3,dt);u.uPointer.value.lerp(pointer,1-Math.exp(-dt*5));u.uPinch.value=THREE.MathUtils.damp(u.uPinch.value,pinch,6,dt);handApart=THREE.MathUtils.damp(handApart,handTargetApart,2.5,dt);u.uHandsApart.value=handApart;u.uAudio.value=THREE.MathUtils.damp(u.uAudio.value,audio.current?.getLevel?.()||0,3,dt);
      const t=now*.001;const sea=1-Math.min(1,Math.abs(u.uScene.value-2));environments.update(dt,t,sea);screenshotStage.update(t);silhouetteMaterials.forEach((m,i)=>{m.uniforms.uTime.value=t;m.uniforms.uScene.value=u.uScene.value;const figure=silhouetteGroup.children[i];figure.position.x=THREE.MathUtils.damp(figure.position.x,sea&&i===2?1.16:0,1.2,dt);});blue.intensity=sea*22;ambient.intensity=8+u.uAudio.value*12;halos.forEach((mesh,i)=>{mesh.rotation.z=t*(.04+i*.025)*(reduced?0:1);mesh.rotation.y=Math.sin(t*.16+i)*.16;mesh.material.opacity=.025+sea*.025+u.uAudio.value*.035;});
      const gx=handActive?(handX-.5)*2.5:(auto&&!reduced?Math.sin(t*.2)*.12:0);const gy=handActive?(.5-handY)*1.3:(auto&&!reduced?Math.sin(t*.15)*.08:0);
      const runner=1-Math.min(1,Math.abs(u.uScene.value-1));camera.position.x=THREE.MathUtils.damp(camera.position.x,gx+(reduced?0:Math.sin(t*.48)*runner*.22),1.5,dt);camera.position.y=THREE.MathUtils.damp(camera.position.y,gy-sea*.42,1.5,dt);camera.position.z=THREE.MathUtils.damp(camera.position.z,12.6+sea*1.15-runner*.22,1,dt);camera.lookAt(0,-sea*.22,0);if(!reduced)points.rotation.y=Math.sin(t*.08)*.045;stars.rotation.y=reduced?0:t*.002;renderer.render(scene3d,camera);};
    renderer.setAnimationLoop(animate);
    if(import.meta.hot)import.meta.hot.dispose(()=>cleanup());
    function cleanup(){renderer?.setAnimationLoop(null);observer?.disconnect();renderer?.domElement.removeEventListener('pointermove',pointerMove);renderer?.domElement.removeEventListener('pointerdown',pointerDown);renderer?.domElement.removeEventListener('pointerleave',pointerUp);renderer?.domElement.removeEventListener('webglcontextlost',contextLost);geometry?.dispose();material?.dispose();screenshotStage?.dispose();silhouetteGroup.children.forEach(f=>{f.geometry.dispose();f.material.dispose();});environments.dispose();starsGeo.dispose();stars.material.dispose();halos.forEach(m=>{m.geometry.dispose();m.material.dispose();});haloMat.dispose();renderer?.dispose();renderer?.domElement.remove();}
    return cleanup;
  }, []);
  useEffect(()=>{api.current.setScene?.(scene);},[scene]);
  useEffect(()=>{api.current.setImage?.(imageIndex);},[imageIndex]);
  return <div className="scene-host" ref={hostRef} data-started={started} />;
});

export default Experience;

