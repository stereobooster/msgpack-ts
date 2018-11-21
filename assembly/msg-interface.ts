// msg-interface

/**
 * @see https://github.com/kawanet/msg-interface
 */

export interface MsgInterface {
  /**
   * expected maximum length of msgpack representation in bytes
   */
  msgpackLength: number;

  /**
   * write the msgpack representation to the buffer with an optional offset address
   * @return {number} actual length of written in bytes
   */
  writeMsgpackTo(buffer: Buffer, offset: number): number;
}

/**
* @return {boolean} true when the argument has the MsgInterface implemented
*/

export function isMsg(msg: any): boolean {
  return !!(msg && msg.msgpackLength >= 0 && msg.writeMsgpackTo);
}

/**
* @return {Buffer} msgpack representation
*/

export function msgToBuffer(msg: MsgInterface): Buffer {
  const expected = +msg.msgpackLength;

  if (isNaN(expected)) {
      throw new Error("Invalid msgpackLength");
  }

  let buffer = Buffer.alloc(expected);
  const actual = +msg.writeMsgpackTo(buffer, 0);

  // trim
  if (expected > actual) {
      buffer = buffer.slice(0, actual);
  }

  return buffer;
}