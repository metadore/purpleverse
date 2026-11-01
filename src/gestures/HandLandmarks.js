const TIPS = [4, 8, 12, 16, 20];
const BASES = [2, 5, 9, 13, 17];
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, (a.z || 0) - (b.z || 0));

export function classifyHands(result, previous = null) {
  const hands = (result?.landmarks || []).map((rawLandmarks, i) => {
    const oldLandmarks=previous?.hands?.[i]?.landmarks;
    const landmarks=rawLandmarks.map((point,j)=>{const old=oldLandmarks?.[j];return old?{x:old.x*.62+point.x*.38,y:old.y*.62+point.y*.38,z:(old.z||0)*.62+(point.z||0)*.38}:point;});
    const wrist = landmarks[0];
    const fingers = [1, 2, 3, 4].map((j) => distance(landmarks[TIPS[j]], wrist) > distance(landmarks[BASES[j]], wrist) * 1.18);
    const thumbOpen = distance(landmarks[4], landmarks[5]) > distance(landmarks[3], landmarks[5]) * 1.12;
    const openCount = fingers.filter(Boolean).length + (thumbOpen ? 1 : 0);
    const writingCandidate = fingers[0] && !fingers[1] && !fingers[2] && !fingers[3];
    // A single noisy frame should not split an air-written stroke. Keep the pen
    // down for one missed frame, then release it normally if the pose changes.
    const wasWriting = !!previous?.hands?.[i]?.writing;
    const writingMisses = writingCandidate ? 0 : wasWriting ? (previous?.hands?.[i]?.writingMisses || 0) + 1 : 0;
    const writing = writingCandidate || (wasWriting && writingMisses <= 1);
    const pinch = distance(landmarks[4], landmarks[8]) < .065;
    const victory = fingers[0] && fingers[1] && !fingers[2] && !fingers[3];
    const spread = distance(landmarks[8], landmarks[20]);
    const center = landmarks[9];
    return { landmarks, center: { x: 1 - center.x, y: center.y, z: center.z }, tip: { x: 1 - landmarks[8].x, y: landmarks[8].y }, open: openCount >= 4, fist: openCount <= 1, pinch, victory, writing, writingMisses, spread };
  });
  const primary = hands[0];
  const second = hands[1];
  let label = 'hands found';
  if (primary) label = primary.victory ? 'victory burst' : primary.fist ? 'fist · release' : primary.pinch ? 'pinch · attract' : primary.open && primary.spread > .34 ? 'spread fingers' : primary.open ? 'open palm · gather' : 'guiding light';
  return { active: !!primary, hands, center: primary?.center || { x: .5, y: .5 }, tip: primary?.tip || { x: .5, y: .5 }, pinch: !!primary?.pinch, fist: !!primary?.fist, open: !!primary?.open, victory: !!primary?.victory, spread: primary?.spread || 0, twoHandDistance: primary && second ? Math.hypot(primary.center.x - second.center.x, primary.center.y - second.center.y) : null, label, changed: previous?.label !== label };
}
