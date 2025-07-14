import { ComponentProps, ComponentRef, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { useRecorder, zip } from './useRecorder'
import { Mesh } from 'three'
import { Html } from './Html'

const fps = 60

export default function App() {
  const [time, setTime] = useState(0) // r3f "external" state

  return (
    <>
      <Canvas>
        <Scene time={time} setTime={setTime} />
      </Canvas>

      <div style={{ position: 'fixed', top: 0, right: 0, padding: '.5rem' }}>
        <label style={{ display: 'flex', alignItems: 'center' }}>
          time:
          <input
            type="range"
            min="0"
            max="3"
            step={1 / fps}
            value={time}
            onChange={(e) => {
              setTime(Number(e.target.value))
            }}
          />
        </label>
      </div>
    </>
  )
}

function Scene({ time, setTime }: { time: number; setTime: (time: number) => void }) {
  const { record } = useRecorder(fps, setTime)

  const handleClick = async () => {
    const videoFrames = await record(2)
    console.log('videoFrames', videoFrames)

    // zip)
    const zipBlob = await zip(videoFrames, 'png')
    const zipUrl = URL.createObjectURL(zipBlob)
    const a = Object.assign(document.createElement('a'), {
      href: zipUrl,
      download: 'frames.zip'
    }).click()
  }

  return (
    <>
      <ambientLight intensity={Math.PI / 2} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
      <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
      <Box time={time} />

      <Html style={{ position: 'fixed', bottom: 0, left: 0, right: 0, textAlign: 'center' }}>
        <p onClick={handleClick}>
          <button>🔴 Export</button> the scene
          <br />{' '}
          <small>
            (will <code>flushSync</code> <code>time</code> state)
          </small>
        </p>
      </Html>
    </>
  )
}

function Box({ time, ...props }: { time: number } & ComponentProps<'mesh'>) {
  const ref = useRef<Mesh>(null!)

  useEffect(() => {
    console.log('useEffect', time)

    ref.current.rotation.x = time
  }, [time])

  return (
    <mesh
      ref={ref}
      {...props}
      // rotation-x={time}
      rotation-y={time}
      //
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  )
}
