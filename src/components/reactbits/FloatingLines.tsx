'use client'

import { useEffect, useRef } from 'react'
import {
  Scene,
  OrthographicCamera,
  WebGLRenderer,
  PlaneGeometry,
  Mesh,
  ShaderMaterial,
  Vector3,
  Vector2,
  Clock,
} from 'three'

interface FloatingLinesProps {
  linesGradient?: string[]
  enabledWaves?: ('top' | 'middle' | 'bottom')[]
  lineCount?: number | number[]
  lineDistance?: number | number[]
  topWavePosition?: { x: number; y: number; rotate: number }
  middleWavePosition?: { x: number; y: number; rotate: number }
  bottomWavePosition?: { x: number; y: number; rotate: number }
  animationSpeed?: number
  interactive?: boolean
  bendRadius?: number
  bendStrength?: number
  mouseDamping?: number
  parallax?: boolean
  parallaxStrength?: number
  mixBlendMode?: string
}

function hexToVec3(hex: string): Vector3 {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.substring(0, 2), 16) / 255
  const g = parseInt(clean.substring(2, 4), 16) / 255
  const b = parseInt(clean.substring(4, 6), 16) / 255
  return new Vector3(r, g, b)
}

const vertexShader = `
precision highp float;
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const fragmentShader = `
precision highp float;

uniform float iTime;
uniform vec3 iResolution;
uniform float animationSpeed;

uniform bool enableTop;
uniform bool enableMiddle;
uniform bool enableBottom;

uniform int topLineCount;
uniform int middleLineCount;
uniform int bottomLineCount;

uniform float topLineDistance;
uniform float middleLineDistance;
uniform float bottomLineDistance;

uniform vec3 topWavePosition;
uniform vec3 middleWavePosition;
uniform vec3 bottomWavePosition;

uniform vec2 iMouse;
uniform bool interactive;
uniform float bendRadius;
uniform float bendStrength;
uniform float bendInfluence;

uniform bool parallax;
uniform float parallaxStrength;
uniform vec2 parallaxOffset;

uniform vec3 lineGradient[8];
uniform int lineGradientCount;

const vec3 BLACK = vec3(0.0);
const vec3 PINK = vec3(233.0, 71.0, 245.0) / 255.0;
const vec3 BLUE = vec3(47.0, 75.0, 162.0) / 255.0;

mat2 rotate(float r) {
  return mat2(cos(r), sin(r), -sin(r), cos(r));
}

vec3 background_color(vec2 uv) {
  vec3 col = vec3(0.0);
  float y = sin(uv.x - 0.2) * 0.3 - 0.1;
  float m = uv.y - y;
  col += mix(BLUE, BLACK, smoothstep(0.0, 1.0, abs(m)));
  col += mix(PINK, BLACK, smoothstep(0.0, 1.0, abs(m - 0.8)));
  return col * 0.5;
}

vec3 getLineColor(float t, vec3 baseColor) {
  if (lineGradientCount <= 0) {
    return baseColor;
  }
  vec3 gradientColor;
  if (lineGradientCount == 1) {
    gradientColor = lineGradient[0];
  } else {
    float clampedT = clamp(t, 0.0, 0.9999);
    float scaled = clampedT * float(lineGradientCount - 1);
    int idx = int(floor(scaled));
    float f = fract(scaled);
    int idx2 = min(idx + 1, lineGradientCount - 1);
    vec3 c1 = lineGradient[idx];
    vec3 c2 = lineGradient[idx2];
    gradientColor = mix(c1, c2, f);
  }
  return gradientColor * 0.5;
}

float wave(vec2 uv, float offset, vec2 screenUv, vec2 mouseUv, bool shouldBend) {
  float time = iTime * animationSpeed;
  float x_offset = offset;
  float x_movement = time * 0.1;
  float amp = sin(offset + time * 0.2) * 0.3;
  float y = sin(uv.x + x_offset + x_movement) * amp;

  if (shouldBend) {
    vec2 d = screenUv - mouseUv;
    float influence = exp(-dot(d, d) * bendRadius);
    float bendOffset = (mouseUv.y - screenUv.y) * influence * bendStrength * bendInfluence;
    y += bendOffset;
  }

  float m = uv.y - y;
  return 0.0175 / max(abs(m) + 0.01, 1e-3) + 0.01;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 baseUv = (2.0 * fragCoord - iResolution.xy) / iResolution.y;
  baseUv.y *= -1.0;

  if (parallax) {
    baseUv += parallaxOffset;
  }

  vec3 col = vec3(0.0);
  vec3 b = lineGradientCount > 0 ? vec3(0.0) : background_color(baseUv);

  vec2 mouseUv = vec2(0.0);
  if (interactive) {
    mouseUv = (2.0 * iMouse - iResolution.xy) / iResolution.y;
    mouseUv.y *= -1.0;
  }

  if (enableBottom) {
    for (int i = 0; i < bottomLineCount; ++i) {
      float fi = float(i);
      float t = fi / max(float(bottomLineCount - 1), 1.0);
      vec3 lineCol = getLineColor(t, b);
      float angle = bottomWavePosition.z * log(length(baseUv) + 1.0);
      vec2 ruv = baseUv * rotate(angle);
      col += lineCol * wave(
        ruv + vec2(bottomLineDistance * fi + bottomWavePosition.x, bottomWavePosition.y),
        1.5 + 0.2 * fi, baseUv, mouseUv, interactive
      ) * 0.2;
    }
  }

  if (enableMiddle) {
    for (int i = 0; i < middleLineCount; ++i) {
      float fi = float(i);
      float t = fi / max(float(middleLineCount - 1), 1.0);
      vec3 lineCol = getLineColor(t, b);
      float angle = middleWavePosition.z * log(length(baseUv) + 1.0);
      vec2 ruv = baseUv * rotate(angle);
      col += lineCol * wave(
        ruv + vec2(middleLineDistance * fi + middleWavePosition.x, middleWavePosition.y),
        2.0 + 0.15 * fi, baseUv, mouseUv, interactive
      );
    }
  }

  if (enableTop) {
    for (int i = 0; i < topLineCount; ++i) {
      float fi = float(i);
      float t = fi / max(float(topLineCount - 1), 1.0);
      vec3 lineCol = getLineColor(t, b);
      float angle = topWavePosition.z * log(length(baseUv) + 1.0);
      vec2 ruv = baseUv * rotate(angle);
      ruv.x *= -1.0;
      col += lineCol * wave(
        ruv + vec2(topLineDistance * fi + topWavePosition.x, topWavePosition.y),
        1.0 + 0.2 * fi, baseUv, mouseUv, interactive
      ) * 0.1;
    }
  }

  fragColor = vec4(col, 1.0);
}

void main() {
  vec4 color = vec4(0.0);
  mainImage(color, gl_FragCoord.xy);
  gl_FragColor = color;
}
`

export default function FloatingLines({
  linesGradient,
  enabledWaves = ['top', 'middle', 'bottom'],
  lineCount = [6],
  lineDistance = [5],
  topWavePosition,
  middleWavePosition,
  bottomWavePosition = { x: 2.0, y: -0.7, rotate: -1 },
  animationSpeed = 1,
  interactive = true,
  bendRadius = 5.0,
  bendStrength = -0.5,
  mouseDamping = 0.05,
  parallax = true,
  parallaxStrength = 0.2,
  mixBlendMode = 'screen',
}: FloatingLinesProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const clock = new Clock()
    const scene = new Scene()
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1)

    const renderer = new WebGLRenderer({ antialias: false, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(container.clientWidth, container.clientHeight)
    container.appendChild(renderer.domElement)

    const lineCounts = Array.isArray(lineCount) ? lineCount : [lineCount]
    const lineDistances = Array.isArray(lineDistance) ? lineDistance : [lineDistance]

    const topCount = lineCounts[0] ?? 6
    const middleCount = lineCounts[1] ?? lineCounts[0] ?? 6
    const bottomCount = lineCounts[2] ?? lineCounts[0] ?? 6

    const topDist = lineDistances[0] ?? 5
    const middleDist = lineDistances[1] ?? lineDistances[0] ?? 5
    const bottomDist = lineDistances[2] ?? lineDistances[0] ?? 5

    const topPos = topWavePosition ?? { x: 0, y: 0, rotate: 0 }
    const midPos = middleWavePosition ?? { x: 0, y: 0, rotate: 0 }
    const botPos = bottomWavePosition

    const gradientVecs: Vector3[] = []
    if (linesGradient) {
      for (let i = 0; i < Math.min(linesGradient.length, 8); i++) {
        gradientVecs.push(hexToVec3(linesGradient[i]))
      }
    }
    // Pad to 8
    while (gradientVecs.length < 8) {
      gradientVecs.push(new Vector3(0, 0, 0))
    }

    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: new Vector3(container.clientWidth, container.clientHeight, 1) },
      animationSpeed: { value: animationSpeed },
      enableTop: { value: enabledWaves.includes('top') },
      enableMiddle: { value: enabledWaves.includes('middle') },
      enableBottom: { value: enabledWaves.includes('bottom') },
      topLineCount: { value: topCount },
      middleLineCount: { value: middleCount },
      bottomLineCount: { value: bottomCount },
      topLineDistance: { value: topDist },
      middleLineDistance: { value: middleDist },
      bottomLineDistance: { value: bottomDist },
      topWavePosition: { value: new Vector3(topPos.x, topPos.y, topPos.rotate) },
      middleWavePosition: { value: new Vector3(midPos.x, midPos.y, midPos.rotate) },
      bottomWavePosition: { value: new Vector3(botPos.x, botPos.y, botPos.rotate) },
      iMouse: { value: new Vector2(0, 0) },
      interactive: { value: interactive },
      bendRadius: { value: bendRadius },
      bendStrength: { value: bendStrength },
      bendInfluence: { value: 0 },
      parallax: { value: parallax },
      parallaxStrength: { value: parallaxStrength },
      parallaxOffset: { value: new Vector2(0, 0) },
      lineGradient: { value: gradientVecs },
      lineGradientCount: { value: linesGradient ? Math.min(linesGradient.length, 8) : 0 },
    }

    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
    })

    const geometry = new PlaneGeometry(2, 2)
    const mesh = new Mesh(geometry, material)
    scene.add(mesh)

    // Mouse tracking with lerp
    const targetMouse = new Vector2(0, 0)
    const currentMouse = new Vector2(0, 0)
    let targetBendInfluence = 0

    const handlePointerMove = (e: PointerEvent) => {
      if (!interactive) return
      const rect = container.getBoundingClientRect()
      targetMouse.set(
        e.clientX - rect.left,
        e.clientY - rect.top
      )
      targetBendInfluence = 1
    }

    const handlePointerLeave = () => {
      targetBendInfluence = 0
    }

    container.addEventListener('pointermove', handlePointerMove)
    container.addEventListener('pointerleave', handlePointerLeave)

    // Render loop
    let animationId: number

    const renderLoop = () => {
      animationId = requestAnimationFrame(renderLoop)

      uniforms.iTime.value = clock.getElapsedTime()

      // Lerp mouse position
      currentMouse.x += (targetMouse.x - currentMouse.x) * mouseDamping
      currentMouse.y += (targetMouse.y - currentMouse.y) * mouseDamping
      uniforms.iMouse.value.set(currentMouse.x, currentMouse.y)

      // Lerp bend influence
      uniforms.bendInfluence.value +=
        (targetBendInfluence - uniforms.bendInfluence.value) * mouseDamping

      // Parallax based on mouse
      if (parallax) {
        const w = container.clientWidth
        const h = container.clientHeight
        const px = ((currentMouse.x / w) * 2 - 1) * parallaxStrength
        const py = ((currentMouse.y / h) * 2 - 1) * parallaxStrength
        uniforms.parallaxOffset.value.set(px, py)
      }

      renderer.render(scene, camera)
    }

    renderLoop()

    // Resize observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        renderer.setSize(width, height)
        uniforms.iResolution.value.set(width, height, 1)
      }
    })

    resizeObserver.observe(container)

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId)
      resizeObserver.disconnect()
      container.removeEventListener('pointermove', handlePointerMove)
      container.removeEventListener('pointerleave', handlePointerLeave)
      renderer.dispose()
      geometry.dispose()
      material.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        mixBlendMode: mixBlendMode as React.CSSProperties['mixBlendMode'],
      }}
    />
  )
}
