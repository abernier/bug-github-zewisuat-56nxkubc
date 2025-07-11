import { advance, invalidate, useThree, flushSync } from '@react-three/fiber'
import JSZip from 'jszip'
import { useCallback, useRef } from 'react'

export function useRecorder(fps = 120, setTime: (time: number) => void) {
  const state = useThree()
  const dt = 1000 / fps
  const clock = useRef(0) // ms

  const record = useCallback(
    (duration: number) => {
      return new Promise<VideoFrame[]>(async (resolve, reject) => {
        {
          const totalFrames = Math.round(duration * fps)
          const videoFrames: VideoFrame[] = []

          clock.current = 0
          while (videoFrames.length < totalFrames) {
            const t = clock.current / 1000 // seconds

            //
            //
            //

            flushSync(() => setTime(t))
            invalidate()
            // await new Promise(requestAnimationFrame);

            advance(clock.current)
            state.gl.getContext().finish()

            const videoFrame = new VideoFrame(state.gl.domElement, {
              timestamp: clock.current * 1e3 // µs
            })
            videoFrames.push(videoFrame)

            //
            clock.current += dt // tick clock
          }

          resolve(videoFrames)
        }
      })
    },
    [fps, setTime, state, dt]
  )

  return { record }
}

export async function zip(frames: VideoFrame[], fmt = 'png') {
  const zip = new JSZip()

  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i]

    const canvas = new OffscreenCanvas(frame.displayWidth, frame.displayHeight)
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(frame, 0, 0)

    // b. Transformer le canvas en Blob (image)
    console.log(`Converting frame ${i} to image Blob...`)
    // Note: `convertToBlob`
    const blob = await canvas.convertToBlob({ type: `image/${fmt}` })
    console.log(`Frame ${i} converted to Blob.`)

    // c. Ajouter le fichier dans l’archive
    const name = `frame_${String(i).padStart(4, '0')}.${fmt}`
    zip.file(name, blob)

    // d. Libérer la mémoire occupée par la VideoFrame
    frame.close()
  }

  // 3. Générer l’archive ZIP (asynchrone)
  return zip.generateAsync({ type: 'blob' })
}
