import assert from "node:assert/strict";
import {
  CommandType,
  DataType,
  DeviceType,
  FlightEvent,
  PidController,
  makePacket,
  ColorClassifier,
  mixStabilizedMotorSpeeds,
  parseAltitude,
  parseButton,
  parseJoystick,
  parseRange,
  parsePackets,
  parseState,
} from "../dist/index.js";

function hex(bytes) {
  return [...bytes]
    .map((byte) => byte.toString(16).padStart(2, "0").toUpperCase())
    .join(" ");
}

assert.equal(
  hex(makePacket(DataType.Command, DeviceType.Drone, [CommandType.Stop, 0])),
  "0A 55 11 02 70 10 01 00 80 29",
);

assert.equal(
  hex(makePacket(DataType.Command, DeviceType.Drone, [CommandType.FlightEvent, FlightEvent.TakeOff])),
  "0A 55 11 02 70 10 07 11 36 81",
);

assert.equal(
  hex(makePacket(DataType.Control, DeviceType.Drone, [0, 30, 0, 0])),
  "0A 55 10 04 70 10 00 1E 00 00 D6 E5",
);

assert.equal(
  hex(makePacket(DataType.Motor, DeviceType.Drone, [100, 0, 100, 0, 100, 0, 100, 0])),
  "0A 55 60 08 70 10 64 00 64 00 64 00 64 00 B0 12",
);

assert.deepEqual(
  mixStabilizedMotorSpeeds(1000, { roll: 10, pitch: -20, yaw: 5 }, { minMotor: 900, maxMotor: 1100 }),
  {
    frontRight: 965,
    backRight: 1015,
    backLeft: 1025,
    frontLeft: 995,
  },
);

assert.deepEqual(
  mixStabilizedMotorSpeeds(1000, { roll: -300 }, { minMotor: 900, maxMotor: 1100 }),
  {
    frontRight: 1100,
    backRight: 1100,
    backLeft: 900,
    frontLeft: 900,
  },
);

const pid = new PidController({ kp: 2, ki: 1, kd: 0.5, integralLimit: 3, outputLimit: 10 });
assert.equal(pid.update(4, 1), 10);
assert.equal(pid.update(4, 1), 10);
pid.reset();
assert.equal(pid.update(-1, 1), -3);

const { packets } = parsePackets(makePacket(
  DataType.State,
  DeviceType.Base,
  [1, 2, 0x10, 4, 2, 50, 6, 87],
  DeviceType.Drone,
));

assert.deepEqual(parseState(packets[0]), {
  modeSystem: 1,
  modeFlight: 2,
  modeControlFlight: 0x10,
  modeMovement: 4,
  headless: 2,
  controlSpeed: 50,
  sensorOrientation: 6,
  battery: 87,
});

assert.deepEqual(
  parseAltitude(parsePackets(makePacket(DataType.Altitude, DeviceType.Base, [
    0, 0, 160, 65,
    0, 0, 72, 66,
    0, 0, 128, 63,
    0, 0, 0, 64,
  ], DeviceType.Drone)).packets[0]),
  {
    temperature: 20,
    pressure: 50,
    altitude: 1,
    rangeHeight: 2,
  },
);

assert.deepEqual(
  parseRange(parsePackets(makePacket(DataType.Range, DeviceType.Base, [
    1, 0, 2, 0, 3, 0, 4, 0, 5, 0, 6, 0,
  ], DeviceType.Drone)).packets[0]),
  {
    left: 1,
    front: 2,
    right: 3,
    rear: 4,
    top: 5,
    bottom: 6,
  },
);

assert.deepEqual(
  parseJoystick(parsePackets(makePacket(DataType.Joystick, DeviceType.Base, [
    255, 1, 0x22, 2,
    10, 246, 0x14, 1,
  ], DeviceType.Controller)).packets[0]),
  {
    left: { x: -1, y: 1, direction: 0x22, event: 2 },
    right: { x: 10, y: -10, direction: 0x14, event: 1 },
  },
);

assert.deepEqual(
  parseButton(parsePackets(makePacket(DataType.Button, DeviceType.Base, [0x10, 0, 1], DeviceType.Controller)).packets[0]),
  { button: 0x10, event: 1 },
);

const classifier = new ColorClassifier(1);
classifier.add("red", { r: 255, g: 0, b: 0 });
classifier.add("blue", { r: 0, g: 0, b: 255 });
assert.equal(classifier.predict({ r: 250, g: 5, b: 5 }), "red");
