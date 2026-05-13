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
  ByBlocks = 0x80,
  Scratch = 0x81,
  Entry = 0x82,
  Tester = 0xa0,
  Monitor = 0xa1,
  Updater = 0xa2,
  Encrypter = 0xa3,
  Whispering = 0xfe,
  Broadcasting = 0xff,
}

export enum DataType {
  None = 0x00,
  Ping = 0x01,
  Ack = 0x02,
  Error = 0x03,
  Request = 0x04,
  Message = 0x05,
  Address = 0x06,
  Information = 0x07,
  Update = 0x08,
  UpdateLocation = 0x09,
  Encrypt = 0x0a,
  SystemCount = 0x0b,
  SystemInformation = 0x0c,
  Registration = 0x0d,
  Administrator = 0x0e,
  Monitor = 0x0f,
  Control = 0x10,
  Command = 0x11,
  Pairing = 0x12,
  Rssi = 0x13,
  TimeSync = 0x14,
  TransmissionPower = 0x15,
  Configuration = 0x16,
  Echo = 0x17,
  CpuID = 0x1e,
  Battle = 0x1f,
  LightManual = 0x20,
  LightMode = 0x21,
  LightEvent = 0x22,
  LightDefault = 0x23,
  RawMotion = 0x30,
  RawFlow = 0x31,
  State = 0x40,
  Attitude = 0x41,
  Position = 0x42,
  Altitude = 0x43,
  Motion = 0x44,
  Range = 0x45,
  Flow = 0x46,
  Count = 0x50,
  Bias = 0x51,
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
  DisplayDrawImage = 0x88,
  CardClassify = 0x90,
  CardRange = 0x91,
  CardRaw = 0x92,
  CardColor = 0x93,
  CardList = 0x94,
  CardFunctionList = 0x95,
  InformationAssembledForController = 0xa0,
  InformationAssembledForEntry = 0xa1,
  InformationAssembledForByBlocks = 0xa2,
  NavigationTarget = 0xd0,
  NavigationLocation = 0xd1,
  NavigationMonitor = 0xd2,
  NavigationHeading = 0xd3,
  NavigationCounter = 0xd4,
  NavigationSatellite = 0xd5,
  NavigationLocationAdjust = 0xd6,
  NavigationTargetEcef = 0xd8,
  NavigationLocationEcef = 0xd9,
  GpsRtkNavigationState = 0xda,
  GpsRtkExtendedRawMeasurementData = 0xdb,
  EndOfType = 0xdc,
}

export enum CommandType {
  None = 0x00,
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
  Link = 0x0b,
  ClearCounter = 0xa0,
  NavigationTargetClear = 0xe0,
  NavigationStart = 0xe1,
  NavigationPause = 0xe2,
  NavigationRestart = 0xe3,
  NavigationStop = 0xe4,
  NavigationNext = 0xe5,
  NavigationReturnToHome = 0xe6,
  GpsRtkBase = 0xea,
  GpsRtkRover = 0xeb,
  EndOfType = 0xec,
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
  MuteReserve = 0x02,
  Scale = 0x03,
  ScaleReserve = 0x04,
  Hz = 0x05,
  HzReserve = 0x06,
  EndOfType = 0x07,
}

export enum VibratorMode {
  Stop = 0x00,
  Instantly = 0x01,
  Continually = 0x02,
  EndOfType = 0x03,
}

export enum ButtonEvent {
  None = 0x00,
  Down = 0x01,
  Press = 0x02,
  Up = 0x03,
  EndContinuePress = 0x04,
}

export enum ButtonFlagController {
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

export enum JoystickDirection {
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

export enum JoystickEvent {
  None = 0x00,
  In = 0x01,
  Stay = 0x02,
  Out = 0x03,
  EndOfType = 0x04,
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

export interface StabilizationAxisValues {
  roll: number;
  pitch: number;
  yaw: number;
}

export interface PidGains {
  kp: number;
  ki?: number;
  kd?: number;
  integralLimit?: number;
  outputLimit?: number;
}

export interface StabilizationGains {
  roll: PidGains;
  pitch: PidGains;
  yaw?: PidGains;
}

export interface MotorMix {
  frontRight: StabilizationAxisValues;
  backRight: StabilizationAxisValues;
  backLeft: StabilizationAxisValues;
  frontLeft: StabilizationAxisValues;
}

export interface MotorCorrections {
  roll?: number;
  pitch?: number;
  yaw?: number;
}

export interface CustomStabilizationOptions {
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

export interface CustomStabilizationSnapshot {
  attitude?: Attitude;
  target: StabilizationAxisValues;
  corrections: StabilizationAxisValues;
  motorSpeeds: MotorSpeeds;
  dt: number;
  timestamp: number;
}

export interface CustomStabilizationLog {
  level: "debug" | "info" | "warn" | "error";
  message: string;
  timestamp: number;
  data?: unknown;
}

export interface DroneState {
  modeSystem: number;
  modeFlight: number;
  modeControlFlight: ModeControlFlight | number;
  modeMovement: number;
  headless: HeadlessMode | number;
  controlSpeed: number;
  sensorOrientation: number;
  battery: number;
}

export interface Attitude {
  roll: number;
  pitch: number;
  yaw: number;
}

export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface Altitude {
  temperature: number;
  pressure: number;
  altitude: number;
  rangeHeight: number;
}

export interface Motion {
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

export interface RawMotion {
  accelX: number;
  accelY: number;
  accelZ: number;
  gyroRoll: number;
  gyroPitch: number;
  gyroYaw: number;
}

export interface RangeSensor {
  left: number;
  front: number;
  right: number;
  rear: number;
  top: number;
  bottom: number;
}

export interface Flow {
  x: number;
  y: number;
  z: number;
}

export interface RawFlow {
  x: number;
  y: number;
}

export interface Trim {
  roll: number;
  pitch: number;
  yaw: number;
  throttle: number;
}

export interface Count {
  timeSystem: number;
  timeFlight: number;
  countTakeOff: number;
  countLanding: number;
  countAccident: number;
}

export interface Button {
  button: number;
  event: ButtonEvent | number;
}

export interface JoystickBlock {
  x: number;
  y: number;
  direction: JoystickDirection | number;
  event: JoystickEvent | number;
}

export interface Joystick {
  left: JoystickBlock;
  right: JoystickBlock;
}

export interface CardRaw {
  front: Rgb16;
  rear: Rgb16;
}

export interface CardColor {
  front: Hsvl & { color: number };
  rear: Hsvl & { color: number };
  card: number;
}

export interface Rgb16 {
  r: number;
  g: number;
  b: number;
}

export interface Hsvl {
  h: number;
  s: number;
  v: number;
  l: number;
}

export interface ColorSample {
  label: string;
  values: Record<string, number>;
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

export function parseState(packet: ReceivedPacket): DroneState {
  expectPacket(packet, DataType.State, 8, "State");

  return {
    modeSystem: packet.payload[0],
    modeFlight: packet.payload[1],
    modeControlFlight: packet.payload[2],
    modeMovement: packet.payload[3],
    headless: packet.payload[4],
    controlSpeed: packet.payload[5],
    sensorOrientation: packet.payload[6],
    battery: packet.payload[7],
  };
}

export function parseAttitude(packet: ReceivedPacket): Attitude {
  expectPacket(packet, DataType.Attitude, 6, "Attitude");
  return {
    roll: readI16(packet.payload, 0),
    pitch: readI16(packet.payload, 2),
    yaw: readI16(packet.payload, 4),
  };
}

export function parsePosition(packet: ReceivedPacket): Position {
  expectPacket(packet, DataType.Position, 12, "Position");
  return {
    x: readF32(packet.payload, 0),
    y: readF32(packet.payload, 4),
    z: readF32(packet.payload, 8),
  };
}

export function parseAltitude(packet: ReceivedPacket): Altitude {
  expectPacket(packet, DataType.Altitude, 16, "Altitude");
  return {
    temperature: readF32(packet.payload, 0),
    pressure: readF32(packet.payload, 4),
    altitude: readF32(packet.payload, 8),
    rangeHeight: readF32(packet.payload, 12),
  };
}

export function parseMotion(packet: ReceivedPacket): Motion {
  expectPacket(packet, DataType.Motion, 18, "Motion");
  return {
    accelX: readI16(packet.payload, 0),
    accelY: readI16(packet.payload, 2),
    accelZ: readI16(packet.payload, 4),
    gyroRoll: readI16(packet.payload, 6),
    gyroPitch: readI16(packet.payload, 8),
    gyroYaw: readI16(packet.payload, 10),
    angleRoll: readI16(packet.payload, 12),
    anglePitch: readI16(packet.payload, 14),
    angleYaw: readI16(packet.payload, 16),
  };
}

export function parseRawMotion(packet: ReceivedPacket): RawMotion {
  expectPacket(packet, DataType.RawMotion, 12, "RawMotion");
  return {
    accelX: readI16(packet.payload, 0),
    accelY: readI16(packet.payload, 2),
    accelZ: readI16(packet.payload, 4),
    gyroRoll: readI16(packet.payload, 6),
    gyroPitch: readI16(packet.payload, 8),
    gyroYaw: readI16(packet.payload, 10),
  };
}

export function parseRange(packet: ReceivedPacket): RangeSensor {
  expectPacket(packet, DataType.Range, 12, "Range");
  return {
    left: readI16(packet.payload, 0),
    front: readI16(packet.payload, 2),
    right: readI16(packet.payload, 4),
    rear: readI16(packet.payload, 6),
    top: readI16(packet.payload, 8),
    bottom: readI16(packet.payload, 10),
  };
}

export function parseFlow(packet: ReceivedPacket): Flow {
  expectPacket(packet, DataType.Flow, 12, "Flow");
  return {
    x: readF32(packet.payload, 0),
    y: readF32(packet.payload, 4),
    z: readF32(packet.payload, 8),
  };
}

export function parseRawFlow(packet: ReceivedPacket): RawFlow {
  expectPacket(packet, DataType.RawFlow, 8, "RawFlow");
  return {
    x: readF32(packet.payload, 0),
    y: readF32(packet.payload, 4),
  };
}

export function parseTrim(packet: ReceivedPacket): Trim {
  expectPacket(packet, DataType.Trim, 8, "Trim");
  return {
    roll: readI16(packet.payload, 0),
    pitch: readI16(packet.payload, 2),
    yaw: readI16(packet.payload, 4),
    throttle: readI16(packet.payload, 6),
  };
}

export function parseCount(packet: ReceivedPacket): Count {
  expectPacket(packet, DataType.Count, 14, "Count");
  return {
    timeSystem: readU32(packet.payload, 0),
    timeFlight: readU32(packet.payload, 4),
    countTakeOff: readU16(packet.payload, 8),
    countLanding: readU16(packet.payload, 10),
    countAccident: readU16(packet.payload, 12),
  };
}

export function parseButton(packet: ReceivedPacket): Button {
  expectPacket(packet, DataType.Button, 3, "Button");
  return {
    button: readU16(packet.payload, 0),
    event: packet.payload[2],
  };
}

export function parseJoystick(packet: ReceivedPacket): Joystick {
  expectPacket(packet, DataType.Joystick, 8, "Joystick");
  const block = (offset: number): JoystickBlock => ({
    x: readI8(packet.payload[offset]),
    y: readI8(packet.payload[offset + 1]),
    direction: packet.payload[offset + 2],
    event: packet.payload[offset + 3],
  });

  return {
    left: block(0),
    right: block(4),
  };
}

export function parseCardRaw(packet: ReceivedPacket): CardRaw {
  expectPacket(packet, DataType.CardRaw, 12, "CardRaw");
  return {
    front: {
      r: readI16(packet.payload, 0),
      g: readI16(packet.payload, 2),
      b: readI16(packet.payload, 4),
    },
    rear: {
      r: readI16(packet.payload, 6),
      g: readI16(packet.payload, 8),
      b: readI16(packet.payload, 10),
    },
  };
}

export function parseCardColor(packet: ReceivedPacket): CardColor {
  expectPacket(packet, DataType.CardColor, 19, "CardColor");
  return {
    front: {
      h: readI16(packet.payload, 0),
      s: readI16(packet.payload, 2),
      v: readI16(packet.payload, 4),
      l: readI16(packet.payload, 6),
      color: packet.payload[16],
    },
    rear: {
      h: readI16(packet.payload, 8),
      s: readI16(packet.payload, 10),
      v: readI16(packet.payload, 12),
      l: readI16(packet.payload, 14),
      color: packet.payload[17],
    },
    card: packet.payload[18],
  };
}

export const DEFAULT_CUSTOM_STABILIZATION_MIXER: MotorMix = {
  frontRight: { roll: -1, pitch: 1, yaw: -1 },
  backRight: { roll: -1, pitch: -1, yaw: 1 },
  backLeft: { roll: 1, pitch: -1, yaw: -1 },
  frontLeft: { roll: 1, pitch: 1, yaw: 1 },
};

export function mixStabilizedMotorSpeeds(
  baseThrottle: number,
  corrections: MotorCorrections = {},
  options: {
    minMotor?: number;
    maxMotor?: number;
    mixer?: MotorMix;
  } = {},
): MotorSpeeds {
  const minMotor = options.minMotor ?? 0;
  const maxMotor = options.maxMotor ?? 0xffff;
  assertMotorLimits(minMotor, maxMotor);
  const mixer = options.mixer ?? DEFAULT_CUSTOM_STABILIZATION_MIXER;
  const correction = {
    roll: corrections.roll ?? 0,
    pitch: corrections.pitch ?? 0,
    yaw: corrections.yaw ?? 0,
  };

  const mixMotor = (motor: StabilizationAxisValues): number => clampInteger(
    baseThrottle
      + correction.roll * motor.roll
      + correction.pitch * motor.pitch
      + correction.yaw * motor.yaw,
    minMotor,
    maxMotor,
  );

  return {
    frontRight: mixMotor(mixer.frontRight),
    backRight: mixMotor(mixer.backRight),
    backLeft: mixMotor(mixer.backLeft),
    frontLeft: mixMotor(mixer.frontLeft),
  };
}

export class PidController {
  private integral = 0;
  private previousError?: number;

  constructor(public gains: PidGains) {}

  reset(): void {
    this.integral = 0;
    this.previousError = undefined;
  }

  update(error: number, dt: number): number {
    const safeDt = Math.max(dt, 0.001);
    this.integral += error * safeDt;

    if (this.gains.integralLimit !== undefined) {
      const limit = Math.abs(this.gains.integralLimit);
      this.integral = clampNumber(this.integral, -limit, limit);
    }

    const derivative = this.previousError === undefined
      ? 0
      : (error - this.previousError) / safeDt;
    this.previousError = error;

    const output = this.gains.kp * error
      + (this.gains.ki ?? 0) * this.integral
      + (this.gains.kd ?? 0) * derivative;

    if (this.gains.outputLimit === undefined) {
      return output;
    }

    const limit = Math.abs(this.gains.outputLimit);
    return clampNumber(output, -limit, limit);
  }
}

export class CustomStabilizer {
  private options: Required<Omit<CustomStabilizationOptions, "target" | "gains" | "mixer">> & {
    gains: StabilizationGains;
    mixer: MotorMix;
  };
  private target: StabilizationAxisValues;
  private readonly rollPid: PidController;
  private readonly pitchPid: PidController;
  private yawPid?: PidController;
  private unsubscribe?: () => void;
  private timer?: ReturnType<typeof setInterval>;
  private latestAttitude?: Attitude;
  private latestAttitudeAt = 0;
  private lastTickAt = 0;
  private lastMotorSpeeds?: MotorSpeeds;
  private ticking = false;
  private lastSnapshot?: CustomStabilizationSnapshot;
  private snapshotListeners = new Set<(snapshot: CustomStabilizationSnapshot) => void>();
  private logListeners = new Set<(entry: CustomStabilizationLog) => void>();

  constructor(
    private readonly drone: Drone,
    options: CustomStabilizationOptions,
  ) {
    this.options = normalizeCustomStabilizationOptions(options);
    this.target = {
      roll: options.target?.roll ?? 0,
      pitch: options.target?.pitch ?? 0,
      yaw: options.target?.yaw ?? 0,
    };
    this.rollPid = new PidController(this.options.gains.roll);
    this.pitchPid = new PidController(this.options.gains.pitch);
    this.yawPid = this.options.gains.yaw ? new PidController(this.options.gains.yaw) : undefined;
  }

  get running(): boolean {
    return this.timer !== undefined;
  }

  get snapshot(): CustomStabilizationSnapshot | undefined {
    return this.lastSnapshot;
  }

  onSnapshot(listener: (snapshot: CustomStabilizationSnapshot) => void): () => void {
    this.snapshotListeners.add(listener);
    return () => this.snapshotListeners.delete(listener);
  }

  onLog(listener: (entry: CustomStabilizationLog) => void): () => void {
    this.logListeners.add(listener);
    return () => this.logListeners.delete(listener);
  }

  start(): void {
    if (this.running) {
      return;
    }

    if (!this.drone.connected) {
      throw new Error("Drone is not connected. Call connect() first.");
    }

    this.emitLog("info", "Custom stabilization started", {
      rateHz: this.options.rateHz,
      baseThrottle: this.options.baseThrottle,
      minMotor: this.options.minMotor,
      maxMotor: this.options.maxMotor,
      maxMotorStep: this.options.maxMotorStep,
      target: this.target,
    });

    this.unsubscribe = this.drone.onPacket((packet) => {
      if (packet.dataType !== DataType.Attitude) {
        return;
      }

      try {
        this.latestAttitude = parseAttitude(packet);
        this.latestAttitudeAt = Date.now();
        this.emitLog("debug", "Attitude received", {
          from: packet.from,
          to: packet.to,
          attitude: this.latestAttitude,
        });
      } catch (error) {
        this.emitLog("error", "Attitude parse failed", { error: errorMessage(error) });
      }
    });

    this.reset();
    void this.drone.request(DataType.Attitude, DeviceType.Drone).catch((error) => {
      this.emitLog("error", "Initial attitude request failed", { error: errorMessage(error) });
    });
    this.timer = setInterval(() => {
      void this.tick().catch((error) => {
        this.emitLog("error", "Stabilization tick failed", { error: errorMessage(error) });
      });
    }, Math.round(1000 / this.options.rateHz));
  }

  async stop(): Promise<void> {
    if (this.timer !== undefined) {
      clearInterval(this.timer);
      this.timer = undefined;
    }

    this.unsubscribe?.();
    this.unsubscribe = undefined;
    this.reset();
    this.emitLog("info", "Custom stabilization stopped");

    if (this.options.zeroMotorsOnStop && this.drone.connected) {
      await this.drone.setMotorSpeeds({
        frontRight: 0,
        backRight: 0,
        backLeft: 0,
        frontLeft: 0,
      });
    }
  }

  reset(): void {
    this.rollPid.reset();
    this.pitchPid.reset();
    this.yawPid?.reset();
    this.lastMotorSpeeds = undefined;
    this.lastTickAt = Date.now();
  }

  setTarget(target: Partial<StabilizationAxisValues>): void {
    this.target = { ...this.target, ...target };
  }

  setBaseThrottle(baseThrottle: number): void {
    this.options.baseThrottle = baseThrottle;
  }

  setMotorLimits(minMotor: number, maxMotor: number): void {
    assertMotorLimits(minMotor, maxMotor);
    this.options.minMotor = minMotor;
    this.options.maxMotor = maxMotor;
  }

  setGains(gains: Partial<StabilizationGains>): void {
    if (gains.roll) {
      this.options.gains.roll = gains.roll;
      this.rollPid.gains = gains.roll;
      this.rollPid.reset();
    }

    if (gains.pitch) {
      this.options.gains.pitch = gains.pitch;
      this.pitchPid.gains = gains.pitch;
      this.pitchPid.reset();
    }

    if (gains.yaw) {
      this.options.gains.yaw = gains.yaw;
      this.yawPid = this.yawPid ?? new PidController(gains.yaw);
      this.yawPid.gains = gains.yaw;
      this.yawPid.reset();
    }
  }

  private async tick(): Promise<void> {
    if (this.ticking || !this.drone.connected) {
      return;
    }

    this.ticking = true;
    try {
      const now = Date.now();
      const age = now - this.latestAttitudeAt;
      if (!this.latestAttitude) {
        this.emitLog("warn", "Waiting for first Attitude packet");
        if (this.options.requestAttitude) {
          await this.drone.request(DataType.Attitude, DeviceType.Drone);
        }
        return;
      }

      if (age > this.options.staleAttitudeMs) {
        this.emitLog("warn", "Attitude packet is stale", {
          ageMs: age,
          staleAttitudeMs: this.options.staleAttitudeMs,
        });
        if (this.options.requestAttitude) {
          await this.drone.request(DataType.Attitude, DeviceType.Drone);
        }
        await this.zeroMotors("Stale attitude");
        return;
      }

      const dt = Math.max((now - this.lastTickAt) / 1000, 0.001);
      this.lastTickAt = now;
      const attitude = scaleAttitude(this.latestAttitude, this.options.attitudeScale);
      const corrections = {
        roll: this.rollPid.update(this.target.roll - attitude.roll, dt),
        pitch: this.pitchPid.update(this.target.pitch - attitude.pitch, dt),
        yaw: this.yawPid?.update(this.target.yaw - attitude.yaw, dt) ?? 0,
      };
      const mixedMotorSpeeds = mixStabilizedMotorSpeeds(this.options.baseThrottle, corrections, {
        minMotor: this.options.minMotor,
        maxMotor: this.options.maxMotor,
        mixer: this.options.mixer,
      });
      const motorSpeeds = limitMotorStep(mixedMotorSpeeds, this.lastMotorSpeeds, this.options.maxMotorStep);

      await this.drone.setMotorSpeeds(motorSpeeds);
      this.lastMotorSpeeds = motorSpeeds;
      this.emitLog("debug", "Motor speeds written", { corrections, motorSpeeds, attitude });
      this.lastSnapshot = {
        attitude,
        target: { ...this.target },
        corrections,
        motorSpeeds,
        dt,
        timestamp: now,
      };

      for (const listener of this.snapshotListeners) {
        listener(this.lastSnapshot);
      }

      if (this.options.requestAttitude) {
        await this.drone.request(DataType.Attitude, DeviceType.Drone);
      }
    } finally {
      this.ticking = false;
    }
  }

  private emitLog(level: CustomStabilizationLog["level"], message: string, data?: unknown): void {
    const entry = {
      level,
      message,
      timestamp: Date.now(),
      data,
    };

    for (const listener of this.logListeners) {
      listener(entry);
    }
  }

  private async zeroMotors(reason: string): Promise<void> {
    const motorSpeeds = {
      frontRight: 0,
      backRight: 0,
      backLeft: 0,
      frontLeft: 0,
    };
    await this.drone.setMotorSpeeds(motorSpeeds);
    this.lastMotorSpeeds = motorSpeeds;
    this.emitLog("warn", "Motors zeroed", { reason });
  }
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

  async requestPacket(
    dataType: DataType | number,
    target: DeviceType | number = DeviceType.Drone,
    timeoutMs = 500,
  ): Promise<ReceivedPacket> {
    const waitForPacket = new Promise<ReceivedPacket>((resolve, reject) => {
      const timeout = setTimeout(() => {
        unsubscribe();
        reject(new Error(`Timed out waiting for data type ${dataType}.`));
      }, timeoutMs);

      const unsubscribe = this.onPacket((packet) => {
        if (packet.dataType !== dataType || packet.from !== target) {
          return;
        }

        clearTimeout(timeout);
        unsubscribe();
        resolve(packet);
      });
    });

    await this.request(dataType, target);
    return waitForPacket;
  }

  async getState(timeoutMs = 500): Promise<DroneState> {
    return parseState(await this.requestPacket(DataType.State, DeviceType.Drone, timeoutMs));
  }

  async getBattery(timeoutMs = 500): Promise<number> {
    return (await this.getState(timeoutMs)).battery;
  }

  async getSystemState(timeoutMs = 500): Promise<number> {
    return (await this.getState(timeoutMs)).modeSystem;
  }

  async getFlightState(timeoutMs = 500): Promise<number> {
    return (await this.getState(timeoutMs)).modeFlight;
  }

  async getMovementState(timeoutMs = 500): Promise<number> {
    return (await this.getState(timeoutMs)).modeMovement;
  }

  async getControlSpeed(timeoutMs = 500): Promise<number> {
    return (await this.getState(timeoutMs)).controlSpeed;
  }

  async getAttitude(timeoutMs = 500): Promise<Attitude> {
    return parseAttitude(await this.requestPacket(DataType.Attitude, DeviceType.Drone, timeoutMs));
  }

  async getPosition(timeoutMs = 500): Promise<Position> {
    return parsePosition(await this.requestPacket(DataType.Position, DeviceType.Drone, timeoutMs));
  }

  async getAltitude(timeoutMs = 500): Promise<Altitude> {
    return parseAltitude(await this.requestPacket(DataType.Altitude, DeviceType.Drone, timeoutMs));
  }

  async getPressure(timeoutMs = 500): Promise<number> {
    return (await this.getAltitude(timeoutMs)).pressure;
  }

  async getTemperature(timeoutMs = 500): Promise<number> {
    return (await this.getAltitude(timeoutMs)).temperature;
  }

  async getHeight(timeoutMs = 500): Promise<number> {
    return (await this.getAltitude(timeoutMs)).rangeHeight;
  }

  async getMotion(timeoutMs = 500): Promise<Motion> {
    return parseMotion(await this.requestPacket(DataType.Motion, DeviceType.Drone, timeoutMs));
  }

  async getRawMotion(timeoutMs = 500): Promise<RawMotion> {
    return parseRawMotion(await this.requestPacket(DataType.RawMotion, DeviceType.Drone, timeoutMs));
  }

  async getRange(timeoutMs = 500): Promise<RangeSensor> {
    return parseRange(await this.requestPacket(DataType.Range, DeviceType.Drone, timeoutMs));
  }

  async getFrontRange(timeoutMs = 500): Promise<number> {
    return (await this.getRange(timeoutMs)).front;
  }

  async getBottomRange(timeoutMs = 500): Promise<number> {
    return (await this.getRange(timeoutMs)).bottom;
  }

  async getFlow(timeoutMs = 500): Promise<Flow> {
    return parseFlow(await this.requestPacket(DataType.Flow, DeviceType.Drone, timeoutMs));
  }

  async getRawFlow(timeoutMs = 500): Promise<RawFlow> {
    return parseRawFlow(await this.requestPacket(DataType.RawFlow, DeviceType.Drone, timeoutMs));
  }

  async getTrim(timeoutMs = 500): Promise<Trim> {
    return parseTrim(await this.requestPacket(DataType.Trim, DeviceType.Drone, timeoutMs));
  }

  async getCount(timeoutMs = 500): Promise<Count> {
    return parseCount(await this.requestPacket(DataType.Count, DeviceType.Drone, timeoutMs));
  }

  async getJoystick(timeoutMs = 500): Promise<Joystick> {
    return parseJoystick(await this.requestPacket(DataType.Joystick, DeviceType.Controller, timeoutMs));
  }

  async getButton(timeoutMs = 500): Promise<Button> {
    return parseButton(await this.requestPacket(DataType.Button, DeviceType.Controller, timeoutMs));
  }

  async getCardRaw(timeoutMs = 500): Promise<CardRaw> {
    return parseCardRaw(await this.requestPacket(DataType.CardRaw, DeviceType.Drone, timeoutMs));
  }

  async getCardColor(timeoutMs = 500): Promise<CardColor> {
    return parseCardColor(await this.requestPacket(DataType.CardColor, DeviceType.Drone, timeoutMs));
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

  async speedChange(level: number): Promise<void> {
    await this.setControlSpeed(level);
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

  createCustomStabilizer(options: CustomStabilizationOptions): CustomStabilizer {
    return new CustomStabilizer(this, options);
  }

  startCustomStabilization(options: CustomStabilizationOptions): CustomStabilizer {
    const stabilizer = this.createCustomStabilizer(options);
    stabilizer.start();
    return stabilizer;
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

  async setLightEventColor(event: number, interval: number, repeat: number, color: Rgb, target = DeviceType.Drone): Promise<void> {
    await this.sendPacket(DataType.LightEvent, target, [
      byte(event),
      ...u16le(interval, "interval"),
      byte(repeat),
      byte(color.r),
      byte(color.g),
      byte(color.b),
    ]);
  }

  async setLightEventPreset(event: number, interval: number, repeat: number, color: number, target = DeviceType.Drone): Promise<void> {
    await this.sendPacket(DataType.LightEvent, target, [
      byte(event),
      ...u16le(interval, "interval"),
      byte(repeat),
      byte(color),
    ]);
  }

  async setLightDefaultColor(mode: number, interval: number, color: Rgb, target = DeviceType.Drone): Promise<void> {
    await this.sendPacket(DataType.LightDefault, target, [
      byte(mode),
      ...u16le(interval, "interval"),
      byte(color.r),
      byte(color.g),
      byte(color.b),
    ]);
  }

  async setDroneLed(r: number, g: number, b: number, brightness = 255): Promise<void> {
    await this.setLightManual(0x07, brightness, DeviceType.Drone);
    await this.setLightModeColor(0x22, 0, { r, g, b }, DeviceType.Drone);
  }

  async setControllerLed(r: number, g: number, b: number, brightness = 255): Promise<void> {
    await this.setLightManual(0x07, brightness, DeviceType.Controller);
    await this.setLightModeColor(0x22, 0, { r, g, b }, DeviceType.Controller);
  }

  async setDroneLedMode(r: number, g: number, b: number, mode: number, interval: number): Promise<void> {
    await this.setLightModeColor(mode, interval, { r, g, b }, DeviceType.Drone);
  }

  async setControllerLedMode(r: number, g: number, b: number, mode: number, interval: number): Promise<void> {
    await this.setLightModeColor(mode, interval, { r, g, b }, DeviceType.Controller);
  }

  async droneLedOff(): Promise<void> {
    await this.setLightManual(0x07, 0, DeviceType.Drone);
  }

  async controllerLedOff(): Promise<void> {
    await this.setLightManual(0x07, 0, DeviceType.Controller);
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

  async buzzerHzReserve(hz: number, durationMs: number, target = DeviceType.Controller): Promise<void> {
    await this.buzzer(BuzzerMode.HzReserve, hz, durationMs, target);
  }

  async buzzerScale(scale: number, durationMs: number, target = DeviceType.Controller): Promise<void> {
    await this.buzzer(BuzzerMode.Scale, scale, durationMs, target);
  }

  async buzzerScaleReserve(scale: number, durationMs: number, target = DeviceType.Controller): Promise<void> {
    await this.buzzer(BuzzerMode.ScaleReserve, scale, durationMs, target);
  }

  async buzzerMute(durationMs: number, target = DeviceType.Controller): Promise<void> {
    await this.buzzer(BuzzerMode.Mute, 0, durationMs, target);
  }

  async buzzerMuteReserve(durationMs: number, target = DeviceType.Controller): Promise<void> {
    await this.buzzer(BuzzerMode.MuteReserve, 0, durationMs, target);
  }

  async stopBuzzer(target = DeviceType.Controller): Promise<void> {
    await this.buzzer(BuzzerMode.Stop, 0, 0, target);
  }

  async droneBuzzerHz(hz: number, durationMs: number): Promise<void> {
    await this.buzzerHz(hz, durationMs, DeviceType.Drone);
  }

  async controllerBuzzerHz(hz: number, durationMs: number): Promise<void> {
    await this.buzzerHz(hz, durationMs, DeviceType.Controller);
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

  async clearDisplayRegion(
    x: number,
    y: number,
    width: number,
    height: number,
    pixel: DisplayPixel = DisplayPixel.White,
  ): Promise<void> {
    await this.sendPacket(DataType.DisplayClear, DeviceType.Controller, [
      ...i16le(x, "x"),
      ...i16le(y, "y"),
      ...i16le(width, "width"),
      ...i16le(height, "height"),
      byte(pixel),
    ]);
  }

  async invertDisplay(x: number, y: number, width: number, height: number): Promise<void> {
    await this.sendPacket(DataType.DisplayInvert, DeviceType.Controller, [
      ...i16le(x, "x"),
      ...i16le(y, "y"),
      ...i16le(width, "width"),
      ...i16le(height, "height"),
    ]);
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

  async drawRect(
    x: number,
    y: number,
    width: number,
    height: number,
    pixel: DisplayPixel = DisplayPixel.White,
    fill = false,
    line: DisplayLine = DisplayLine.Solid,
  ): Promise<void> {
    await this.sendPacket(DataType.DisplayDrawRect, DeviceType.Controller, [
      ...i16le(x, "x"),
      ...i16le(y, "y"),
      ...i16le(width, "width"),
      ...i16le(height, "height"),
      byte(pixel),
      fill ? 1 : 0,
      byte(line),
    ]);
  }

  async drawCircle(
    x: number,
    y: number,
    radius: number,
    pixel: DisplayPixel = DisplayPixel.White,
    fill = false,
  ): Promise<void> {
    await this.sendPacket(DataType.DisplayDrawCircle, DeviceType.Controller, [
      ...i16le(x, "x"),
      ...i16le(y, "y"),
      ...i16le(radius, "radius"),
      byte(pixel),
      fill ? 1 : 0,
    ]);
  }

  async drawImage(x: number, y: number, width: number, height: number, image: Iterable<number>): Promise<void> {
    await this.sendPacket(DataType.DisplayDrawImage, DeviceType.Controller, [
      ...i16le(x, "x"),
      ...i16le(y, "y"),
      ...i16le(width, "width"),
      ...i16le(height, "height"),
      ...Uint8Array.from(image, byte),
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

export class ColorClassifier {
  private samples: ColorSample[] = [];

  constructor(private readonly k = 9) {}

  reset(): void {
    this.samples = [];
  }

  fit(samples: Iterable<ColorSample>): void {
    this.samples = [...samples];
  }

  add(label: string, values: Record<string, number>): void {
    this.samples.push({ label, values });
  }

  predict(values: Record<string, number>): string | undefined {
    if (this.samples.length === 0) {
      return undefined;
    }

    const neighbors = this.samples
      .map((sample) => ({
        label: sample.label,
        distance: colorDistance(values, sample.values),
      }))
      .sort((left, right) => left.distance - right.distance)
      .slice(0, Math.max(1, Math.min(this.k, this.samples.length)));

    const counts = new Map<string, { count: number; distance: number }>();
    for (const neighbor of neighbors) {
      const entry = counts.get(neighbor.label) ?? { count: 0, distance: 0 };
      entry.count += 1;
      entry.distance += neighbor.distance;
      counts.set(neighbor.label, entry);
    }

    return [...counts.entries()]
      .sort((left, right) => (
        right[1].count - left[1].count
        || left[1].distance - right[1].distance
      ))[0]?.[0];
  }
}

function colorDistance(values: Record<string, number>, sample: Record<string, number>): number {
  const keys = Object.keys(values).filter((key) => typeof sample[key] === "number");
  if (keys.length === 0) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.sqrt(keys.reduce((sum, key) => {
    const delta = values[key] - sample[key];
    return sum + delta * delta;
  }, 0));
}

function expectPacket(packet: ReceivedPacket, dataType: DataType, length: number, label: string): void {
  if (packet.dataType !== dataType) {
    throw new Error(`Expected ${label} packet, received data type ${packet.dataType}.`);
  }

  if (packet.payload.length !== length) {
    throw new Error(`${label} payload must be ${length} bytes, received ${packet.payload.length}.`);
  }
}

function normalizeCustomStabilizationOptions(
  options: CustomStabilizationOptions,
): Required<Omit<CustomStabilizationOptions, "target" | "gains" | "mixer">> & {
  gains: StabilizationGains;
  mixer: MotorMix;
} {
  if (options.rateHz !== undefined && options.rateHz <= 0) {
    throw new RangeError("rateHz must be greater than 0.");
  }

  assertMotorLimits(options.minMotor ?? 0, options.maxMotor ?? 0xffff);

  return {
    baseThrottle: options.baseThrottle,
    gains: options.gains,
    minMotor: options.minMotor ?? 0,
    maxMotor: options.maxMotor ?? 0xffff,
    maxMotorStep: options.maxMotorStep ?? Number.POSITIVE_INFINITY,
    rateHz: options.rateHz ?? 50,
    attitudeScale: options.attitudeScale ?? 1,
    staleAttitudeMs: options.staleAttitudeMs ?? 250,
    requestAttitude: options.requestAttitude ?? true,
    zeroMotorsOnStop: options.zeroMotorsOnStop ?? true,
    mixer: options.mixer ?? DEFAULT_CUSTOM_STABILIZATION_MIXER,
  };
}

function scaleAttitude(attitude: Attitude, scale: number): Attitude {
  return {
    roll: attitude.roll * scale,
    pitch: attitude.pitch * scale,
    yaw: attitude.yaw * scale,
  };
}

function limitMotorStep(
  motorSpeeds: MotorSpeeds,
  previous: MotorSpeeds | undefined,
  maxStep: number,
): MotorSpeeds {
  if (!previous || !Number.isFinite(maxStep)) {
    return motorSpeeds;
  }

  const limit = Math.max(0, maxStep);
  return {
    frontRight: clampInteger(motorSpeeds.frontRight, previous.frontRight - limit, previous.frontRight + limit),
    backRight: clampInteger(motorSpeeds.backRight, previous.backRight - limit, previous.backRight + limit),
    backLeft: clampInteger(motorSpeeds.backLeft, previous.backLeft - limit, previous.backLeft + limit),
    frontLeft: clampInteger(motorSpeeds.frontLeft, previous.frontLeft - limit, previous.frontLeft + limit),
  };
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function view(bytes: Bytes, offset: number, length: number): DataView {
  return new DataView(bytes.buffer, bytes.byteOffset + offset, length);
}

function readI8(value: number): number {
  return value & 0x80 ? value - 0x100 : value;
}

function readI16(bytes: Bytes, offset: number): number {
  return view(bytes, offset, 2).getInt16(0, true);
}

function readU16(bytes: Bytes, offset: number): number {
  return view(bytes, offset, 2).getUint16(0, true);
}

function readU32(bytes: Bytes, offset: number): number {
  return view(bytes, offset, 4).getUint32(0, true);
}

function readF32(bytes: Bytes, offset: number): number {
  return view(bytes, offset, 4).getFloat32(0, true);
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

function assertMotorLimits(minMotor: number, maxMotor: number): void {
  if (minMotor > maxMotor) {
    throw new RangeError("minMotor must be less than or equal to maxMotor.");
  }
}

function clampInteger(value: number, min: number, max: number): number {
  return Math.round(clampNumber(value, min, max));
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function concat(left: Bytes, right: Bytes): Bytes {
  const result = new Uint8Array(left.length + right.length);
  result.set(left, 0);
  result.set(right, left.length);
  return result;
}
