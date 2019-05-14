import { PhilipsLightBulb } from "./profiles/philips.light.bulb";
import { PhilipsLightCandle } from "./profiles/philips.light.candle";
import { PhilipsLightCeiling } from "./profiles/philips.light.ceiling";
import { PhilipsLightMoon } from "./profiles/philips.light.moon";
import { PhilipsLightRead } from "./profiles/philips.light.read";
import { YeelightAmbi } from "./profiles/yeelight.ambi";
import { YeelightBasic } from "./profiles/yeelight.basic";
import { YeelightCeiling } from "./profiles/yeelight.ceiling";
import { YeelightColor } from "./profiles/yeelight.color";
import { IDeviceProfile } from "./device";

export const Profiles: { [index: string]: any } = {
  "philips.light.candle": PhilipsLightCandle,
  "philips.light.candle2": PhilipsLightCandle,

  // "philips.light.bulb": PhilipsLightBulb,
  // "philips.light.downlight": PhilipsLightBulb,
  // "philips.light.mono1": PhilipsLightBulb,
  // "philips.light.virtual": PhilipsLightBulb,
  // "philips.light.zysread": PhilipsLightBulb,
  // "philips.light.zystrip": PhilipsLightBulb,

  // "philips.light.ceiling": PhilipsLightCeiling,
  // "philips.light.zyceiling": PhilipsLightCeiling,

  // "philips.light.moonlight": PhilipsLightMoon,

  // "philips.light.sread1": PhilipsLightRead,

  // "yeelink.light.ceiling1": YeelightCeiling,
  // "yeelink.light.ceiling2": YeelightCeiling,
  // "yeelink.light.ceiling3": YeelightCeiling,
  // "yeelink.light.ceiling5": YeelightCeiling,
  // "yeelink.light.ceiling6": YeelightCeiling,
  // "yeelink.light.ceiling7": YeelightCeiling,
  // "yeelink.light.ceiling8": YeelightCeiling,

  // "yeelink.light.ceiling4": YeelightAmbi,
  // "yeelink.light.ceiling4.ambi": YeelightAmbi,

  // "yeelink.light.bslamp1": YeelightColor,
  // "yeelink.light.bslamp2": YeelightColor,
  // "yeelink.light.color1": YeelightColor,
  // "yeelink.light.color2": YeelightColor,
  // "yeelink.light.color3": YeelightColor,
  // "yeelink.light.strip1": YeelightColor,
  // "yeelink.light.strip2": YeelightColor,

  // "yeelink.light.ct2": YeelightBasic,
  // "yeelink.light.lamp1": YeelightBasic,
  // "yeelink.light.lamp2": YeelightBasic,
  // "yeelink.light.lamp3": YeelightBasic,
  // "yeelink.light.mono1": YeelightBasic,
  // "yeelink.light.mono2": YeelightBasic,
  // "yeelink.light.virtual": YeelightBasic,
};
