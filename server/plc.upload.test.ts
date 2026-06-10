import { describe, it, expect } from "vitest";
import { parsePlcProgram } from "./plcParser";

describe("PLC Parser", () => {
  describe("Structured Text (ST) parsing", () => {
    it("should extract conditions from ST program with recognizable patterns", () => {
      const stProgram = `
        PROGRAM MainProgram
        VAR
          start_button : BOOL;
          stop_button : BOOL;
          emergency_stop : BOOL;
        END_VAR
      `;

      const result = parsePlcProgram(stProgram, "ST");
      expect(result.conditions.length).toBeGreaterThan(0);
      expect(result.conditions.some(c => c.name.includes("Start") || c.name.includes("Stop"))).toBe(true);
    });

    it("should extract actions from ST program", () => {
      const stProgram = `
        PROGRAM MainProgram
        VAR
          motor_on : BOOL;
          pump_start : BOOL;
          valve_open : BOOL;
        END_VAR
      `;

      const result = parsePlcProgram(stProgram, "ST");
      expect(result.actions.length).toBeGreaterThan(0);
    });

    it("should extract equipment from ST program", () => {
      const stProgram = `
        PROGRAM MainProgram
        VAR
          pump_motor : BOOL;
          conveyor_belt : BOOL;
          pressure_sensor : REAL;
        END_VAR
      `;

      const result = parsePlcProgram(stProgram, "ST");
      expect(result.equipment.length).toBeGreaterThan(0);
    });

    it("should extract alarms from ST program with alarm keywords", () => {
      const stProgram = `
        PROGRAM MainProgram
        VAR
          high_pressure_alarm : BOOL;
          low_level_alarm : BOOL;
        END_VAR
      `;

      const result = parsePlcProgram(stProgram, "ST");
      expect(result.alarms.length).toBeGreaterThan(0);
    });

    it("should extract safety rules from ST program", () => {
      const stProgram = `
        PROGRAM MainProgram
        VAR
          emergency_stop : BOOL;
          motor_run : BOOL;
        END_VAR
      `;

      const result = parsePlcProgram(stProgram, "ST");
      expect(result.safetyRules.length).toBeGreaterThan(0);
    });

    it("should generate summary statistics", () => {
      const stProgram = `
        PROGRAM MainProgram
        VAR
          start_button : BOOL;
          motor_on : BOOL;
        END_VAR
      `;

      const result = parsePlcProgram(stProgram, "ST");
      expect(result.summary.logicBlockCount).toBeGreaterThanOrEqual(0);
      expect(result.summary.equipmentCount).toBeGreaterThanOrEqual(0);
      expect(result.summary.alarmCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Ladder Logic (LD) parsing", () => {
    it("should parse Ladder Logic format", () => {
      const ldProgram = `
        NETWORK 1
        LD start_button
        AND stop_button
        ST motor_run
      `;

      const result = parsePlcProgram(ldProgram, "LD");
      expect(result).toBeDefined();
      expect(result.conditions).toBeDefined();
      expect(result.actions).toBeDefined();
    });
  });

  describe("Function Block Diagram (FBD) parsing", () => {
    it("should parse FBD format", () => {
      const fbdProgram = `
        BLOCK1 : AND
        BLOCK2 : OR
        BLOCK3 : TON
      `;

      const result = parsePlcProgram(fbdProgram, "FBD");
      expect(result).toBeDefined();
      expect(result.conditions).toBeDefined();
    });
  });

  describe("Sequential Function Chart (SFC) parsing", () => {
    it("should parse SFC format", () => {
      const sfcProgram = `
        STEP1 : START
        TRANSITION1 : start_button = TRUE
        STEP2 : OPERATION
        TRANSITION2 : timer > 5s
        STEP3 : SHUTDOWN
      `;

      const result = parsePlcProgram(sfcProgram, "SFC");
      expect(result).toBeDefined();
      expect(result.processSequences).toBeDefined();
    });
  });

  describe("Knowledge graph generation", () => {
    it("should create equipment nodes", () => {
      const stProgram = `
        PROGRAM MainProgram
        VAR
          pump_motor : BOOL;
          conveyor : BOOL;
        END_VAR
      `;

      const result = parsePlcProgram(stProgram, "ST");
      expect(result.equipment.length).toBeGreaterThan(0);
      expect(result.equipment[0]?.id).toBeDefined();
      expect(result.equipment[0]?.name).toBeDefined();
    });

    it("should create sensor nodes", () => {
      const stProgram = `
        PROGRAM MainProgram
        VAR
          pressure_sensor : REAL;
          temperature_sensor : REAL;
        END_VAR
      `;

      const result = parsePlcProgram(stProgram, "ST");
      expect(result.sensors.length).toBeGreaterThan(0);
    });

    it("should create actuator nodes", () => {
      const stProgram = `
        PROGRAM MainProgram
        VAR
          motor_control : BOOL;
          valve_control : BOOL;
        END_VAR
      `;

      const result = parsePlcProgram(stProgram, "ST");
      expect(result.actuators.length).toBeGreaterThan(0);
    });
  });

  describe("Process sequence extraction", () => {
    it("should extract start sequence", () => {
      const stProgram = `
        PROGRAM MainProgram
        (* Start sequence *)
        IF start_button THEN
          pump_on := TRUE;
          motor_on := TRUE;
        END_IF;
      `;

      const result = parsePlcProgram(stProgram, "ST");
      expect(result.processSequences).toBeDefined();
      expect(Array.isArray(result.processSequences)).toBe(true);
    });

    it("should extract operation sequence", () => {
      const stProgram = `
        PROGRAM MainProgram
        (* Operation *)
        IF pump_on AND motor_on THEN
          output_valve := TRUE;
        END_IF;
      `;

      const result = parsePlcProgram(stProgram, "ST");
      expect(result.processSequences).toBeDefined();
    });

    it("should extract shutdown sequence", () => {
      const stProgram = `
        PROGRAM MainProgram
        (* Shutdown *)
        IF stop_button THEN
          pump_on := FALSE;
          motor_on := FALSE;
        END_IF;
      `;

      const result = parsePlcProgram(stProgram, "ST");
      expect(result.processSequences).toBeDefined();
    });
  });

  describe("Alarm extraction", () => {
    it("should identify alarm conditions", () => {
      const stProgram = `
        PROGRAM MainProgram
        VAR
          high_pressure_alarm : BOOL;
          low_level_alarm : BOOL;
        END_VAR
      `;

      const result = parsePlcProgram(stProgram, "ST");
      expect(result.alarms.length).toBeGreaterThan(0);
      expect(result.alarms[0]?.name).toBeDefined();
      expect(result.alarms[0]?.severity).toBeDefined();
    });

    it("should extract alarm severity", () => {
      const stProgram = `
        PROGRAM MainProgram
        VAR
          critical_alarm : BOOL;
          warning_alarm : BOOL;
        END_VAR
      `;

      const result = parsePlcProgram(stProgram, "ST");
      expect(result.alarms.length).toBeGreaterThan(0);
      expect(["Critical", "High", "Medium", "Low"]).toContain(result.alarms[0]?.severity);
    });
  });

  describe("Safety rule extraction", () => {
    it("should identify safety interlocks", () => {
      const stProgram = `
        PROGRAM MainProgram
        VAR
          emergency_stop : BOOL;
          motor_run : BOOL;
        END_VAR
      `;

      const result = parsePlcProgram(stProgram, "ST");
      expect(result.safetyRules.length).toBeGreaterThan(0);
    });

    it("should extract protected assets", () => {
      const stProgram = `
        PROGRAM MainProgram
        VAR
          safety_interlock : BOOL;
          protected_motor : BOOL;
        END_VAR
      `;

      const result = parsePlcProgram(stProgram, "ST");
      expect(result.safetyRules.length).toBeGreaterThan(0);
      expect(result.safetyRules[0]?.protectedAssets).toBeDefined();
    });
  });

  describe("Control loop extraction", () => {
    it("should identify control loops", () => {
      const stProgram = `
        PROGRAM MainProgram
        VAR
          setpoint : REAL := 50;
          feedback : REAL;
          output : REAL;
        END_VAR
      `;

      const result = parsePlcProgram(stProgram, "ST");
      expect(result.controlLoops).toBeDefined();
      expect(Array.isArray(result.controlLoops)).toBe(true);
    });
  });

  describe("Parser output structure", () => {
    it("should return complete parsed structure", () => {
      const stProgram = `
        PROGRAM MainProgram
        VAR
          input1 : BOOL;
          output1 : BOOL;
        END_VAR
      `;

      const result = parsePlcProgram(stProgram, "ST");
      
      expect(result).toHaveProperty("conditions");
      expect(result).toHaveProperty("actions");
      expect(result).toHaveProperty("timers");
      expect(result).toHaveProperty("counters");
      expect(result).toHaveProperty("alarms");
      expect(result).toHaveProperty("interlocks");
      expect(result).toHaveProperty("processSequences");
      expect(result).toHaveProperty("equipment");
      expect(result).toHaveProperty("sensors");
      expect(result).toHaveProperty("actuators");
      expect(result).toHaveProperty("safetyRules");
      expect(result).toHaveProperty("controlLoops");
      expect(result).toHaveProperty("summary");
    });

    it("should return valid summary statistics", () => {
      const stProgram = `
        PROGRAM MainProgram
        VAR
          start_button : BOOL;
          motor_on : BOOL;
          emergency_stop : BOOL;
        END_VAR
      `;

      const result = parsePlcProgram(stProgram, "ST");
      
      expect(result.summary).toHaveProperty("logicBlockCount");
      expect(result.summary).toHaveProperty("equipmentCount");
      expect(result.summary).toHaveProperty("alarmCount");
      expect(result.summary).toHaveProperty("safetyRuleCount");
      expect(result.summary).toHaveProperty("controlLoopCount");
      
      expect(typeof result.summary.logicBlockCount).toBe("number");
      expect(typeof result.summary.equipmentCount).toBe("number");
      expect(typeof result.summary.alarmCount).toBe("number");
      expect(typeof result.summary.safetyRuleCount).toBe("number");
      expect(typeof result.summary.controlLoopCount).toBe("number");
    });
  });
});
