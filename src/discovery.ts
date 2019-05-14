import * as dgram from "dgram";
import { Device } from "./device";
import { RequestMessage, ResponseMessage } from "./protocol";
import { GenericProfile } from "./profiles/generic";
import { EventEmitter } from "events";

export class Discovery extends EventEmitter {
  private socket: dgram.Socket;
  private devices: Map<number, Device<any>>;
  private tokens: Map<number, string>;
  private broadcast: string = "255.255.255.255";
  private readonly port: number = 54321;

  constructor(tokens: Map<number, string>, broadcast?: string) {
    super();

    this.tokens = tokens;
    this.devices = new Map();

    if(broadcast) {
      this.broadcast = broadcast;
    }

    this.socket = dgram.createSocket("udp4");

    this.socket.on("message", (msg: Buffer, rinfo: dgram.RemoteInfo) => {
      this.processHandshake(msg, rinfo).catch(console.error);
    });
  }

  public async start() {
    await new Promise((resolve, reject) => {
      this.socket.bind(resolve);
    });

    this.socket.setMulticastTTL(3);

    const search = setInterval(() => {
      this.sendBeacon();
    }, 2000);

    setTimeout(() => {
      clearInterval(search);
    }, 10000);
  }

  private async processHandshake(msg: Buffer, rinfo: dgram.RemoteInfo) {
    const response = ResponseMessage.from(msg);
    const id = response.getDeviceId();
    const timestamp = response.getTimestamp();

    if (this.devices.has(id)) {
      this.devices.get(id)!.setTimestamp(timestamp);
      return;
    }

    let device;

    if (this.tokens.has(id)) {
      const token = this.tokens.get(id)!;

      device = new Device({
        address: rinfo.address,
        id,
        port: rinfo.port,
        timestamp,
        token,
      }, new GenericProfile());

      await device.init();
      await device.getInfo();
    } else {
      device = new Device({
        address: rinfo.address,
        id,
        port: rinfo.port,
        timestamp,
        token: "",
      }, new GenericProfile());
    }

    this.emit("found", device);

    console.log(`Found device '${device.profile.name}' (${device.id}) (${device.address})`);

    this.devices.set(id, device);
  }

  private sendBeacon() {
    this.socket.send(new RequestMessage({ handshake: true }).raw(), this.port, this.broadcast, (err) => {
      if(err) {
        console.error(err);
      }
    });
  }
}
