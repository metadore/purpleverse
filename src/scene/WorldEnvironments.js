import * as THREE from 'three';

const rng=seed=>()=>{seed=(Math.imul(seed^seed>>>15,1|seed));seed^=seed+Math.imul(seed^seed>>>7,61|seed);return((seed^seed>>>14)>>>0)/4294967296;};

function cosmicTexture(){
  const canvas=document.createElement('canvas');canvas.width=1600;canvas.height=900;const c=canvas.getContext('2d'),random=rng(931);
  const bg=c.createLinearGradient(0,0,0,900);bg.addColorStop(0,'#05030d');bg.addColorStop(.48,'#10091f');bg.addColorStop(1,'#05030c');c.fillStyle=bg;c.fillRect(0,0,1600,900);
  for(const [x,y,r,color] of [[360,410,430,'rgba(84,28,142,.22)'],[1170,510,520,'rgba(70,24,119,.19)'],[820,210,340,'rgba(143,54,196,.10)']]){const neb=c.createRadialGradient(x,y,0,x,y,r);neb.addColorStop(0,color);neb.addColorStop(1,'rgba(5,3,13,0)');c.fillStyle=neb;c.fillRect(0,0,1600,900);}
  // A quiet seven-point constellation sits behind the full-frame artwork.
  const pts=Array.from({length:7},(_,i)=>[120+i*226,180+Math.sin(i/6*Math.PI)*180]);
  c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle='rgba(185,132,255,.11)';c.lineWidth=1;c.stroke();
  for(const [x,y] of pts){const glow=c.createRadialGradient(x,y,0,x,y,28);glow.addColorStop(0,'rgba(220,184,255,.85)');glow.addColorStop(.12,'rgba(168,103,255,.35)');glow.addColorStop(1,'rgba(168,103,255,0)');c.fillStyle=glow;c.beginPath();c.arc(x,y,28,0,Math.PI*2);c.fill();c.fillStyle='rgba(229,206,255,.86)';c.beginPath();c.arc(x,y,2.2,0,Math.PI*2);c.fill();}
  for(let i=0;i<1900;i++){const x=random()*1600,y=random()*900,r=random()<.94?.35+random()*.8:1+random()*1.1;c.fillStyle=`rgba(${165+Math.floor(random()*72)},${130+Math.floor(random()*72)},255,${.06+random()*.42})`;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();}
  // Thin, slow orbital wisps create depth without becoming wallpaper.
  for(let i=0;i<5;i++){c.beginPath();c.ellipse(800,470,500+i*68,210+i*25,-.13+i*.05,Math.PI*1.05,Math.PI*1.94);c.strokeStyle=`rgba(172,111,255,${.018+i*.008})`;c.lineWidth=1;c.stroke();}
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.minFilter=THREE.LinearMipmapLinearFilter;return texture;
}

export function createWorldEnvironments(scene){
  const texture=cosmicTexture();const background=new THREE.Mesh(new THREE.PlaneGeometry(56,31.5),new THREE.MeshBasicMaterial({map:texture,depthWrite:false,toneMapped:false}));background.name='midnight-violet-cosmos';background.position.z=-18;scene.add(background);
  const random=rng(8871),count=170,positions=new Float32Array(count*3),velocities=new Float32Array(count);
  for(let i=0;i<count;i++){positions[i*3]=(random()-.5)*22;positions[i*3+1]=(random()-.5)*16;positions[i*3+2]=-3-random()*10;velocities[i]=.08+random()*.28;}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(positions,3));const material=new THREE.PointsMaterial({color:'#b98aff',size:.045,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending});const dust=new THREE.Points(geo,material);scene.add(dust);
  const linesGeo=new THREE.BufferGeometry(),linePoints=new Float32Array(7*3);for(let i=0;i<7;i++){linePoints[i*3]=(i-3)*2.85;linePoints[i*3+1]=5.8+Math.sin(i/6*Math.PI)*1.1;linePoints[i*3+2]=-8;}linesGeo.setAttribute('position',new THREE.BufferAttribute(linePoints,3));const starsMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,vertexShader:'uniform float uSize; void main(){vec4 mv=modelViewMatrix*vec4(position,1.0);gl_Position=projectionMatrix*mv;gl_PointSize=uSize;}',fragmentShader:'uniform float uOpacity; void main(){vec2 q=gl_PointCoord-.5;float d=length(q);if(d>.5)discard;float glow=exp(-d*d*38.0);gl_FragColor=vec4(.78,.56,1.0,glow*uOpacity);}',uniforms:{uSize:{value:8},uOpacity:{value:.5}}});const stars=new THREE.Points(linesGeo,starsMaterial);scene.add(stars);
  const lineGeo=new THREE.BufferGeometry().setFromPoints(Array.from({length:7},(_,i)=>new THREE.Vector3((i-3)*2.85,5.8+Math.sin(i/6*Math.PI)*1.1,-8)));const lineMat=new THREE.LineBasicMaterial({color:'#9b69d1',transparent:true,opacity:.12,depthWrite:false});const constellation=new THREE.Line(lineGeo,lineMat);scene.add(constellation);
  let current=0;
  return{setScene(n){current=THREE.MathUtils.clamp(n,0,4);},update(dt,time,sea){const p=geo.attributes.position.array;for(let i=0;i<count;i++){p[i*3+1]+=velocities[i]*dt*(.35+sea);p[i*3]+=(Math.sin(time*.35+i)*.0004);if(p[i*3+1]>9)p[i*3+1]=-9;}geo.attributes.position.needsUpdate=true;material.opacity=.18+(current===4?.18:0)+sea*.17;stars.rotation.z=Math.sin(time*.07)*.006;},dispose(){scene.remove(background,dust,stars,constellation);background.geometry.dispose();background.material.dispose();texture.dispose();geo.dispose();material.dispose();linesGeo.dispose();starsMaterial.dispose();lineGeo.dispose();lineMat.dispose();}};
}
