import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { storagePut } from "./storage";
import { 
  createPlcProgram, 
  getUserPlcPrograms, 
  getPlcProgramById,
  createParsedPlcData,
  getParsedPlcDataByProgramId,
  createNarrative,
  getNarrativesByProgramId,
  createKnowledgeGraphNode,
  getKnowledgeGraphNodesByProgramId,
  createKnowledgeGraphRelationship,
  getKnowledgeGraphRelationshipsByProgramId,
  createAnalysisResult,
  getAnalysisResultsByProgramId,
} from "./db";
import { parsePlcProgram } from "./plcParser";
import { invokeLLM } from "./_core/llm";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  plc: router({
    upload: protectedProcedure
      .input(z.object({
        fileName: z.string(),
        fileFormat: z.enum(["LD", "ST", "FBD", "SFC"]),
        fileContent: z.string(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const fileBuffer = Buffer.from(input.fileContent);
          const { url: fileUrl, key: fileKey } = await storagePut(
            `plc-programs/${ctx.user.id}/${Date.now()}_${input.fileName}`,
            fileBuffer,
            "text/plain"
          );

          const program = await createPlcProgram({
            userId: ctx.user.id,
            fileName: input.fileName,
            fileFormat: input.fileFormat,
            fileSize: fileBuffer.length,
            fileUrl,
            fileKey,
            description: input.description,
          });

          if (!program) {
            throw new Error("Failed to create PLC program record");
          }

          return {
            success: true,
            programId: program.id,
            fileUrl,
          };
        } catch (error) {
          console.error("PLC upload error:", error);
          throw new Error("Failed to upload PLC program");
        }
      }),

    listPrograms: protectedProcedure
      .query(async ({ ctx }) => {
        return getUserPlcPrograms(ctx.user.id);
      }),

    getProgram: protectedProcedure
      .input(z.object({ programId: z.number() }))
      .query(async ({ input }) => {
        return getPlcProgramById(input.programId);
      }),

    parse: protectedProcedure
      .input(z.object({
        programId: z.number(),
        fileContent: z.string(),
        fileFormat: z.enum(["LD", "ST", "FBD", "SFC"]),
      }))
      .mutation(async ({ input }) => {
        try {
          const parsed = parsePlcProgram(input.fileContent, input.fileFormat);

          await createParsedPlcData({
            programId: input.programId,
            conditions: JSON.stringify(parsed.conditions),
            actions: JSON.stringify(parsed.actions),
            timers: JSON.stringify(parsed.timers),
            counters: JSON.stringify(parsed.counters),
            alarms: JSON.stringify(parsed.alarms),
            interlocks: JSON.stringify(parsed.interlocks),
            processSequences: JSON.stringify(parsed.processSequences),
            equipment: JSON.stringify(parsed.equipment),
            sensors: JSON.stringify(parsed.sensors),
            actuators: JSON.stringify(parsed.actuators),
            safetyRules: JSON.stringify(parsed.safetyRules),
            controlLoops: JSON.stringify(parsed.controlLoops),
            logicBlockCount: parsed.summary.logicBlockCount,
            equipmentCount: parsed.summary.equipmentCount,
            alarmCount: parsed.summary.alarmCount,
            safetyRuleCount: parsed.summary.safetyRuleCount,
            controlLoopCount: parsed.summary.controlLoopCount,
          });

          for (const equipment of parsed.equipment) {
            await createKnowledgeGraphNode({
              programId: input.programId,
              nodeId: equipment.id,
              nodeType: "Equipment",
              label: equipment.name,
              description: equipment.description,
              properties: JSON.stringify(equipment),
            });
          }

          for (const sensor of parsed.sensors) {
            await createKnowledgeGraphNode({
              programId: input.programId,
              nodeId: sensor.id,
              nodeType: "Sensor",
              label: sensor.name,
              description: `${sensor.type} - ${sensor.measuredValue}`,
              properties: JSON.stringify(sensor),
            });
          }

          for (const actuator of parsed.actuators) {
            await createKnowledgeGraphNode({
              programId: input.programId,
              nodeId: actuator.id,
              nodeType: "Actuator",
              label: actuator.name,
              description: `Controls ${actuator.controlsEquipment}`,
              properties: JSON.stringify(actuator),
            });
          }

          for (const alarm of parsed.alarms) {
            await createKnowledgeGraphNode({
              programId: input.programId,
              nodeId: alarm.id,
              nodeType: "Alarm",
              label: alarm.name,
              description: alarm.message,
              properties: JSON.stringify(alarm),
            });
          }

          for (const rule of parsed.safetyRules) {
            await createKnowledgeGraphNode({
              programId: input.programId,
              nodeId: rule.id,
              nodeType: "SafetyRule",
              label: rule.name,
              description: rule.description,
              properties: JSON.stringify(rule),
            });
          }

          for (const sensor of parsed.sensors) {
            const equipment = parsed.equipment.find(e => e.name === sensor.equipment);
            if (equipment) {
              await createKnowledgeGraphRelationship({
                programId: input.programId,
                sourceNodeId: sensor.id,
                targetNodeId: equipment.id,
                relationshipType: "Measures",
              });
            }
          }

          for (const actuator of parsed.actuators) {
            const equipment = parsed.equipment.find(e => e.name === actuator.controlsEquipment);
            if (equipment) {
              await createKnowledgeGraphRelationship({
                programId: input.programId,
                sourceNodeId: actuator.id,
                targetNodeId: equipment.id,
                relationshipType: "Controls",
              });
            }
          }

          return {
            success: true,
            parsed,
          };
        } catch (error) {
          console.error("PLC parse error:", error);
          throw new Error("Failed to parse PLC program");
        }
      }),

    getParsedData: protectedProcedure
      .input(z.object({ programId: z.number() }))
      .query(async ({ input }) => {
        const data = await getParsedPlcDataByProgramId(input.programId);
        if (!data) return null;

        return {
          ...data,
          conditions: data.conditions ? JSON.parse(data.conditions) : [],
          actions: data.actions ? JSON.parse(data.actions) : [],
          timers: data.timers ? JSON.parse(data.timers) : [],
          counters: data.counters ? JSON.parse(data.counters) : [],
          alarms: data.alarms ? JSON.parse(data.alarms) : [],
          interlocks: data.interlocks ? JSON.parse(data.interlocks) : [],
          processSequences: data.processSequences ? JSON.parse(data.processSequences) : [],
          equipment: data.equipment ? JSON.parse(data.equipment) : [],
          sensors: data.sensors ? JSON.parse(data.sensors) : [],
          actuators: data.actuators ? JSON.parse(data.actuators) : [],
          safetyRules: data.safetyRules ? JSON.parse(data.safetyRules) : [],
          controlLoops: data.controlLoops ? JSON.parse(data.controlLoops) : [],
        };
      }),

    getKnowledgeGraph: protectedProcedure
      .input(z.object({ programId: z.number() }))
      .query(async ({ input }) => {
        const nodes = await getKnowledgeGraphNodesByProgramId(input.programId);
        const relationships = await getKnowledgeGraphRelationshipsByProgramId(input.programId);

        return {
          nodes: nodes.map(n => ({
            ...n,
            properties: n.properties ? JSON.parse(n.properties) : {},
          })),
          relationships: relationships.map(r => ({
            ...r,
            properties: r.properties ? JSON.parse(r.properties) : {},
          })),
        };
      }),

    generateNarrative: protectedProcedure
      .input(z.object({
        programId: z.number(),
        stakeholderType: z.enum(["Engineer", "Operator", "Management", "Training", "Maintenance"]),
      }))
      .mutation(async ({ input }) => {
        try {
          const parsedData = await getParsedPlcDataByProgramId(input.programId);
          if (!parsedData) throw new Error("Parsed data not found");

          const program = await getPlcProgramById(input.programId);
          if (!program) throw new Error("Program not found");

          const conditions = parsedData.conditions ? JSON.parse(parsedData.conditions) : [];
          const actions = parsedData.actions ? JSON.parse(parsedData.actions) : [];
          const alarms = parsedData.alarms ? JSON.parse(parsedData.alarms) : [];
          const equipment = parsedData.equipment ? JSON.parse(parsedData.equipment) : [];
          const safetyRules = parsedData.safetyRules ? JSON.parse(parsedData.safetyRules) : [];

          const prompt = `Generate a detailed ${input.stakeholderType} narrative for a PLC program with the following characteristics:
          
Program: ${program.fileName} (${program.fileFormat})
Equipment: ${equipment.map((e: any) => e.name).join(", ")}
Alarms: ${alarms.map((a: any) => a.name).join(", ")}
Safety Rules: ${safetyRules.map((r: any) => r.name).join(", ")}
Conditions: ${conditions.map((c: any) => c.name).join(", ")}
Actions: ${actions.map((a: any) => a.name).join(", ")}

Create a comprehensive narrative that explains:
1. Functional Description: What this PLC program does
2. Sequence of Operation: How it operates step by step
3. Alarm Analysis: What alarms are present and what they mean
4. Safety Interlocks: What safety protections are in place
5. Process Summary: Overall process overview
6. Asset Summary: Equipment and resources involved

Format the response as a detailed narrative suitable for a ${input.stakeholderType}.`;

          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: `You are an expert industrial automation engineer creating a detailed narrative for a ${input.stakeholderType}. Be specific, technical, and professional.`,
              },
              {
                role: "user",
                content: prompt,
              },
            ],
          });

          const responseContent = response.choices[0]?.message?.content;
          const content = typeof responseContent === 'string' ? responseContent : '';

          await createNarrative({
            programId: input.programId,
            stakeholderType: input.stakeholderType,
            title: `${input.stakeholderType} Narrative - ${program.fileName}`,
            content,
            functionalDescription: content.split("\n")[0],
          });

          return {
            success: true,
            narrative: content,
          };
        } catch (error) {
          console.error("Narrative generation error:", error);
          throw new Error("Failed to generate narrative");
        }
      }),

    getNarratives: protectedProcedure
      .input(z.object({ programId: z.number() }))
      .query(async ({ input }) => {
        return getNarrativesByProgramId(input.programId);
      }),

    generateAnalysis: protectedProcedure
      .input(z.object({
        programId: z.number(),
        analysisType: z.enum(["RootCauseAnalysis", "ImpactAnalysis", "ControlDependencyAnalysis", "SafetyAnalysis", "AlarmAnalysis"]),
      }))
      .mutation(async ({ input }) => {
        try {
          const parsedData = await getParsedPlcDataByProgramId(input.programId);
          if (!parsedData) throw new Error("Parsed data not found");

          const program = await getPlcProgramById(input.programId);
          if (!program) throw new Error("Program not found");

          const alarms = parsedData.alarms ? JSON.parse(parsedData.alarms) : [];
          const equipment = parsedData.equipment ? JSON.parse(parsedData.equipment) : [];
          const safetyRules = parsedData.safetyRules ? JSON.parse(parsedData.safetyRules) : [];

          let prompt = "";
          if (input.analysisType === "RootCauseAnalysis") {
            prompt = `Perform a root cause analysis for the PLC program "${program.fileName}". Identify potential failure modes and their root causes based on the following:
Alarms: ${alarms.map((a: any) => `${a.name} (${a.triggerCondition})`).join(", ")}
Equipment: ${equipment.map((e: any) => e.name).join(", ")}`;
          } else if (input.analysisType === "ImpactAnalysis") {
            prompt = `Perform an impact analysis for the PLC program "${program.fileName}". Analyze how failures in one component affect others:
Equipment: ${equipment.map((e: any) => e.name).join(", ")}
Safety Rules: ${safetyRules.map((r: any) => r.name).join(", ")}`;
          } else if (input.analysisType === "ControlDependencyAnalysis") {
            prompt = `Analyze the control dependencies in the PLC program "${program.fileName}":
Equipment: ${equipment.map((e: any) => e.name).join(", ")}
Alarms: ${alarms.map((a: any) => a.name).join(", ")}`;
          } else if (input.analysisType === "SafetyAnalysis") {
            prompt = `Perform a safety analysis for the PLC program "${program.fileName}":
Safety Rules: ${safetyRules.map((r: any) => r.name).join(", ")}
Alarms: ${alarms.map((a: any) => a.name).join(", ")}`;
          } else {
            prompt = `Analyze the alarms in the PLC program "${program.fileName}":
Alarms: ${alarms.map((a: any) => `${a.name} - ${a.message}`).join(", ")}`;
          }

          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: "You are an expert industrial automation engineer. Provide detailed technical analysis.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
          });

          const responseContent = response.choices[0]?.message?.content;
          const content = typeof responseContent === 'string' ? responseContent : '';

          await createAnalysisResult({
            programId: input.programId,
            analysisType: input.analysisType,
            title: `${input.analysisType} - ${program.fileName}`,
            content,
          });

          return {
            success: true,
            analysis: content,
          };
        } catch (error) {
          console.error("Analysis generation error:", error);
          throw new Error("Failed to generate analysis");
        }
      }),

    getAnalysis: protectedProcedure
      .input(z.object({ programId: z.number() }))
      .query(async ({ input }) => {
        return getAnalysisResultsByProgramId(input.programId);
      }),
  }),
});

export type AppRouter = typeof appRouter;
