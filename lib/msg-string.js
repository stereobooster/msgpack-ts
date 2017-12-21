"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var msg_value_1 = require("./msg-value");
function encodeString(value) {
    return new MsgString(value);
}
exports.encodeString = encodeString;
var MsgString = /** @class */ (function (_super) {
    __extends(MsgString, _super);
    function MsgString(value) {
        var _this = _super.call(this, value) || this;
        // maximum byte length
        _this.msgpackLength = 5 + value.length * 3;
        return _this;
    }
    MsgString.prototype.writeMsgpackTo = function (buffer, offset) {
        var length = this.value.length * 3;
        var expect = (length < 32) ? MsgFixString : (length < 256) ? MsgString8 : (length < 65536) ? MsgString16 : MsgString32;
        var bytes = expect.prototype.writeMsgpackTo.call(this, buffer, offset);
        var actual = (bytes < 2 + 32) ? MsgFixString : (bytes < 3 + 256) ? MsgString8 : (bytes < 5 + 65536) ? MsgString16 : MsgString32;
        if (expect === actual)
            return bytes;
        return actual.prototype.writeMsgpackTo.call(this, buffer, offset);
    };
    return MsgString;
}(msg_value_1.MsgValue));
exports.MsgString = MsgString;
var MsgFixString = /** @class */ (function (_super) {
    __extends(MsgFixString, _super);
    function MsgFixString(value) {
        var _this = _super.call(this, value) || this;
        // maximum byte length
        _this.msgpackLength = 1 + value.length * 3;
        return _this;
    }
    MsgFixString.prototype.writeMsgpackTo = function (buffer, offset) {
        var length = buffer.write(this.value, offset + 1);
        buffer[offset] = 0xa0 | length;
        // actual byte length
        return 1 + length;
    };
    return MsgFixString;
}(msg_value_1.MsgValue));
exports.MsgFixString = MsgFixString;
var MsgString8 = /** @class */ (function (_super) {
    __extends(MsgString8, _super);
    function MsgString8(value) {
        var _this = _super.call(this, value) || this;
        // maximum byte length
        _this.msgpackLength = 2 + value.length * 3;
        return _this;
    }
    MsgString8.prototype.writeMsgpackTo = function (buffer, offset) {
        buffer[offset] = 0xd9;
        var length = buffer.write(this.value, offset + 2);
        buffer.writeUInt8(length, offset + 1);
        // actual byte length
        return 2 + length;
    };
    return MsgString8;
}(msg_value_1.MsgValue));
exports.MsgString8 = MsgString8;
var MsgString16 = /** @class */ (function (_super) {
    __extends(MsgString16, _super);
    function MsgString16(value) {
        var _this = _super.call(this, value) || this;
        // maximum byte length
        _this.msgpackLength = 3 + value.length * 3;
        return _this;
    }
    MsgString16.prototype.writeMsgpackTo = function (buffer, offset) {
        buffer[offset] = 0xda;
        var length = buffer.write(this.value, offset + 3);
        buffer.writeUInt16BE(length, offset + 1);
        // actual byte length
        return 3 + length;
    };
    return MsgString16;
}(msg_value_1.MsgValue));
exports.MsgString16 = MsgString16;
var MsgString32 = /** @class */ (function (_super) {
    __extends(MsgString32, _super);
    function MsgString32(value) {
        var _this = _super.call(this, value) || this;
        // maximum byte length
        _this.msgpackLength = 5 + value.length * 3;
        return _this;
    }
    MsgString32.prototype.writeMsgpackTo = function (buffer, offset) {
        buffer[offset] = 0xdb;
        var length = buffer.write(this.value, offset + 5);
        buffer.writeUInt32BE(length, offset + 1);
        // actual byte length
        return 5 + length;
    };
    return MsgString32;
}(msg_value_1.MsgValue));
exports.MsgString32 = MsgString32;