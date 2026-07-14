import { useEffect, useRef } from 'react';
import * as THREE from 'three';

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

  uniform sampler2D uNormalMap;
  uniform sampler2D uHeightMap;
  uniform sampler2D uAmbientMap;
  uniform sampler2D uSpecularMap;

  uniform vec3 uBaseColor;
  uniform vec3 uSpotColor;
  uniform vec3 uKeyDir;

  uniform vec2 uSpotPos;
  uniform vec2 uReliefCenter;

  uniform float uEntrance;
  uniform float uPlaneAspect;
  uniform float uReliefScale;
  uniform float uAmbient;
  uniform float uKeyStrength;
  uniform float uSpotHeight;
  uniform float uSpotRadius;
  uniform float uSpotStrength;
  uniform float uSpecStrength;
  uniform float uShininess;

  void main() {
    vec2 planePos = (vUv - uReliefCenter) * vec2(uPlaneAspect, 1.0);
    vec2 reliefUv = planePos / max(uReliefScale, 0.0001) + 0.5;

    if (reliefUv.x < 0.0 || reliefUv.x > 1.0 || reliefUv.y < 0.0 || reliefUv.y > 1.0) {
      gl_FragColor = vec4(0.0);
      return;
    }

    float height = texture2D(uHeightMap, reliefUv).r;
    float ambientShape = texture2D(uAmbientMap, reliefUv).r;
    float specShape = texture2D(uSpecularMap, reliefUv).r;
    float reliefShape = max(height, ambientShape);
    float reliefMask = smoothstep(0.025, 0.18, reliefShape);

    if (reliefMask < 0.002) {
      gl_FragColor = vec4(0.0);
      return;
    }

    vec3 normal = texture2D(uNormalMap, reliefUv).rgb * 2.0 - 1.0;
    normal.xy *= vec2(1.0, -1.0);
    normal = normalize(normal);

    vec3 viewDir = vec3(0.0, 0.0, 1.0);
    float ao = mix(0.58, 1.0, reliefShape);

    float keyDiff = max(dot(normal, uKeyDir), 0.0);
    float keyLight = clamp(uAmbient + keyDiff * uKeyStrength * ao, 0.0, 1.0);
    float keyShadow = (1.0 - keyDiff) * reliefMask * 0.16;
    vec3 resting = uBaseColor * (0.70 + keyLight * 0.46);
    resting = mix(resting, uBaseColor * 0.58, keyShadow);

    vec2 aspectFix = vec2(uPlaneAspect, 1.0);
    vec2 toSpot = (uSpotPos - vUv) * aspectFix;
    float distSq = dot(toSpot, toSpot);
    float radiusSq = uSpotRadius * uSpotRadius;

    vec3 color = resting;
    float spotMask = 0.0;

    if (distSq < radiusSq * 2.0 && uSpotStrength > 0.001) {
      float dist = sqrt(distSq);
      float edge = max(fwidth(dist), 0.002);
      spotMask = 1.0 - smoothstep(uSpotRadius - edge, uSpotRadius + edge, dist);
      spotMask *= uSpotStrength;

      vec3 lightDir = normalize(vec3(toSpot, uSpotHeight));
      vec3 halfDir = normalize(lightDir + viewDir);

      float diffuse = max(dot(normal, lightDir), 0.0);
      float specular = pow(max(dot(normal, halfDir), 0.0), uShininess) * uSpecStrength;
      specular *= mix(0.35, 1.0, smoothstep(0.02, 0.35, max(specShape, reliefShape)));

      vec3 lit = uBaseColor * (diffuse * ao * 0.64) * uSpotColor;
      lit += uSpotColor * specular;

      float spotShadow = (1.0 - diffuse) * spotMask * reliefMask * 0.16;
      color += lit * spotMask;
      color = mix(color, uBaseColor * 0.58, spotShadow);
    }

    float alpha = reliefMask * (0.18 + uAmbient * 0.28 + spotMask * 0.42) * uEntrance;
    gl_FragColor = vec4(color * uEntrance, alpha);
  }
`;

type ReliefLightLayerProps = {
  normalMapSrc: string;
  heightMapSrc: string;
  ambientMapSrc?: string;
  specularMapSrc?: string;
  revealRadius?: number;
  lightHeight?: number;
  specStrength?: number;
  shininess?: number;
  ambient?: number;
  lightColor?: string;
  baseColor?: string;
  reliefCenter?: [number, number];
  reliefScale?: number;
  fill?: boolean;
  className?: string;
};

const configureDataTexture = (texture: THREE.Texture) => {
  texture.colorSpace = THREE.NoColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
};

function idlePosition(time: number) {
  return {
    x: 0.5 + 0.22 * Math.cos(time * 0.35),
    y: 0.5 + 0.16 * Math.sin(time * 0.5 + 1.3),
  };
}

export default function ReliefLightLayer({
  normalMapSrc,
  heightMapSrc,
  ambientMapSrc,
  specularMapSrc,
  revealRadius = 0.34,
  lightHeight = 0.28,
  specStrength = 0.45,
  shininess = 28,
  ambient = 0.1,
  lightColor = '#ffffff',
  baseColor = '#f7f3ea',
  reliefCenter = [0.5, 0.52],
  reliefScale = 0.72,
  fill = true,
  className = '',
}: ReliefLightLayerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const reliefCenterX = reliefCenter[0];
  const reliefCenterY = reliefCenter[1];

  useEffect(() => {
    const mount = mountRef.current;
    const host = fill ? mount?.parentElement : mount;
    if (!mount || !host) return;

    const canUseWebGL = (() => {
      try {
        const canvas = document.createElement('canvas');
        return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
      } catch {
        return false;
      }
    })();

    if (!canUseWebGL) return;

    let disposed = false;
    let frameId = 0;
    let isVisible = false;
    let isHovering = false;
    let hasPointer = false;
    let idleHideTimer: number | undefined;
    let spotStrength = 0;
    let width = Math.max(mount.clientWidth, 1);
    let height = Math.max(mount.clientHeight, 1);

    const pointerTarget = new THREE.Vector2(0.5, 0.5);
    const smoothSpotPos = new THREE.Vector2(0.5, 0.5);
    const keyDirection = new THREE.Vector3(-0.4, 0.5, 0.75).normalize();
    const clock = new THREE.Clock();

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.PlaneGeometry(2, 2);

    const textureLoader = new THREE.TextureLoader();
    const normalMap = textureLoader.load(normalMapSrc, () => renderOnce());
    const heightMap = textureLoader.load(heightMapSrc, () => renderOnce());
    const ambientMap = textureLoader.load(ambientMapSrc ?? heightMapSrc, () => renderOnce());
    const specularMap = textureLoader.load(specularMapSrc ?? heightMapSrc, () => renderOnce());

    [normalMap, heightMap, ambientMap, specularMap].forEach(configureDataTexture);

    const uniforms = {
      uNormalMap: { value: normalMap },
      uHeightMap: { value: heightMap },
      uAmbientMap: { value: ambientMap },
      uSpecularMap: { value: specularMap },
      uBaseColor: { value: new THREE.Color(baseColor) },
      uSpotColor: { value: new THREE.Color(lightColor) },
      uKeyDir: { value: keyDirection },
      uSpotPos: { value: smoothSpotPos },
      uReliefCenter: { value: new THREE.Vector2(reliefCenterX, reliefCenterY) },
      uEntrance: { value: 0 },
      uPlaneAspect: { value: width / height },
      uReliefScale: { value: reliefScale },
      uAmbient: { value: ambient },
      uKeyStrength: { value: 0.35 },
      uSpotHeight: { value: lightHeight },
      uSpotRadius: { value: revealRadius },
      uSpotStrength: { value: 0 },
      uSpecStrength: { value: specStrength },
      uShininess: { value: shininess },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      depthWrite: false,
      extensions: {
        derivatives: true,
      },
    });

    scene.add(new THREE.Mesh(geometry, material));

    function renderOnce() {
      if (disposed || !isVisible) return;
      renderer.render(scene, camera);
    }

    function animate() {
      frameId = 0;
      if (disposed || !isVisible) return;

      const delta = Math.min(clock.getDelta(), 0.05);
      const time = clock.elapsedTime;
      const wantsHover = hasPointer && isHovering;
      const target = wantsHover ? pointerTarget : idlePosition(time);
      const positionEase = 1 - Math.pow(wantsHover ? 0.0008 : 0.02, delta);
      const strengthTarget = wantsHover ? 1 : 0.34;

      smoothSpotPos.lerp(target, positionEase);
      spotStrength += (strengthTarget - spotStrength) * (1 - Math.pow(0.004, delta));
      uniforms.uEntrance.value = Math.min(1, uniforms.uEntrance.value + delta * 1.6);
      uniforms.uSpotStrength.value = spotStrength;

      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    }

    const ensureLoop = () => {
      if (!frameId && isVisible) frameId = window.requestAnimationFrame(animate);
    };

    const updatePointer = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      hasPointer = true;
      isHovering = true;
      pointerTarget.set(
        THREE.MathUtils.clamp((event.clientX - rect.left) / rect.width, 0, 1),
        THREE.MathUtils.clamp(1 - (event.clientY - rect.top) / rect.height, 0, 1)
      );

      if (idleHideTimer) window.clearTimeout(idleHideTimer);
      idleHideTimer = window.setTimeout(() => {
        isHovering = false;
      }, 220);

      ensureLoop();
    };

    const handlePointerLeave = () => {
      isHovering = false;
      if (idleHideTimer) window.clearTimeout(idleHideTimer);
      ensureLoop();
    };

    const resizeObserver = new ResizeObserver(() => {
      width = Math.max(mount.clientWidth, 1);
      height = Math.max(mount.clientHeight, 1);
      renderer.setSize(width, height);
      uniforms.uPlaneAspect.value = width / height;
      renderOnce();
    });

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = Boolean(entry?.isIntersecting);
        if (isVisible) {
          renderOnce();
          ensureLoop();
        } else if (frameId) {
          window.cancelAnimationFrame(frameId);
          frameId = 0;
        }
      },
      { threshold: 0.02 }
    );

    host.addEventListener('pointerenter', updatePointer);
    host.addEventListener('pointermove', updatePointer);
    host.addEventListener('pointerdown', updatePointer);
    host.addEventListener('pointerleave', handlePointerLeave);
    resizeObserver.observe(mount);
    intersectionObserver.observe(host);

    return () => {
      disposed = true;
      if (frameId) window.cancelAnimationFrame(frameId);
      if (idleHideTimer) window.clearTimeout(idleHideTimer);
      host.removeEventListener('pointerenter', updatePointer);
      host.removeEventListener('pointermove', updatePointer);
      host.removeEventListener('pointerdown', updatePointer);
      host.removeEventListener('pointerleave', handlePointerLeave);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      geometry.dispose();
      material.dispose();
      normalMap.dispose();
      heightMap.dispose();
      ambientMap.dispose();
      specularMap.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [
    ambient,
    ambientMapSrc,
    baseColor,
    fill,
    heightMapSrc,
    lightColor,
    lightHeight,
    normalMapSrc,
    reliefCenterX,
    reliefCenterY,
    reliefScale,
    revealRadius,
    shininess,
    specularMapSrc,
    specStrength,
  ]);

  return (
    <div
      ref={mountRef}
      className={`${
        fill ? 'pointer-events-none absolute inset-0 z-[1]' : 'relative block'
      } overflow-hidden ${className}`}
      aria-hidden="true"
    />
  );
}
