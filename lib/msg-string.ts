import {MsgInterface} from "msg-interface";

interface MsgStringInterface extends MsgInterface {
    valueOf(): string;
}

export class MsgString implements MsgStringInterface {
    msgpackLength: number;

    protected value: string;

    constructor(value: string) {
        if (value == null) return;

        this.value = value;

        // maximum byte length
        this.msgpackLength = 5 + value.length * 3;
    }

    valueOf(): string {
        return this.value;
    }

    writeMsgpackTo(buffer: Buffer, offset: number): number {
        const length = this.value.length * 3;
        const expect = (length < 32) ? MsgFixString : (length < 256) ? MsgString8 : (length < 65536) ? MsgString16 : MsgString32;
        const bytes = expect.prototype.writeMsgpackTo.call(this, buffer, offset);
        const actual = (bytes < 2 + 32) ? MsgFixString : (bytes < 3 + 256) ? MsgString8 : (bytes < 5 + 65536) ? MsgString16 : MsgString32;
        if (expect === actual) return bytes;
        return actual.prototype.writeMsgpackTo.call(this, buffer, offset);
    }
}

export class MsgFixString extends MsgString {
    writeMsgpackTo(buffer: Buffer, offset: number): number {
        offset |= 0;

        const length = buffer.write(this.value, offset + 1);
        if (length > 31) throw new TypeError("Too long string: " + length);

        buffer[offset] = 0xa0 | length;

        // actual byte length
        return 1 + length;
    }
}

export class MsgString8 extends MsgString {
    writeMsgpackTo(buffer: Buffer, offset: number): number {
        offset |= 0;
        buffer[offset] = 0xd9;

        const length = buffer.write(this.value, offset + 2);
        if (length > 255) throw new TypeError("Too long string: " + length);

        buffer.writeUInt8(length, offset + 1);

        // actual byte length
        return 2 + length;
    }
}

export class MsgString16 extends MsgString {
    writeMsgpackTo(buffer: Buffer, offset: number): number {
        offset |= 0;
        buffer[offset] = 0xda;

        const length = buffer.write(this.value, offset + 3);
        if (length > 65535) throw new TypeError("Too long string: " + length);

        buffer.writeUInt16BE(length, offset + 1);

        // actual byte length
        return 3 + length;
    }
}

export class MsgString32 extends MsgString {
    writeMsgpackTo(buffer: Buffer, offset: number): number {
        offset |= 0;
        buffer[offset] = 0xdb;

        const length = buffer.write(this.value, offset + 5);

        buffer.writeUInt32BE(length, offset + 1);

        // actual byte length
        return 5 + length;
    }
}

export class MsgStringBuffer implements MsgStringInterface {
    protected buffer: Buffer;
    protected offset: number;
    protected skip: number;
    msgpackLength: number;

    constructor(buffer: Buffer, offset: number, skip: number, size: number) {
        this.buffer = buffer;
        this.offset = offset;
        this.skip = skip;
        this.msgpackLength = skip + size;
    }

    valueOf(): string {
        const start = this.offset + this.skip;
        const end = this.offset + this.msgpackLength;
        return this.buffer.toString("UTF8", start, end);
    }

    writeMsgpackTo(buffer: Buffer, offset: number): number {
        const start = this.offset;
        const end = start + this.msgpackLength;
        this.buffer.copy(buffer, offset, start, end);
        return length;
    }
}
