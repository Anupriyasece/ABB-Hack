CREATE TABLE `analysis_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`programId` int NOT NULL,
	`analysisType` enum('RootCauseAnalysis','ImpactAnalysis','ControlDependencyAnalysis','SafetyAnalysis','AlarmAnalysis') NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`findings` text,
	`recommendations` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `analysis_results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `knowledge_graph_nodes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`programId` int NOT NULL,
	`nodeId` varchar(255) NOT NULL,
	`nodeType` enum('Equipment','Sensor','Actuator','Alarm','ProcessStep','SafetyRule','Operator') NOT NULL,
	`label` varchar(255) NOT NULL,
	`description` text,
	`properties` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `knowledge_graph_nodes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `knowledge_graph_relationships` (
	`id` int AUTO_INCREMENT NOT NULL,
	`programId` int NOT NULL,
	`sourceNodeId` varchar(255) NOT NULL,
	`targetNodeId` varchar(255) NOT NULL,
	`relationshipType` enum('Measures','Controls','Triggers','Prevents','Protects','Causes','Contains','DependsOn') NOT NULL,
	`properties` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `knowledge_graph_relationships_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `narratives` (
	`id` int AUTO_INCREMENT NOT NULL,
	`programId` int NOT NULL,
	`stakeholderType` enum('Engineer','Operator','Management','Training','Maintenance') NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`functionalDescription` text,
	`sequenceOfOperation` text,
	`alarmAnalysis` text,
	`safetyInterlocks` text,
	`processSummary` text,
	`assetSummary` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `narratives_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `parsed_plc_data` (
	`id` int AUTO_INCREMENT NOT NULL,
	`programId` int NOT NULL,
	`conditions` text,
	`actions` text,
	`timers` text,
	`counters` text,
	`alarms` text,
	`interlocks` text,
	`processSequences` text,
	`equipment` text,
	`sensors` text,
	`actuators` text,
	`safetyRules` text,
	`controlLoops` text,
	`logicBlockCount` int DEFAULT 0,
	`equipmentCount` int DEFAULT 0,
	`alarmCount` int DEFAULT 0,
	`safetyRuleCount` int DEFAULT 0,
	`controlLoopCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `parsed_plc_data_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `plc_programs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileFormat` enum('LD','ST','FBD','SFC') NOT NULL,
	`fileSize` int NOT NULL,
	`fileUrl` text NOT NULL,
	`fileKey` varchar(255) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `plc_programs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `analysis_results` ADD CONSTRAINT `analysis_results_programId_plc_programs_id_fk` FOREIGN KEY (`programId`) REFERENCES `plc_programs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `knowledge_graph_nodes` ADD CONSTRAINT `knowledge_graph_nodes_programId_plc_programs_id_fk` FOREIGN KEY (`programId`) REFERENCES `plc_programs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `knowledge_graph_relationships` ADD CONSTRAINT `knowledge_graph_relationships_programId_plc_programs_id_fk` FOREIGN KEY (`programId`) REFERENCES `plc_programs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `narratives` ADD CONSTRAINT `narratives_programId_plc_programs_id_fk` FOREIGN KEY (`programId`) REFERENCES `plc_programs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `parsed_plc_data` ADD CONSTRAINT `parsed_plc_data_programId_plc_programs_id_fk` FOREIGN KEY (`programId`) REFERENCES `plc_programs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `plc_programs` ADD CONSTRAINT `plc_programs_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;