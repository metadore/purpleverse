import assert from 'node:assert/strict';
import { classifyHands } from '../src/gestures/HandLandmarks.js';
import { createGestureDebouncer } from '../src/gestures/GestureDebouncer.js';

function hand({extended=[],pinch=false,spread=false}={}){
  const points=Array.from({length:21},()=>({x:.5,y:.7,z:0}));
  points[0]={x:.5,y:.8,z:0};
  const bases=[2,5,9,13,17],tips=[4,8,12,16,20],xs=[.39,.44,.5,.56,.62];
  for(let f=0;f<5;f++){
    points[bases[f]]={x:xs[f],y:.62,z:0};
    points[tips[f]]=extended.includes(f)?{x:xs[f],y:.16,z:0}:{x:xs[f],y:.75,z:0};
  }
  points[3]={x:.43,y:.64,z:0};points[4]=extended.includes(0)?{x:.23,y:.6,z:0}:{x:.46,y:.64,z:0};
  if(pinch){points[4]={x:.47,y:.39,z:0};points[8]={x:.5,y:.4,z:0};}
  if(spread){points[8]={x:.23,y:.16,z:0};points[20]={x:.77,y:.16,z:0};}
  return points;
}
const open=classifyHands({landmarks:[hand({extended:[0,1,2,3,4]})]});assert.equal(open.label,'open palm · gather');
const fist=classifyHands({landmarks:[hand()]});assert.equal(fist.label,'fist · release');
const victory=classifyHands({landmarks:[hand({extended:[1,2]})]});assert.equal(victory.label,'victory burst');
const pinch=classifyHands({landmarks:[hand({extended:[1],pinch:true})]});assert.equal(pinch.label,'pinch · attract');
const spread=classifyHands({landmarks:[hand({extended:[0,1,2,3,4],spread:true})]});assert.equal(spread.label,'spread fingers');
const twoHands=classifyHands({landmarks:[hand({extended:[0,1,2,3,4]}),hand({extended:[0,1,2,3,4]})]});assert.equal(twoHands.hands.length,2);assert.notEqual(twoHands.twoHandDistance,null);
const trigger=createGestureDebouncer();assert.equal(trigger('open palm · gather',0),null);assert.equal(trigger('open palm · gather',80),null);assert.equal(trigger('open palm · gather',160),'next screenshot');assert.equal(trigger('open palm · gather',400),null);assert.equal(trigger('hands found',500),null);assert.equal(trigger('hands found',520),null);assert.equal(trigger('hands found',540),null);assert.equal(trigger('open palm · gather',900),null);assert.equal(trigger('open palm · gather',920),null);assert.equal(trigger('open palm · gather',940),null);assert.equal(trigger('hands found',1000),null);assert.equal(trigger('hands found',1020),null);assert.equal(trigger('hands found',1040),null);assert.equal(trigger('open palm · gather',1800),null);assert.equal(trigger('open palm · gather',1820),null);assert.equal(trigger('open palm · gather',1840),'next screenshot');
console.log('PASS — open palm, fist, pinch, spread, victory, two-hand tracking, smoothing-compatible landmarks, three-frame debounce and cooldown.');
