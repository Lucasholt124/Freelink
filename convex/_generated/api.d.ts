/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as analytics from "../analytics.js";
import type * as brain from "../brain.js";
import type * as client from "../client.js";
import type * as connections from "../connections.js";
import type * as giveaways from "../giveaways.js";
import type * as lib_customizations from "../lib/customizations.js";
import type * as lib_fetchLinkAnalytics from "../lib/fetchLinkAnalytics.js";
import type * as lib_getBaseUrl from "../lib/getBaseUrl.js";
import type * as lib_links from "../lib/links.js";
import type * as lib_usernames from "../lib/usernames.js";
import type * as mentor from "../mentor.js";
import type * as shareAchievements from "../shareAchievements.js";
import type * as shortLinks from "../shortLinks.js";
import type * as tracking from "../tracking.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  analytics: typeof analytics;
  brain: typeof brain;
  client: typeof client;
  connections: typeof connections;
  giveaways: typeof giveaways;
  "lib/customizations": typeof lib_customizations;
  "lib/fetchLinkAnalytics": typeof lib_fetchLinkAnalytics;
  "lib/getBaseUrl": typeof lib_getBaseUrl;
  "lib/links": typeof lib_links;
  "lib/usernames": typeof lib_usernames;
  mentor: typeof mentor;
  shareAchievements: typeof shareAchievements;
  shortLinks: typeof shortLinks;
  tracking: typeof tracking;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
