import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// TODO: Add your tables here

/**
 * PLC Programs table - stores uploaded PLC files and metadata
 */
export const plcPrograms = mysqlTable("plc_programs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileFormat: mysqlEnum("fileFormat", ["LD", "ST", "FBD", "SFC"]).notNull(),
  fileSize: int("fileSize").notNull(),
  fileUrl: text("fileUrl").notNull(),
  fileKey: varchar("fileKey", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PlcProgram = typeof plcPrograms.$inferSelect;
export type InsertPlcProgram = typeof plcPrograms.$inferInsert;

/**
 * Parsed PLC Data - stores UIR (Universal Intermediate Representation) and extracted elements
 */
export const parsedPlcData = mysqlTable("parsed_plc_data", {
  id: int("id").autoincrement().primaryKey(),
  programId: int("programId").notNull().references(() => plcPrograms.id),
  conditions: text("conditions"),
  actions: text("actions"),
  timers: text("timers"),
  counters: text("counters"),
  alarms: text("alarms"),
  interlocks: text("interlocks"),
  processSequences: text("processSequences"),
  equipment: text("equipment"),
  sensors: text("sensors"),
  actuators: text("actuators"),
  safetyRules: text("safetyRules"),
  controlLoops: text("controlLoops"),
  logicBlockCount: int("logicBlockCount").default(0),
  equipmentCount: int("equipmentCount").default(0),
  alarmCount: int("alarmCount").default(0),
  safetyRuleCount: int("safetyRuleCount").default(0),
  controlLoopCount: int("controlLoopCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ParsedPlcData = typeof parsedPlcData.$inferSelect;
export type InsertParsedPlcData = typeof parsedPlcData.$inferInsert;

/**
 * Knowledge Graph - stores nodes and relationships
 */
export const knowledgeGraphNodes = mysqlTable("knowledge_graph_nodes", {
  id: int("id").autoincrement().primaryKey(),
  programId: int("programId").notNull().references(() => plcPrograms.id),
  nodeId: varchar("nodeId", { length: 255 }).notNull(),
  nodeType: mysqlEnum("nodeType", ["Equipment", "Sensor", "Actuator", "Alarm", "ProcessStep", "SafetyRule", "Operator"]).notNull(),
  label: varchar("label", { length: 255 }).notNull(),
  description: text("description"),
  properties: text("properties"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type KnowledgeGraphNode = typeof knowledgeGraphNodes.$inferSelect;
export type InsertKnowledgeGraphNode = typeof knowledgeGraphNodes.$inferInsert;

/**
 * Knowledge Graph Relationships
 */
export const knowledgeGraphRelationships = mysqlTable("knowledge_graph_relationships", {
  id: int("id").autoincrement().primaryKey(),
  programId: int("programId").notNull().references(() => plcPrograms.id),
  sourceNodeId: varchar("sourceNodeId", { length: 255 }).notNull(),
  targetNodeId: varchar("targetNodeId", { length: 255 }).notNull(),
  relationshipType: mysqlEnum("relationshipType", ["Measures", "Controls", "Triggers", "Prevents", "Protects", "Causes", "Contains", "DependsOn"]).notNull(),
  properties: text("properties"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type KnowledgeGraphRelationship = typeof knowledgeGraphRelationships.$inferSelect;
export type InsertKnowledgeGraphRelationship = typeof knowledgeGraphRelationships.$inferInsert;

/**
 * Narratives - stores AI-generated narratives for different stakeholders
 */
export const narratives = mysqlTable("narratives", {
  id: int("id").autoincrement().primaryKey(),
  programId: int("programId").notNull().references(() => plcPrograms.id),
  stakeholderType: mysqlEnum("stakeholderType", ["Engineer", "Operator", "Management", "Training", "Maintenance"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  functionalDescription: text("functionalDescription"),
  sequenceOfOperation: text("sequenceOfOperation"),
  alarmAnalysis: text("alarmAnalysis"),
  safetyInterlocks: text("safetyInterlocks"),
  processSummary: text("processSummary"),
  assetSummary: text("assetSummary"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Narrative = typeof narratives.$inferSelect;
export type InsertNarrative = typeof narratives.$inferInsert;

/**
 * Analysis Results - stores AI-powered analysis outputs
 */
export const analysisResults = mysqlTable("analysis_results", {
  id: int("id").autoincrement().primaryKey(),
  programId: int("programId").notNull().references(() => plcPrograms.id),
  analysisType: mysqlEnum("analysisType", ["RootCauseAnalysis", "ImpactAnalysis", "ControlDependencyAnalysis", "SafetyAnalysis", "AlarmAnalysis"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  findings: text("findings"),
  recommendations: text("recommendations"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AnalysisResult = typeof analysisResults.$inferSelect;
export type InsertAnalysisResult = typeof analysisResults.$inferInsert;
