import { useEffect, useRef, useState, type CSSProperties } from 'react';
import * as THREE from 'three';

const TRAIL_MAX = 24;
const TRAIL_LIFETIME = 1.1;

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;

  varying vec2 vUv;

  uniform sampler2D uTexture;
  uniform float uTime;
  uniform vec2 uTrailPos[${TRAIL_MAX}];
  uniform float uTrailAge[${TRAIL_MAX}];
  uniform vec2 uTrailDir[${TRAIL_MAX}];
  uniform vec2 uCurrent;
  uniform vec2 uCurrentDir;
  uniform float uHasCurrent;
  uniform float uBrushRadius;
  uniform float uStrength;
  uniform float uLifetime;
  uniform float uPlaneAspect;
  uniform float uIntensity;
  uniform vec3 uTint;
  uniform vec3 uGlow;

  vec3 permute(vec3 x) {
    return mod(((x * 34.0) + 1.0) * x, 289.0);
  }

  float snoise(vec2 v) {
    const vec4 C = vec4(
      0.211324865405187,
      0.366025403784439,
      -0.577350269189626,
      0.024390243902439
    );
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(
      0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)),
      0.0
    );
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 4; i++) {
      value += amplitude * snoise(p);
      p *= 2.02;
      amplitude *= 0.5;
    }
    return value;
  }

  void addBrush(
    vec2 uv,
    vec2 position,
    vec2 direction,
    float lifeFade,
    float indexSeed,
    inout vec2 totalDisp,
    inout float totalInk
  ) {
    vec2 aspectFix = vec2(uPlaneAspect, 1.0);
    vec2 delta = (uv - position) * aspectFix;
    float dist = length(delta);
    float falloff = smoothstep(uBrushRadius, 0.0, dist) * lifeFade;
    if (falloff <= 0.0001) return;

    // Domain-warped noise makes the cursor behave like a brush pulling wet ink,
    // rather than a radial water ripple.
    vec2 noiseCoord = uv * 6.0 + position * 3.0 + uTime * 0.15 + indexSeed * 11.7;
    float nx = fbm(noiseCoord);
    float ny = fbm(noiseCoord + vec2(37.2, 91.4));
    vec2 swirl = normalize(vec2(nx, ny) + 0.0001);

    vec2 dragDir = normalize(direction + 0.0001);
    vec2 pushDir = normalize(mix(dragDir, swirl, 0.62) + 0.0001);

    totalDisp += pushDir * falloff;
    totalInk += falloff;
  }

  void main() {
    vec2 uv = vUv;
    vec2 totalDisp = vec2(0.0);
    float totalInk = 0.0;

    for (int i = 0; i < ${TRAIL_MAX}; i++) {
      float age = uTrailAge[i];
      if (age > uLifetime) continue;

      float lifeFade = 1.0 - clamp(age / uLifetime, 0.0, 1.0);
      lifeFade = lifeFade * lifeFade;
      addBrush(
        uv,
        uTrailPos[i],
        uTrailDir[i],
        lifeFade,
        float(i),
        totalDisp,
        totalInk
      );
    }

    addBrush(
      uv,
      uCurrent,
      uCurrentDir,
      uHasCurrent * 0.95,
      31.0,
      totalDisp,
      totalInk
    );

    totalInk = clamp(totalInk * uIntensity, 0.0, 1.0);
    totalDisp *= uStrength * uIntensity;

    vec2 distortedUv = clamp(uv + totalDisp, 0.001, 0.999);

    vec4 color = vec4(0.0);
    const int TAPS = 5;
    for (int i = 0; i < TAPS; i++) {
      float t = float(i) / float(TAPS - 1);
      vec2 sampleUv = mix(uv, distortedUv, t);
      color += texture2D(uTexture, sampleUv);
    }
    color /= float(TAPS);

    float ink = clamp(totalInk, 0.0, 1.0);
    float wetShine = pow(fbm(uv * 13.0 + uTime * 0.22) * 0.5 + 0.5, 4.0);
    color.rgb = mix(color.rgb, color.rgb * (1.0 - 0.15 * ink), ink);
    color.rgb = mix(color.rgb, uTint, ink * 0.28);
    color.rgb += uGlow * wetShine * ink * 0.10;
    color.a = mix(color.a, color.a * 0.85, ink * 0.3);

    gl_FragColor = vec4(color.rgb, color.a * uIntensity);
  }
`;

type HeroShaderTitleProps = {
  text: string;
  as?: 'h1' | 'h2';
  className?: string;
  color?: string;
  fontSize?: CSSProperties['fontSize'];
  respectReducedMotion?: boolean;
};

type TextTexture = {
  texture: THREE.CanvasTexture;
  width: number;
  height: number;
};

type TrailPoint = {
  pos: THREE.Vector2;
  dir: THREE.Vector2;
  age: number;
};

function wrapText(context: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';

  words.forEach((word) => {
    const candidate = line ? `${line} ${word}` : word;
    if (!line || context.measureText(candidate).width <= maxWidth) {
      line = candidate;
      return;
    }

    lines.push(line);
    line = word;
  });

  if (line) lines.push(line);
  return lines;
}

function makeTextTexture(element: HTMLElement, text: string, color: string): TextTexture | null {
  const rect = element.getBoundingClientRect();
  if (rect.width < 2 || rect.height < 2) return null;

  const style = window.getComputedStyle(element);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(rect.width * dpr);
  canvas.height = Math.ceil(rect.height * dpr);

  const context = canvas.getContext('2d');
  if (!context) return null;

  const fontSizePx = Number.parseFloat(style.fontSize);
  const lineHeight = style.lineHeight === 'normal' ? fontSizePx * 1.12 : Number.parseFloat(style.lineHeight);
  context.scale(dpr, dpr);
  context.clearRect(0, 0, rect.width, rect.height);
  context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  const richTextContext = context as CanvasRenderingContext2D & {
    fontKerning?: CanvasFontKerning;
    letterSpacing?: string;
  };
  richTextContext.fontKerning = 'normal';
  richTextContext.letterSpacing = style.letterSpacing;
  context.fillStyle = color;
  context.textAlign = 'center';
  context.textBaseline = 'middle';

  const lines = wrapText(context, text, rect.width);
  const blockHeight = lines.length * lineHeight;
  const startY = rect.height / 2 - blockHeight / 2 + lineHeight / 2;

  lines.forEach((line, index) => {
    context.fillText(line, rect.width / 2, startY + index * lineHeight);
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;

  return { texture, width: rect.width, height: rect.height };
}

export default function HeroShaderTitle({
  text,
  as = 'h1',
  className = '',
  color = '#F7F3EA',
  fontSize,
  respectReducedMotion = false,
}: HeroShaderTitleProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const pointerRef = useRef({
    hover: false,
    intensity: 0,
    targetIntensity: 0,
    current: new THREE.Vector2(0.5, 0.5),
    currentDir: new THREE.Vector2(0, 0),
  });
  const [active, setActive] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isShaderReady, setIsShaderReady] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const heading = headingRef.current;
    const mount = mountRef.current;
    if (!heading || !mount) return;

    const reducedMotion =
      respectReducedMotion && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return undefined;

    let disposed = false;
    let frameId = 0;
    let textureState: TextTexture | null = null;
    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.OrthographicCamera | null = null;
    let material: THREE.ShaderMaterial | null = null;
    let geometry: THREE.PlaneGeometry | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let previousFrameTime = performance.now();
    let trailIndex = 0;
    let hasLastPointer = false;
    const lastPointer = new THREE.Vector2(0.5, 0.5);
    const trail: TrailPoint[] = Array.from({ length: TRAIL_MAX }, () => ({
      pos: new THREE.Vector2(-10, -10),
      dir: new THREE.Vector2(0, 0),
      age: TRAIL_LIFETIME + 1,
    }));

    const disposeScene = () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      frameId = 0;
      setIsShaderReady(false);
      textureState?.texture.dispose();
      textureState = null;
      scene?.clear();
      scene = null;
      camera = null;
      geometry?.dispose();
      geometry = null;
      material?.dispose();
      material = null;
      renderer?.dispose();
      renderer?.domElement.remove();
      renderer = null;
    };

    const renderLoop = () => {
      if (disposed || !renderer || !scene || !camera || !material) return;

      const now = performance.now();
      const dt = Math.min((now - previousFrameTime) / 1000, 0.05);
      previousFrameTime = now;

      const pointer = pointerRef.current;
      pointer.intensity = THREE.MathUtils.lerp(
        pointer.intensity,
        pointer.targetIntensity,
        1 - Math.pow(0.001, dt)
      );

      let hasLiveTrail = false;
      const trailPos = material.uniforms.uTrailPos.value as THREE.Vector2[];
      const trailDir = material.uniforms.uTrailDir.value as THREE.Vector2[];
      const trailAge = material.uniforms.uTrailAge.value as number[];

      trail.forEach((point, index) => {
        if (point.age <= TRAIL_LIFETIME) {
          point.age += dt;
          if (point.age <= TRAIL_LIFETIME) hasLiveTrail = true;
        }

        trailPos[index].copy(point.pos);
        trailDir[index].copy(point.dir);
        trailAge[index] = point.age;
      });

      material.uniforms.uCurrent.value.copy(pointer.current);
      material.uniforms.uCurrentDir.value.copy(pointer.currentDir);
      material.uniforms.uHasCurrent.value = pointer.hover ? pointer.intensity : 0;
      material.uniforms.uIntensity.value = pointer.intensity;
      material.uniforms.uTime.value += dt;

      renderer.render(scene, camera);

      if (pointer.hover || pointer.intensity > 0.01 || hasLiveTrail) {
        frameId = window.requestAnimationFrame(renderLoop);
      } else {
        frameId = 0;
        setActive(false);
        setIsHovering(false);
      }
    };

    const ensureLoop = () => {
      if (!frameId) frameId = window.requestAnimationFrame(renderLoop);
    };

    const setup = () => {
      disposeScene();
      textureState = makeTextTexture(heading, text, color);
      if (!textureState || disposed) return;
      setDimensions({ width: textureState.width, height: textureState.height });

      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      } catch {
        setActive(false);
        setIsHovering(false);
        return;
      }

      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.NoToneMapping;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(textureState.width, textureState.height);
      renderer.setClearColor(0x000000, 0);
      renderer.domElement.style.display = 'block';
      renderer.domElement.style.height = '100%';
      renderer.domElement.style.width = '100%';
      mount.appendChild(renderer.domElement);

      const aspect = textureState.width / textureState.height;
      scene = new THREE.Scene();
      camera = new THREE.OrthographicCamera(-aspect, aspect, 1, -1, 0, 1);
      geometry = new THREE.PlaneGeometry(aspect * 2, 2);

      material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uTexture: { value: textureState.texture },
          uTime: { value: 0 },
          uTrailPos: {
            value: Array.from({ length: TRAIL_MAX }, () => new THREE.Vector2(-10, -10)),
          },
          uTrailAge: { value: Array.from({ length: TRAIL_MAX }, () => TRAIL_LIFETIME + 1) },
          uTrailDir: {
            value: Array.from({ length: TRAIL_MAX }, () => new THREE.Vector2(0, 0)),
          },
          uCurrent: { value: new THREE.Vector2(0.5, 0.5) },
          uCurrentDir: { value: new THREE.Vector2(0, 0) },
          uHasCurrent: { value: 0 },
          uBrushRadius: { value: 0.16 },
          uStrength: { value: 0.09 },
          uLifetime: { value: TRAIL_LIFETIME },
          uPlaneAspect: { value: aspect },
          uIntensity: { value: 0 },
          uTint: { value: new THREE.Color('#B38A52') },
          uGlow: { value: new THREE.Color('#F0C37A') },
        },
        transparent: true,
        depthWrite: false,
      });

      scene.add(new THREE.Mesh(geometry, material));
      renderer.render(scene, camera);
      setIsShaderReady(true);
    };

    const pushTrailPoint = (position: THREE.Vector2, direction: THREE.Vector2) => {
      const point = trail[trailIndex];
      point.pos.copy(position);
      point.dir.copy(direction);
      point.age = 0;
      trailIndex = (trailIndex + 1) % TRAIL_MAX;
    };

    const updatePointer = (clientX: number, clientY: number, hover: boolean) => {
      const rect = heading.getBoundingClientRect();
      const uv = new THREE.Vector2(
        THREE.MathUtils.clamp((clientX - rect.left) / rect.width, 0, 1),
        THREE.MathUtils.clamp(1 - (clientY - rect.top) / rect.height, 0, 1)
      );

      const pointer = pointerRef.current;
      pointer.hover = hover;
      pointer.targetIntensity = hover ? 1 : 0;
      setIsHovering(hover);

      if (hover && hasLastPointer) {
        const delta = uv.clone().sub(lastPointer);
        const speed = delta.length();
        if (speed > 0.002 && speed < 0.65) {
          const direction = delta.clone().normalize();
          pushTrailPoint(uv, direction);
          pointer.currentDir.copy(direction);
        }
      }

      pointer.current.copy(uv);
      lastPointer.copy(uv);
      hasLastPointer = hover;
      setActive(true);
      ensureLoop();
    };

    const handlePointerEnter = (event: PointerEvent) => {
      hasLastPointer = false;
      updatePointer(event.clientX, event.clientY, true);
    };
    const handlePointerMove = (event: PointerEvent) => updatePointer(event.clientX, event.clientY, true);
    const handlePointerLeave = () => {
      pointerRef.current.hover = false;
      pointerRef.current.targetIntensity = 0;
      hasLastPointer = false;
      setIsHovering(false);
      ensureLoop();
    };
    const handleTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      hasLastPointer = false;
      updatePointer(touch.clientX, touch.clientY, true);
    };
    const handleTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      updatePointer(touch.clientX, touch.clientY, true);
    };
    const handleTouchEnd = () => {
      pointerRef.current.hover = false;
      pointerRef.current.targetIntensity = 0;
      hasLastPointer = false;
      setIsHovering(false);
      ensureLoop();
    };

    const initialize = async () => {
      await document.fonts?.ready;
      if (disposed) return;
      setup();
      resizeObserver = new ResizeObserver(setup);
      resizeObserver.observe(heading);
    };

    initialize();
    heading.addEventListener('pointerenter', handlePointerEnter);
    heading.addEventListener('pointermove', handlePointerMove);
    heading.addEventListener('pointerleave', handlePointerLeave);
    heading.addEventListener('touchstart', handleTouchStart, { passive: true });
    heading.addEventListener('touchmove', handleTouchMove, { passive: true });
    heading.addEventListener('touchend', handleTouchEnd);

    cleanupRef.current = () => {
      disposed = true;
      resizeObserver?.disconnect();
      heading.removeEventListener('pointerenter', handlePointerEnter);
      heading.removeEventListener('pointermove', handlePointerMove);
      heading.removeEventListener('pointerleave', handlePointerLeave);
      heading.removeEventListener('touchstart', handleTouchStart);
      heading.removeEventListener('touchmove', handleTouchMove);
      heading.removeEventListener('touchend', handleTouchEnd);
      disposeScene();
    };

    return () => cleanupRef.current?.();
  }, [color, respectReducedMotion, text]);

  const HeadingTag = as;

  return (
    <div className="relative block w-full">
      <HeadingTag
        ref={headingRef}
        className={className}
        style={{
          fontSize,
          opacity: isHovering && isShaderReady ? 0 : 1,
          transition: 'opacity 140ms ease-out',
        }}
      >
        {text}
      </HeadingTag>
      <div
        ref={mountRef}
        className="pointer-events-none absolute left-0 top-0 z-10"
        style={{
          width: dimensions.width,
          height: dimensions.height,
          opacity: active && isShaderReady ? 1 : 0,
          transition: 'opacity 140ms ease-out',
        }}
        aria-hidden="true"
      />
    </div>
  );
}
