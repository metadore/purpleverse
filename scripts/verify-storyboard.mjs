import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import manifest from '../src/data/screenshotManifest.json' with { type:'json' };

const root=path.resolve('public');const hashes=new Map();let totalBytes=0;
for(let i=0;i<manifest.sequence.length;i++){
  const frame=manifest.sequence[i];assert.equal(frame.sequence,i+1,`Frame ${i+1} has an incorrect sequence number.`);
  const file=path.resolve(root,`.${frame.file.replaceAll('/','\\')}`);assert.ok(file.startsWith(root+path.sep),`Frame ${i+1} escapes public assets.`);
  const png=fs.readFileSync(file);assert.equal(png.toString('hex',0,8),'89504e470d0a1a0a',`Frame ${i+1} is not a PNG.`);
  const width=png.readUInt32BE(16),height=png.readUInt32BE(20);assert.equal(width,frame.width,`Frame ${i+1} width mismatch.`);assert.equal(height,frame.height,`Frame ${i+1} height mismatch.`);
  const hash=crypto.createHash('sha256').update(png).digest('hex');hashes.set(hash,(hashes.get(hash)||0)+1);totalBytes+=png.length;
}
assert.equal(manifest.sequence.at(-1).transitionIntoNext,null,'Last frame should not transition to an unlisted frame.');
assert.equal(manifest.sequence.length,21,'Expected all 21 supplied screenshots in the original sequence.');
console.log(`PASS — ${manifest.sequence.length} original frames, dimensions and sequence verified (${(totalBytes/1024/1024).toFixed(2)} MiB).`);
console.log(`Exact duplicate source frames retained: ${[...hashes.values()].filter(count=>count>1).reduce((sum,count)=>sum+count-1,0)}.`);
