import { z } from "zod/v4";

// Enum values from db schema
const roleEnum = ["fighter", "judge", "both"] as const;
const weightClassEnum = [
  "flyweight",
  "bantamweight",
  "featherweight",
  "lightweight",
  "welterweight",
  "middleweight",
  "light_heavyweight",
  "heavyweight",
] as const;

// Profile schemas
export const createProfile = z.object({
  nickname: z.string().min(1).max(64),
  bio: z.string().max(500).optional(),
  role: z.enum(roleEnum),
  weightClass: z.enum(weightClassEnum).optional(),
  wins: z.number().int().nonnegative().default(0),
  losses: z.number().int().nonnegative().default(0),
  location: z.string().max(128).optional(),
});

export const updateProfile = createProfile.partial();

// Swipe schemas
export const like = z.object({
  targetId: z.string().min(1).max(64),
});

export const pass = z.object({
  targetId: z.string().min(1).max(64),
});

// Fight schemas
export const propose = z.object({
  location: z.string().min(1).max(256),
  lat: z.number().optional(),
  lng: z.number().optional(),
  scheduledAt: z.string().datetime({ offset: true }).refine((date) => {
    return new Date(date) > new Date();
  }, { message: "scheduledAt must be in the future" })
}).superRefine((val, ctx) => {
  const hasLat = val.lat !== undefined;
  const hasLng = val.lng !== undefined;
  if (hasLat !== hasLng) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Both lat and lng must be provided together",
      path: ["lat", "lng"],
    });
  }
});

export const confirm = z.object({
  fightId: z.string().uuid(),
});

export const acceptJudge = z.object({
  fightId: z.string().uuid(),
});

export const complete = z.object({
  fightId: z.string().uuid(),
  winnerId: z.string().min(1).max(64),
});

export const cancel = z.object({
  fightId: z.string().uuid(),
});

// Chat schemas
export const sendMessage = z.object({
  fightId: z.string().uuid(),
  content: z.string().min(1).max(2000),
});

// Export groups
export const profileSchemas = {
  createProfile,
  updateProfile,
};

export const swipeSchemas = {
  like,
  pass,
};

export const fightSchemas = {
  propose,
  confirm,
  acceptJudge,
  complete,
  cancel,
};

export const chatSchemas = {
  sendMessage,
};