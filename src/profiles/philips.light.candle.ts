import { Accessory, Characteristic, Service, uuid } from "hap-nodejs";
import { getState, setBrightness, setPower, togglePower, setPhilipsTemperature } from "../capabilities";
import { Device, IDeviceProfile } from "../device";

export class PhilipsLightCandle implements IDeviceProfile {
  private readonly MIN_TEMP = 3000;
  private readonly MAX_TEMP = 5700;

  public name = "Philips ZhiRui Candle Lamp";
  public actions = {
    getState, togglePower, setPower, setBrightness, setTemperature: setPhilipsTemperature
  };

  public homekit(device: Device<PhilipsLightCandle>): HAPNodeJS.Accessory {
    const accessory = new Accessory(device.profile.name, uuid.generate(device.id.toString(16)));

    accessory
      .getService(Service.AccessoryInformation)
      .setCharacteristic(Characteristic.Manufacturer, "Xiaomi")
      .setCharacteristic(Characteristic.SerialNumber, device.info.uid)
      .setCharacteristic(Characteristic.Model, device.model)
      .setCharacteristic(Characteristic.FirmwareRevision, device.info.fw_ver);

    accessory
      .addService(Service.Lightbulb)
      .getCharacteristic(Characteristic.On)
      .on('get', (callback: any) => {
        device.profile.actions.getState(device, "power")
          .then((result) => {
            if (result[0] === "on") {
              callback(null, true);
            } else if (result[0] === "off") {
              callback(null, false);
            } else {
              callback("fail");
            }
          })
          .catch((err) => {
            console.error(err);
            callback("fail");
          });
      });

    accessory
      .getService(Service.Lightbulb)
      .getCharacteristic(Characteristic.On)
      .on('set', (value: boolean, callback: any) => {
        device.profile.actions.setPower(device, value ? "on" : "off");
        callback(null);
      });

    accessory
      .getService(Service.Lightbulb)
      .addCharacteristic(Characteristic.Brightness)
      .on("get", (callback: any) => {
        device.profile.actions.getState(device, "bright").then((result) => {
          callback(null, result[0]);
        });
      })
      .on("set", (value: any, callback: any) => {
        device.profile.actions.setBrightness(device, value);
        callback(null);
      });

    accessory
      .getService(Service.Lightbulb)
      .addCharacteristic(Characteristic.ColorTemperature)
      .on("get", (callback: any) => {
        device.profile.actions.getState(device, "cct").then((result) => {
          const kelvin = Math.round((result[0] / 100) * (this.MAX_TEMP - this.MIN_TEMP)) + this.MIN_TEMP;
          const mirek = Math.round(1000000 / kelvin);
          callback(null, mirek);
        });
      })
      .on("set", (value: any, callback: any) => {
        const kelvin = Math.round(1000000 / value);
        const actualPercent = Math.round((kelvin - this.MIN_TEMP) / (this.MAX_TEMP - this.MIN_TEMP) * 100);
        const relativePercent = actualPercent > 100 ? 100 : actualPercent < 1 ? 1 : actualPercent;
        device.profile.actions.setTemperature(device, relativePercent);
        callback(null);
      });

    return accessory;
  }
};
