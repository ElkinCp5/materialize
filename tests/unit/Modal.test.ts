import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { Modal } from '../../src/components/Modal'

describe('Modal Component', () => {
  let element: HTMLElement

  beforeEach(() => {
    element = document.createElement('div')
    element.id = 'modal-test'
    element.className = 'modal'
    document.body.appendChild(element)
  })

  afterEach(() => {
    element.remove()
    document.querySelectorAll('.modal-overlay').forEach(el => el.remove())
  })

  it('should initialize successfully', () => {
    const modal = new Modal(element)
    expect(modal).toBeDefined()
  })

  it('should open and close the modal', async () => {
    const modal = new Modal(element, { inDuration: 0, outDuration: 0 })
    
    await modal.open()
    expect(element.style.display).toBe('block')
    expect(document.querySelector('.modal-overlay')).toBeTruthy()

    await modal.close()
    expect(element.style.display).toBe('none')
    expect(document.querySelector('.modal-overlay')).toBeNull()
  })
})
