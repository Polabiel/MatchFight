import { sql, relations } from "drizzle-orm";
import { pgTable, pgEnum, uniqueIndex, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { user } from "./auth-schema";

export const roleEnum = pgEnum("role", ["fighter", "judge", "both"]);
export const weightClassEnum = pgEnum("weight_class", [
  "flyweight", "bantamweight", "featherweight", "lightweight",
  "welterweight", "middleweight", "light_heavyweight", "heavyweight",
]);
export const swipeChoiceEnum = pgEnum("swipe_choice", ["like", "pass"]);
export const fightStatusEnum = pgEnum("fight_status", [
  "pending", "scheduled", "completed", "cancelled",
]);

export const Post = pgTable("post", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  title: t.varchar({ length: 256 }).notNull(),
  content: t.text().notNull(),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t
    .timestamp({ mode: "date", withTimezone: true })
    .$onUpdateFn(() => sql`now()`),
}));

export const Profile = pgTable("profile", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  userId: t.text('user_id').notNull().unique().references(() => user.id, { onDelete: "cascade" }),
  nickname: t.varchar({ length: 64 }).notNull(),
  bio: t.text(),
  role: roleEnum("role").notNull(),
  weightClass: weightClassEnum("weight_class"),
  wins: t.integer().notNull().default(0),
  losses: t.integer().notNull().default(0),
  location: t.varchar({ length: 128 }),
  createdAt: t.timestamp('created_at').defaultNow().notNull(),
  updatedAt: t.timestamp('updated_at', { mode: "date", withTimezone: true }).$onUpdateFn(() => sql`now()`),
}));

export const Swipe = pgTable("swipe", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  swiperId: t.text('swiper_id').notNull().references(() => user.id, { onDelete: "cascade" }),
  targetId: t.text('target_id').notNull().references(() => user.id, { onDelete: "cascade" }),
  choice: swipeChoiceEnum("choice").notNull(),
  createdAt: t.timestamp('created_at').defaultNow().notNull(),
}), (t) => [uniqueIndex("swipe_unique_pair").on(t.swiperId, t.targetId), index("swipe_target_idx").on(t.targetId)]);

export const Fight = pgTable("fight", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  fighter1Id: t.text('fighter1_id').notNull().references(() => user.id, { onDelete: "cascade" }),
  fighter2Id: t.text('fighter2_id').notNull().references(() => user.id, { onDelete: "cascade" }),
  judgeId: t.text('judge_id').references(() => user.id, { onDelete: "set null" }),
  status: fightStatusEnum("status").notNull().default("pending"),
  location: t.varchar({ length: 256 }),
  lat: t.doublePrecision(),
  lng: t.doublePrecision(),
  scheduledAt: t.timestamp('scheduled_at', { mode: "date", withTimezone: true }),
  winnerId: t.text('winner_id').references(() => user.id, { onDelete: "set null" }),
  createdById: t.text('created_by_id').references(() => user.id, { onDelete: "set null" }),
  createdAt: t.timestamp('created_at').defaultNow().notNull(),
  updatedAt: t.timestamp('updated_at', { mode: "date", withTimezone: true }).$onUpdateFn(() => sql`now()`),
}), (t) => [
  index("fight_fighter1_idx").on(t.fighter1Id),
  index("fight_fighter2_idx").on(t.fighter2Id),
  index("fight_pending_judge_idx").on(t.status).where(sql`${t.judgeId} IS NULL`),
]);

export const ChatMessage = pgTable("chat_message", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  fightId: t.uuid('fight_id').notNull().references(() => Fight.id, { onDelete: "cascade" }),
  senderId: t.text('sender_id').notNull().references(() => user.id, { onDelete: "cascade" }),
  content: t.text().notNull(),
  createdAt: t.timestamp('created_at').defaultNow().notNull(),
}), (t) => [index("chat_message_fight_time_idx").on(t.fightId, t.createdAt)]);

export const CreatePostSchema = createInsertSchema(Post, {
  title: z.string().max(256),
  content: z.string().max(256),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const ProfileRelations = relations(Profile, ({ one }) => ({
  user: one(user, { fields: [Profile.userId], references: [user.id] }),
}));

export const FightRelations = relations(Fight, ({ one }) => ({
  fighter1: one(user, { fields: [Fight.fighter1Id], references: [user.id] }),
  fighter2: one(user, { fields: [Fight.fighter2Id], references: [user.id] }),
  judge: one(user, { fields: [Fight.judgeId], references: [user.id] }),
  createdBy: one(user, { fields: [Fight.createdById], references: [user.id] }),
}));

export const SwipeRelations = relations(Swipe, ({ one }) => ({
  swiper: one(user, { fields: [Swipe.swiperId], references: [user.id] }),
  target: one(user, { fields: [Swipe.targetId], references: [user.id] }),
}));

export const ChatMessageRelations = relations(ChatMessage, ({ one }) => ({
  fight: one(Fight, { fields: [ChatMessage.fightId], references: [Fight.id] }),
  sender: one(user, { fields: [ChatMessage.senderId], references: [user.id] }),
}));

export const UserRelations = relations(user, ({ one }) => ({
  profile: one(Profile, { fields: [user.id], references: [Profile.userId] }),
}));

export * from "./auth-schema";