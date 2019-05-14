import { DeviceCaller, Device } from "./device";

export async function getState(device: Device<unknown>, ...params: string[]) {
  return await device.call("get_prop", params);
}

export async function togglePower(device: Device<unknown>, ...params: any[]) {
  return await device.call("toggle", []);
}

export async function setPower(device: Device<unknown>, state: "on" | "off", effect: "sudden" | "smooth" = "smooth", duration: number = 500) {
  return await device.call("set_power", [state, effect, duration]);
}

export async function setBrightness(device: Device<unknown>, value: number, effect: "sudden" | "smooth" = "smooth", duration: number = 500) {
  return await device.call("set_bright", [value, effect, duration]);
}

export async function setPhilipsTemperature(device: Device<unknown>, value: number, effect: "sudden" | "smooth" = "smooth", duration: number = 500) {
  return await device.call("set_cct", [value, effect, duration]);
}
