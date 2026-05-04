import assert from "node:assert/strict";
import { DataType, DeviceType, CommandType, FlightEvent, makePacket } from "../dist/index.js";

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
