const SPRITE_W      = 32
const SPRITE_H      = 32
const CURSOR_SCALE  = 2
const FRAME_DELAY   = 150
const WALK_FRAMES   = 4
const DIR_DOWN      = 0
const DIR_RIGHT     = 3
const DIR_UP        = 6
const DIR_LEFT      = 9

const SLEEP_FRAME_W = 40
const SLEEP_FRAME_H = 24
const SLEEP_FRAMES  = 2
const SLEEP_DELAY   = 500
const IDLE_TIMEOUT  = 100
const SLEEP_TIMEOUT = 5000

const walkImg  = new Image()
walkImg.src    = 'snorlax-walk.png'
const sleepImg = new Image()
sleepImg.src   = 'snorlax-sleep.png'

let cursorX = -999, cursorY = -999
let cursorFrame   = 0
let lastFrameTime = 0
let walkRow       = DIR_DOWN
let lastMoveTime  = 0
let sleepFrame    = 0
let lastSleepTime = 0
let state         = 'idle' // 'walk' | 'idle' | 'sleep'

export function initCursor(canvas) {
  canvas.addEventListener('mousemove', e => {
    if (cursorX > -999) {
      const dx = e.clientX - cursorX
      const dy = e.clientY - cursorY
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
        if (Math.abs(dx) >= Math.abs(dy)) {
          walkRow = dx > 0 ? DIR_RIGHT : DIR_LEFT
        } else {
          walkRow = dy > 0 ? DIR_DOWN : DIR_UP
        }
        lastMoveTime = performance.now()
      }
    }
    cursorX = e.clientX
    cursorY = e.clientY
  })

  canvas.addEventListener('mouseleave', () => {
    cursorX = -999
    cursorY = -999
  })
}

export function getCursorObstacle() {
  if (cursorX <= -999) return null
  if (state === 'sleep') {
    const fw = SLEEP_FRAME_W * CURSOR_SCALE
    const fh = SLEEP_FRAME_H * CURSOR_SCALE
    return { left: cursorX - fw / 2, right: cursorX + fw / 2, top: cursorY - fh, bot: cursorY }
  }
  const fw = SPRITE_W * CURSOR_SCALE
  const fh = SPRITE_H * CURSOR_SCALE
  return { left: cursorX - fw / 2, right: cursorX + fw / 2, top: cursorY - fh, bot: cursorY }
}

export function drawCursor(ctx) {
  if (cursorX <= -999) return

  const now     = performance.now()
  const elapsed = now - lastMoveTime

  if      (elapsed < IDLE_TIMEOUT)  state = 'walk'
  else if (elapsed < SLEEP_TIMEOUT) state = 'idle'
  else                              state = 'sleep'

  ctx.imageSmoothingEnabled = false

  if (state === 'sleep') {
    if (now - lastSleepTime > SLEEP_DELAY) {
      sleepFrame    = (sleepFrame + 1) % SLEEP_FRAMES
      lastSleepTime = now
    }
    if (sleepImg.complete && sleepImg.naturalWidth > 0) {
      const fw = SLEEP_FRAME_W * CURSOR_SCALE
      const fh = SLEEP_FRAME_H * CURSOR_SCALE
      ctx.drawImage(
        sleepImg,
        sleepFrame * SLEEP_FRAME_W, 0, SLEEP_FRAME_W, SLEEP_FRAME_H,
        cursorX - fw / 2, cursorY - fh, fw, fh
      )
    }
  } else {
    sleepFrame = 0
    if (state === 'walk' && now - lastFrameTime > FRAME_DELAY) {
      cursorFrame   = (cursorFrame + 1) % WALK_FRAMES
      lastFrameTime = now
    }
    if (walkImg.complete && walkImg.naturalWidth > 0) {
      const fw    = SPRITE_W * CURSOR_SCALE
      const fh    = SPRITE_H * CURSOR_SCALE
      const frame = state === 'idle' ? 0 : cursorFrame
      ctx.drawImage(
        walkImg,
        frame * SPRITE_W, walkRow * SPRITE_H, SPRITE_W, SPRITE_H,
        cursorX - fw / 2, cursorY - fh, fw, fh
      )
    }
  }
}
