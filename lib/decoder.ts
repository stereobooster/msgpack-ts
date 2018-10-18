import {MsgExt, MsgInterface} from "msg-interface";
import {MsgInt64, MsgUInt64} from "msg-int64";

import {MsgBinary} from "./msg-binary";

type Decoder = (buffer: Buffer, offset: number) => MsgInterface;

export function initDecoders(): Decoder[] {
    const ARR = require("./msg-array");
    const BOO = require("./msg-boolean");
    const MAP = require("./msg-map");
    const NIL = require("./msg-nil");
    const NUM = require("./msg-number");
    const STR = require("./msg-string");

    const decoders = new Array(256);

    decoders[0xc0] = NIL.MsgNil.from;
    decoders[0xc2] = BOO.MsgBoolean.from;
    decoders[0xc3] = BOO.MsgBoolean.from;

    let i;
    for (i = 0x00; i < 0x80; i++) decoders[i] = NUM.MsgFixInt.parse;
    for (i = 0x80; i < 0x90; i++) decoders[i] = MAP.MsgFixMap.parse;
    for (i = 0x90; i < 0xa0; i++) decoders[i] = ARR.MsgFixArray.parse;
    for (i = 0xa0; i < 0xc0; i++) decoders[i] = STR.MsgFixString.parse;

    decoders[0xc4] = (buffer: Buffer, offset: number) => decodeBinary(buffer, offset, 2, buffer.readUInt8(offset + 1));
    decoders[0xc5] = (buffer: Buffer, offset: number) => decodeBinary(buffer, offset, 3, buffer.readUInt16BE(offset + 1));
    decoders[0xc6] = (buffer: Buffer, offset: number) => decodeBinary(buffer, offset, 5, buffer.readUInt32BE(offset + 1));

    decoders[0xc7] = (buffer: Buffer, offset: number) => decodeExt(buffer, offset, 2, buffer.readUInt8(offset + 1));
    decoders[0xc8] = (buffer: Buffer, offset: number) => decodeExt(buffer, offset, 3, buffer.readUInt16BE(offset + 1));
    decoders[0xc9] = (buffer: Buffer, offset: number) => decodeExt(buffer, offset, 5, buffer.readUInt32BE(offset + 1));

    decoders[0xca] = NUM.MsgFloat32.parse;
    decoders[0xcb] = NUM.MsgFloat64.parse;
    decoders[0xcc] = NUM.MsgUInt8.parse;
    decoders[0xcd] = NUM.MsgUInt16.parse;
    decoders[0xce] = NUM.MsgUInt32.parse;
    decoders[0xcf] = (buffer: Buffer, offset: number) => new MsgUInt64(buffer, offset + 1);
    decoders[0xd0] = NUM.MsgInt8.parse;
    decoders[0xd1] = NUM.MsgInt16.parse;
    decoders[0xd2] = NUM.MsgInt32.parse;
    decoders[0xd3] = (buffer: Buffer, offset: number) => new MsgInt64(buffer, offset + 1);

    decoders[0xd4] = (buffer: Buffer, offset: number) => decodeExt(buffer, offset, 1, 1);
    decoders[0xd5] = (buffer: Buffer, offset: number) => decodeExt(buffer, offset, 1, 2);
    decoders[0xd6] = (buffer: Buffer, offset: number) => decodeExt(buffer, offset, 1, 4);
    decoders[0xd7] = (buffer: Buffer, offset: number) => decodeExt(buffer, offset, 1, 8);
    decoders[0xd8] = (buffer: Buffer, offset: number) => decodeExt(buffer, offset, 1, 16);

    decoders[0xd9] = STR.MsgString8.parse;
    decoders[0xda] = STR.MsgString16.parse;
    decoders[0xdb] = STR.MsgString32.parse;

    decoders[0xdc] = ARR.MsgArray16.parse;
    decoders[0xdd] = ARR.MsgArray32.parse;

    decoders[0xde] = MAP.MsgMap16.parse;
    decoders[0xdf] = MAP.MsgMap32.parse;

    for (i = 0xe0; i < 0x100; i++) decoders[i] = NUM.MsgFixInt.parse;

    return decoders;
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
