function parseWindowsGuid(guid) {
  let s = guid.trim();
  if (s.length !== 36 || s[8] !== "-" || s[13] !== "-" || s[18] !== "-" || s[23] !== "-") {
    throw new Error(`Invalid GUID format: ${guid}`);
  }
  let v;
  const out = new Uint8Array(16);
  v = parseInt(s.slice(0, 8), 16);
  out[0] = v & 255;
  out[1] = v >>> 8 & 255;
  out[2] = v >>> 16 & 255;
  out[3] = v >>> 24 & 255;
  v = parseInt(s.slice(9, 13), 16);
  out[4] = v & 255;
  out[5] = v >>> 8 & 255;
  v = parseInt(s.slice(14, 18), 16);
  out[6] = v & 255;
  out[7] = v >>> 8 & 255;
  v = parseInt(s.slice(19, 23), 16);
  out[8] = v >>> 8 & 255;
  out[9] = v & 255;
  v = parseInt(s.slice(24, 32), 16);
  out[10] = v >>> 24 & 255;
  out[11] = v >>> 16 & 255;
  out[12] = v >>> 8 & 255;
  out[13] = v & 255;
  v = parseInt(s.slice(32, 36), 16);
  out[14] = v >>> 8 & 255;
  out[15] = v & 255;
  for (let i = 0; i < 16; i++) {
    if (!Number.isFinite(out[i])) {
      throw new Error(`Invalid GUID format: ${guid}`);
    }
  }
  if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(s)) {
    throw new Error(`Invalid GUID format: ${guid}`);
  }
  return out;
}
class Guid {
  constructor(bytes) {
    if (bytes.length !== 16)
      throw new Error("GUID must be exactly 16 bytes");
    this.bytes = bytes;
  }
  static fromString(guid) {
    return new Guid(parseWindowsGuid(guid));
  }
  /**
   * Convert Windows / CFBF byte order into canonical GUID string:
   * xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   */
  toString() {
    const b = this.bytes;
    const hx = (n) => n.toString(16).padStart(2, "0");
    const g1 = hx(b[3]) + hx(b[2]) + hx(b[1]) + hx(b[0]);
    const g2 = hx(b[5]) + hx(b[4]);
    const g3 = hx(b[7]) + hx(b[6]);
    const g4 = hx(b[8]) + hx(b[9]);
    const g5 = hx(b[10]) + hx(b[11]) + hx(b[12]) + hx(b[13]) + hx(b[14]) + hx(b[15]);
    return `${g1}-${g2}-${g3}-${g4}-${g5}`.toUpperCase();
  }
  /**
   * Compare against a Uint8Array containing GUID bytes
   * in Windows / CFBF layout.
   */
  equals(buf, offset = 0) {
    if (offset < 0 || buf.length - offset < 16)
      return false;
    const a = this.bytes;
    for (let i = 0; i < 16; i++) {
      if (buf[offset + i] !== a[i])
        return false;
    }
    return true;
  }
}
export {
  Guid as G,
  parseWindowsGuid as p
};
