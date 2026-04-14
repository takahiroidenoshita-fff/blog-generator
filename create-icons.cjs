/**
 * PWA用アイコンを生成するスクリプト（純粋なNode.js）
 * 使い方: node create-icons.cjs
 */
const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

function crc32(buf) {
  const table = []
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
    table[n] = c
  }
  let crc = 0xffffffff
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff]
  }
  return ((crc ^ 0xffffffff) >>> 0)
}

function createChunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const typeBuffer = Buffer.from(type, 'ascii')
  const combined = Buffer.concat([typeBuffer, data])
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(combined), 0)
  return Buffer.concat([len, typeBuffer, data, crcBuf])
}

function createPNG(size, r, g, b) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  const ihdrData = Buffer.alloc(13)
  ihdrData.writeUInt32BE(size, 0)
  ihdrData.writeUInt32BE(size, 4)
  ihdrData[8] = 8  // bit depth
  ihdrData[9] = 2  // color type RGB
  const ihdr = createChunk('IHDR', ihdrData)

  // 各ピクセル行: [filter=0, R, G, B, ...]
  const rowSize = 1 + size * 3
  const raw = Buffer.alloc(size * rowSize)
  for (let y = 0; y < size; y++) {
    const offset = y * rowSize
    raw[offset] = 0  // filter None
    for (let x = 0; x < size; x++) {
      raw[offset + 1 + x * 3] = r
      raw[offset + 1 + x * 3 + 1] = g
      raw[offset + 1 + x * 3 + 2] = b
    }
  }

  const compressed = zlib.deflateSync(raw, { level: 6 })
  const idat = createChunk('IDAT', compressed)
  const iend = createChunk('IEND', Buffer.alloc(0))

  return Buffer.concat([signature, ihdr, idat, iend])
}

const publicDir = path.join(__dirname, 'public')
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true })
}

// インディゴ (#6366f1 = rgb(99, 102, 241))
const [r, g, b] = [99, 102, 241]

fs.writeFileSync(path.join(publicDir, 'icon-192.png'), createPNG(192, r, g, b))
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), createPNG(512, r, g, b))

console.log('✓ public/icon-192.png を作成しました')
console.log('✓ public/icon-512.png を作成しました')
console.log('必要に応じてアイコンを差し替えてください。')
