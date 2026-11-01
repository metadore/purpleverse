import * as THREE from 'three';
import { gsap } from 'gsap';
import manifest from '../data/screenshotManifest.json';

const names = manifest.transitions;
const finaleFrames = new Set([manifest.sequence.length - 2, manifest.sequence.length - 1]);
const particleVertex = /* glsl */`
precision highp float;
attribute vec2 aUv;
attribute float aSide;
attribute float aSeed;
uniform float uProgress;
uniform float uTime;
uniform float uStyle;
uniform vec2 uFromScale;
uniform vec2 uToScale;
uniform vec2 uHand;
uniform float uHandActive;
uniform float uPinch;
uniform float uBurst;
uniform float uExpand;
uniform float uPixelRatio;
varying vec2 vUv;
varying float vSide;
varying float vSeed;
varying float vAlpha;
varying float vProgress;
float hash(float n){return fract(sin(n*127.1)*43758.5453);}
void main(){
  float p=clamp(uProgress,0.0,1.0);
  float oldSide=1.0-aSide;
  float localT=aSide<.5?smoothstep(.0,.57,p):smoothstep(.34,1.0,p);
  vec2 uvPos=(aUv-.5)*2.0;
  vec2 fromPos=uvPos*uFromScale;
  vec2 toPos=uvPos*uToScale;
  float angle=aSeed*6.28318+uTime*.08;
  vec3 direction=normalize(vec3(cos(angle),sin(angle),hash(aSeed+7.0)*2.0-1.0));
  float spiral=(uStyle>.5&&uStyle<1.5)?(1.0-localT)*1.15:0.0;
  mat2 swirl=mat2(cos(spiral),-sin(spiral),sin(spiral),cos(spiral));
  vec3 oldScatter=vec3(swirl*(fromPos+direction.xy*(.15+hash(aSeed+2.0)*.7)),0.0);
  oldScatter+=direction*(.7+hash(aSeed+3.0)*6.6)*(localT*localT+uBurst*.75);
  if(uStyle>1.5&&uStyle<2.5)oldScatter+=direction*(uBurst+localT)*2.2;
  if(uStyle>2.5&&uStyle<3.5)oldScatter.y+=sin(aUv.x*18.0+uTime*1.3)*localT*.55;
  if(uStyle>4.5&&uStyle<5.5)oldScatter.xy+=vec2(sin(uTime+aSeed*31.0),cos(uTime*.8+aSeed*23.0))*localT*.48;
  if(uStyle>5.5)oldScatter+=direction*(1.2+hash(aSeed+37.0)*2.4)*localT;
  vec3 newStart=vec3((hash(aSeed+13.0)-.5)*uToScale.x*2.8,(hash(aSeed+17.0)-.5)*uToScale.y*3.1,-1.0-hash(aSeed+19.0)*4.0);
  if(uStyle>3.5&&uStyle<4.5){float star=mod(floor(aSeed*43.0),7.0);float starA=star*.8976;newStart.xy+=vec2(cos(starA),sin(starA))*2.2;}
  vec3 oldPos=mix(vec3(fromPos,4.35),vec3(oldScatter.xy,4.35+oldScatter.z),localT);
  float converge=aSide<.5?0.0:smoothstep(.0,1.0,localT);
  vec3 newPos=mix(vec3(newStart.xy,4.35+newStart.z),vec3(toPos,4.35),converge);
  float orbit=(1.0-converge)*(.25+hash(aSeed+23.0)*.7);
  newPos.xy+=vec2(cos(angle+uTime*.15),sin(angle+uTime*.15))*orbit*(1.0-converge);
  vec3 pos=mix(newPos,oldPos,oldSide);
  float handForce=uHandActive*exp(-dot(pos.xy-uHand,pos.xy-uHand)*.8);
  vec2 away=normalize(pos.xy-uHand+vec2(.0001));
  pos.xy+=away*handForce*(uPinch>0.5?-.45:.28);
  pos.xy+=direction.xy*uExpand*.36;
  pos.xy+=direction.xy*hash(aSeed+31.0)*uBurst*.9;
  vec4 mv=modelViewMatrix*vec4(pos,1.0);
  gl_PointSize=clamp((1.7+hash(aSeed+29.0)*1.6)*uPixelRatio*(12.5/max(1.0,-mv.z)),1.1,5.2*uPixelRatio);
  gl_Position=projectionMatrix*mv;
  vUv=aUv;vSide=aSide;vSeed=aSeed;vProgress=p;
  float oldFade=1.0-smoothstep(.22,.59,p);
  float newFade=smoothstep(.34,.73,p);
  vAlpha=mix(oldFade,newFade,aSide);
}`;

const finaleSparkleVertex = /* glsl */`
precision highp float;
attribute float aPhase;
attribute float aSize;
attribute float aTint;
uniform float uTime;
uniform float uPixelRatio;
varying float vPulse;
varying float vTint;
void main(){
  vec3 p=position;
  p.x+=sin(uTime*.16+aPhase)*.012;
  p.y+=cos(uTime*.13+aPhase*1.7)*.012;
  vec4 mv=modelViewMatrix*vec4(p,1.0);
  gl_Position=projectionMatrix*mv;
  gl_PointSize=clamp(aSize*uPixelRatio*(18.0/max(1.0,-mv.z)),1.2,6.5*uPixelRatio);
  vPulse=.22+.78*pow(.5+.5*sin(uTime*2.0+aPhase),7.0);
  vTint=aTint;
}`;

const finaleSparkleFragment = /* glsl */`
precision highp float;
varying float vPulse;
varying float vTint;
void main(){
  vec2 q=gl_PointCoord-.5;
  float d=length(q)*2.0;
  if(d>1.0)discard;
  float core=exp(-d*d*34.0);
  float halo=exp(-d*d*7.0)*.55;
  vec3 color=mix(vec3(.69,.43,1.0),vec3(1.0,.78,.97),vTint*.72);
  gl_FragColor=vec4(color*(.55+core*1.8),(core+halo)*vPulse*.78);
}`;

const particleFragment = /* glsl */`
precision highp float;
uniform sampler2D uFrom;
uniform sampler2D uTo;
uniform float uTime;
uniform float uProgress;
uniform float uStyle;
varying vec2 vUv;
varying float vSide;
varying float vSeed;
varying float vAlpha;
varying float vProgress;
void main(){
  vec2 q=gl_PointCoord-.5;float r=length(q)*2.0;
  if(r>1.0)discard;
  vec4 pixel=vSide<.5?texture2D(uFrom,vUv):texture2D(uTo,vUv);
  if(pixel.a<.08)discard;
  float core=exp(-r*r*14.0),halo=exp(-r*r*4.0)*.5;
  float sparkle=.64+.36*sin(uTime*(2.2+vSeed*7.0)+vSeed*93.0);
  float flash=uStyle>5.5?exp(-pow((uProgress-.52)*8.0,2.0))*.52:0.0;
  vec3 violet=vec3(.56,.30,1.0);
  vec3 color=mix(pixel.rgb, pixel.rgb+violet*.22, .4+halo*.45);
  color+=violet*(core*.8+halo*.42+flash);
  gl_FragColor=vec4(color,(core+halo)*vAlpha*sparkle*pixel.a);
}`;

export class ScreenshotStage {
  constructor(scene,camera,onError=()=>{}){
    this.scene=scene;this.camera=camera;this.onError=onError;this.loader=new THREE.TextureLoader();this.cache=new Map();this.inflight=new Map();this.index=-1;this.requestId=0;this.disposed=false;this.busy=false;
    this.reveal={value:1};this.diffuse={progress:0,time:0,style:0,from:null,to:null,fromScale:new THREE.Vector2(1,1),toScale:new THREE.Vector2(1,1),hand:new THREE.Vector2(),handActive:0,pinch:0,burst:0,expand:0,pixelRatio:1};
    this.material=new THREE.MeshBasicMaterial({map:null,depthWrite:true,depthTest:true,toneMapped:false});
    this.image=new THREE.Mesh(new THREE.PlaneGeometry(1,1),this.material);this.image.name='original-storyboard-frame';this.image.position.z=4.4;this.image.visible=false;this.image.renderOrder=10;scene.add(this.image);
    this.backdropMaterial=new THREE.MeshBasicMaterial({map:null,color:'#b58ad1',transparent:true,opacity:1,depthWrite:false,depthTest:true,toneMapped:false});
    this.backdrop=new THREE.Mesh(new THREE.PlaneGeometry(1,1),this.backdropMaterial);this.backdrop.name='story-frame-atmosphere';this.backdrop.position.z=4.32;this.backdrop.visible=false;this.backdrop.renderOrder=9;scene.add(this.backdrop);
    const geometry=new THREE.BufferGeometry(),resX=208,resY=118,count=resX*resY*2,uv=new Float32Array(count*2),side=new Float32Array(count),seed=new Float32Array(count);
    let k=0;for(let s=0;s<2;s++)for(let y=0;y<resY;y++)for(let x=0;x<resX;x++){uv[k*2]=(x+.5)/resX;uv[k*2+1]=1-(y+.5)/resY;side[k]=s;seed[k]=((x*73856093^y*19349663^s*83492791)>>>0)/4294967295;k++;}
    geometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(count*3),3));geometry.setAttribute('aUv',new THREE.BufferAttribute(uv,2));geometry.setAttribute('aSide',new THREE.BufferAttribute(side,1));geometry.setAttribute('aSeed',new THREE.BufferAttribute(seed,1));
    this.particleMaterial=new THREE.ShaderMaterial({vertexShader:particleVertex,fragmentShader:particleFragment,transparent:true,depthWrite:false,depthTest:false,blending:THREE.AdditiveBlending,toneMapped:false,uniforms:{uFrom:{value:null},uTo:{value:null},uProgress:{value:0},uTime:{value:0},uStyle:{value:0},uFromScale:{value:this.diffuse.fromScale},uToScale:{value:this.diffuse.toScale},uHand:{value:this.diffuse.hand},uHandActive:{value:0},uPinch:{value:0},uBurst:{value:0},uExpand:{value:0},uPixelRatio:{value:1}}});
    this.particles=new THREE.Points(geometry,this.particleMaterial);this.particles.frustumCulled=false;this.particles.visible=false;this.particles.renderOrder=11;scene.add(this.particles);
    const sparkleCount=640,sparkleGeometry=new THREE.BufferGeometry();sparkleGeometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(sparkleCount*3),3));sparkleGeometry.setAttribute('aPhase',new THREE.BufferAttribute(new Float32Array(sparkleCount),1));sparkleGeometry.setAttribute('aSize',new THREE.BufferAttribute(new Float32Array(sparkleCount),1));sparkleGeometry.setAttribute('aTint',new THREE.BufferAttribute(new Float32Array(sparkleCount),1));
    this.sparkleMaterial=new THREE.ShaderMaterial({vertexShader:finaleSparkleVertex,fragmentShader:finaleSparkleFragment,transparent:true,depthWrite:false,depthTest:false,blending:THREE.AdditiveBlending,toneMapped:false,uniforms:{uTime:{value:0},uPixelRatio:{value:1}}});
    this.finaleSparkles=new THREE.Points(sparkleGeometry,this.sparkleMaterial);this.finaleSparkles.name='finale-image-sparkle-overlay';this.finaleSparkles.position.z=4.46;this.finaleSparkles.visible=false;this.finaleSparkles.frustumCulled=false;this.finaleSparkles.renderOrder=12;scene.add(this.finaleSparkles);
  }
  #load(index){
    if(index<0||index>=manifest.sequence.length)return Promise.reject(new Error(`Screenshot ${index+1} is outside the storyboard.`));
    if(this.cache.has(index))return Promise.resolve(this.cache.get(index));if(this.inflight.has(index))return this.inflight.get(index);
    const entry=manifest.sequence[index];const promise=new Promise((resolve,reject)=>this.loader.load(entry.file,texture=>{if(this.disposed){texture.dispose();reject(new Error('Screenshot stage was disposed while loading.'));return;}texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;texture.minFilter=THREE.LinearMipmapLinearFilter;texture.magFilter=THREE.LinearFilter;texture.generateMipmaps=true;const result={texture,width:texture.image.width,height:texture.image.height};this.cache.set(index,result);resolve(result);},undefined,error=>reject(new Error(`Could not load original frame ${entry.sequence} (${entry.file}): ${error?.message||'asset unavailable'}`))));
    this.inflight.set(index,promise);promise.finally(()=>this.inflight.delete(index)).catch(()=>{});return promise;
  }
  async enter(index=0){this.index=index;try{const image=await this.#load(index);if(this.disposed)return;this.image.visible=true;this.#showImage(image);this.reveal.value=1;this.#warm(index);}catch(error){this.onError(error.message);}}
  async show(index,transitionName){if(index===this.index||this.disposed)return;const request=++this.requestId;let next;try{next=await this.#load(index);}catch(error){this.onError(error.message);return;}if(this.disposed||request!==this.requestId)return;
    const current=this.cache.get(this.index);if(!current){this.enter(index);return;}
    gsap.killTweensOf(this.diffuse);gsap.killTweensOf(this.backdropMaterial);this.busy=true;this.image.visible=false;this.finaleSparkles.visible=false;this.backdrop.visible=true;this.backdropMaterial.opacity=1;gsap.to(this.backdropMaterial,{opacity:.14,duration:1.65,ease:'power2.out'});this.particles.visible=true;this.particleMaterial.uniforms.uFrom.value=current.texture;this.particleMaterial.uniforms.uTo.value=next.texture;
    const a=this.#dimensions(current.width/current.height),b=this.#dimensions(next.width/next.height);this.diffuse.fromScale.set(a.width/2,a.height/2);this.diffuse.toScale.set(b.width/2,b.height/2);
    this.particleMaterial.uniforms.uStyle.value=Math.max(0,names.indexOf(transitionName||manifest.sequence[this.index]?.transitionIntoNext||names[0]));this.diffuse.progress=0;this.particleMaterial.uniforms.uProgress.value=0;
    gsap.to(this.diffuse,{progress:1,duration:2.65,ease:'power2.inOut',onUpdate:()=>{this.particleMaterial.uniforms.uProgress.value=this.diffuse.progress;},onComplete:()=>{if(this.disposed||request!==this.requestId)return;this.index=index;this.busy=false;this.particles.visible=false;this.particleMaterial.uniforms.uFrom.value=null;this.particleMaterial.uniforms.uTo.value=null;this.#showImage(next,true);this.#warm(index);}});
  }
  #viewportDimensions(z){const distance=this.camera.position.z-z,height=2*distance*Math.tan(THREE.MathUtils.degToRad(this.camera.fov*.5));return{width:height*this.camera.aspect,height};}
  #dimensions(aspect){const view=this.#viewportDimensions(this.image.position.z),height=Math.min(view.height*.97,view.width*.97/aspect);return{width:height*aspect,height};}
  #coverDimensions(aspect){const view=this.#viewportDimensions(this.backdrop.position.z),viewAspect=view.width/view.height;return aspect<viewAspect?{width:view.width,height:view.width/aspect}:{width:view.height*aspect,height:view.height};}
  #makeAtmosphere(image){
    const source=image.texture.image,canvas=document.createElement('canvas');canvas.width=960;canvas.height=540;const ctx=canvas.getContext('2d');if(!ctx)return null;
    const scale=Math.max(canvas.width/source.width,canvas.height/source.height),w=source.width*scale,h=source.height*scale;
    ctx.fillStyle='#10091d';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.save();ctx.filter='blur(24px) brightness(.62) saturate(1.28)';ctx.drawImage(source,(canvas.width-w)/2,(canvas.height-h)/2,w,h);ctx.restore();
    const tint=ctx.createLinearGradient(0,0,canvas.width,canvas.height);tint.addColorStop(0,'rgba(59,24,91,.24)');tint.addColorStop(.5,'rgba(30,10,48,.16)');tint.addColorStop(1,'rgba(126,40,101,.24)');ctx.fillStyle=tint;ctx.fillRect(0,0,canvas.width,canvas.height);
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.generateMipmaps=true;texture.minFilter=THREE.LinearMipmapLinearFilter;return texture;
  }
  #showImage(image,animateAtmosphere=false){
    this.material.map=image.texture;this.material.needsUpdate=true;
    const old=this.backdropMaterial.map,next=this.#makeAtmosphere(image);if(next){this.backdropMaterial.map=next;this.backdropMaterial.needsUpdate=true;if(old)old.dispose();}
    this.backdrop.visible=true;this.backdropMaterial.opacity=animateAtmosphere?0:1;if(animateAtmosphere)gsap.to(this.backdropMaterial,{opacity:1,duration:.9,ease:'power2.out'});
    this.#fit(image.width/image.height);this.image.visible=true;this.finaleSparkles.visible=finaleFrames.has(this.index);if(this.finaleSparkles.visible)this.#placeFinaleSparkles(image);
  }
  #fit(aspect){const d=this.#dimensions(aspect),cover=this.#coverDimensions(aspect);this.image.scale.set(d.width,d.height,1);this.backdrop.scale.set(cover.width,cover.height,1);this.particleMaterial.uniforms.uPixelRatio.value=Math.min(window.devicePixelRatio||1,1.7);this.sparkleMaterial.uniforms.uPixelRatio.value=Math.min(window.devicePixelRatio||1,1.55);}
  #placeFinaleSparkles(image){
    const count=this.finaleSparkles.geometry.attributes.position.count,positions=this.finaleSparkles.geometry.attributes.position.array,phases=this.finaleSparkles.geometry.attributes.aPhase.array,sizes=this.finaleSparkles.geometry.attributes.aSize.array,tints=this.finaleSparkles.geometry.attributes.aTint.array,dims=this.#dimensions(image.width/image.height),candidates=[];
    const canvas=document.createElement('canvas');canvas.width=182;canvas.height=91;const ctx=canvas.getContext('2d',{willReadFrequently:true});
    if(ctx){try{ctx.drawImage(image.texture.image,0,0,canvas.width,canvas.height);const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++){const i=(y*canvas.width+x)*4,r=pixels[i],g=pixels[i+1],b=pixels[i+2];if(r+g+b>550&&(b>r*.88||g>r*1.06))candidates.push([x/(canvas.width-1),y/(canvas.height-1),Math.min(1,(r+g+b-550)/215)]);}}catch{}}
    let seed=0x7e7+this.index;const random=()=>{seed=Math.imul(seed^seed>>>15,1|seed);seed^=seed+Math.imul(seed^seed>>>7,61|seed);return((seed^seed>>>14)>>>0)/4294967296;};
    for(let i=0;i<count;i++){const sample=candidates.length?candidates[Math.floor(random()*candidates.length)]:[random(),random(),random()];positions[i*3]=(sample[0]-.5)*dims.width;positions[i*3+1]=(.5-sample[1])*dims.height;positions[i*3+2]=0;phases[i]=random()*Math.PI*2;sizes[i]=.58+random()*1.18;tints[i]=sample[2];}
    for(const key of ['position','aPhase','aSize','aTint'])this.finaleSparkles.geometry.attributes[key].needsUpdate=true;
  }
  setGesture(g){if(!g?.active){this.diffuse.handActive=0;this.diffuse.pinch=0;this.diffuse.expand=0;return;}const p=g.pinch?(g.tip||g.center):g.center;if(p){this.diffuse.hand.set((p.x-.5)*this.camera.aspect*12,(.5-p.y)*7);}this.diffuse.handActive=1;this.diffuse.pinch=g.pinch?1:0;this.diffuse.expand=g.twoHandDistance==null?0:THREE.MathUtils.clamp((g.twoHandDistance-.24)*2,-.6,1.4);if(g.trigger==='spread fingers'||g.trigger==='victory burst')gsap.fromTo(this.diffuse,{burst:1},{burst:0,duration:.9,ease:'power2.out'});}
  setPointer(x,y,active){if(!active){if(this.diffuse.handActive<1)this.diffuse.handActive=0;return;}this.diffuse.hand.set((x-.5)*this.camera.aspect*12,(.5-y)*7);if(this.diffuse.handActive<1)this.diffuse.handActive=.62;}
  resize(){if(this.index>=0){const image=this.cache.get(this.index);if(image){this.#fit(image.width/image.height);if(finaleFrames.has(this.index))this.#placeFinaleSparkles(image);}}}
  #warm(index){for(const i of [index-1,index+1])if(i>=0&&i<manifest.sequence.length)this.#load(i).catch(()=>{});for(const[i,image]of this.cache)if(Math.abs(i-index)>1){image.texture.dispose();this.cache.delete(i);}}
  update(time){const u=this.particleMaterial.uniforms;u.uTime.value=time;u.uHandActive.value=this.diffuse.handActive;u.uPinch.value=this.diffuse.pinch;u.uBurst.value=this.diffuse.burst;u.uExpand.value=this.diffuse.expand;this.sparkleMaterial.uniforms.uTime.value=time;}
  dispose(){this.disposed=true;this.requestId++;gsap.killTweensOf(this.diffuse);gsap.killTweensOf(this.backdropMaterial);for(const image of this.cache.values())image.texture.dispose();this.cache.clear();this.image.removeFromParent();this.backdrop.removeFromParent();this.finaleSparkles.removeFromParent();this.image.geometry.dispose();this.material.dispose();this.backdrop.geometry.dispose();this.backdropMaterial.map?.dispose();this.backdropMaterial.dispose();this.particles.removeFromParent();this.particles.geometry.dispose();this.particleMaterial.dispose();this.finaleSparkles.geometry.dispose();this.sparkleMaterial.dispose();}
}
export {manifest as screenshotManifest};
