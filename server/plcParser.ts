/**
 * PLC Parser Engine
 * Simulates parsing of IEC 61131-3 PLC programs and converts them to UIR
 * (Universal Intermediate Representation)
 */

export interface Condition {
  id: string;
  name: string;
  type: string;
  description: string;
}

export interface Action {
  id: string;
  name: string;
  type: string;
  description: string;
}

export interface Timer {
  id: string;
  name: string;
  duration: number;
  unit: string;
}

export interface Counter {
  id: string;
  name: string;
  initialValue: number;
  maxValue: number;
}

export interface Alarm {
  id: string;
  name: string;
  triggerCondition: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  message: string;
  affectedEquipment: string[];
  potentialCauses: string[];
  recommendedActions: string[];
}

export interface Interlock {
  id: string;
  name: string;
  description: string;
  conditions: string[];
  preventedAction: string;
}

export interface ProcessSequence {
  id: string;
  name: string;
  steps: SequenceStep[];
}

export interface SequenceStep {
  order: number;
  name: string;
  description: string;
  conditions: string[];
  actions: string[];
}

export interface Equipment {
  id: string;
  name: string;
  type: string;
  description: string;
  controlledBy: string[];
  monitoredBy: string[];
}

export interface Sensor {
  id: string;
  name: string;
  type: string;
  measuredValue: string;
  unit: string;
  equipment: string;
}

export interface Actuator {
  id: string;
  name: string;
  type: string;
  controlsEquipment: string;
  possibleStates: string[];
}

export interface SafetyRule {
  id: string;
  name: string;
  description: string;
  protectedAssets: string[];
  triggerConditions: string[];
  safetyActions: string[];
}

export interface ControlLoop {
  id: string;
  name: string;
  inputSignal: string;
  outputSignal: string;
  controlType: string;
  setpoint?: number;
}

export interface ParsedUIR {
  conditions: Condition[];
  actions: Action[];
  timers: Timer[];
  counters: Counter[];
  alarms: Alarm[];
  interlocks: Interlock[];
  processSequences: ProcessSequence[];
  equipment: Equipment[];
  sensors: Sensor[];
  actuators: Actuator[];
  safetyRules: SafetyRule[];
  controlLoops: ControlLoop[];
  summary: {
    logicBlockCount: number;
    equipmentCount: number;
    alarmCount: number;
    safetyRuleCount: number;
    controlLoopCount: number;
  };
}

/**
 * Parse PLC file content and extract UIR
 * This is a simulation that demonstrates the structure
 */
export function parsePlcProgram(fileContent: string, fileFormat: string): ParsedUIR {
  // Simulate parsing based on file format
  // In a real implementation, this would parse actual PLC syntax
  
  const parsed: ParsedUIR = {
    conditions: extractConditions(fileContent),
    actions: extractActions(fileContent),
    timers: extractTimers(fileContent),
    counters: extractCounters(fileContent),
    alarms: extractAlarms(fileContent),
    interlocks: extractInterlocks(fileContent),
    processSequences: extractProcessSequences(fileContent),
    equipment: extractEquipment(fileContent),
    sensors: extractSensors(fileContent),
    actuators: extractActuators(fileContent),
    safetyRules: extractSafetyRules(fileContent),
    controlLoops: extractControlLoops(fileContent),
    summary: {
      logicBlockCount: 0,
      equipmentCount: 0,
      alarmCount: 0,
      safetyRuleCount: 0,
      controlLoopCount: 0,
    },
  };

  // Calculate summary counts
  parsed.summary.logicBlockCount = parsed.conditions.length + parsed.actions.length;
  parsed.summary.equipmentCount = parsed.equipment.length;
  parsed.summary.alarmCount = parsed.alarms.length;
  parsed.summary.safetyRuleCount = parsed.safetyRules.length;
  parsed.summary.controlLoopCount = parsed.controlLoops.length;

  return parsed;
}

function extractConditions(content: string): Condition[] {
  // Simulate condition extraction from PLC code
  const conditions: Condition[] = [];
  
  // Look for common patterns like "IF", "WHEN", etc.
  const patterns = [
    { regex: /start_button|START/gi, name: "Start Button", type: "Input" },
    { regex: /stop_button|STOP/gi, name: "Stop Button", type: "Input" },
    { regex: /emergency_stop|E_STOP/gi, name: "Emergency Stop", type: "Safety" },
    { regex: /fault|FAULT/gi, name: "Fault Condition", type: "Error" },
    { regex: /pressure.*high|HIGH_PRESSURE/gi, name: "High Pressure", type: "Sensor" },
    { regex: /temperature.*high|HIGH_TEMP/gi, name: "High Temperature", type: "Sensor" },
    { regex: /level.*low|LOW_LEVEL/gi, name: "Low Level", type: "Sensor" },
  ];

  patterns.forEach((pattern, index) => {
    if (pattern.regex.test(content)) {
      conditions.push({
        id: `cond_${index}`,
        name: pattern.name,
        type: pattern.type,
        description: `Condition: ${pattern.name}`,
      });
    }
  });

  return conditions;
}

function extractActions(content: string): Action[] {
  const actions: Action[] = [];
  
  const patterns = [
    { regex: /motor_on|MOTOR_START|motor.*start/gi, name: "Motor Start", type: "Actuator" },
    { regex: /motor_off|MOTOR_STOP|motor.*stop/gi, name: "Motor Stop", type: "Actuator" },
    { regex: /pump_on|PUMP_START|pump.*start/gi, name: "Pump Start", type: "Actuator" },
    { regex: /pump_off|PUMP_STOP|pump.*stop/gi, name: "Pump Stop", type: "Actuator" },
    { regex: /valve_open|VALVE_OPEN/gi, name: "Valve Open", type: "Actuator" },
    { regex: /valve_close|VALVE_CLOSE/gi, name: "Valve Close", type: "Actuator" },
    { regex: /alarm_on|ALARM_SET|alarm.*set/gi, name: "Alarm Set", type: "Signal" },
    { regex: /alarm_off|ALARM_CLEAR|alarm.*clear/gi, name: "Alarm Clear", type: "Signal" },
  ];

  patterns.forEach((pattern, index) => {
    if (pattern.regex.test(content)) {
      actions.push({
        id: `act_${index}`,
        name: pattern.name,
        type: pattern.type,
        description: `Action: ${pattern.name}`,
      });
    }
  });

  return actions;
}

function extractTimers(content: string): Timer[] {
  const timers: Timer[] = [];
  
  const timerPatterns = [
    { regex: /timer.*(\d+)\s*(ms|second|minute)/gi, name: "Timer", unit: "ms" },
    { regex: /delay.*(\d+)/gi, name: "Delay", unit: "ms" },
  ];

  let timerIndex = 0;
  timerPatterns.forEach((pattern) => {
    const matches = Array.from(content.matchAll(pattern.regex));
    matches.forEach((match) => {
      if (timerIndex < 5) { // Limit to 5 timers
        timers.push({
          id: `timer_${timerIndex}`,
          name: `${pattern.name}_${timerIndex}`,
          duration: parseInt(match[1]) || 1000,
          unit: pattern.unit,
        });
        timerIndex++;
      }
    });
  });

  return timers;
}

function extractCounters(content: string): Counter[] {
  const counters: Counter[] = [];
  
  if (/counter|count/gi.test(content)) {
    counters.push({
      id: "counter_0",
      name: "Main Counter",
      initialValue: 0,
      maxValue: 1000,
    });
  }

  return counters;
}

function extractAlarms(content: string): Alarm[] {
  const alarms: Alarm[] = [];
  
  const alarmPatterns = [
    {
      name: "High Pressure Alarm",
      trigger: "Pressure > 100 PSI",
      severity: "High" as const,
      equipment: ["Pump", "Compressor"],
      causes: ["Blockage", "Valve malfunction", "Overpressure"],
      actions: ["Reduce pressure", "Check valve", "Inspect system"],
    },
    {
      name: "Temperature Warning",
      trigger: "Temperature > 80°C",
      severity: "Medium" as const,
      equipment: ["Motor", "Compressor"],
      causes: ["Insufficient cooling", "Overload", "Bearing wear"],
      actions: ["Increase cooling", "Reduce load", "Inspect bearings"],
    },
    {
      name: "Low Level Alarm",
      trigger: "Tank Level < 10%",
      severity: "High" as const,
      equipment: ["Tank", "Pump"],
      causes: ["Leak", "Pump malfunction", "Supply issue"],
      actions: ["Refill tank", "Check for leaks", "Inspect pump"],
    },
    {
      name: "Motor Fault",
      trigger: "Motor current > 50A",
      severity: "Critical" as const,
      equipment: ["Motor"],
      causes: ["Overload", "Mechanical jam", "Electrical fault"],
      actions: ["Stop motor", "Check load", "Inspect wiring"],
    },
  ];

  alarmPatterns.forEach((pattern, index) => {
    if (content.toLowerCase().includes(pattern.name.toLowerCase()) || 
        content.toLowerCase().includes(pattern.trigger.toLowerCase())) {
      alarms.push({
        id: `alarm_${index}`,
        name: pattern.name,
        triggerCondition: pattern.trigger,
        severity: pattern.severity,
        message: `${pattern.name}: ${pattern.trigger}`,
        affectedEquipment: pattern.equipment,
        potentialCauses: pattern.causes,
        recommendedActions: pattern.actions,
      });
    }
  });

  // If no alarms found, add default ones for demonstration
  if (alarms.length === 0) {
    alarms.push(
      {
        id: "alarm_default_1",
        name: "System Fault",
        triggerCondition: "Fault signal detected",
        severity: "High",
        message: "System fault detected",
        affectedEquipment: ["System"],
        potentialCauses: ["Unknown"],
        recommendedActions: ["Check system status"],
      },
      {
        id: "alarm_default_2",
        name: "Communication Error",
        triggerCondition: "No response from device",
        severity: "Medium",
        message: "Communication error detected",
        affectedEquipment: ["Network"],
        potentialCauses: ["Connection lost", "Device offline"],
        recommendedActions: ["Check connection", "Restart device"],
      }
    );
  }

  return alarms;
}

function extractInterlocks(content: string): Interlock[] {
  const interlocks: Interlock[] = [];
  
  interlocks.push({
    id: "interlock_1",
    name: "Safety Interlock 1",
    description: "Prevents motor start if emergency stop is active",
    conditions: ["Emergency Stop Active"],
    preventedAction: "Motor Start",
  });

  interlocks.push({
    id: "interlock_2",
    name: "Pressure Relief",
    description: "Automatically stops pump if pressure exceeds limit",
    conditions: ["Pressure > Max Limit"],
    preventedAction: "Pump Operation",
  });

  return interlocks;
}

function extractProcessSequences(content: string): ProcessSequence[] {
  const sequences: ProcessSequence[] = [];
  
  sequences.push({
    id: "seq_startup",
    name: "Startup Sequence",
    steps: [
      { order: 1, name: "Initialize", description: "Initialize all systems", conditions: ["System Ready"], actions: ["Clear faults"] },
      { order: 2, name: "Pre-check", description: "Perform pre-operation checks", conditions: ["All checks pass"], actions: ["Enable monitoring"] },
      { order: 3, name: "Start", description: "Start main operation", conditions: ["Start command"], actions: ["Start motor"] },
    ],
  });

  sequences.push({
    id: "seq_operation",
    name: "Normal Operation",
    steps: [
      { order: 1, name: "Monitor", description: "Monitor system parameters", conditions: ["System running"], actions: ["Log data"] },
      { order: 2, name: "Control", description: "Maintain setpoints", conditions: ["Setpoint reached"], actions: ["Adjust output"] },
      { order: 3, name: "Protect", description: "Monitor safety limits", conditions: ["Limits exceeded"], actions: ["Trigger alarm"] },
    ],
  });

  sequences.push({
    id: "seq_shutdown",
    name: "Shutdown Sequence",
    steps: [
      { order: 1, name: "Notify", description: "Notify operators", conditions: ["Stop command"], actions: ["Display message"] },
      { order: 2, name: "Ramp down", description: "Gradually reduce operation", conditions: ["Ramp complete"], actions: ["Reduce speed"] },
      { order: 3, name: "Stop", description: "Stop all equipment", conditions: ["Safe to stop"], actions: ["Stop motor"] },
      { order: 4, name: "Secure", description: "Secure the system", conditions: ["All stopped"], actions: ["Lock equipment"] },
    ],
  });

  return sequences;
}

function extractEquipment(content: string): Equipment[] {
  const equipment: Equipment[] = [];
  
  const equipmentPatterns = [
    { name: "Motor", type: "Actuator" },
    { name: "Pump", type: "Actuator" },
    { name: "Compressor", type: "Actuator" },
    { name: "Tank", type: "Storage" },
    { name: "Valve", type: "Control" },
    { name: "Conveyor", type: "Transport" },
  ];

  equipmentPatterns.forEach((eq, index) => {
    if (content.toLowerCase().includes(eq.name.toLowerCase())) {
      equipment.push({
        id: `equip_${index}`,
        name: eq.name,
        type: eq.type,
        description: `${eq.name} - ${eq.type}`,
        controlledBy: [],
        monitoredBy: [],
      });
    }
  });

  // If no equipment found, add defaults
  if (equipment.length === 0) {
    equipment.push(
      { id: "equip_1", name: "Main Motor", type: "Actuator", description: "Primary motor", controlledBy: [], monitoredBy: [] },
      { id: "equip_2", name: "Pump", type: "Actuator", description: "Fluid transfer pump", controlledBy: [], monitoredBy: [] },
      { id: "equip_3", name: "Tank", type: "Storage", description: "Fluid storage tank", controlledBy: [], monitoredBy: [] }
    );
  }

  return equipment;
}

function extractSensors(content: string): Sensor[] {
  const sensors: Sensor[] = [];
  
  const sensorPatterns = [
    { name: "Pressure Sensor", type: "Pressure", value: "Pressure", unit: "PSI", equipment: "Pump" },
    { name: "Temperature Sensor", type: "Temperature", value: "Temperature", unit: "°C", equipment: "Motor" },
    { name: "Level Sensor", type: "Level", value: "Tank Level", unit: "%", equipment: "Tank" },
    { name: "Flow Sensor", type: "Flow", value: "Flow Rate", unit: "GPM", equipment: "Pump" },
    { name: "Current Sensor", type: "Current", value: "Motor Current", unit: "A", equipment: "Motor" },
  ];

  sensorPatterns.forEach((sensor, index) => {
    if (content.toLowerCase().includes(sensor.name.toLowerCase()) ||
        content.toLowerCase().includes(sensor.value.toLowerCase())) {
      sensors.push({
        id: `sensor_${index}`,
        name: sensor.name,
        type: sensor.type,
        measuredValue: sensor.value,
        unit: sensor.unit,
        equipment: sensor.equipment,
      });
    }
  });

  // If no sensors found, add defaults
  if (sensors.length === 0) {
    sensors.push(
      { id: "sensor_1", name: "Pressure Sensor", type: "Pressure", measuredValue: "System Pressure", unit: "PSI", equipment: "Pump" },
      { id: "sensor_2", name: "Temperature Sensor", type: "Temperature", measuredValue: "Motor Temperature", unit: "°C", equipment: "Motor" },
      { id: "sensor_3", name: "Level Sensor", type: "Level", measuredValue: "Tank Level", unit: "%", equipment: "Tank" }
    );
  }

  return sensors;
}

function extractActuators(content: string): Actuator[] {
  const actuators: Actuator[] = [];
  
  const actuatorPatterns = [
    { name: "Motor Contactor", equipment: "Motor", states: ["On", "Off"] },
    { name: "Pump Valve", equipment: "Pump", states: ["Open", "Closed"] },
    { name: "Relief Valve", equipment: "Compressor", states: ["Open", "Closed"] },
    { name: "Solenoid Valve", equipment: "Tank", states: ["Energized", "De-energized"] },
  ];

  actuatorPatterns.forEach((act, index) => {
    if (content.toLowerCase().includes(act.name.toLowerCase())) {
      actuators.push({
        id: `actuator_${index}`,
        name: act.name,
        type: "Control",
        controlsEquipment: act.equipment,
        possibleStates: act.states,
      });
    }
  });

  // If no actuators found, add defaults
  if (actuators.length === 0) {
    actuators.push(
      { id: "actuator_1", name: "Motor Contactor", type: "Control", controlsEquipment: "Motor", possibleStates: ["On", "Off"] },
      { id: "actuator_2", name: "Pump Valve", type: "Control", controlsEquipment: "Pump", possibleStates: ["Open", "Closed"] }
    );
  }

  return actuators;
}

function extractSafetyRules(content: string): SafetyRule[] {
  const rules: SafetyRule[] = [];
  
  rules.push({
    id: "safety_1",
    name: "Emergency Stop Protection",
    description: "Immediately stops all equipment when emergency stop is activated",
    protectedAssets: ["Motor", "Pump", "Compressor"],
    triggerConditions: ["Emergency Stop Button Pressed"],
    safetyActions: ["Stop all motors", "Close all valves", "Activate alarm"],
  });

  rules.push({
    id: "safety_2",
    name: "Overpressure Protection",
    description: "Prevents system damage from excessive pressure",
    protectedAssets: ["Pump", "Tank", "Compressor"],
    triggerConditions: ["Pressure > Max Limit"],
    safetyActions: ["Open relief valve", "Stop pump", "Log event"],
  });

  rules.push({
    id: "safety_3",
    name: "Overtemperature Protection",
    description: "Protects equipment from thermal damage",
    protectedAssets: ["Motor", "Compressor"],
    triggerConditions: ["Temperature > Max Limit"],
    safetyActions: ["Reduce load", "Increase cooling", "Stop if critical"],
  });

  return rules;
}

function extractControlLoops(content: string): ControlLoop[] {
  const loops: ControlLoop[] = [];
  
  loops.push({
    id: "loop_1",
    name: "Pressure Control",
    inputSignal: "Pressure Sensor",
    outputSignal: "Pump Speed",
    controlType: "PID",
    setpoint: 50,
  });

  loops.push({
    id: "loop_2",
    name: "Temperature Control",
    inputSignal: "Temperature Sensor",
    outputSignal: "Cooling Valve",
    controlType: "On-Off",
  });

  loops.push({
    id: "loop_3",
    name: "Level Control",
    inputSignal: "Level Sensor",
    outputSignal: "Fill Valve",
    controlType: "PID",
    setpoint: 50,
  });

  return loops;
}
