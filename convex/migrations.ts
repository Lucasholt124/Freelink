import { internalMutation } from "./_generated/server";

export const fixNotificationSentField = internalMutation({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db.query("scheduledPosts").collect();

    let updated = 0;
    for (const post of posts) {
      if (post.notificationSent === undefined) {
        await ctx.db.patch(post._id, {
          notificationSent: false
        });
        updated++;
      }
    }

    console.log(`✅ Atualizados ${updated} de ${posts.length} posts`);
    return { updated, total: posts.length };
  },
});