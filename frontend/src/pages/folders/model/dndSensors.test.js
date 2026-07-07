import { describe, expect, it } from 'vitest'
import {
  FOLDER_MOUSE_SENSOR_OPTIONS,
  FOLDER_TOUCH_SENSOR_OPTIONS,
} from './dndSensors'

describe('folder drag sensors', () => {
  it('uses distance activation for mouse dragging', () => {
    expect(FOLDER_MOUSE_SENSOR_OPTIONS).toEqual({
      activationConstraint: {
        distance: 8,
      },
    })
  })

  it('uses a press delay with movement tolerance for touch dragging', () => {
    expect(FOLDER_TOUCH_SENSOR_OPTIONS).toEqual({
      activationConstraint: {
        delay: 180,
        tolerance: 8,
      },
    })
  })
})
