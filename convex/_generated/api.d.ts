/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ads from "../ads.js";
import type * as analytics from "../analytics.js";
import type * as client from "../client.js";
import type * as connections from "../connections.js";
import type * as crons from "../crons.js";
import type * as files from "../files.js";
import type * as gamification from "../gamification.js";
import type * as giveaways from "../giveaways.js";
import type * as lib_customizations from "../lib/customizations.js";
import type * as lib_fetchLinkAnalytics from "../lib/fetchLinkAnalytics.js";
import type * as lib_files from "../lib/files.js";
import type * as lib_getBaseUrl from "../lib/getBaseUrl.js";
import type * as lib_links from "../lib/links.js";
import type * as lib_subAccounts from "../lib/subAccounts.js";
import type * as lib_usernames from "../lib/usernames.js";
import type * as profitCalculator from "../profitCalculator.js";
import type * as publicGiveaways from "../publicGiveaways.js";
import type * as shareAchievements from "../shareAchievements.js";
import type * as shortLinks from "../shortLinks.js";
import type * as tracking from "../tracking.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ads: typeof ads;
  analytics: typeof analytics;
  client: typeof client;
  connections: typeof connections;
  crons: typeof crons;
  files: typeof files;
  gamification: typeof gamification;
  giveaways: typeof giveaways;
  "lib/customizations": typeof lib_customizations;
  "lib/fetchLinkAnalytics": typeof lib_fetchLinkAnalytics;
  "lib/files": typeof lib_files;
  "lib/getBaseUrl": typeof lib_getBaseUrl;
  "lib/links": typeof lib_links;
  "lib/subAccounts": typeof lib_subAccounts;
  "lib/usernames": typeof lib_usernames;
  profitCalculator: typeof profitCalculator;
  publicGiveaways: typeof publicGiveaways;
  shareAchievements: typeof shareAchievements;
  shortLinks: typeof shortLinks;
  tracking: typeof tracking;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
