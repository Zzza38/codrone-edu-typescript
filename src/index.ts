const START_BYTES = [0x0a, 0x55] as const;
const DEFAULT_BAUD_RATE = 57_600;

export type Bytes = Uint8Array<ArrayBufferLike>;

export interface CoDroneSerialPort {
  readonly readable: ReadableStream<Bytes> | null;
  readonly writable: WritableStream<Bytes> | null;
  open(options: SerialOptions): Promise<void>;
  close(): Promise<void>;
}

export interface CoDroneSerial {
  requestPort(options?: SerialPortRequestOptions): Promise<CoDroneSerialPort>;
  getPorts(): Promise<CoDroneSerialPort[]>;
}

export interface SerialOptions {
  baudRate: number;
  dataBits?: 7 | 8;
  stopBits?: 1 | 2;
  parity?: "none" | "even" | "odd";
  bufferSize?: number;
  flowControl?: "none" | "hardware";
}

export interface SerialPortFilter {
  usbVendorId?: number;
  usbProductId?: number;
  bluetoothServiceClassId?: string;
}

export interface SerialPortRequestOptions {
  filters?: SerialPortFilter[];
  allowedBluetoothServiceClassIds?: string[];
}

declare global {
  interface Navigator {
    serial?: CoDroneSerial;
  }
}

export enum DeviceType {
  None = 0x00,
  Drone = 0x10,
  Controller = 0x20,
  Link = 0x30,
  Base = 0x70,
  Tester = 0xa0,
  Broadcasting = 0xff,
}

export enum DataType {
  Ping = 0x01,
  Request = 0x04,
  Control = 0x10,
  Command = 0x11,
  LightManual = 0x20,
  LightMode = 0x21,
  LightEvent = 0x22,
  LightDefault = 0x23,
  State = 0x40,
  Attitude = 0x41,
  Position = 0x42,
  Altitude = 0x43,
  Motion = 0x44,
  Range = 0x45,
  Trim = 0x52,
  Weight = 0x53,
  LostConnection = 0x54,
  Motor = 0x60,
  MotorSingle = 0x61,
  Buzzer = 0x62,
  Vibrator = 0x63,
  Button = 0x70,
  Joystick = 0x71,
  DisplayClear = 0x80,
  DisplayInvert = 0x81,
  DisplayDrawPoint = 0x82,
  DisplayDrawLine = 0x83,
  DisplayDrawRect = 0x84,
  DisplayDrawCircle = 0x85,
  DisplayDrawString = 0x86,
  DisplayDrawStringAlign = 0x87,
}

export enum CommandType {
  Stop = 0x01,
  ModeControlFlight = 0x02,
  Headless = 0x03,
  ControlSpeed = 0x04,
  ClearBias = 0x05,
  ClearTrim = 0x06,
  FlightEvent = 0x07,
  SetDefault = 0x08,
  Backlight = 0x09,
  ModeController = 0x0a,
}

export enum FlightEvent {
  Stop = 0x10,
  TakeOff = 0x11,
  Landing = 0x12,
  Reverse = 0x13,
  FlipFront = 0x14,
  FlipRear = 0x15,
  FlipLeft = 0x16,
  FlipRight = 0x17,
  Return = 0x18,
  Shot = 0x90,
  UnderAttack = 0x91,
  ResetHeading = 0xa0,
}

export enum ModeControlFlight {
  Attitude = 0x10,
  Position = 0x11,
  Manual = 0x12,
  Rate = 0x13,
  Function = 0x14,
}

export enum HeadlessMode {
  Headless = 0x01,
  Normal = 0x02,
}

export enum BuzzerMode {
  Stop = 0x00,
  Mute = 0x01,
  Scale = 0x03,
  Hz = 0x05,
}

export enum DisplayPixel {
  Black = 0x00,
  White = 0x01,
  Inverse = 0x02,
  Outline = 0x03,
}

export enum DisplayFont {
  LiberationMono5x8 = 0x00,
  LiberationMono10x16 = 0x01,
}

export enum DisplayAlign {
  Left = 0x00,
  Center = 0x01,
  Right = 0x02,
}

export enum DisplayLine {
  Solid = 0x00,
  Dotted = 0x01,
  Dashed = 0x02,
}

export interface DroneOptions {
  port?: CoDroneSerialPort;
  baudRate?: number;
  serial?: CoDroneSerial;
  from?: DeviceType;
}

export interface ControlPositionOptions {
  x: number;
  y: number;
  z: number;
  velocity: number;
  heading: number;
  rotationalVelocity: number;
}

export interface MotorSpeeds {
  frontRight: number;
  backRight: number;
  backLeft: number;
  frontLeft: number;
}

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

export interface ReceivedPacket {
  dataType: DataType | number;
  length: number;
  from: DeviceType | number;
  to: DeviceType | number;
  payload: Bytes;
  crc: number;
  raw: Bytes;
}

export function crc16CcittInitial0(bytes: Bytes): number {
  let crc = 0;

  for (const byte of bytes) {
    crc ^= byte << 8;

    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc & 0x8000) !== 0
        ? ((crc << 1) ^ 0x1021) & 0xffff
        : (crc << 1) & 0xffff;
    }
  }

  return crc & 0xffff;
}

export function makePacket(
  dataType: DataType | number,
  to: DeviceType | number,
  payload: Iterable<number> = [],
  from: DeviceType | number = DeviceType.Base,
): Bytes {
  const data = Uint8Array.from(payload, byte);
  assertRange(data.length, 0, 255, "payload length");

  const header = new Uint8Array([byte(dataType), data.length, byte(from), byte(to)]);
  const crcInput = new Uint8Array(header.length + data.length);
  crcInput.set(header, 0);
  crcInput.set(data, header.length);

  const crc = crc16CcittInitial0(crcInput);
  const packet = new Uint8Array(START_BYTES.length + crcInput.length + 2);
  packet.set(START_BYTES, 0);
  packet.set(crcInput, START_BYTES.length);
  packet[packet.length - 2] = crc & 0xff;
  packet[packet.length - 1] = (crc >> 8) & 0xff;

  return packet;
}

export function parsePackets(buffer: Bytes): {
  packets: ReceivedPacket[];
  remainder: Bytes;
} {
  const packets: ReceivedPacket[] = [];
  let offset = 0;

  while (offset <= buffer.length - 8) {
    if (buffer[offset] !== START_BYTES[0] || buffer[offset + 1] !== START_BYTES[1]) {
      offset += 1;
      continue;
    }

    const length = buffer[offset + 3];
    const packetLength = 2 + 4 + length + 2;

    if (offset + packetLength > buffer.length) {
      break;
    }

    const raw = buffer.slice(offset, offset + packetLength);
    const crcInput = raw.slice(2, raw.length - 2);
    const expectedCrc = crc16CcittInitial0(crcInput);
    const actualCrc = raw[raw.length - 2] | (raw[raw.length - 1] << 8);

    if (expectedCrc === actualCrc) {
      packets.push({
        dataType: raw[2],
        length,
        from: raw[4],
        to: raw[5],
        payload: raw.slice(6, 6 + length),
        crc: actualCrc,
        raw,
      });
    }

    offset += packetLength;
  }

  return {
    packets,
    remainder: buffer.slice(offset),
  };
}

export class Drone {
  readonly baudRate: number;

  private readonly from: DeviceType | number;
  private readonly serial?: CoDroneSerial;
  private port?: CoDroneSerialPort;
  private reader?: ReadableStreamDefaultReader<Bytes>;
  private writer?: WritableStreamDefaultWriter<Bytes>;
  private readBuffer: Bytes = new Uint8Array();
  private readLoop?: Promise<void>;
  private packetListeners = new Set<(packet: ReceivedPacket) => void>();

  constructor(options: DroneOptions = {}) {
    this.port = options.port;
    this.serial = options.serial;
    this.baudRate = options.baudRate ?? DEFAULT_BAUD_RATE;
    this.from = options.from ?? DeviceType.Base;
  }

  get connected(): boolean {
    return this.writer !== undefined;
  }

  static isSupported(): boolean {
    return typeof navigator !== "undefined" && navigator.serial !== undefined;
  }

  async connect(requestOptions: SerialPortRequestOptions = {}): Promise<void> {
    if (this.connected) {
      return;
    }

    const serial = this.serial ?? navigator.serial;
    if (!this.port) {
      if (!serial) {
        throw new Error("Web Serial is not available in this environment.");
      }

      this.port = await serial.requestPort(requestOptions);
    }

    await this.port.open({ baudRate: this.baudRate });

    if (!this.port.writable) {
      throw new Error("Selected serial port is not writable.");
    }

    this.writer = this.port.writable.getWriter();
    this.startReading();
  }

  async disconnect(): Promise<void> {
    await this.reader?.cancel().catch(() => undefined);
    this.reader?.releaseLock();
    this.reader = undefined;

    this.writer?.releaseLock();
    this.writer = undefined;

    await this.readLoop?.catch(() => undefined);
    this.readLoop = undefined;

    if (this.port) {
      await this.port.close();
    }
  }

  onPacket(listener: (packet: ReceivedPacket) => void): () => void {
    this.packetListeners.add(listener);
    return () => this.packetListeners.delete(listener);
  }

  async send(bytes: Bytes): Promise<void> {
    if (!this.writer) {
      throw new Error("Drone is not connected. Call connect() first.");
    }

    await this.writer.write(bytes);
  }

  async sendPacket(
    dataType: DataType | number,
    to: DeviceType | number,
    payload: Iterable<number> = [],
  ): Promise<void> {
    await this.send(makePacket(dataType, to, payload, this.from));
  }

  async command(
    commandType: CommandType | number,
    option = 0,
    to: DeviceType | number = DeviceType.Drone,
  ): Promise<void> {
    await this.sendPacket(DataType.Command, to, [commandType, option]);
  }

  async request(
    dataType: DataType | number,
    target: DeviceType | number = DeviceType.Drone,
  ): Promise<void> {
    await this.sendPacket(DataType.Request, target, [dataType]);
  }

  async ping(target: DeviceType | number = DeviceType.Drone, time = Date.now()): Promise<void> {
    await this.sendPacket(DataType.Ping, target, u64le(BigInt(Math.max(0, Math.trunc(time)))));
  }

  async stop(): Promise<void> {
    await this.command(CommandType.Stop);
  }

  async takeOff(): Promise<void> {
    await this.flightEvent(FlightEvent.TakeOff);
  }

  async land(): Promise<void> {
    await this.flightEvent(FlightEvent.Landing);
  }

  async emergencyStop(): Promise<void> {
    await this.flightEvent(FlightEvent.Stop);
    await this.stop();
  }

  async resetHeading(): Promise<void> {
    await this.flightEvent(FlightEvent.ResetHeading);
  }

  async flip(direction: "front" | "rear" | "left" | "right"): Promise<void> {
    const events = {
      front: FlightEvent.FlipFront,
      rear: FlightEvent.FlipRear,
      left: FlightEvent.FlipLeft,
      right: FlightEvent.FlipRight,
    } satisfies Record<string, FlightEvent>;

    await this.flightEvent(events[direction]);
  }

  async flightEvent(event: FlightEvent | number): Promise<void> {
    await this.command(CommandType.FlightEvent, event);
  }

  async control(roll = 0, pitch = 0, yaw = 0, throttle = 0): Promise<void> {
    await this.sendPacket(DataType.Control, DeviceType.Drone, [
      i8(roll, "roll"),
      i8(pitch, "pitch"),
      i8(yaw, "yaw"),
      i8(throttle, "throttle"),
    ]);
  }

  async neutral(): Promise<void> {
    await this.control(0, 0, 0, 0);
  }

  async controlPosition(options: ControlPositionOptions): Promise<void> {
    await this.sendPacket(DataType.Control, DeviceType.Drone, [
      ...f32le(options.x),
      ...f32le(options.y),
      ...f32le(options.z),
      ...f32le(options.velocity),
      ...i16le(options.heading, "heading"),
      ...i16le(options.rotationalVelocity, "rotationalVelocity"),
    ]);
  }

  async setFlightMode(mode: ModeControlFlight | number): Promise<void> {
    await this.command(CommandType.ModeControlFlight, mode);
  }

  async setHeadless(mode: HeadlessMode | boolean): Promise<void> {
    await this.command(
      CommandType.Headless,
      typeof mode === "boolean" ? (mode ? HeadlessMode.Headless : HeadlessMode.Normal) : mode,
    );
  }

  async setControlSpeed(level: number): Promise<void> {
    await this.command(CommandType.ControlSpeed, byte(level));
  }

  async clearBias(): Promise<void> {
    await this.command(CommandType.ClearBias);
  }

  async clearTrim(): Promise<void> {
    await this.sendPacket(DataType.Command, DeviceType.Drone, [CommandType.ClearTrim, 0]);
  }

  async setTrim(roll = 0, pitch = 0, yaw = 0, throttle = 0): Promise<void> {
    await this.sendPacket(DataType.Trim, DeviceType.Drone, [
      ...i16le(roll, "roll"),
      ...i16le(pitch, "pitch"),
      ...i16le(yaw, "yaw"),
      ...i16le(throttle, "throttle"),
    ]);
  }

  async setWeight(grams: number): Promise<void> {
    await this.sendPacket(DataType.Weight, DeviceType.Drone, f32le(grams));
  }

  async setLostConnection(timeNeutral: number, timeLanding: number, timeStop: number): Promise<void> {
    await this.sendPacket(DataType.LostConnection, DeviceType.Drone, [
      ...u16le(timeNeutral, "timeNeutral"),
      ...u16le(timeLanding, "timeLanding"),
      ...u32le(timeStop, "timeStop"),
    ]);
  }

  async setMotorSpeeds(speeds: MotorSpeeds): Promise<void> {
    await this.sendPacket(DataType.Motor, DeviceType.Drone, [
      ...u16le(speeds.frontRight, "frontRight"),
      ...u16le(speeds.backRight, "backRight"),
      ...u16le(speeds.backLeft, "backLeft"),
      ...u16le(speeds.frontLeft, "frontLeft"),
    ]);
  }

  async setMotor(target: number, value: number): Promise<void> {
    await this.sendPacket(DataType.MotorSingle, DeviceType.Drone, [
      byte(target),
      ...u16le(value, "value"),
    ]);
  }

  async setLightManual(flags: number, brightness: number, target = DeviceType.Drone): Promise<void> {
    await this.sendPacket(DataType.LightManual, target, [
      ...u16le(flags, "flags"),
      byte(brightness),
    ]);
  }

  async setLightModeColor(mode: number, interval: number, color: Rgb, target = DeviceType.Drone): Promise<void> {
    await this.sendPacket(DataType.LightMode, target, [
      byte(mode),
      ...u16le(interval, "interval"),
      byte(color.r),
      byte(color.g),
      byte(color.b),
    ]);
  }

  async setLightModePreset(mode: number, interval: number, color: number, target = DeviceType.Drone): Promise<void> {
    await this.sendPacket(DataType.LightMode, target, [
      byte(mode),
      ...u16le(interval, "interval"),
      byte(color),
    ]);
  }

  async buzzerHz(hz: number, durationMs: number, target = DeviceType.Controller): Promise<void> {
    await this.buzzer(BuzzerMode.Hz, hz, durationMs, target);
  }

  async buzzer(mode: BuzzerMode | number, value: number, durationMs: number, target = DeviceType.Controller): Promise<void> {
    await this.sendPacket(DataType.Buzzer, target, [
      byte(mode),
      ...u16le(value, "value"),
      ...u16le(durationMs, "durationMs"),
    ]);
  }

  async vibrate(onMs: number, offMs: number, totalMs: number, mode = 1): Promise<void> {
    await this.sendPacket(DataType.Vibrator, DeviceType.Controller, [
      byte(mode),
      ...u16le(onMs, "onMs"),
      ...u16le(offMs, "offMs"),
      ...u16le(totalMs, "totalMs"),
    ]);
  }

  async clearDisplay(pixel: DisplayPixel = DisplayPixel.Black): Promise<void> {
    await this.sendPacket(DataType.DisplayClear, DeviceType.Controller, [byte(pixel)]);
  }

  async drawPoint(x: number, y: number, pixel: DisplayPixel = DisplayPixel.White): Promise<void> {
    await this.sendPacket(DataType.DisplayDrawPoint, DeviceType.Controller, [
      ...i16le(x, "x"),
      ...i16le(y, "y"),
      byte(pixel),
    ]);
  }

  async drawLine(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    pixel: DisplayPixel = DisplayPixel.White,
    line: DisplayLine = DisplayLine.Solid,
  ): Promise<void> {
    await this.sendPacket(DataType.DisplayDrawLine, DeviceType.Controller, [
      ...i16le(x1, "x1"),
      ...i16le(y1, "y1"),
      ...i16le(x2, "x2"),
      ...i16le(y2, "y2"),
      byte(pixel),
      byte(line),
    ]);
  }

  async drawString(
    x: number,
    y: number,
    text: string,
    font: DisplayFont = DisplayFont.LiberationMono5x8,
    pixel: DisplayPixel = DisplayPixel.White,
  ): Promise<void> {
    await this.sendPacket(DataType.DisplayDrawString, DeviceType.Controller, [
      ...i16le(x, "x"),
      ...i16le(y, "y"),
      byte(font),
      byte(pixel),
      ...ascii(text),
    ]);
  }

  async drawStringAlign(
    xStart: number,
    xEnd: number,
    y: number,
    align: DisplayAlign,
    text: string,
    font: DisplayFont = DisplayFont.LiberationMono5x8,
    pixel: DisplayPixel = DisplayPixel.White,
  ): Promise<void> {
    await this.sendPacket(DataType.DisplayDrawStringAlign, DeviceType.Controller, [
      ...i16le(xStart, "xStart"),
      ...i16le(xEnd, "xEnd"),
      ...i16le(y, "y"),
      byte(align),
      byte(font),
      byte(pixel),
      ...ascii(text),
    ]);
  }

  private startReading(): void {
    if (!this.port?.readable || this.reader) {
      return;
    }

    this.reader = this.port.readable.getReader();
    this.readLoop = this.readFromPort();
  }

  private async readFromPort(): Promise<void> {
    const reader = this.reader;
    if (!reader) {
      return;
    }

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done || !value) {
          break;
        }

        this.readBuffer = concat(this.readBuffer, value);
        const { packets, remainder } = parsePackets(this.readBuffer);
        this.readBuffer = remainder;

        for (const packet of packets) {
          for (const listener of this.packetListeners) {
            listener(packet);
          }
        }
      }
    } catch {
      // Reader cancellation during disconnect is expected.
    }
  }
}

function byte(value: number): number {
  assertRange(value, 0, 255, "byte");
  return value & 0xff;
}

function i8(value: number, label: string): number {
  assertRange(value, -128, 127, label);
  return value < 0 ? 256 + value : value;
}

function u16le(value: number, label = "u16"): number[] {
  assertRange(value, 0, 0xffff, label);
  return [value & 0xff, (value >> 8) & 0xff];
}

function u32le(value: number, label = "u32"): number[] {
  assertRange(value, 0, 0xffffffff, label);
  return [
    value & 0xff,
    (value >> 8) & 0xff,
    (value >> 16) & 0xff,
    (value >> 24) & 0xff,
  ];
}

function u64le(value: bigint): number[] {
  const bytes: number[] = [];

  for (let index = 0; index < 8; index += 1) {
    bytes.push(Number((value >> BigInt(index * 8)) & 0xffn));
  }

  return bytes;
}

function i16le(value: number, label: string): number[] {
  assertRange(value, -32768, 32767, label);
  return u16le(value & 0xffff, label);
}

function f32le(value: number): number[] {
  const buffer = new ArrayBuffer(4);
  new DataView(buffer).setFloat32(0, value, true);
  return [...new Uint8Array(buffer)];
}

function ascii(text: string): number[] {
  return [...text].map((character) => {
    const code = character.charCodeAt(0);
    if (code > 0x7f) {
      throw new RangeError("Display strings must contain ASCII characters only.");
    }

    return code;
  });
}

function assertRange(value: number, min: number, max: number, label: string): void {
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new RangeError(`${label} must be an integer from ${min} to ${max}.`);
  }
}

function concat(left: Bytes, right: Bytes): Bytes {
  const result = new Uint8Array(left.length + right.length);
  result.set(left, 0);
  result.set(right, left.length);
  return result;
}
