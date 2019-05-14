//@ts-ignore
import { Bridge } from "hap-nodejs/lib/Bridge";
import { Accessory, uuid } from "hap-nodejs";
import * as HAPNodeJS from "hap-nodejs";
import { Discovery } from "./discovery";
import { Device, IDeviceProfile } from "./device";

HAPNodeJS.init();
const bridge = new Bridge("Node Bridge", uuid.generate("Node Bridge"));

bridge.on("identify", (paired: any, callback: any) => {
  console.log("Node Bridge identify");
  callback(); // success
});

const tokens = new Map();
const discovery = new Discovery(tokens);

discovery.on("found", (device: Device<IDeviceProfile>) => {
  bridge.addBridgedAccessory(device.profile.homekit(device));
});

discovery.start();

bridge.publish({
  username: "CC:22:3D:E3:CE:F6",
  port: 51826,
  pincode: "031-45-154",
  category: Accessory.Categories.BRIDGE
}, false);
