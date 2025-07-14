import { ComponentProps, ComponentRef, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { useRecorder, zip } from './useRecorder'
import { Mesh } from 'three'

const fps = 60

export default function App() {
  const [time, setTime] = useState(0)

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

      <p style={{ position: 'fixed', bottom: 0, left: 0, right: 0, textAlign: 'center' }}>Double-click cube to export scene</p>
    </>
  )
}

function Scene({ time, setTime }: { time: number; setTime: (time: number) => void }) {
  const [time2, setTime2] = useState(0)
  const { record } = useRecorder(fps, setTime2)

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
      <Box time={time2} onDoubleClick={handleClick} />
    </>
  )
}

function Box({ time, ...props }: { time: number } & ComponentProps<'mesh'>) {
  const ref = useRef<Mesh>(null)

  useEffect(() => {
    console.log('useEffect', time)
    
    if (ref.current) {
      ref.current.rotation.x = time
    }
  }, [time])

  return (
    <mesh
      ref={ref}
      {...props}
      // rotation-x={time}
      //
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  )
}
