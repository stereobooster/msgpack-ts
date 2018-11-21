import { MsgInterface } from "./msg-interface";

export interface MsgArrayInterface extends MsgInterface {
  add(value: MsgInterface): void;
}

abstract class MsgArray implements MsgArrayInterface {
  msgpackLength: number;

  protected array: MsgInterface[] = [];

  writeMsgpackTo(buffer: Buffer, offset: number): number {
    throw new Error("Not implemented");
  }

  add(value: MsgInterface): void {
    this.array.push(value);
    this.msgpackLength += value.msgpackLength;
  }

  valueOf(): Array<any> {
    return this.array.map(function(msg): any {
      return msg.valueOf();
    });
  }
}

export class MsgFixArray extends MsgArray {
  writeMsgpackTo(buffer: Buffer, offset: number): number {
    const length = this.array.length;
    if (length > 15) throw new TypeError("Too many items: " + length);

    offset |= 0;
    buffer[offset] = 0x90 | length;
    let pos = offset + 1;

    this.array.forEach(function(msg): void {
      pos += msg.writeMsgpackTo(buffer, pos);
    });
    return pos - offset;
  }
}

export class MsgArray16 extends MsgArray {
  writeMsgpackTo(buffer: Buffer, offset: number): number {
    const length = this.array.length;
    if (length > 65535) throw new TypeError("Too many items: " + length);

    offset |= 0;
    buffer[offset] = 0xdc;
    let pos = buffer.writeUInt16BE(length, offset + 1);

    this.array.forEach(function(msg): void {
      pos += msg.writeMsgpackTo(buffer, pos);
    });
    return pos - offset;
  }
}

export class MsgArray32 extends MsgArray {
  writeMsgpackTo(buffer: Buffer, offset: number): number {
    const length = this.array.length;

    offset |= 0;
    buffer[offset] = 0xdd;
    let pos = buffer.writeUInt32BE(length, offset + 1);

    this.array.forEach(function(msg): void {
      pos += msg.writeMsgpackTo(buffer, pos);
    });
    return pos - offset;
  }
}

/**
 * constant length
 */

MsgFixArray.prototype.msgpackLength = 1;
MsgArray16.prototype.msgpackLength = 3;
MsgArray32.prototype.msgpackLength = 5;
