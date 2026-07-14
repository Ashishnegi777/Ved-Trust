import { useEffect, useRef, useState } from 'react';

const interactiveSelector = [
  'a',
  'button',
  '[role="button"]',
  'summary',
  '[data-cursor]',
  '.cursor-pointer',
].join(',');

export default function AestheticCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const cursor = useRef({ x: 0, y: 0, dotX: 0, dotY: 0 });
  const [enabled, setEnabled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isInteractive, setIsInteractive] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    const hasFinePointer =
      window.matchMedia('(pointer: fine)').matches ||
      window.matchMedia('(any-pointer: fine)').matches;

    if (!hasFinePointer) return;

    setEnabled(true);

    let animationFrame = 0;

    const setPosition = (x: number, y: number) => {
      const state = cursor.current;
      state.x = x;
      state.y = y;

      if (state.dotX === 0 && state.dotY === 0) {
        state.dotX = x;
        state.dotY = y;
      }

      setIsVisible(true);
    };

    const moveCursor = (event: MouseEvent) => {
      setPosition(event.clientX, event.clientY);
      const target = event.target as HTMLElement | null;
      setIsInteractive(Boolean(target?.closest(interactiveSelector)));
    };

    const touchStart = () => setIsVisible(false);
    const hideCursor = () => setIsVisible(false);
    const pressCursor = () => setIsPressed(true);
    const releaseCursor = () => setIsPressed(false);

    const render = () => {
      const state = cursor.current;
      state.dotX += (state.x - state.dotX) * 0.35;
      state.dotY += (state.y - state.dotY) * 0.35;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${state.dotX}px, ${state.dotY}px, 0) translate(-50%, -50%)`;
      }

      animationFrame = window.requestAnimationFrame(render);
    };

    animationFrame = window.requestAnimationFrame(render);
    document.addEventListener('mousemove', moveCursor, { passive: true });
    document.addEventListener('mouseleave', hideCursor);
    document.addEventListener('mousedown', pressCursor);
    document.addEventListener('mouseup', releaseCursor);
    document.addEventListener('touchstart', touchStart, { passive: true });

    return () => {
      window.cancelAnimationFrame(animationFrame);
      document.removeEventListener('mousemove', moveCursor);
      document.removeEventListener('mouseleave', hideCursor);
      document.removeEventListener('mousedown', pressCursor);
      document.removeEventListener('mouseup', releaseCursor);
      document.removeEventListener('touchstart', touchStart);
    };
  }, []);

  if (!enabled) return null;

  const opacityClass = isVisible ? 'opacity-100' : 'opacity-0';
  const dotShape = isInteractive
    ? isPressed
      ? 'h-3 w-3 bg-earth'
      : 'h-2 w-2 bg-earth'
    : isPressed
      ? 'h-2 w-2 bg-pine-green'
      : 'h-3 w-3 bg-pine-green';

  return (
    <div
      ref={dotRef}
      className={`fixed left-0 top-0 z-[9999] rounded-full shadow-[0_0_12px_rgba(63,95,69,0.35)] pointer-events-none transition-[width,height,background-color,opacity] duration-200 ease-out ${opacityClass} ${dotShape}`}
      aria-hidden="true"
    />
  );
}
