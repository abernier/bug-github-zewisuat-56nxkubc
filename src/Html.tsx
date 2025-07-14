import * as ReactDOM from 'react-dom/client'
import { ComponentProps, useLayoutEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'

export function Html({ portal, ...props }: { portal?: React.RefObject<HTMLElement> } & ComponentProps<'div'>) {
  const { gl, events } = useThree()

  const elRef = useRef(document.createElement('div'))
  const rootRef = useRef<ReactDOM.Root>(null!)
  const target = (portal?.current || events.connected || gl.domElement.parentNode) as HTMLElement

  useLayoutEffect(() => {
    const el = elRef.current

    const root = (rootRef.current = ReactDOM.createRoot(el))
    target.appendChild(el)
    return () => {
      target.removeChild(el)
      root.unmount()
    }
  }, [target])

  useLayoutEffect(() => {
    rootRef.current.render(<div {...props} />)
  }, [props])

  return null
}
