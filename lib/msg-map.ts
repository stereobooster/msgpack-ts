import {MsgInterface} from "msg-interface";

export interface MsgMapInterface extends MsgInterface {
    set(key: MsgInterface, value: MsgInterface): void;
}

abstract class MsgMap implements MsgMapInterface {
    msgpackLength: number;

    protected array = [] as MsgInterface[];

    abstract writeMsgpackTo(buffer: Buffer, offset: number): number;

    set(key: MsgInterface, value: MsgInterface) {
        this.array.push(key, value);
        this.msgpackLength += key.msgpackLength + value.msgpackLength;
    }

    valueOf() {
        const array = this.array;
        const length = array.length;
        const obj = {} as { [key: string]: any };
        for (let i = 0; i < length;) {
            const key = array[i++];
            const val = array[i++];
            obj[key.valueOf() as string] = val.valueOf();
        }
        return obj;
    }
}

export class MsgFixMap extends MsgMap {
    writeMsgpackTo(buffer: Buffer, offset: number): number {
        offset |= 0;
        const length = this.array.length / 2;
        if (length > 15) throw new TypeError("Too many items: " + length);

        buffer[offset] = 0x80 | length;
        let pos = offset + 1;

        this.array.forEach(msg => pos += msg.writeMsgpackTo(buffer, pos));
        return pos - offset;
    }
}

export class MsgMap16 extends MsgMap {
    writeMsgpackTo(buffer: Buffer, offset: number): number {
        offset |= 0;

        const length = this.array.length / 2;
        if (length > 65535) throw new TypeError("Too many items: " + length);

        buffer[offset] = 0xde;
        let pos = buffer.writeUInt16BE(length, offset + 1);

        this.array.forEach(msg => pos += msg.writeMsgpackTo(buffer, pos));
        return pos - offset;
    }
}

export class MsgMap32 extends MsgMap {
    writeMsgpackTo(buffer: Buffer, offset: number): number {
        const length = this.array.length / 2;

        offset |= 0;
        buffer[offset] = 0xdf;
        let pos = buffer.writeUInt32BE(length, offset + 1);

        this.array.forEach(msg => pos += msg.writeMsgpackTo(buffer, pos));
        return pos - offset;
    }
}

/**
 * constant length
 */

MsgFixMap.prototype.msgpackLength = 1;
MsgMap16.prototype.msgpackLength = 3;
MsgMap32.prototype.msgpackLength = 5;
