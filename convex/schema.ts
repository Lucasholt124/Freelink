import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  usernames: defineTable({
    userId: v.string(), // Clerk user ID
    username: v.string(), // Custom username (must be unique)
  })
    .index("by_user_id", ["userId"])
    .index("by_username", ["username"]),

  links: defineTable({
    userId: v.string(), // Clerk user ID
    title: v.string(), // Display name of the link
    url: v.string(), // Destination URL
    order: v.number(), // Sort order
  })
    .index("by_user", ["userId"])
    .index("by_user_and_order", ["userId", "order"]),

  userCustomizations: defineTable({
    userId: v.string(), // Clerk user ID
    profilePictureStorageId: v.optional(v.id("_storage")), // Convex storage ID for profile picture
    description: v.optional(v.string()), // Custom description
    accentColor: v.optional(v.string()), // Hex color for accent (e.g., "#6366f1")
  }).index("by_user_id", ["userId"]),
});