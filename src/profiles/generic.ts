import { Accessory, uuid } from "hap-nodejs";
import { Device, IDeviceProfile } from "../device";

export class GenericProfile implements IDeviceProfile {
  public readonly name: string = "Unknown Device";
  public readonly actions: { [index: string]: any } = {};

  public homekit(device: Device<GenericProfile>) {
    return new Accessory(device.profile.name, uuid.generate(device.id.toString(16)));
  }
}
