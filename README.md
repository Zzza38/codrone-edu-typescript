# CoDrone EDU TypeScript

Browser TypeScript API for controlling CoDrone EDU drones through the Web Serial API.

```ts
import { Drone } from "codrone-edu-typescript";

const drone = new Drone();

await drone.connect();
await drone.takeOff();
await drone.control(0, 25, 0, 0);
await new Promise((resolve) => setTimeout(resolve, 500));
await drone.neutral();
await drone.land();
await drone.disconnect();
```

## Web Serial

This package targets browsers that support Web Serial, such as Chromium-based browsers. It opens the controller at `57600` baud by default.

```ts
const drone = new Drone({ baudRate: 57600 });
await drone.connect({
  filters: [{ usbVendorId: 1155 }],
});
```

## Commands

The `Drone` class includes high-level commands:

- `connect()` / `disconnect()`
- `takeOff()`, `land()`, `stop()`, `emergencyStop()`
- `control(roll, pitch, yaw, throttle)`
- `controlPosition({ x, y, z, velocity, heading, rotationalVelocity })`
- `setFlightMode(mode)`, `setHeadless(mode)`, `setControlSpeed(level)`
- `setTrim(roll, pitch, yaw, throttle)`, `clearTrim()`, `clearBias()`
- `setLightManual(...)`, `setLightModeColor(...)`, `buzzerHz(...)`
- `clearDisplay()`, `drawPoint(...)`, `drawLine(...)`, `drawString(...)`
- `request(dataType, target)` and `onPacket(listener)` for telemetry packets

Low-level motor output is exposed as `setMotorSpeeds(...)` and `setMotor(...)`. These methods send raw motor packets and do not provide stabilization, altitude hold, or safety mixing.

## Packet Helpers

The package also exports protocol enums, `makePacket(...)`, `parsePackets(...)`, and `crc16CcittInitial0(...)` for custom integrations.
