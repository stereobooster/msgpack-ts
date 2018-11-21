import { MsgInterface } from "./msg-interface";

const fixedToken: Array<number> = [];
fixedToken[1] = 0xd4;
fixedToken[2] = 0xd5;
fixedToken[4] = 0xd6;
fixedToken[8] = 0xd7;
fixedToken[16] = 0xd8;

const flexToken: Array<number> = [];
flexToken[1] = 0xc7;
flexToken[2] = 0xc8;
flexToken[4] = 0xc9;

function getAddressLength(length: number): number {
  return fixedToken[length] ? 0 : length > 65535 ? 4 : length > 255 ? 2 : 1;
}

function getToken(length: number): number {
  return fixedToken[length] || flexToken[getAddressLength(length)];
}

function getByteLength(payload: Buffer): number {
  var length = (payload && payload.length) || 0;
  return 2 + getAddressLength(length) + length;
}

export class MsgExt implements MsgInterface {
  // constructor(payload: Buffer, type?: number);
  constructor(type: number, payload: Buffer) {
    // if (!isNaN(payload) && Buffer.isBuffer(type)) {
    //   return MsgExt.call(this, type, +payload);
    // }

    // ext type: -128 - +127
    if (type < -128 || 255 < type) {
      throw new RangeError("Invalid ext type: " + type);
    }

    if (-129 < type && type < 256) {
      this.type = type;
    }

    // payload
    if (payload && !Buffer.isBuffer(payload)) {
      payload = Buffer.from(payload);
    }

    if (!payload) {
      throw new TypeError("Invalid ext payload");
    }

    this.buffer = payload;
    this.msgpackLength = getByteLength(payload);
  }

  /**
   * payload
   */
  buffer: Buffer;

  /**
   * msgpack extension type number: -128 to +127
   */
  type: number;

  /**
   * expected maximum length of msgpack representation in bytes
   */
  msgpackLength: number;

  /**
   * write the msgpack representation to the buffer with an optional offset address
   * @return {number} actual length of msgpack representation written
   */
  writeMsgpackTo(buffer: Buffer, offset: number): number {
    const payload = this.buffer;
    const length = payload.length;

    offset |= 0;

    // token
    buffer[offset++] = getToken(length);

    // length for body length
    const addr = getAddressLength(length);
    if (addr === 1) {
      buffer.writeUInt8(length, offset);
    } else if (addr === 2) {
      buffer.writeUInt16BE(length, offset);
    } else if (addr === 4) {
      buffer.writeUInt32BE(length, offset);
    }
    offset += addr;

    // ext type
    buffer[offset++] = this.type & 255;

    // body
    payload.copy(buffer, offset, 0, length);

    return offset + length;
  }

  valueOf(): any {
    throw new Error("Not implemented");
  }
}
