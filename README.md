# CoDrone EDU TypeScript

Browser TypeScript API for controlling CoDrone EDU drones with the Web Serial API.

This package exposes:

- A `Drone` class for connecting to the controller, sending flight commands, reading telemetry, controlling LEDs, using the buzzer, vibrating the controller, and drawing on the controller display.
- Packet helpers for building and parsing CoDrone protocol packets.
- Typed parsers for common telemetry packets.
- A small custom stabilization loop for experiments that write raw motor output from browser-side PID controllers.
- A simple k-nearest-neighbor `ColorClassifier` for card/color sensor experiments.

## Requirements

- A browser with Web Serial support, such as desktop Chrome or Edge.
- A secure context. `https://` is required on normal origins; `http://localhost` is allowed for local development.
- A CoDrone EDU controller connected over USB.
- User interaction before `connect()`, because browsers only allow `navigator.serial.requestPort()` from a user gesture such as a button click.

The default serial baud rate is `57600`.

## Installation

```sh
pnpm add codrone-edu-typescript
```

Or with npm:

```sh
npm install codrone-edu-typescript
```

## Quick Start

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

## Connecting

```ts
import { Drone } from "codrone-edu-typescript";

if (!Drone.isSupported()) {
  throw new Error("This browser does not support Web Serial.");
}

const drone = new Drone({
  baudRate: 57600,
});

await drone.connect({
  filters: [{ usbVendorId: 1155 }],
});
```

### `new Drone(options?)`

```ts
interface DroneOptions {
  port?: CoDroneSerialPort;
  baudRate?: number;
  serial?: CoDroneSerial;
  from?: DeviceType;
}
```

- `port`: Existing serial port object. Useful for tests or advanced integrations.
- `baudRate`: Serial baud rate. Defaults to `57600`.
- `serial`: Custom serial provider. Defaults to `navigator.serial`.
- `from`: Protocol sender device type. Defaults to `DeviceType.Base`.

### Connection Methods

| Method | Description |
| --- | --- |
| `Drone.isSupported()` | Returns `true` when `navigator.serial` exists. |
| `connect(requestOptions?)` | Requests or opens a serial port, opens it at the configured baud rate, and starts the read loop. |
| `disconnect()` | Cancels reading, releases reader/writer locks, and closes the port. |
| `connected` | Boolean getter that is `true` when a writer is available. |
| `onPacket(listener)` | Subscribes to parsed incoming packets. Returns an unsubscribe function. |

### Serial Types

These exported types mirror the Web Serial pieces used by the library. They are useful for tests, mocks, and custom serial implementations.

```ts
type Bytes = Uint8Array<ArrayBufferLike>;

interface CoDroneSerialPort {
  readonly readable: ReadableStream<Bytes> | null;
  readonly writable: WritableStream<Bytes> | null;
  open(options: SerialOptions): Promise<void>;
  close(): Promise<void>;
}

interface CoDroneSerial {
  requestPort(options?: SerialPortRequestOptions): Promise<CoDroneSerialPort>;
  getPorts(): Promise<CoDroneSerialPort[]>;
}

interface SerialOptions {
  baudRate: number;
  dataBits?: 7 | 8;
  stopBits?: 1 | 2;
  parity?: "none" | "even" | "odd";
  bufferSize?: number;
  flowControl?: "none" | "hardware";
}

interface SerialPortFilter {
  usbVendorId?: number;
  usbProductId?: number;
  bluetoothServiceClassId?: string;
}

interface SerialPortRequestOptions {
  filters?: SerialPortFilter[];
  allowedBluetoothServiceClassIds?: string[];
}
```

## Flight Commands

All methods return `Promise<void>` unless otherwise noted.

```ts
await drone.takeOff();
await drone.control(0, 30, 0, 0);
await drone.neutral();
await drone.land();
```

| Method | Description |
| --- | --- |
| `takeOff()` | Sends `FlightEvent.TakeOff`. |
| `land()` | Sends `FlightEvent.Landing`. |
| `stop()` | Sends `CommandType.Stop`. |
| `emergencyStop()` | Sends `FlightEvent.Stop`, then `CommandType.Stop`. |
| `resetHeading()` | Resets the drone heading. |
| `flip(direction)` | Flips in `"front"`, `"rear"`, `"left"`, or `"right"` direction. |
| `flightEvent(event)` | Sends any `FlightEvent` value. |
| `control(roll, pitch, yaw, throttle)` | Sends direct control values. Each channel must be an integer from `-128` to `127`. |
| `neutral()` | Sends `control(0, 0, 0, 0)`. |
| `controlPosition(options)` | Sends position control values. |

### Control Axes

`control(roll, pitch, yaw, throttle)` uses signed 8-bit channel values:

- `roll`: Negative and positive lateral movement.
- `pitch`: Negative and positive forward/back movement.
- `yaw`: Negative and positive rotation.
- `throttle`: Negative and positive vertical power.

The method validates every value and throws `RangeError` when a channel is outside `-128..127`.

### Position Control

```ts
await drone.controlPosition({
  x: 0.5,
  y: 0,
  z: 1,
  velocity: 0.5,
  heading: 0,
  rotationalVelocity: 30,
});
```

```ts
interface ControlPositionOptions {
  x: number;
  y: number;
  z: number;
  velocity: number;
  heading: number;
  rotationalVelocity: number;
}
```

`x`, `y`, `z`, and `velocity` are sent as little-endian 32-bit floats. `heading` and `rotationalVelocity` are signed 16-bit integers.

## Flight Configuration

| Method | Description |
| --- | --- |
| `setFlightMode(mode)` | Sends `CommandType.ModeControlFlight`. |
| `setHeadless(mode)` | Accepts `HeadlessMode` or boolean. `true` enables headless mode; `false` sets normal mode. |
| `setControlSpeed(level)` | Sends control speed as one byte, `0..255`. |
| `speedChange(level)` | Alias for `setControlSpeed(level)`. |
| `clearBias()` | Sends `CommandType.ClearBias`. |
| `clearTrim()` | Sends `CommandType.ClearTrim`. |
| `setTrim(roll, pitch, yaw, throttle)` | Sends signed 16-bit trim values. |
| `setWeight(grams)` | Sends weight as a 32-bit float. |
| `setLostConnection(timeNeutral, timeLanding, timeStop)` | Configures lost-connection timing. Neutral and landing are unsigned 16-bit values; stop is unsigned 32-bit. |

## Telemetry

Telemetry helpers request a packet and parse the first matching response. They accept an optional timeout in milliseconds and default to `500`.

```ts
const battery = await drone.getBattery();
const attitude = await drone.getAttitude(1000);
const range = await drone.getRange();

console.log({ battery, attitude, front: range.front });
```

| Method | Returns |
| --- | --- |
| `requestPacket(dataType, target?, timeoutMs?)` | `ReceivedPacket` |
| `getState(timeoutMs?)` | `DroneState` |
| `getBattery(timeoutMs?)` | `number` |
| `getSystemState(timeoutMs?)` | `number` |
| `getFlightState(timeoutMs?)` | `number` |
| `getMovementState(timeoutMs?)` | `number` |
| `getControlSpeed(timeoutMs?)` | `number` |
| `getAttitude(timeoutMs?)` | `Attitude` |
| `getPosition(timeoutMs?)` | `Position` |
| `getAltitude(timeoutMs?)` | `Altitude` |
| `getPressure(timeoutMs?)` | `number` |
| `getTemperature(timeoutMs?)` | `number` |
| `getHeight(timeoutMs?)` | `number` |
| `getMotion(timeoutMs?)` | `Motion` |
| `getRawMotion(timeoutMs?)` | `RawMotion` |
| `getRange(timeoutMs?)` | `RangeSensor` |
| `getFrontRange(timeoutMs?)` | `number` |
| `getBottomRange(timeoutMs?)` | `number` |
| `getFlow(timeoutMs?)` | `Flow` |
| `getRawFlow(timeoutMs?)` | `RawFlow` |
| `getTrim(timeoutMs?)` | `Trim` |
| `getCount(timeoutMs?)` | `Count` |
| `getJoystick(timeoutMs?)` | `Joystick` from `DeviceType.Controller` |
| `getButton(timeoutMs?)` | `Button` from `DeviceType.Controller` |
| `getCardRaw(timeoutMs?)` | `CardRaw` |
| `getCardColor(timeoutMs?)` | `CardColor` |

### Telemetry Types

```ts
interface DroneState {
  modeSystem: number;
  modeFlight: number;
  modeControlFlight: ModeControlFlight | number;
  modeMovement: number;
  headless: HeadlessMode | number;
  controlSpeed: number;
  sensorOrientation: number;
  battery: number;
}

interface Attitude {
  roll: number;
  pitch: number;
  yaw: number;
}

interface Position {
  x: number;
  y: number;
  z: number;
}

interface Altitude {
  temperature: number;
  pressure: number;
  altitude: number;
  rangeHeight: number;
}

interface Motion {
  accelX: number;
  accelY: number;
  accelZ: number;
  gyroRoll: number;
  gyroPitch: number;
  gyroYaw: number;
  angleRoll: number;
  anglePitch: number;
  angleYaw: number;
}

interface RawMotion {
  accelX: number;
  accelY: number;
  accelZ: number;
  gyroRoll: number;
  gyroPitch: number;
  gyroYaw: number;
}

interface RangeSensor {
  left: number;
  front: number;
  right: number;
  rear: number;
  top: number;
  bottom: number;
}

interface Flow {
  x: number;
  y: number;
  z: number;
}

interface RawFlow {
  x: number;
  y: number;
}

interface Trim {
  roll: number;
  pitch: number;
  yaw: number;
  throttle: number;
}

interface Count {
  timeSystem: number;
  timeFlight: number;
  countTakeOff: number;
  countLanding: number;
  countAccident: number;
}

interface Button {
  button: number;
  event: ButtonEvent | number;
}

interface JoystickBlock {
  x: number;
  y: number;
  direction: JoystickDirection | number;
  event: JoystickEvent | number;
}

interface Joystick {
  left: JoystickBlock;
  right: JoystickBlock;
}

interface CardRaw {
  front: Rgb16;
  rear: Rgb16;
}

interface CardColor {
  front: Hsvl & { color: number };
  rear: Hsvl & { color: number };
  card: number;
}
```

## Raw Sending and Packet Access

For integrations that need direct protocol access:

```ts
import { DataType, DeviceType, makePacket } from "codrone-edu-typescript";

const packet = makePacket(DataType.Request, DeviceType.Drone, [DataType.State]);
await drone.send(packet);
```

| Method | Description |
| --- | --- |
| `send(bytes)` | Writes raw bytes to the serial writer. Throws when not connected. |
| `sendPacket(dataType, to, payload?)` | Builds and sends a protocol packet using the drone instance's `from` device type. |
| `command(commandType, option?, to?)` | Sends a command packet. Defaults to `DeviceType.Drone`. |
| `request(dataType, target?)` | Sends a request packet. Defaults to `DeviceType.Drone`. |
| `ping(target?, time?)` | Sends a ping with an unsigned 64-bit timestamp derived from `Date.now()` by default. |

## Packet Helpers

```ts
import {
  DataType,
  DeviceType,
  crc16CcittInitial0,
  makePacket,
  parsePackets,
  parseState,
} from "codrone-edu-typescript";

const bytes = makePacket(DataType.Request, DeviceType.Drone, [DataType.State]);
const crc = crc16CcittInitial0(bytes.slice(2, -2));
const { packets, remainder } = parsePackets(receivedBytes);

for (const packet of packets) {
  if (packet.dataType === DataType.State) {
    console.log(parseState(packet).battery);
  }
}
```

| Helper | Description |
| --- | --- |
| `crc16CcittInitial0(bytes)` | Computes CRC-16/CCITT with initial value `0`. |
| `makePacket(dataType, to, payload?, from?)` | Builds a packet with start bytes `0A 55`, a 4-byte header, payload, and little-endian CRC. Defaults `from` to `DeviceType.Base`. |
| `parsePackets(buffer)` | Scans a byte buffer, validates CRCs, returns complete packets plus trailing `remainder`. Invalid packets are skipped. |

```ts
interface ReceivedPacket {
  dataType: DataType | number;
  length: number;
  from: DeviceType | number;
  to: DeviceType | number;
  payload: Uint8Array;
  crc: number;
  raw: Uint8Array;
}
```

### Parser Helpers

Parser helpers validate the packet data type and exact payload length. They throw an `Error` if the packet does not match the expected shape.

| Parser | Expected `DataType` | Payload bytes | Returns |
| --- | --- | ---: | --- |
| `parseState(packet)` | `State` | 8 | `DroneState` |
| `parseAttitude(packet)` | `Attitude` | 6 | `Attitude` |
| `parsePosition(packet)` | `Position` | 12 | `Position` |
| `parseAltitude(packet)` | `Altitude` | 16 | `Altitude` |
| `parseMotion(packet)` | `Motion` | 18 | `Motion` |
| `parseRawMotion(packet)` | `RawMotion` | 12 | `RawMotion` |
| `parseRange(packet)` | `Range` | 12 | `RangeSensor` |
| `parseFlow(packet)` | `Flow` | 12 | `Flow` |
| `parseRawFlow(packet)` | `RawFlow` | 8 | `RawFlow` |
| `parseTrim(packet)` | `Trim` | 8 | `Trim` |
| `parseCount(packet)` | `Count` | 14 | `Count` |
| `parseButton(packet)` | `Button` | 3 | `Button` |
| `parseJoystick(packet)` | `Joystick` | 8 | `Joystick` |
| `parseCardRaw(packet)` | `CardRaw` | 12 | `CardRaw` |
| `parseCardColor(packet)` | `CardColor` | 19 | `CardColor` |

## Motors and Custom Stabilization

`setMotorSpeeds()` and `setMotor()` send raw motor packets. These bypass the normal high-level flight control commands and do not provide stabilization, altitude hold, or safety mixing.

Use extreme care. For tuning and experiments, remove propellers or physically secure the drone until signs, motor order, and gains are known to be safe.

```ts
await drone.setMotorSpeeds({
  frontRight: 1000,
  backRight: 1000,
  backLeft: 1000,
  frontLeft: 1000,
});

await drone.setMotor(0, 1000);
```

### Motor Methods

| Method | Description |
| --- | --- |
| `setMotorSpeeds(speeds)` | Sends four unsigned 16-bit motor values in `frontRight`, `backRight`, `backLeft`, `frontLeft` order. |
| `setMotor(target, value)` | Sends one motor target byte and one unsigned 16-bit value. |

```ts
interface MotorSpeeds {
  frontRight: number;
  backRight: number;
  backLeft: number;
  frontLeft: number;
}
```

### Custom Stabilizer

```ts
const stabilizer = drone.startCustomStabilization({
  baseThrottle: 1200,
  minMotor: 0,
  maxMotor: 2000,
  maxMotorStep: 25,
  rateHz: 50,
  attitudeScale: 1,
  target: { roll: 0, pitch: 0, yaw: 0 },
  gains: {
    roll: { kp: 4, ki: 0, kd: 1, outputLimit: 250 },
    pitch: { kp: 4, ki: 0, kd: 1, outputLimit: 250 },
    yaw: { kp: 0, ki: 0, kd: 0, outputLimit: 0 },
  },
});

const unsubscribeSnapshot = stabilizer.onSnapshot((snapshot) => {
  console.log(snapshot.attitude, snapshot.corrections, snapshot.motorSpeeds);
});

const unsubscribeLog = stabilizer.onLog((entry) => {
  console.log(entry.level, entry.message, entry.data);
});

stabilizer.setBaseThrottle(1300);
stabilizer.setTarget({ roll: 2 });
stabilizer.setGains({ roll: { kp: 3, kd: 0.8, outputLimit: 180 } });

unsubscribeSnapshot();
unsubscribeLog();
await stabilizer.stop();
```

| Drone Method | Description |
| --- | --- |
| `createCustomStabilizer(options)` | Creates a `CustomStabilizer` without starting it. |
| `startCustomStabilization(options)` | Creates, starts, and returns a `CustomStabilizer`. |

| CustomStabilizer Method or Property | Description |
| --- | --- |
| `running` | Boolean getter that indicates whether the timer is active. |
| `snapshot` | Last `CustomStabilizationSnapshot`, if one exists. |
| `start()` | Starts listening for attitude packets and writing motor packets at `rateHz`. Requires the drone to be connected. |
| `stop()` | Stops the timer, unsubscribes from packets, resets controllers, and optionally zeros motors. |
| `reset()` | Resets PID state and motor step history. |
| `setTarget(target)` | Updates one or more target axes. |
| `setBaseThrottle(baseThrottle)` | Updates base throttle. |
| `setMotorLimits(minMotor, maxMotor)` | Updates motor output clamp. |
| `setGains(gains)` | Updates roll, pitch, and/or yaw gains and resets changed PID controllers. |
| `onSnapshot(listener)` | Subscribes to stabilization snapshots. Returns an unsubscribe function. |
| `onLog(listener)` | Subscribes to diagnostic log entries. Returns an unsubscribe function. |

```ts
interface CustomStabilizationOptions {
  baseThrottle: number;
  gains: StabilizationGains;
  target?: Partial<StabilizationAxisValues>;
  minMotor?: number;
  maxMotor?: number;
  maxMotorStep?: number;
  rateHz?: number;
  attitudeScale?: number;
  staleAttitudeMs?: number;
  requestAttitude?: boolean;
  zeroMotorsOnStop?: boolean;
  mixer?: MotorMix;
}
```

Defaults:

| Option | Default |
| --- | --- |
| `minMotor` | `0` |
| `maxMotor` | `0xffff` |
| `maxMotorStep` | `Number.POSITIVE_INFINITY` |
| `rateHz` | `50` |
| `attitudeScale` | `1` |
| `staleAttitudeMs` | `250` |
| `requestAttitude` | `true` |
| `zeroMotorsOnStop` | `true` |
| `mixer` | `DEFAULT_CUSTOM_STABILIZATION_MIXER` |

### PID and Mixer Helpers

```ts
import {
  PidController,
  mixStabilizedMotorSpeeds,
} from "codrone-edu-typescript";

const pid = new PidController({ kp: 2, ki: 0.1, kd: 0.5, outputLimit: 100 });
const correction = pid.update(5, 0.02);

const speeds = mixStabilizedMotorSpeeds(1200, { roll: correction }, {
  minMotor: 0,
  maxMotor: 2000,
});
```

| Export | Description |
| --- | --- |
| `PidController` | PID controller with `update(error, dt)` and `reset()`. |
| `mixStabilizedMotorSpeeds(baseThrottle, corrections?, options?)` | Mixes roll, pitch, and yaw corrections into four motor speeds and clamps to motor limits. |
| `DEFAULT_CUSTOM_STABILIZATION_MIXER` | Default motor mixer in `frontRight`, `backRight`, `backLeft`, `frontLeft` order. |

```ts
interface PidGains {
  kp: number;
  ki?: number;
  kd?: number;
  integralLimit?: number;
  outputLimit?: number;
}

interface StabilizationAxisValues {
  roll: number;
  pitch: number;
  yaw: number;
}

interface StabilizationGains {
  roll: PidGains;
  pitch: PidGains;
  yaw?: PidGains;
}

interface MotorCorrections {
  roll?: number;
  pitch?: number;
  yaw?: number;
}

interface MotorMix {
  frontRight: StabilizationAxisValues;
  backRight: StabilizationAxisValues;
  backLeft: StabilizationAxisValues;
  frontLeft: StabilizationAxisValues;
}
```

## Lights

```ts
await drone.setDroneLed(255, 0, 0);
await drone.setControllerLed(0, 0, 255, 128);
await drone.droneLedOff();
```

| Method | Description |
| --- | --- |
| `setLightManual(flags, brightness, target?)` | Sends manual light flags and brightness. Defaults to the drone. |
| `setLightModeColor(mode, interval, color, target?)` | Sends a light mode with RGB color. |
| `setLightEventColor(event, interval, repeat, color, target?)` | Sends a light event with RGB color. |
| `setLightEventPreset(event, interval, repeat, color, target?)` | Sends a light event with preset color byte. |
| `setLightDefaultColor(mode, interval, color, target?)` | Sets default RGB light behavior. |
| `setLightModePreset(mode, interval, color, target?)` | Sends a light mode with preset color byte. |
| `setDroneLed(r, g, b, brightness?)` | Convenience method for setting drone RGB LEDs. |
| `setControllerLed(r, g, b, brightness?)` | Convenience method for setting controller RGB LEDs. |
| `setDroneLedMode(r, g, b, mode, interval)` | Convenience method for drone LED mode. |
| `setControllerLedMode(r, g, b, mode, interval)` | Convenience method for controller LED mode. |
| `droneLedOff()` | Turns drone LED brightness off. |
| `controllerLedOff()` | Turns controller LED brightness off. |

```ts
interface Rgb {
  r: number;
  g: number;
  b: number;
}
```

RGB channels, brightness, mode, repeat, and preset color values are bytes from `0..255`. Intervals are unsigned 16-bit integers.

## Buzzer and Vibration

```ts
await drone.controllerBuzzerHz(880, 250);
await drone.buzzerMute(100);
await drone.stopBuzzer();
await drone.vibrate(100, 50, 500);
```

| Method | Description |
| --- | --- |
| `buzzerHz(hz, durationMs, target?)` | Plays a frequency immediately. Defaults to controller. |
| `buzzerHzReserve(hz, durationMs, target?)` | Queues a frequency. |
| `buzzerScale(scale, durationMs, target?)` | Plays a scale value immediately. |
| `buzzerScaleReserve(scale, durationMs, target?)` | Queues a scale value. |
| `buzzerMute(durationMs, target?)` | Mutes immediately for a duration. |
| `buzzerMuteReserve(durationMs, target?)` | Queues a mute duration. |
| `stopBuzzer(target?)` | Stops buzzer output. |
| `droneBuzzerHz(hz, durationMs)` | Plays a frequency on the drone. |
| `controllerBuzzerHz(hz, durationMs)` | Plays a frequency on the controller. |
| `buzzer(mode, value, durationMs, target?)` | Low-level buzzer packet sender. |
| `vibrate(onMs, offMs, totalMs, mode?)` | Sends a controller vibrator packet. Default mode is `1`. |

## Controller Display

Display methods target the controller.

```ts
await drone.clearDisplay();
await drone.drawString(0, 0, "READY");
await drone.drawLine(0, 12, 80, 12);
await drone.drawRect(2, 18, 40, 20, DisplayPixel.White, false);
await drone.drawCircle(64, 28, 10, DisplayPixel.White, true);
```

| Method | Description |
| --- | --- |
| `clearDisplay(pixel?)` | Clears the whole display. Defaults to `DisplayPixel.Black`. |
| `clearDisplayRegion(x, y, width, height, pixel?)` | Clears a rectangular region. Defaults to `DisplayPixel.White`. |
| `invertDisplay(x, y, width, height)` | Inverts a rectangular region. |
| `drawPoint(x, y, pixel?)` | Draws one point. |
| `drawLine(x1, y1, x2, y2, pixel?, line?)` | Draws a line. |
| `drawRect(x, y, width, height, pixel?, fill?, line?)` | Draws a rectangle. |
| `drawCircle(x, y, radius, pixel?, fill?)` | Draws a circle. |
| `drawImage(x, y, width, height, image)` | Draws raw image bytes. |
| `drawString(x, y, text, font?, pixel?)` | Draws ASCII text. |
| `drawStringAlign(xStart, xEnd, y, align, text, font?, pixel?)` | Draws aligned ASCII text. |

Display strings must contain ASCII characters only. Non-ASCII characters throw `RangeError`.

## Color Classifier

`ColorClassifier` is a simple k-nearest-neighbor classifier for sensor values. It compares numeric keys that exist in both the input and stored sample.

```ts
import { ColorClassifier } from "codrone-edu-typescript";

const classifier = new ColorClassifier(3);
classifier.add("red", { r: 255, g: 0, b: 0 });
classifier.add("blue", { r: 0, g: 0, b: 255 });

console.log(classifier.predict({ r: 250, g: 5, b: 5 })); // "red"
```

| Method | Description |
| --- | --- |
| `new ColorClassifier(k?)` | Creates a classifier. Defaults to `k = 9`. |
| `reset()` | Removes all samples. |
| `fit(samples)` | Replaces all samples. |
| `add(label, values)` | Adds one labeled sample. |
| `predict(values)` | Returns the winning label, or `undefined` when there are no samples. |

```ts
interface ColorSample {
  label: string;
  values: Record<string, number>;
}

interface Rgb16 {
  r: number;
  g: number;
  b: number;
}

interface Hsvl {
  h: number;
  s: number;
  v: number;
  l: number;
}
```

## Exported Enums

The package exports protocol enums for commands, devices, telemetry, controls, display drawing, controller input, buzzer, and vibration.

### `DataType`

| Name | Value |
| --- | ---: |
| `None` | `0x00` |
| `Ping` | `0x01` |
| `Ack` | `0x02` |
| `Error` | `0x03` |
| `Request` | `0x04` |
| `Message` | `0x05` |
| `Address` | `0x06` |
| `Information` | `0x07` |
| `Update` | `0x08` |
| `UpdateLocation` | `0x09` |
| `Encrypt` | `0x0a` |
| `SystemCount` | `0x0b` |
| `SystemInformation` | `0x0c` |
| `Registration` | `0x0d` |
| `Administrator` | `0x0e` |
| `Monitor` | `0x0f` |
| `Control` | `0x10` |
| `Command` | `0x11` |
| `Pairing` | `0x12` |
| `Rssi` | `0x13` |
| `TimeSync` | `0x14` |
| `TransmissionPower` | `0x15` |
| `Configuration` | `0x16` |
| `Echo` | `0x17` |
| `CpuID` | `0x1e` |
| `Battle` | `0x1f` |
| `LightManual` | `0x20` |
| `LightMode` | `0x21` |
| `LightEvent` | `0x22` |
| `LightDefault` | `0x23` |
| `RawMotion` | `0x30` |
| `RawFlow` | `0x31` |
| `State` | `0x40` |
| `Attitude` | `0x41` |
| `Position` | `0x42` |
| `Altitude` | `0x43` |
| `Motion` | `0x44` |
| `Range` | `0x45` |
| `Flow` | `0x46` |
| `Count` | `0x50` |
| `Bias` | `0x51` |
| `Trim` | `0x52` |
| `Weight` | `0x53` |
| `LostConnection` | `0x54` |
| `Motor` | `0x60` |
| `MotorSingle` | `0x61` |
| `Buzzer` | `0x62` |
| `Vibrator` | `0x63` |
| `Button` | `0x70` |
| `Joystick` | `0x71` |
| `DisplayClear` | `0x80` |
| `DisplayInvert` | `0x81` |
| `DisplayDrawPoint` | `0x82` |
| `DisplayDrawLine` | `0x83` |
| `DisplayDrawRect` | `0x84` |
| `DisplayDrawCircle` | `0x85` |
| `DisplayDrawString` | `0x86` |
| `DisplayDrawStringAlign` | `0x87` |
| `DisplayDrawImage` | `0x88` |
| `CardClassify` | `0x90` |
| `CardRange` | `0x91` |
| `CardRaw` | `0x92` |
| `CardColor` | `0x93` |
| `CardList` | `0x94` |
| `CardFunctionList` | `0x95` |
| `InformationAssembledForController` | `0xa0` |
| `InformationAssembledForEntry` | `0xa1` |
| `InformationAssembledForByBlocks` | `0xa2` |
| `NavigationTarget` | `0xd0` |
| `NavigationLocation` | `0xd1` |
| `NavigationMonitor` | `0xd2` |
| `NavigationHeading` | `0xd3` |
| `NavigationCounter` | `0xd4` |
| `NavigationSatellite` | `0xd5` |
| `NavigationLocationAdjust` | `0xd6` |
| `NavigationTargetEcef` | `0xd8` |
| `NavigationLocationEcef` | `0xd9` |
| `GpsRtkNavigationState` | `0xda` |
| `GpsRtkExtendedRawMeasurementData` | `0xdb` |
| `EndOfType` | `0xdc` |

### `DeviceType`

| Name | Value |
| --- | ---: |
| `None` | `0x00` |
| `Drone` | `0x10` |
| `Controller` | `0x20` |
| `Link` | `0x30` |
| `Base` | `0x70` |
| `ByBlocks` | `0x80` |
| `Scratch` | `0x81` |
| `Entry` | `0x82` |
| `Tester` | `0xa0` |
| `Monitor` | `0xa1` |
| `Updater` | `0xa2` |
| `Encrypter` | `0xa3` |
| `Whispering` | `0xfe` |
| `Broadcasting` | `0xff` |

### `CommandType`

| Name | Value |
| --- | ---: |
| `None` | `0x00` |
| `Stop` | `0x01` |
| `ModeControlFlight` | `0x02` |
| `Headless` | `0x03` |
| `ControlSpeed` | `0x04` |
| `ClearBias` | `0x05` |
| `ClearTrim` | `0x06` |
| `FlightEvent` | `0x07` |
| `SetDefault` | `0x08` |
| `Backlight` | `0x09` |
| `ModeController` | `0x0a` |
| `Link` | `0x0b` |
| `ClearCounter` | `0xa0` |
| `NavigationTargetClear` | `0xe0` |
| `NavigationStart` | `0xe1` |
| `NavigationPause` | `0xe2` |
| `NavigationRestart` | `0xe3` |
| `NavigationStop` | `0xe4` |
| `NavigationNext` | `0xe5` |
| `NavigationReturnToHome` | `0xe6` |
| `GpsRtkBase` | `0xea` |
| `GpsRtkRover` | `0xeb` |
| `EndOfType` | `0xec` |

### `FlightEvent`

| Name | Value |
| --- | ---: |
| `Stop` | `0x10` |
| `TakeOff` | `0x11` |
| `Landing` | `0x12` |
| `Reverse` | `0x13` |
| `FlipFront` | `0x14` |
| `FlipRear` | `0x15` |
| `FlipLeft` | `0x16` |
| `FlipRight` | `0x17` |
| `Return` | `0x18` |
| `Shot` | `0x90` |
| `UnderAttack` | `0x91` |
| `ResetHeading` | `0xa0` |

### Other Small Enums

```ts
enum ModeControlFlight {
  Attitude = 0x10,
  Position = 0x11,
  Manual = 0x12,
  Rate = 0x13,
  Function = 0x14,
}

enum HeadlessMode {
  Headless = 0x01,
  Normal = 0x02,
}

enum BuzzerMode {
  Stop = 0x00,
  Mute = 0x01,
  MuteReserve = 0x02,
  Scale = 0x03,
  ScaleReserve = 0x04,
  Hz = 0x05,
  HzReserve = 0x06,
  EndOfType = 0x07,
}

enum VibratorMode {
  Stop = 0x00,
  Instantly = 0x01,
  Continually = 0x02,
  EndOfType = 0x03,
}

enum ButtonEvent {
  None = 0x00,
  Down = 0x01,
  Press = 0x02,
  Up = 0x03,
  EndContinuePress = 0x04,
}

enum ButtonFlagController {
  None = 0x0000,
  FrontLeftTop = 0x0001,
  FrontLeftBottom = 0x0002,
  FrontRightTop = 0x0004,
  FrontRightBottom = 0x0008,
  TopLeft = 0x0010,
  TopRight = 0x0020,
  MidUp = 0x0040,
  MidLeft = 0x0080,
  MidRight = 0x0100,
  MidDown = 0x0200,
  BottomLeft = 0x0400,
  BottomRight = 0x0800,
}

enum JoystickDirection {
  None = 0x00,
  VT = 0x10,
  VM = 0x20,
  VB = 0x40,
  HL = 0x01,
  HM = 0x02,
  HR = 0x04,
  TL = 0x11,
  TM = 0x12,
  TR = 0x14,
  ML = 0x21,
  CN = 0x22,
  MR = 0x24,
  BL = 0x41,
  BM = 0x42,
  BR = 0x44,
}

enum JoystickEvent {
  None = 0x00,
  In = 0x01,
  Stay = 0x02,
  Out = 0x03,
  EndOfType = 0x04,
}

enum DisplayPixel {
  Black = 0x00,
  White = 0x01,
  Inverse = 0x02,
  Outline = 0x03,
}

enum DisplayFont {
  LiberationMono5x8 = 0x00,
  LiberationMono10x16 = 0x01,
}

enum DisplayAlign {
  Left = 0x00,
  Center = 0x01,
  Right = 0x02,
}

enum DisplayLine {
  Solid = 0x00,
  Dotted = 0x01,
  Dashed = 0x02,
}
```

## Error Handling and Validation

The API validates packet-sized numeric fields before sending:

- Byte fields must be integers from `0..255`.
- Signed 8-bit fields must be integers from `-128..127`.
- Unsigned 16-bit fields must be integers from `0..65535`.
- Signed 16-bit fields must be integers from `-32768..32767`.
- Unsigned 32-bit fields must be integers from `0..4294967295`.
- Display strings must be ASCII.
- Custom stabilization `rateHz` must be greater than `0`.
- `minMotor` must be less than or equal to `maxMotor`.

Most validation failures throw `RangeError`. Telemetry parser mismatches throw `Error`.

## Development

```sh
pnpm install
pnpm run build
pnpm run check
pnpm test
```

The package is TypeScript-first and emits ESM JavaScript and declarations to `dist/`.

## Safety

Drones can cause injury or property damage. Test new code with propellers removed whenever possible, keep a clear flight area, and always have a way to call `land()` or `emergencyStop()`.
