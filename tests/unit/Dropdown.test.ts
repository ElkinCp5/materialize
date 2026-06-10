import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { Dropdown } from '../../src/components/Dropdown'

describe('Dropdown Component', () => {
  let trigger: HTMLElement
  let dropdownEl: HTMLElement

  beforeEach(() => {
    // Create trigger
    trigger = document.createElement('a')
    trigger.className = 'dropdown-trigger'
    trigger.setAttribute('data-target', 'dropdown1')
    trigger.textContent = 'Dropdown Trigger'
    document.body.appendChild(trigger)

    // Create dropdown content
    dropdownEl = document.createElement('ul')
    dropdownEl.id = 'dropdown1'
    dropdownEl.className = 'dropdown-content'
    dropdownEl.style.display = 'none'

    const item1 = document.createElement('li')
    item1.innerHTML = '<a href="#!">one</a>'
    const item2 = document.createElement('li')
    item2.innerHTML = '<a href="#!">two</a>'

    dropdownEl.appendChild(item1)
    dropdownEl.appendChild(item2)
    document.body.appendChild(dropdownEl)
  })

  afterEach(() => {
    trigger.remove()
    dropdownEl.remove()
  })

  it('should initialize successfully', () => {
    const dropdown = new Dropdown(trigger)
    expect(dropdown).toBeDefined()
    expect(dropdownEl.tabIndex).toBe(0)
    expect(dropdownEl.children[0]?.getAttribute('tabindex')).toBe('0')
  })

  it('should open and close the dropdown', async () => {
    const dropdown = new Dropdown(trigger, { inDuration: 0, outDuration: 0 })
    
    dropdown.open()
    expect(dropdownEl.style.display).toBe('block')

    dropdown.close()
    // Delay to let timeout execute (outDuration is 0, but execute inside setTimeout)
    await new Promise((resolve) => setTimeout(resolve, 10))
    expect(dropdownEl.style.display).toBe('none')
  })

  it('should close on item click if closeOnClick is true', async () => {
    const dropdown = new Dropdown(trigger, { closeOnClick: true, inDuration: 0, outDuration: 0 })
    dropdown.open()

    const item = dropdownEl.querySelector('li')
    expect(item).toBeTruthy()
    
    item?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    
    await new Promise((resolve) => setTimeout(resolve, 10))
    expect(dropdownEl.style.display).toBe('none')
  })
})
