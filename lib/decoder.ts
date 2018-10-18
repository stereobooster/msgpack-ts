import {MsgExt, MsgInterface} from "msg-interface";
import {MsgInt64, MsgUInt64} from "msg-int64";

import {MsgBinary} from "./msg-binary";

type Decoder = (buffer: Buffer, offset: number) => MsgInterface;

const UTF8 = "utf8";

export function initDecoders(): Decoder[] {
    const ARR = require("./msg-array");
    const BOO = require("./msg-boolean");
    const MAP = require("./msg-map");
    const NIL = require("./msg-nil");
    const NUM = require("./msg-number");
    const STR = require("./msg-string");

    const decoders = new Array(256);

    decoders[0xc0] = (_buffer: Buffer, _offset: number) => new NIL.MsgNil();
    decoders[0xc2] = (_buffer: Buffer, _offset: number) => new BOO.MsgBoolean(false);
    decoders[0xc3] = (_buffer: Buffer, _offset: number) => new BOO.MsgBoolean(true);

    let i;
    for (i = 0x00; i < 0x80; i++) decoders[i] = decodeFixInt;
    for (i = 0x80; i < 0x90; i++) decoders[i] = MAP.MsgFixMap.parse;
    for (i = 0x90; i < 0xa0; i++) decoders[i] = ARR.MsgFixArray.parse;
    for (i = 0xa0; i < 0xc0; i++) decoders[i] = decodeFixString;

    decoders[0xc4] = (buffer: Buffer, offset: number) => decodeBinary(buffer, offset, 2, buffer.readUInt8(offset + 1));
    decoders[0xc5] = (buffer: Buffer, offset: number) => decodeBinary(buffer, offset, 3, buffer.readUInt16BE(offset + 1));
    decoders[0xc6] = (buffer: Buffer, offset: number) => decodeBinary(buffer, offset, 5, buffer.readUInt32BE(offset + 1));

    decoders[0xc7] = (buffer: Buffer, offset: number) => decodeExt(buffer, offset, 2, buffer.readUInt8(offset + 1));
    decoders[0xc8] = (buffer: Buffer, offset: number) => decodeExt(buffer, offset, 3, buffer.readUInt16BE(offset + 1));
    decoders[0xc9] = (buffer: Buffer, offset: number) => decodeExt(buffer, offset, 5, buffer.readUInt32BE(offset + 1));

    decoders[0xca] = (buffer: Buffer, offset: number) => new NUM.MsgFloat32(buffer.readFloatBE(offset + 1));
    decoders[0xcb] = (buffer: Buffer, offset: number) => new NUM.MsgFloat32(buffer.readDoubleBE(offset + 1));
    decoders[0xcc] = (buffer: Buffer, offset: number) => new NUM.MsgUInt8(buffer.readUInt8(offset + 1));
    decoders[0xcd] = (buffer: Buffer, offset: number) => new NUM.MsgUInt16(buffer.readUInt16BE(offset + 1));
    decoders[0xce] = (buffer: Buffer, offset: number) => new NUM.MsgUInt32(buffer.readUInt32BE(offset + 1));
    decoders[0xcf] = (buffer: Buffer, offset: number) => new MsgUInt64(buffer, offset + 1);
    decoders[0xd0] = (buffer: Buffer, offset: number) => new NUM.MsgInt8(buffer.readInt8(offset + 1));
    decoders[0xd1] = (buffer: Buffer, offset: number) => new NUM.MsgInt16(buffer.readInt16BE(offset + 1));
    decoders[0xd2] = (buffer: Buffer, offset: number) => new NUM.MsgInt32(buffer.readInt32BE(offset + 1));
    decoders[0xd3] = (buffer: Buffer, offset: number) => new MsgInt64(buffer, offset + 1);

    decoders[0xd4] = (buffer: Buffer, offset: number) => decodeExt(buffer, offset, 1, 1);
    decoders[0xd5] = (buffer: Buffer, offset: number) => decodeExt(buffer, offset, 1, 2);
    decoders[0xd6] = (buffer: Buffer, offset: number) => decodeExt(buffer, offset, 1, 4);
    decoders[0xd7] = (buffer: Buffer, offset: number) => decodeExt(buffer, offset, 1, 8);
    decoders[0xd8] = (buffer: Buffer, offset: number) => decodeExt(buffer, offset, 1, 16);

    decoders[0xd9] = decodeString8;
    decoders[0xda] = decodeString16;
    decoders[0xdb] = decodeString32;

    decoders[0xdc] = ARR.MsgArray16.parse;
    decoders[0xdd] = ARR.MsgArray32.parse;

    decoders[0xde] = MAP.MsgMap16.parse;
    decoders[0xdf] = MAP.MsgMap32.parse;

    for (i = 0xe0; i < 0x100; i++) decoders[i] = decodeFixInt;

    return decoders;

    function decodeFixInt(buffer: Buffer, offset?: number) {
        let value = buffer[0 | offset as number];
        if (value > 127) value -= 256;
        return new NUM.MsgFixInt(value);
    }

    function decodeFixString(buffer: Buffer, offset: number) {
        const length = buffer[offset] & 0x1f;
        const start = offset + 1;
        const end = start + length;
        const str = buffer.toString(UTF8, start, end);
        const msg = new STR.MsgFixString(str);
        msg.msgpackLength = end - offset;
        return msg;
    }

    function decodeString8(buffer: Buffer, offset: number) {
        const length = buffer.readUInt8(offset + 1);
        const start = offset + 2;
        const end = start + length;
        const str = buffer.toString(UTF8, start, end);
        const msg = new STR.MsgString8(str);
        msg.msgpackLength = end - offset;
        return msg;
    }

    function decodeString16(buffer: Buffer, offset: number) {
        const length = buffer.readUInt16BE(offset + 1);
        const start = offset + 3;
        const end = start + length;
        const str = buffer.toString(UTF8, start, end);
        const msg = new STR.MsgString16(str);
        msg.msgpackLength = end - offset;
        return msg;
    }

    function decodeString32(buffer: Buffer, offset: number) {
        const length = buffer.readUInt32BE(offset + 1);
        const start = offset + 5;
        const end = start + length;
        const str = buffer.toString(UTF8, start, end);
        const msg = new STR.MsgString32(str);
        msg.msgpackLength = end - offset;
        return msg;
    }
}

function decodeBinary(buffer: Buffer, offset: number, skip: number, length: number) {
    const start = offset + skip;
    const end = start + length;
    const payload = buffer.slice(start, end);
    const msg = new MsgBinary(payload);
    msg.msgpackLength = end - offset;
    return msg;
}

function decodeExt(buffer: Buffer, offset: number, skip: number, length: number) {
    let start = offset + skip;
    const type = buffer[start++];
    const end = start + length;
    const payload = buffer.slice(start, end);
    const msg = new MsgExt(payload, type);
    msg.msgpackLength = end - offset;
    return msg;
}
