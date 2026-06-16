import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, plcPrograms, parsedPlcData, narratives, knowledgeGraphNodes, knowledgeGraphRelationships, analysisResults } from "../drizzle/schema";
import { ENV } from './_core/env';
import fs from "fs";
import path from "path";
import os from "os";

const isServerless = !!process.env.NETLIFY || !!process.env.AWS_LAMBDA_FUNCTION_NAME || !!process.env.LAMBDA_TASK_ROOT;
const DB_FILE = isServerless
  ? path.join(os.tmpdir(), "db.json")
  : path.join(process.cwd(), "db.json");

interface LocalDb {
  users: any[];
  plcPrograms: any[];
  parsedPlcData: any[];
  knowledgeGraphNodes: any[];
  knowledgeGraphRelationships: any[];
  narratives: any[];
  analysisResults: any[];
}

const DEFAULT_USER = {
  id: 1,
  openId: "mock-user-openid",
  name: "Default User",
  email: "default@example.com",
  loginMethod: "mock",
  role: "admin",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  lastSignedIn: new Date().toISOString(),
};

function readLocalDb(): LocalDb {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      const db = JSON.parse(content);
      // Ensure arrays exist and mock user is present
      if (!db.users) db.users = [];
      if (!db.plcPrograms) db.plcPrograms = [];
      if (!db.parsedPlcData) db.parsedPlcData = [];
      if (!db.knowledgeGraphNodes) db.knowledgeGraphNodes = [];
      if (!db.knowledgeGraphRelationships) db.knowledgeGraphRelationships = [];
      if (!db.narratives) db.narratives = [];
      if (!db.analysisResults) db.analysisResults = [];

      if (!db.users.some((u: any) => u.openId === "mock-user-openid")) {
        db.users.push(DEFAULT_USER);
        fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
      }
      return db;
    }
  } catch (error) {
    console.error("[Local DB] Failed to read database file:", error);
  }

  const initialDb = {
    users: [DEFAULT_USER],
    plcPrograms: [],
    parsedPlcData: [],
    knowledgeGraphNodes: [],
    knowledgeGraphRelationships: [],
    narratives: [],
    analysisResults: [],
  };

  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), "utf-8");
  } catch (e) {
    console.error("[Local DB] Failed to write initial database file:", e);
  }

  return initialDb;
}

function writeLocalDb(data: LocalDb) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("[Local DB] Failed to write database file:", error);
  }
}

function parseDates<T>(obj: T): T {
  if (!obj) return obj;
  const newObj = { ...obj } as any;
  for (const key of Object.keys(newObj)) {
    if (typeof newObj[key] === "string" && (key.endsWith("At") || key.endsWith("In") || key === "lastSignedIn")) {
      const parsedDate = new Date(newObj[key]);
      if (!isNaN(parsedDate.getTime())) {
        newObj[key] = parsedDate;
      }
    }
  }
  return newObj;
}

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && ENV.databaseUrl) {
    try {
      _db = drizzle(ENV.databaseUrl);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (db) {
    try {
      const values: InsertUser = {
        openId: user.openId,
      };
      const updateSet: Record<string, unknown> = {};

      const textFields = ["name", "email", "loginMethod"] as const;
      type TextField = (typeof textFields)[number];

      const assignNullable = (field: TextField) => {
        const value = user[field];
        if (value === undefined) return;
        const normalized = value ?? null;
        values[field] = normalized;
        updateSet[field] = normalized;
      };

      textFields.forEach(assignNullable);

      if (user.lastSignedIn !== undefined) {
        values.lastSignedIn = user.lastSignedIn;
        updateSet.lastSignedIn = user.lastSignedIn;
      }
      if (user.role !== undefined) {
        values.role = user.role;
        updateSet.role = user.role;
      } else if (user.openId === ENV.ownerOpenId) {
        values.role = 'admin';
        updateSet.role = 'admin';
      }

      if (!values.lastSignedIn) {
        values.lastSignedIn = new Date();
      }

      if (Object.keys(updateSet).length === 0) {
        updateSet.lastSignedIn = new Date();
      }

      await db.insert(users).values(values).onDuplicateKeyUpdate({
        set: updateSet,
      });
    } catch (error) {
      console.error("[Database] Failed to upsert user:", error);
      throw error;
    }
  } else {
    // Local JSON DB
    const localDb = readLocalDb();
    let existing = localDb.users.find(u => u.openId === user.openId);
    const now = new Date().toISOString();

    if (existing) {
      if (user.name !== undefined) existing.name = user.name;
      if (user.email !== undefined) existing.email = user.email;
      if (user.loginMethod !== undefined) existing.loginMethod = user.loginMethod;
      if (user.lastSignedIn !== undefined) existing.lastSignedIn = user.lastSignedIn.toISOString();
      if (user.role !== undefined) existing.role = user.role;
      existing.updatedAt = now;
    } else {
      const id = localDb.users.reduce((max, u) => Math.max(max, u.id), 0) + 1;
      localDb.users.push({
        id,
        openId: user.openId,
        name: user.name ?? null,
        email: user.email ?? null,
        loginMethod: user.loginMethod ?? null,
        role: user.role ?? (user.openId === ENV.ownerOpenId ? "admin" : "user"),
        createdAt: now,
        updatedAt: now,
        lastSignedIn: user.lastSignedIn ? user.lastSignedIn.toISOString() : now,
      });
    }
    writeLocalDb(localDb);
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (db) {
    const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } else {
    const localDb = readLocalDb();
    const user = localDb.users.find(u => u.openId === openId);
    return user ? parseDates(user) : undefined;
  }
}

// PLC Program helpers
export async function createPlcProgram(data: typeof plcPrograms.$inferInsert) {
  const db = await getDb();
  if (db) {
    await db.insert(plcPrograms).values(data);
    const inserted = await db.select().from(plcPrograms).where(eq(plcPrograms.userId, data.userId)).orderBy(desc(plcPrograms.id)).limit(1);
    return inserted.length > 0 ? inserted[0] : null;
  } else {
    const localDb = readLocalDb();
    const id = localDb.plcPrograms.reduce((max, p) => Math.max(max, p.id), 0) + 1;
    const now = new Date().toISOString();
    const record = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };
    localDb.plcPrograms.push(record);
    writeLocalDb(localDb);
    return parseDates(record);
  }
}

export async function getUserPlcPrograms(userId: number) {
  const db = await getDb();
  if (db) {
    const result = await db.select().from(plcPrograms).where(eq(plcPrograms.userId, userId));
    return result;
  } else {
    const localDb = readLocalDb();
    const list = localDb.plcPrograms.filter(p => p.userId === userId);
    return list.map(p => parseDates(p));
  }
}

export async function getPlcProgramById(id: number) {
  const db = await getDb();
  if (db) {
    const result = await db.select().from(plcPrograms).where(eq(plcPrograms.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  } else {
    const localDb = readLocalDb();
    const program = localDb.plcPrograms.find(p => p.id === id);
    return program ? parseDates(program) : null;
  }
}

// Parsed PLC Data helpers
export async function createParsedPlcData(data: typeof parsedPlcData.$inferInsert) {
  const db = await getDb();
  if (db) {
    const result = await db.insert(parsedPlcData).values(data);
    return result;
  } else {
    const localDb = readLocalDb();
    const id = localDb.parsedPlcData.reduce((max, p) => Math.max(max, p.id), 0) + 1;
    const now = new Date().toISOString();
    const record = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };
    localDb.parsedPlcData.push(record);
    writeLocalDb(localDb);
    return parseDates(record);
  }
}

export async function getParsedPlcDataByProgramId(programId: number) {
  const db = await getDb();
  if (db) {
    const result = await db.select().from(parsedPlcData).where(eq(parsedPlcData.programId, programId)).limit(1);
    return result.length > 0 ? result[0] : null;
  } else {
    const localDb = readLocalDb();
    const data = localDb.parsedPlcData.find(p => p.programId === programId);
    return data ? parseDates(data) : null;
  }
}

export async function updateParsedPlcData(programId: number, data: Partial<typeof parsedPlcData.$inferInsert>) {
  const db = await getDb();
  if (db) {
    return db.update(parsedPlcData).set(data).where(eq(parsedPlcData.programId, programId));
  } else {
    const localDb = readLocalDb();
    const existingIndex = localDb.parsedPlcData.findIndex(p => p.programId === programId);
    if (existingIndex !== -1) {
      localDb.parsedPlcData[existingIndex] = {
        ...localDb.parsedPlcData[existingIndex],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      writeLocalDb(localDb);
    }
  }
}

// Narrative helpers
export async function createNarrative(data: typeof narratives.$inferInsert) {
  const db = await getDb();
  if (db) {
    return db.insert(narratives).values(data);
  } else {
    const localDb = readLocalDb();
    const id = localDb.narratives.reduce((max, n) => Math.max(max, n.id), 0) + 1;
    const now = new Date().toISOString();
    const record = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };
    localDb.narratives.push(record);
    writeLocalDb(localDb);
    return parseDates(record);
  }
}

export async function getNarrativesByProgramId(programId: number) {
  const db = await getDb();
  if (db) {
    return db.select().from(narratives).where(eq(narratives.programId, programId));
  } else {
    const localDb = readLocalDb();
    const list = localDb.narratives.filter(n => n.programId === programId);
    return list.map(n => parseDates(n));
  }
}

// Knowledge Graph helpers
export async function createKnowledgeGraphNode(data: typeof knowledgeGraphNodes.$inferInsert) {
  const db = await getDb();
  if (db) {
    return db.insert(knowledgeGraphNodes).values(data);
  } else {
    const localDb = readLocalDb();
    const id = localDb.knowledgeGraphNodes.reduce((max, k) => Math.max(max, k.id), 0) + 1;
    const now = new Date().toISOString();
    const record = {
      ...data,
      id,
      createdAt: now,
    };
    localDb.knowledgeGraphNodes.push(record);
    writeLocalDb(localDb);
    return parseDates(record);
  }
}

export async function getKnowledgeGraphNodesByProgramId(programId: number) {
  const db = await getDb();
  if (db) {
    return db.select().from(knowledgeGraphNodes).where(eq(knowledgeGraphNodes.programId, programId));
  } else {
    const localDb = readLocalDb();
    const list = localDb.knowledgeGraphNodes.filter(k => k.programId === programId);
    return list.map(k => parseDates(k));
  }
}

export async function createKnowledgeGraphRelationship(data: typeof knowledgeGraphRelationships.$inferInsert) {
  const db = await getDb();
  if (db) {
    return db.insert(knowledgeGraphRelationships).values(data);
  } else {
    const localDb = readLocalDb();
    const id = localDb.knowledgeGraphRelationships.reduce((max, k) => Math.max(max, k.id), 0) + 1;
    const now = new Date().toISOString();
    const record = {
      ...data,
      id,
      createdAt: now,
    };
    localDb.knowledgeGraphRelationships.push(record);
    writeLocalDb(localDb);
    return parseDates(record);
  }
}

export async function getKnowledgeGraphRelationshipsByProgramId(programId: number) {
  const db = await getDb();
  if (db) {
    return db.select().from(knowledgeGraphRelationships).where(eq(knowledgeGraphRelationships.programId, programId));
  } else {
    const localDb = readLocalDb();
    const list = localDb.knowledgeGraphRelationships.filter(k => k.programId === programId);
    return list.map(k => parseDates(k));
  }
}

// Analysis Result helpers
export async function createAnalysisResult(data: typeof analysisResults.$inferInsert) {
  const db = await getDb();
  if (db) {
    return db.insert(analysisResults).values(data);
  } else {
    const localDb = readLocalDb();
    const id = localDb.analysisResults.reduce((max, a) => Math.max(max, a.id), 0) + 1;
    const now = new Date().toISOString();
    const record = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };
    localDb.analysisResults.push(record);
    writeLocalDb(localDb);
    return parseDates(record);
  }
}

export async function getAnalysisResultsByProgramId(programId: number) {
  const db = await getDb();
  if (db) {
    return db.select().from(analysisResults).where(eq(analysisResults.programId, programId));
  } else {
    const localDb = readLocalDb();
    const list = localDb.analysisResults.filter(a => a.programId === programId);
    return list.map(a => parseDates(a));
  }
}
