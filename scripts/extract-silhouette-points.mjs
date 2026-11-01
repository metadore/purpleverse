import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const args = process.argv.slice(2);
const [input, output] = args;
if (!input || !output) throw new Error('Usage: node scripts/extract-silhouette-points.mjs input.png output.json [--regions regions.json] [--threshold 92] [--invert] [--alpha]');
const option = (name) => args.includes(name);
const value = (name, fallback) => { const i = args.indexOf(name); return i < 0 ? fallback : args[i + 1]; };

function decodePng(file) {
  const bytes=fs.readFileSync(file); let offset=8,width=0,height=0,depth=0,type=0; const chunks=[];
  while(offset<bytes.length){const n=bytes.readUInt32BE(offset),tag=bytes.toString('ascii',offset+4,offset+8);if(tag==='IHDR'){width=bytes.readUInt32BE(offset+8);height=bytes.readUInt32BE(offset+12);depth=bytes[offset+16];type=bytes[offset+17];}if(tag==='IDAT')chunks.push(bytes.subarray(offset+8,offset+8+n));offset+=n+12;if(tag==='IEND')break;}
  if(depth!==8||![2,6].includes(type))throw new Error(`Expected an 8-bit RGB or RGBA PNG; got depth ${depth}, color type ${type}.`);
  const channels=type===6?4:3,stride=width*channels,raw=zlib.inflateSync(Buffer.concat(chunks)),pixels=Buffer.alloc(height*stride);let at=0;
  for(let y=0;y<height;y++){const filter=raw[at++],row=y*stride;for(let x=0;x<stride;x++){const byte=raw[at++],left=x>=channels?pixels[row+x-channels]:0,up=y?pixels[row-stride+x]:0,corner=y&&x>=channels?pixels[row-stride+x-channels]:0;let p=0;if(filter===1)p=left;else if(filter===2)p=up;else if(filter===3)p=(left+up)>>1;else if(filter===4){const q=left+up-corner,pa=Math.abs(q-left),pb=Math.abs(q-up),pc=Math.abs(q-corner);p=pa<=pb&&pa<=pc?left:pb<=pc?up:corner;}else if(filter!==0)throw new Error(`Unsupported PNG filter ${filter}.`);pixels[row+x]=(byte+p)&255;}}
  return {width,height,channels,pixels};
}

const {width,height,channels,pixels}=decodePng(input);
const defaultRegions=[[228,244,257,294],[255,244,283,294],[281,244,309,294],[306,244,334,294],[332,244,360,294],[358,244,386,294],[384,244,412,294]];
const regionsPath=value('--regions',null), regions=regionsPath?JSON.parse(fs.readFileSync(regionsPath,'utf8')):defaultRegions;
const threshold=Number(value('--threshold','92'));
if(!Number.isFinite(threshold)||threshold<0||threshold>255)throw new Error('--threshold must be between 0 and 255.');
const characters=regions.map((region,index)=>{
  const [x0,y0,x1,y1]=region.map(Math.round),mask=[];
  for(let y=Math.max(0,y0);y<Math.min(height,y1);y++)for(let x=Math.max(0,x0);x<Math.min(width,x1);x++){
    const i=(y*width+x)*channels,alpha=channels===4?pixels[i+3]:255,luma=.2126*pixels[i]+.7152*pixels[i+1]+.0722*pixels[i+2];
    if(option('--alpha')?alpha>32:alpha>32&&(option('--invert')?luma>=threshold:luma<=threshold))mask.push([x,y]);
  }
  if(mask.length<20)throw new Error(`Figure ${index+1} has only ${mask.length} mask pixels; adjust its crop or threshold.`);
  const xs=mask.map(p=>p[0]),ys=mask.map(p=>p[1]),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys),h=Math.max(1,maxY-minY),aspect=(maxX-minX)/h;
  const points=mask.map(([x,y])=>[Number(((x-(minX+maxX)/2)/h).toFixed(4)),Number(((maxY-y)/h-.5).toFixed(4))]);
  return {id:`reference-figure-${index+1}`,identity:'anonymous-reference-silhouette',aspect:Number(aspect.toFixed(4)),bounds:[minX,minY,maxX,maxY],points};
});
fs.mkdirSync(path.dirname(path.resolve(output)),{recursive:true});
fs.writeFileSync(output,JSON.stringify({schemaVersion:1,source:path.basename(input),description:'Silhouette pixels normalized to character height; identities remain anonymous.',extraction:{threshold,invert:option('--invert'),alphaMask:option('--alpha')},characters},null,2)+'\n');
console.log(JSON.stringify(characters.map(({id,aspect,points})=>({id,aspect,pixels:points.length})),null,2));
