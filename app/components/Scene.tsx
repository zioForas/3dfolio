'use client'

import { useRef, useMemo, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import Navigation3D from './Navigation3D'

const TRAIL_LENGTH = 600
const COLORS = ['#ff00ff', '#00ffff', '#ffff00', '#ff00aa', '#00ff00']

const generateShape = () => {
  const shapes = [
    (t: number) => new THREE.Vector3(Math.cos(t) * 1.0, Math.sin(t) * 1.0, 0),
    (t: number) => new THREE.Vector3(Math.cos(t) * t * 0.02, Math.sin(t) * t * 0.02, 0),
    (t: number) => new THREE.Vector3(Math.cos(2 * t) * Math.cos(t) * 1.0, Math.cos(2 * t) * Math.sin(t) * 1.0, 0),
    (t: number) => new THREE.Vector3(Math.sin(3 * t) * Math.cos(t) * 0.8, Math.sin(3 * t) * Math.sin(t) * 0.8, 0),
    (t: number) => new THREE.Vector3(Math.sin(5 * t) * Math.cos(t) * 0.6, Math.sin(5 * t) * Math.sin(t) * 0.6, 0),
    (t: number) => new THREE.Vector3(Math.pow(Math.cos(t), 3) * 0.4, Math.pow(Math.sin(t), 3) * 0.4, 0),
    (t: number) => new THREE.Vector3(Math.cos(7 * t) * Math.cos(t) * 0.3, Math.cos(7 * t) * Math.sin(t) * 0.3, 0),
    (t: number) => new THREE.Vector3(Math.sin(t) * (Math.exp(Math.cos(t)) - 2 * Math.cos(4 * t) - Math.pow(Math.sin(t / 12), 5)) * 0.1, 
                                     Math.cos(t) * (Math.exp(Math.cos(t)) - 2 * Math.cos(4 * t) - Math.pow(Math.sin(t / 12), 5)) * 0.1, 0),
    (t: number) => new THREE.Vector3(Math.cos(t) * (1 + Math.cos(3 * t) / 3) * 0.3, Math.sin(t) * (1 + Math.cos(3 * t) / 3) * 0.3, 0),
    (t: number) => new THREE.Vector3(Math.sin(3 * t) * Math.cos(2 * t) * 0.4, Math.sin(3 * t) * Math.sin(2 * t) * 0.4, 0),
  ]
  return shapes[Math.floor(Math.random() * shapes.length)]
}

const FloatingPoints = () => {
  const { viewport } = useThree()
  const pointsRef = useRef<THREE.Group>(null)
  const trailsRef = useRef<THREE.Group>(null)
  const startTime = useRef(Date.now())
  const [isMoving, setIsMoving] = useState(false)
  const lastMousePos = useRef(new THREE.Vector2())

  const points = useMemo(() => {
    const temp = []
    const shapeCount = 10
    for (let i = 0; i < shapeCount; i++) {
      const shape = generateShape()
      const centerX = (Math.random() - 0.5) * viewport.width * 0.4
      const centerY = (Math.random() - 0.5) * viewport.height * 0.4
      const centerZ = Math.random() * 2 - 1
      const color = COLORS[Math.floor(Math.random() * COLORS.length)]

      for (let j = 0; j < 1; j++) {
        const offset = Math.random() * Math.PI * 2
        const x = centerX + (Math.random() - 0.5) * 0.2
        const y = centerY + (Math.random() - 0.5) * 0.2
        const z = centerZ + (Math.random() - 0.5) * 0.05
        temp.push({ position: new THREE.Vector3(x, y, z), shape, trail: [], offset, color })
      }
    }
    return temp
  }, [viewport])

  useFrame(({ clock, mouse }) => {
    if (pointsRef.current && trailsRef.current) {
      const elapsedTime = (Date.now() - startTime.current) / 1000

      if (Math.abs(mouse.x - lastMousePos.current.x) > 0.001 || Math.abs(mouse.y - lastMousePos.current.y) > 0.001) {
        setIsMoving(true)
        lastMousePos.current.set(mouse.x, mouse.y)
      } else {
        setIsMoving(false)
      }

      points.forEach((point, i) => {
        const t = (clock.elapsedTime * 1 + point.offset) % (Math.PI * 2)
        const newPos = point.shape(t)
        const childPoint = pointsRef.current!.children[i]
        const childTrail = trailsRef.current!.children[i]

        let targetX = point.position.x + newPos.x
        let targetY = point.position.y + newPos.y

        if (isMoving) {
          const mouseForce = new THREE.Vector3(
            mouse.x * viewport.width / 2 - childPoint.position.x,
            mouse.y * viewport.height / 2 - childPoint.position.y,
            0
          ).multiplyScalar(0.1)
          targetX += mouseForce.x
          targetY += mouseForce.y
        }

        childPoint.position.x += (targetX - childPoint.position.x) * 0.1
        childPoint.position.y += (targetY - childPoint.position.y) * 0.1
        childPoint.position.z = point.position.z

        if (elapsedTime > 0.05) {
          point.trail.push(childPoint.position.clone())
          if (point.trail.length > TRAIL_LENGTH) {
            point.trail.shift()
          }

          const positions = point.trail.flatMap(p => [p.x, p.y, p.z])
          const alphas = point.trail.map((_, index) => index / TRAIL_LENGTH)

          ;(childTrail as THREE.Line).geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
          ;(childTrail as THREE.Line).geometry.setAttribute('alpha', new THREE.Float32BufferAttribute(alphas, 1))
          ;(childTrail.material as THREE.LineBasicMaterial).color.set(point.color)
        }
      })
    }
  })

  return (
    <>
      <group ref={pointsRef}>
        {points.map((point, i) => (
          <mesh key={i} position={point.position}>
            <sphereGeometry args={[0.01, 8, 8]} />
            <meshBasicMaterial color={point.color} />
          </mesh>
        ))}
      </group>
      <group ref={trailsRef}>
        {points.map((point, i) => (
          <line key={i}>
            <bufferGeometry>
              <bufferAttribute
                attach="position"
                count={TRAIL_LENGTH}
                array={new Float32Array(TRAIL_LENGTH * 3)}
                itemSize={3}
              />
              <bufferAttribute
                attach="alpha"
                count={TRAIL_LENGTH}
                array={new Float32Array(TRAIL_LENGTH)}
                itemSize={1}
              />
            </bufferGeometry>
            <lineBasicMaterial color={point.color} transparent opacity={0.7} />
          </line>
        ))}
      </group>
    </>
  )
}

const Scene = () => {
  return (
    <Canvas 
      camera={{ position: [0, 0, 5], fov: 75 }} 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        overflow: 'hidden',
        zIndex: -1,
        touchAction: 'none'
      }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <FloatingPoints />
      <Navigation3D />
    </Canvas>
  )
}

export default Scene
