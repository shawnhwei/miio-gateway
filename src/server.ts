//@ts-ignore
import { Bridge } from "hap-nodejs/lib/Bridge";
import { Accessory, uuid } from "hap-nodejs";
import * as HAPNodeJS from "hap-nodejs";

HAPNodeJS.init();

console.log("HAP-NodeJS starting...");

// Start by creating our Bridge which will host all loaded Accessories
var bridge = new Bridge("Node Bridge", uuid.generate("Node Bridge"));

// Listen for bridge identification event
bridge.on("identify", (paired: any, callback: any) => {
  console.log("Node Bridge identify");
  callback(); // success
});

var lock = new Accessory("Lock", uuid.generate("hap-nodejs:accessories:lock"));

lock.on("identify", function (paired: any, callback: any) {
  callback(); // success
});

bridge.addBridgedAccessory(lock);

// Publish the Bridge on the local network.
bridge.publish({
  username: "CC:22:3D:E3:CE:F6",
  port: 51826,
  pincode: "031-45-154",
  category: Accessory.Categories.BRIDGE
}, false);
