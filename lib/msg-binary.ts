import {MsgValue} from "./msg-value";

export class MsgBinary extends MsgValue {
    constructor(value: Buffer) {
        super(value);
        const length = value.length;
        this.msgpackLength = (length < 256) ? 2 + length : (length < 65536) ? 3 + length : 5 + length;
    }

    writeMsgpackTo(buffer: Buffer, offset: number) {
        const value = this.value;
        const length = value.length;
        if (length < 256) {
            buffer[offset++] = 0xc4;
            buffer[offset++] = length;
        } else if (length < 65536) {
            buffer[offset++] = 0xc5;
            offset = buffer.writeUInt16BE(length, offset);
        } else {
            buffer[offset++] = 0xc6;
            offset = buffer.writeUInt32BE(length, offset);
        }
        offset += value.copy(buffer, offset);
        return offset;
    }

    value: Buffer;
}