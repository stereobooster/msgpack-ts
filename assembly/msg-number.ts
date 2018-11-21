import { MsgInterface } from "msg-interface";
import { Int64BE, Uint64BE } from "int64-buffer";

export class MsgNumber implements MsgInterface {
  msgpackLength: number;
  value: number;

  constructor(value: any) {
    this.value = +value;
  }

  valueOf(): number {
    return +this.value;
  }

  toString(radix: number): string {
    // @ts-ignore
    return (+this.value).toString(radix);
  }

  writeMsgpackTo(buffer: Buffer, offset: number): number {
    throw new Error("Not implemented");
  }
}

export class MsgFixInt extends MsgNumber {
  msgpackLength: number = 1;

  writeMsgpackTo(buffer: Buffer, offset: number): number {
    offset |= 0;
    buffer[offset] = this.value & 255;
    return 1;
  }
}

export class MsgInt8 extends MsgNumber {
  msgpackLength: number = 2;

  writeMsgpackTo(buffer: Buffer, offset: number): number {
    offset |= 0;
    buffer[offset] = 0xd0;
    buffer[offset + 1] = this.value & 255;
    return 2;
  }
}

export class MsgUInt8 extends MsgNumber {
  msgpackLength: number = 2;

  writeMsgpackTo(buffer: Buffer, offset: number): number {
    offset |= 0;
    buffer[offset] = 0xcc;
    buffer[offset + 1] = this.value & 255;
    return 2;
  }
}

export class MsgInt16 extends MsgNumber {
  msgpackLength: number = 3;

  writeMsgpackTo(buffer: Buffer, offset: number): number {
    offset |= 0;
    buffer[offset] = 0xd1;
    buffer.writeInt16BE(+this.value, offset + 1);
    return 3;
  }
}

export class MsgUInt16 extends MsgNumber {
  msgpackLength: number = 3;

  writeMsgpackTo(buffer: Buffer, offset: number): number {
    offset |= 0;
    buffer[offset] = 0xcd;
    buffer.writeUInt16BE(+this.value, offset + 1);
    return 3;
  }
}

export class MsgInt32 extends MsgNumber {
  msgpackLength: number = 5;

  writeMsgpackTo(buffer: Buffer, offset: number): number {
    offset |= 0;
    buffer[offset] = 0xd2;
    buffer.writeInt32BE(+this.value, offset + 1);
    return 5;
  }
}

export class MsgUInt32 extends MsgNumber {
  msgpackLength: number = 5;

  writeMsgpackTo(buffer: Buffer, offset: number): number {
    offset |= 0;
    buffer[offset] = 0xce;
    buffer.writeUInt32BE(+this.value, offset + 1);
    return 5;
  }
}

export class MsgFloat32 extends MsgNumber {
  msgpackLength: number = 5;

  writeMsgpackTo(buffer: Buffer, offset: number): number {
    offset |= 0;
    buffer[offset] = 0xca;
    buffer.writeFloatBE(+this.value, offset + 1);
    return 5;
  }
}

export class MsgFloat64 extends MsgNumber {
  msgpackLength: number = 9;

  writeMsgpackTo(buffer: Buffer, offset: number): number {
    offset |= 0;
    buffer[offset] = 0xcb;
    buffer.writeDoubleBE(+this.value, offset + 1);
    return 9;
  }
}

export class MsgInt64 extends Int64BE implements MsgInterface {
  msgpackLength: number = 9;

  valueOf(): Int64BE {
    return this;
  }

  toString(radix: number): string {
    return this.toString(radix);
  }

  writeMsgpackTo(buffer: Buffer, offset: number): number {
    offset |= 0;
    buffer[offset] = 0xd3;
    this.toBuffer().copy(buffer, offset + 1);
    return 9;
  }
}

export class MsgUInt64 extends Uint64BE implements MsgInterface {
  msgpackLength: number = 9;

  valueOf(): Uint64BE {
    return this;
  }

  toString(radix: number): string {
    return this.toString(radix);
  }

  writeMsgpackTo(buffer: Buffer, offset: number): number {
    offset |= 0;
    buffer[offset] = 0xcf;
    this.toBuffer().copy(buffer, offset + 1);
    return 9;
  }
}
