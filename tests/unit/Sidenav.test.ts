import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { Sidenav } from '../../src/components/Sidenav'

describe('Sidenav Component', () => {
  let element: HTMLElement

  beforeEach(() => {
    element = document.createElement('div')
    element.id = 'slide-out'
    element.className = 'sidenav'
    document.body.appendChild(element)
  })

  afterEach(() => {
    element.remove()
    document.querySelectorAll('.sidenav-overlay').forEach(el => el.remove())
    document.querySelectorAll('.drag-target').forEach(el => el.remove())
  })

  it('should initialize successfully', () => {
    const sidenav = new Sidenav(element)
    expect(sidenav).toBeDefined()
    expect(document.querySelector('.sidenav-overlay')).toBeTruthy()
  })

  it('should open and close the sidenav', async () => {
    const sidenav = new Sidenav(element, { inDuration: 0, outDuration: 0 })
    
    sidenav.open()
    // Sidenav overlay should be visible
    const overlay = document.querySelector('.sidenav-overlay') as HTMLElement
    expect(overlay.style.display).toBe('block')

    sidenav.close()
    // Delay to let timeout execute (set inDuration/outDuration to 0, so it executes almost immediately, but vitest runs asynchronously)
    await new Promise((resolve) => setTimeout(resolve, 10))
    expect(overlay.style.display).toBe('none')
  })

  it('should support right-aligned edge', () => {
    const sidenav = new Sidenav(element, { edge: 'right' })
    expect(element.classList.contains('right-aligned')).toBe(true)
  })
})
