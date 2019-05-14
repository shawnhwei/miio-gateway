import { createCipheriv, createDecipheriv, createHash } from "crypto";

const MARKER = 0x2131;

interface IMessage {
  getDeviceId(): number;
  getTimestamp(): number;
  getData(): string;
}

export class ResponseMessage implements IMessage {
  public static from(raw: Buffer, token?: string) {
    if (token) {
      const tokenData = Buffer.from(token, "hex");

      const keyHash = createHash("md5");
      keyHash.update(tokenData);
      const key = keyHash.digest();

      const ivHash = createHash("md5");
      ivHash.update(key);
      ivHash.update(tokenData);
      const iv = ivHash.digest();

      const cipher = createDecipheriv("aes-128-cbc", key, iv);
      const decrypted = Buffer.concat([cipher.update(raw.slice(32)), cipher.final()]);

      return new ResponseMessage({
        data: decrypted,
        headers: raw.slice(0, 32),
      });
    } else {
      return new ResponseMessage({
        data: raw.slice(32),
        headers: raw.slice(0, 32),
      });
    }
  }

  public static getDeviceIdFromRaw(raw: Buffer) {
    return raw.readUInt32BE(8);
  }

  private headers: Buffer;
  private data: Buffer;

  constructor(options: { data: Buffer, headers: Buffer }) {
    this.headers = options.headers;
    this.data = options.data;
  }

  public getDeviceId(): number {
    return this.headers.readUInt32BE(8);
  }

  public getTimestamp(): number {
    return this.headers.readUInt32BE(12);
  }

  public getData(): string {
    return this.data.toString("utf8");
  }
}

export class RequestMessage implements IMessage {
  private headers: Buffer = Buffer.alloc(32);
  private data: Buffer = Buffer.alloc(0);
  private token: Buffer = Buffer.alloc(0);
  private handshake: boolean = false;
  private timestamp: number = 0;

  constructor(options: { handshake: true } | { handshake?: false, id: number, token: string, data: Buffer, timestamp: number }) {
    this.headers.writeUInt16BE(MARKER, 0);
    this.headers.writeUInt16BE(this.headers.length, 2);

    if (options.handshake) {
      this.handshake = true;

      for (let i = 4; i < 32; i++) {
        this.headers[i] = 0xff;
      }
    } else {
      this.headers.writeUInt32BE(options.id, 8);
      this.headers.writeUInt32BE(options.timestamp, 12);
      this.token = Buffer.from(options.token, "hex");

      const keyHash = createHash("md5");
      keyHash.update(this.token);
      const key = keyHash.digest();

      const ivHash = createHash("md5");
      ivHash.update(key);
      ivHash.update(this.token);
      const iv = ivHash.digest();

      const cipher = createCipheriv("aes-128-cbc", key, iv);
      this.data = Buffer.concat([cipher.update(options.data), cipher.final()]);
      this.headers.writeUInt16BE(this.headers.length + this.data.length, 2);
    }
  }

  public getDeviceId(): number {
    return this.headers.readUInt32BE(8);
  }

  public getTimestamp(): number {
    return this.headers.readUInt32BE(12);
  }

  public getData(): string {
    return this.data.toString("utf8");
  }

  public raw() {
    if (!this.handshake) {
      const hash = createHash("md5");
      hash.update(this.headers.slice(0, 16));
      hash.update(this.token);
      hash.update(this.data);
      hash.digest().copy(this.headers, 16);

      return Buffer.concat([this.headers, this.data]);
    } else {
      return this.headers.slice(0);
    }
  }
}
