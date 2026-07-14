import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const passVertex = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fieldFragment = `
  precision highp float;

  uniform sampler2D uPrevField;
  uniform vec2 uMouse;
  uniform vec2 uVelocity;
  uniform float uRadius;
  uniform float uDecay;
  uniform float uAspect;
  uniform float uStrength;

  varying vec2 vUv;

  void main() {
    vec2 previous = (texture2D(uPrevField, vUv).rg - 0.5) * 2.0;
    previous *= uDecay;

    vec2 p = vUv;
    vec2 m = uMouse;
    p.x *= uAspect;
    m.x *= uAspect;

    float distanceToMouse = distance(p, m);
    float falloff = pow(smoothstep(uRadius, 0.0, distanceToMouse), 1.4);
    vec2 field = clamp(previous + uVelocity * uStrength * falloff, -1.0, 1.0);

    gl_FragColor = vec4(field * 0.5 + 0.5, 0.0, 1.0);
  }
`;

const neutralFieldFragment = `
  precision highp float;

  void main() {
    gl_FragColor = vec4(0.5, 0.5, 0.0, 1.0);
  }
`;

const displayFragment = `
  precision highp float;

  uniform sampler2D uImage;
  uniform sampler2D uField;
  uniform float uCanvasAspect;
  uniform float uImageAspect;
  uniform float uDisplaceScale;
  uniform float uStreak;
  uniform float uSmearMix;

  varying vec2 vUv;

  const int SAMPLES = 8;

  vec2 coverUv(vec2 uv) {
    vec2 centered = uv - 0.5;
    if (uCanvasAspect > uImageAspect) {
      centered.y *= uImageAspect / uCanvasAspect;
    } else {
      centered.x *= uCanvasAspect / uImageAspect;
    }
    return centered + 0.5;
  }

  vec3 linearToSRGB(vec3 color) {
    vec3 lower = color * 12.92;
    vec3 higher = 1.055 * pow(max(color, vec3(0.0)), vec3(1.0 / 2.4)) - 0.055;
    return mix(lower, higher, step(0.0031308, color));
  }

  void main() {
    vec2 field = (texture2D(uField, vUv).rg - 0.5) * 2.0;
    float magnitude = length(field) * uSmearMix;
    vec2 direction = magnitude > 0.0001 ? field / magnitude : vec2(0.0);
    vec2 baseOffset = field * uDisplaceScale;

    if (magnitude < 0.001) {
      vec4 cleanColor = texture2D(uImage, coverUv(vUv));
      gl_FragColor = vec4(linearToSRGB(cleanColor.rgb), 1.0);
      return;
    }

    vec4 accumulated = vec4(0.0);
    float total = 0.0;

    for (int i = 0; i < SAMPLES; i++) {
      float t = float(i) / float(SAMPLES - 1);
      float weight = 1.0 - t;
      vec2 streakOffset = direction * uStreak * magnitude * t;
      vec2 sampleUv = coverUv(vUv - baseOffset - streakOffset);
      accumulated += texture2D(uImage, sampleUv) * weight;
      total += weight;
    }

    vec4 color = accumulated / total;
    gl_FragColor = vec4(linearToSRGB(color.rgb), 1.0);
  }
`;



type PaintSmearImageProps = {
  src: string;
  alt: string;
  className?: string;
  radius?: number;
  decay?: number;
  strength?: number;
  displaceScale?: number;
  streak?: number;
};

export default function PaintSmearImage({
  src,
  alt,
  className = '',
  radius = 0.14,
  decay = 0.93,
  strength = 1,
  displaceScale = 0.032,
  streak = 0.09,
}: PaintSmearImageProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = Math.max(container.clientWidth, 1);
    let height = Math.max(container.clientHeight, 1);
    let frameId = 0;
    let disposed = false;
    let settlingFrames = 0;
    let hasPointer = false;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.width = '100%';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const fieldScene = new THREE.Scene();
    const neutralScene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.PlaneGeometry(2, 2);
    const pointer = new THREE.Vector2(-10, -10);
    const previousPointer = new THREE.Vector2(-10, -10);
    const velocity = new THREE.Vector2(0, 0);

    const targetOptions: THREE.RenderTargetOptions = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
      colorSpace: THREE.NoColorSpace,
      depthBuffer: false,
      stencilBuffer: false,
    };

    let fieldRTA = new THREE.WebGLRenderTarget(width, height, targetOptions);
    let fieldRTB = new THREE.WebGLRenderTarget(width, height, targetOptions);
    fieldRTA.texture.colorSpace = THREE.NoColorSpace;
    fieldRTB.texture.colorSpace = THREE.NoColorSpace;

    const fieldUniforms = {
      uPrevField: { value: fieldRTA.texture },
      uMouse: { value: pointer.clone() },
      uVelocity: { value: velocity.clone() },
      uRadius: { value: radius },
      uDecay: { value: decay },
      uAspect: { value: width / height },
      uStrength: { value: strength },
    };

    const fieldMaterial = new THREE.ShaderMaterial({
      vertexShader: passVertex,
      fragmentShader: fieldFragment,
      uniforms: fieldUniforms,
    });
    fieldScene.add(new THREE.Mesh(geometry, fieldMaterial));

    const neutralMaterial = new THREE.ShaderMaterial({
      vertexShader: passVertex,
      fragmentShader: neutralFieldFragment,
      depthWrite: false,
      depthTest: false,
    });
    neutralScene.add(new THREE.Mesh(geometry, neutralMaterial));

    const displayUniforms = {
      uImage: { value: new THREE.Texture() },
      uField: { value: fieldRTB.texture },
      uCanvasAspect: { value: width / height },
      uImageAspect: { value: 1 },
      uDisplaceScale: { value: displaceScale },
      uStreak: { value: streak },
      uSmearMix: { value: 0 },
    };

    const displayMaterial = new THREE.ShaderMaterial({
      vertexShader: passVertex,
      fragmentShader: displayFragment,
      uniforms: displayUniforms,
    });
    scene.add(new THREE.Mesh(geometry, displayMaterial));

    const resetFieldTargets = () => {
      renderer.setRenderTarget(fieldRTA);
      renderer.render(neutralScene, camera);
      renderer.setRenderTarget(fieldRTB);
      renderer.render(neutralScene, camera);
      renderer.setRenderTarget(null);
    };

    resetFieldTargets();

    const imageTexture = new THREE.TextureLoader().load(src, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.generateMipmaps = false;
      texture.needsUpdate = true;

      const image = texture.image as HTMLImageElement | undefined;
      displayUniforms.uImageAspect.value =
        image && image.height > 0 ? image.width / image.height : 1;
      renderFrame();
    });
    displayUniforms.uImage.value = imageTexture;

    const toUv = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      return new THREE.Vector2(
        THREE.MathUtils.clamp((event.clientX - rect.left) / rect.width, 0, 1),
        THREE.MathUtils.clamp(1 - (event.clientY - rect.top) / rect.height, 0, 1)
      );
    };

    const ensureLoop = () => {
      if (!frameId) frameId = window.requestAnimationFrame(animate);
    };

    const handlePointerEnter = (event: PointerEvent) => {
      pointer.copy(toUv(event));
      previousPointer.copy(pointer);
      hasPointer = true;
      settlingFrames = 90;
      ensureLoop();
    };

    const handlePointerMove = (event: PointerEvent) => {
      const uv = toUv(event);
      if (hasPointer) {
        previousPointer.copy(pointer);
      } else {
        previousPointer.copy(uv);
        hasPointer = true;
      }
      pointer.copy(uv);
      displayUniforms.uSmearMix.value = 1;
      settlingFrames = 90;
      ensureLoop();
    };

    const handlePointerLeave = () => {
      hasPointer = false;
      velocity.set(0, 0);
      settlingFrames = 90;
      ensureLoop();
    };

    container.addEventListener('pointerenter', handlePointerEnter);
    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('pointerleave', handlePointerLeave);

    function renderFrame() {
      renderer.setRenderTarget(fieldRTB);
      renderer.render(fieldScene, camera);
      renderer.setRenderTarget(null);

      displayUniforms.uField.value = fieldRTB.texture;
      renderer.render(scene, camera);

      const next = fieldRTA;
      fieldRTA = fieldRTB;
      fieldRTB = next;
    }

    function animate() {
      frameId = 0;
      if (disposed) return;

      velocity.subVectors(pointer, previousPointer);
      velocity.multiplyScalar(hasPointer ? 1 : 0);

      fieldUniforms.uMouse.value.copy(pointer);
      fieldUniforms.uVelocity.value.copy(velocity);
      fieldUniforms.uPrevField.value = fieldRTA.texture;

      renderFrame();
      previousPointer.copy(pointer);

      settlingFrames -= 1;
      if (settlingFrames > 0) ensureLoop();
    }

    const resizeObserver = new ResizeObserver(() => {
      width = Math.max(container.clientWidth, 1);
      height = Math.max(container.clientHeight, 1);
      renderer.setSize(width, height);
      fieldRTA.setSize(width, height);
      fieldRTB.setSize(width, height);
      resetFieldTargets();
      fieldUniforms.uAspect.value = width / height;
      displayUniforms.uCanvasAspect.value = width / height;
      settlingFrames = 2;
      ensureLoop();
    });
    resizeObserver.observe(container);

    renderFrame();

    return () => {
      disposed = true;
      if (frameId) window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      container.removeEventListener('pointerenter', handlePointerEnter);
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerleave', handlePointerLeave);
      geometry.dispose();
      fieldMaterial.dispose();
      neutralMaterial.dispose();
      displayMaterial.dispose();
      fieldRTA.dispose();
      fieldRTB.dispose();
      imageTexture.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [decay, displaceScale, radius, src, streak, strength]);

  return (
    <div
      ref={mountRef}
      className={`h-full w-full ${className}`}
      role="img"
      aria-label={alt}
    />
  );
}
