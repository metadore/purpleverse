import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

const MAX_POINTS = 18000;

function AirWritingCanvas({ active, cameraLive, onClear }, ref) {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const pathsRef = useRef([]);
  const currentPathRef = useRef(null);
  const propsRef = useRef({ active, cameraLive });
  const pointCountRef = useRef(0);

  useEffect(() => { propsRef.current = { active, cameraLive }; }, [active, cameraLive]);

  const drawSegment = (from, to) => {
    const ctx = contextRef.current;
    if (!ctx || !to) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const x = to.x * canvas.clientWidth;
    const y = to.y * canvas.clientHeight;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalCompositeOperation = 'lighter';
    ctx.beginPath();
    if (from) { ctx.moveTo(from.x * canvas.clientWidth, from.y * canvas.clientHeight); ctx.lineTo(x, y); }
    else { ctx.arc(x, y, 1.2, 0, Math.PI * 2); }
    ctx.strokeStyle = 'rgba(167, 97, 255, .7)';
    ctx.lineWidth = 14;
    ctx.shadowColor = '#a747ff';
    ctx.shadowBlur = 21;
    ctx.stroke();
    ctx.beginPath();
    if (from) { ctx.moveTo(from.x * canvas.clientWidth, from.y * canvas.clientHeight); ctx.lineTo(x, y); }
    else { ctx.arc(x, y, 1.1, 0, Math.PI * 2); }
    ctx.strokeStyle = 'rgba(224, 195, 255, .96)';
    ctx.lineWidth = 3.2;
    ctx.shadowColor = '#d5a6ff';
    ctx.shadowBlur = 7;
    ctx.stroke();
    ctx.restore();
  };

  const redraw = () => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    for (const path of pathsRef.current) {
      if (!path.length) continue;
      drawSegment(null, path[0]);
      for (let i = 1; i < path.length; i++) drawSegment(path[i - 1], path[i]);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      contextRef.current = ctx;
      redraw();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    return () => observer.disconnect();
  }, []);

  const addPoint = (point) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let path = currentPathRef.current;
    const previous = path?.[path.length - 1] || null;
    const cameraInput = propsRef.current.cameraLive;
    // Keep coordinates resolution-independent and smooth small tracking jitter.
    const target = { x: Math.min(1, Math.max(0, point.x)), y: Math.min(1, Math.max(0, point.y)) };
    const delta = previous ? Math.hypot(target.x - previous.x, target.y - previous.y) : 0;
    if (cameraInput && delta > .16) {
      currentPathRef.current = null;
      path = null;
    }
    if (!path || path.length >= MAX_POINTS) {
      path = [];
      pathsRef.current.push(path);
      currentPathRef.current = path;
    }
    const last = path[path.length - 1] || null;
    const smoothing = cameraInput ? .46 : 1;
    const smoothed = last ? {
      x: last.x + (target.x - last.x) * smoothing,
      y: last.y + (target.y - last.y) * smoothing
    } : target;
    if (last && Math.hypot(smoothed.x - last.x, smoothed.y - last.y) < .0008) return;
    path.push(smoothed);
    pointCountRef.current++;
    let trimmed = false;
    while (pointCountRef.current > MAX_POINTS && pathsRef.current.length > 1) {
      pointCountRef.current -= pathsRef.current.shift().length;
      trimmed = true;
    }
    if (trimmed) redraw();
    drawSegment(last, smoothed);
  };

  useImperativeHandle(ref, () => ({
    updateFromHand(data) {
      if (!propsRef.current.active || !propsRef.current.cameraLive) {
        currentPathRef.current = null;
        return;
      }
      const hand = data?.hands?.[0];
      if (!hand?.writing || !hand.tip) {
        currentPathRef.current = null;
        return;
      }
      const canvas = canvasRef.current;
      if (!canvas) return;
      addPoint(hand.tip);
    },
    clear() {
      pathsRef.current = [];
      currentPathRef.current = null;
      pointCountRef.current = 0;
      const canvas = canvasRef.current;
      contextRef.current?.clearRect(0, 0, canvas?.clientWidth || 0, canvas?.clientHeight || 0);
      onClear?.();
    }
  }), [onClear]);

  const pointerPoint = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) / Math.max(1, rect.width),
      y: (event.clientY - rect.top) / Math.max(1, rect.height)
    };
  };

  return <div className={`air-writing-layer${active ? ' active' : ''}`} aria-label="Finale air-writing canvas">
    <canvas
      ref={canvasRef}
      className="air-writing-canvas"
      aria-label="Write in violet light by raising one index finger, or click and drag"
      onPointerDown={(event) => {
        if (!active) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        currentPathRef.current = null;
        addPoint(pointerPoint(event));
      }}
      onPointerMove={(event) => { if (active && event.buttons === 1) addPoint(pointerPoint(event)); }}
      onPointerUp={() => { currentPathRef.current = null; }}
      onPointerCancel={() => { currentPathRef.current = null; }}
      onPointerLeave={(event) => { if (event.buttons !== 1) currentPathRef.current = null; }}
    />
    {active && <div className="air-writing-hud">
      <div className="air-writing-copy">
        <span className="air-writing-kicker">A SMALL LIGHT OF YOUR OWN</span>
        <strong>Write in starlight</strong>
        <span>{cameraLive ? 'Raise one finger to trace · close it to pause' : 'Enable the camera to air write, or click and drag'}</span>
      </div>
      <button className="air-writing-clear" type="button" onClick={() => ref?.current?.clear()}>CLEAR LIGHT</button>
    </div>}
  </div>;
}

export default forwardRef(AirWritingCanvas);
