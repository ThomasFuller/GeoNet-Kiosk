/** Compact miniSEED reader for GeoNet FDSN traces (STEIM2 / STEIM1 / ints). */

export type MiniSeedTrace = {
  network: string
  station: string
  location: string
  channel: string
  startMs: number
  sampleRate: number
  samples: number[]
}

function sampleRate(factor: number, multiplier: number): number {
  if (factor > 0 && multiplier > 0) return factor * multiplier
  if (factor > 0 && multiplier < 0) return factor / -multiplier
  if (factor < 0 && multiplier > 0) return -multiplier / factor
  return 1 / (factor * multiplier)
}

function btimeMs(view: DataView, offset: number): number {
  const year = view.getUint16(offset)
  const jday = view.getUint16(offset + 2)
  const hour = view.getUint8(offset + 4)
  const min = view.getUint8(offset + 5)
  const sec = view.getUint8(offset + 6)
  const tfrac = view.getUint16(offset + 8)
  return Date.UTC(year, 0, jday, hour, min, sec, Math.round(tfrac / 10))
}

function ascii(view: DataView, offset: number, len: number): string {
  let s = ''
  for (let i = 0; i < len; i++) s += String.fromCharCode(view.getUint8(offset + i))
  return s.trim()
}

function signBits(value: number, width: number): number {
  const mask = (1 << width) - 1
  let v = value & mask
  if (v & (1 << (width - 1))) v -= 1 << width
  return v
}

function decodeSteim2(view: DataView, offset: number, length: number, npts: number, littleEndian: boolean): number[] {
  const maxFrames = Math.floor(length / 64)
  const output: number[] = []
  for (let frameIdx = 0; frameIdx < maxFrames && output.length < npts; frameIdx++) {
    const base = offset + frameIdx * 64
    const uwords = new Uint32Array(16)
    const swords = new Int32Array(16)
    for (let i = 0; i < 16; i++) {
      uwords[i] = view.getUint32(base + i * 4, littleEndian)
      swords[i] = view.getInt32(base + i * 4, littleEndian)
    }
    const nibbles = Array.from({ length: 16 }, (_, i) => (uwords[0] >>> (30 - 2 * i)) & 3)
    const diffs: number[] = []
    if (frameIdx === 0) {
      output.push(swords[1])
      // Xn at swords[2] is the integrity check; we still decode even if it drifts.
    }
    const startNibble = frameIdx === 0 ? 3 : 1
    for (let w = startNibble; w < 16; w++) {
      const nibble = nibbles[w]
      const uw = uwords[w]
      if (nibble === 0) continue
      if (nibble === 1) {
        for (let s = 0; s < 4; s++) diffs.push(signBits(uw >>> (24 - 8 * s), 8))
      } else if (nibble === 2) {
        const dnib = (uw >>> 30) & 3
        if (dnib === 1) diffs.push(signBits(uw, 30))
        else if (dnib === 2) {
          diffs.push(signBits(uw >>> 15, 15))
          diffs.push(signBits(uw, 15))
        } else if (dnib === 3) {
          diffs.push(signBits(uw >>> 20, 10))
          diffs.push(signBits(uw >>> 10, 10))
          diffs.push(signBits(uw, 10))
        }
      } else if (nibble === 3) {
        const dnib = (uw >>> 30) & 3
        if (dnib === 0) {
          for (let s = 0; s < 5; s++) diffs.push(signBits(uw >>> (24 - 6 * s), 6))
        } else if (dnib === 1) {
          for (let s = 0; s < 6; s++) diffs.push(signBits(uw >>> (25 - 5 * s), 5))
        } else if (dnib === 2) {
          for (let s = 0; s < 7; s++) diffs.push(signBits(uw >>> (24 - 4 * s), 4))
        }
      }
    }
    const start = frameIdx === 0 ? 1 : 0
    for (let i = start; i < diffs.length && output.length < npts; i++) {
      output.push((output[output.length - 1] + diffs[i]) | 0)
    }
  }
  return output
}

function decodeSteim1(view: DataView, offset: number, length: number, npts: number, littleEndian: boolean): number[] {
  const maxFrames = Math.floor(length / 64)
  const output: number[] = []
  for (let frameIdx = 0; frameIdx < maxFrames && output.length < npts; frameIdx++) {
    const base = offset + frameIdx * 64
    const uwords = new Uint32Array(16)
    const swords = new Int32Array(16)
    for (let i = 0; i < 16; i++) {
      uwords[i] = view.getUint32(base + i * 4, littleEndian)
      swords[i] = view.getInt32(base + i * 4, littleEndian)
    }
    const nibbles = Array.from({ length: 16 }, (_, i) => (uwords[0] >>> (30 - 2 * i)) & 3)
    const diffs: number[] = []
    if (frameIdx === 0) output.push(swords[1])
    const startNibble = frameIdx === 0 ? 3 : 1
    for (let w = startNibble; w < 16; w++) {
      const nibble = nibbles[w]
      const uw = uwords[w]
      const sw = swords[w]
      if (nibble === 1) {
        for (let s = 0; s < 4; s++) diffs.push(signBits(uw >>> (24 - 8 * s), 8))
      } else if (nibble === 2) {
        diffs.push(signBits(uw >>> 16, 16))
        diffs.push(signBits(uw, 16))
      } else if (nibble === 3) {
        diffs.push(sw)
      }
    }
    const start = frameIdx === 0 ? 1 : 0
    for (let i = start; i < diffs.length && output.length < npts; i++) {
      output.push((output[output.length - 1] + diffs[i]) | 0)
    }
  }
  return output
}

function decodeInts(view: DataView, offset: number, npts: number, encoding: number, littleEndian: boolean): number[] {
  const out: number[] = []
  if (encoding === 1) {
    for (let i = 0; i < npts; i++) out.push(view.getInt16(offset + i * 2, littleEndian))
  } else if (encoding === 3) {
    for (let i = 0; i < npts; i++) out.push(view.getInt32(offset + i * 4, littleEndian))
  } else if (encoding === 4) {
    for (let i = 0; i < npts; i++) out.push(view.getFloat32(offset + i * 4, littleEndian))
  }
  return out
}

export function parseMiniSeed(buffer: ArrayBuffer): MiniSeedTrace | null {
  const view = new DataView(buffer)
  if (view.byteLength < 48) return null

  const samples: number[] = []
  let startMs = 0
  let sampleRateHz = 0
  let network = ''
  let station = ''
  let location = ''
  let channel = ''

  let offset = 0
  while (offset + 48 <= view.byteLength) {
    const quality = String.fromCharCode(view.getUint8(offset + 6))
    if (quality === ' ') {
      offset += 512
      continue
    }

    const recStation = ascii(view, offset + 8, 5)
    const recLocation = ascii(view, offset + 13, 2)
    const recChannel = ascii(view, offset + 15, 3)
    const recNetwork = ascii(view, offset + 18, 2)
    const npts = view.getUint16(offset + 30)
    const factor = view.getInt16(offset + 32)
    const multiplier = view.getInt16(offset + 34)
    const dataOffset = view.getUint16(offset + 44)
    const firstBlockette = view.getUint16(offset + 46)

    let encoding = 11
    let littleEndian = false
    let recLen = 512
    let bOff = firstBlockette
    for (let n = 0; n < 8 && bOff >= 48 && offset + bOff + 8 <= view.byteLength; n++) {
      const type = view.getUint16(offset + bOff)
      const next = view.getUint16(offset + bOff + 2)
      if (type === 1000) {
        encoding = view.getUint8(offset + bOff + 4)
        littleEndian = view.getUint8(offset + bOff + 5) === 0
        recLen = 2 ** view.getUint8(offset + bOff + 6)
      }
      if (!next || next === bOff) break
      bOff = next
    }

    if (offset + recLen > view.byteLength) break

    if (!samples.length) {
      startMs = btimeMs(view, offset + 20)
      sampleRateHz = sampleRate(factor, multiplier)
      network = recNetwork
      station = recStation
      location = recLocation
      channel = recChannel
    }

    const payloadOff = offset + dataOffset
    const payloadLen = recLen - dataOffset
    let decoded: number[] = []
    if (encoding === 11) decoded = decodeSteim2(view, payloadOff, payloadLen, npts, littleEndian)
    else if (encoding === 10) decoded = decodeSteim1(view, payloadOff, payloadLen, npts, littleEndian)
    else if (encoding === 1 || encoding === 3 || encoding === 4) {
      decoded = decodeInts(view, payloadOff, npts, encoding, littleEndian)
    }
    samples.push(...decoded.slice(0, npts))
    offset += recLen
  }

  if (!samples.length || !sampleRateHz) return null
  return { network, station, location, channel, startMs, sampleRate: sampleRateHz, samples }
}

/** Keep wiggle spikes: two points (min, max) per bin. */
export function downsampleMinMax(values: number[], times: number[], target = 720): { values: number[]; times: number[] } {
  if (values.length <= target) return { values, times }
  const bins = Math.max(2, Math.floor(target / 2))
  const outV: number[] = []
  const outT: number[] = []
  for (let b = 0; b < bins; b++) {
    const i0 = Math.floor((b / bins) * values.length)
    const i1 = Math.floor(((b + 1) / bins) * values.length)
    let min = values[i0]
    let max = values[i0]
    let minI = i0
    let maxI = i0
    for (let i = i0 + 1; i < i1; i++) {
      if (values[i] < min) {
        min = values[i]
        minI = i
      }
      if (values[i] > max) {
        max = values[i]
        maxI = i
      }
    }
    if (minI <= maxI) {
      outV.push(min, max)
      outT.push(times[minI], times[maxI])
    } else {
      outV.push(max, min)
      outT.push(times[maxI], times[minI])
    }
  }
  return { values: outV, times: outT }
}
