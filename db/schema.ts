// Intentionally empty by default.
// Add Drizzle tables here when the site actually needs a database.
// See examples/d1/db/schema.ts for an opt-in example.
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const rewardStates = sqliteTable('reward_states', { owner: text('owner').primaryKey(), body: text('body').notNull(), revision: integer('revision').notNull().default(0), updatedAt: text('updated_at').notNull() });
export const requestLimits = sqliteTable('request_limits', { owner: text('owner').primaryKey(), day: text('day').notNull(), count: integer('count').notNull().default(0) });
