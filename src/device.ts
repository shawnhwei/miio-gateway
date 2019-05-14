import * as dgram from "dgram";
import { Profiles } from "./profiles";
import { RequestMessage, ResponseMessage } from "./protocol";

interface IDeviceOptions {
  id: number;
  address: string;
  port: number;
  token: string;
  timestamp: number;
}

export interface IDeviceProfile {
  readonly name: string;
  readonly actions: { [index: string]: any };

  homekit(device: Device<unknown>): HAPNodeJS.Accessory;
}

export type DeviceCaller = (method: string, params: any[]) => Promise<void>;

export class Device<T> {
  public readonly id: number;
  public readonly address: string;

  private readonly socket: dgram.Socket;
  private readonly port: number;
  private readonly token: string;
  private remoteTimestamp: number;
  private localTimestamp: number;
  private _profile: T;
  private _model: string = "unknown";
  private _info: any = {};
  private counter: number = 1;
  private callbacks: Map<number, (data: any) => void> = new Map();

  constructor(options: IDeviceOptions, profile: T) {
    this._profile = profile;
    this.id = options.id;
    this.address = options.address;
    this.port = options.port;
    this.token = options.token;
    this.remoteTimestamp = options.timestamp;
    this.localTimestamp = Date.now();

    this.socket = dgram.createSocket("udp4");

    this.socket.on("message", (msg, rinfo) => {
      const response = ResponseMessage.from(msg, this.token);
      const data = JSON.parse(response.getData());

      console.log(data);

      if (this.callbacks.has(data.id)) {
        const callback = this.callbacks.get(data.id)!;

        callback(data);
      }
    });
  }

  private from<X extends T>(device: Device<T>, profile: X): Device<X> {
    device.setProfile(profile);
    return device as Device<X>;
  }

  public get model() {
    return this._model;
  }

  public get profile(): T {
    return this._profile;
  }

  public get info() {
    return this._info;
  }

  public setProfile(profile: T) {
    this._profile = profile;
  }

  public setTimestamp(timestamp: number) {
    this.remoteTimestamp = timestamp;
    this.localTimestamp = Date.now();
  }

  public async init(): Promise<Device<T>> {
    await new Promise((resolve, reject) => {
      this.socket.bind(resolve);
    });

    const info = await this.call("miIO.info", []);
    this._info = info;

    if (Profiles.hasOwnProperty(info.model)) {
      this._model = info.model;
      return this.from(this, new Profiles[info.model]());
    }

    return this;
  }

  public async getInfo() {
    const info = await this.call("miIO.info", []);
    return info;
  }

  public async call(method: string, params: any[]): Promise<any> {
    const elapsedSecs = (Date.now() - this.localTimestamp) / 1000;
    const timestamp = this.remoteTimestamp + elapsedSecs;
    const messageId = this.counter++;

    const data = Buffer.from(JSON.stringify({
      id: messageId,
      method,
      params,
    }), "utf8");

    console.log(data.toString("utf8"));

    const request = new RequestMessage({
      data,
      id: this.id,
      timestamp,
      token: this.token,
    });

    const result = await new Promise((resolve, reject) => {
      const token = this.token;

      this.callbacks.set(messageId, (data) => {
        resolve(data.result);
      });

      this.socket.send(request.raw(), this.port, this.address, (err) => {
        if (err) {
          reject(err);
        }
      });
    });

    return result;
  }
}
