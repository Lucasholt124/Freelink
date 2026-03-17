import { captureException } from "./sentry";

export interface BaseAuthContext {
    auth: {
      getUserIdentity: () => Promise<{ subject: string } | null>;
    };
  }

  export function withSentry<TCtx extends BaseAuthContext, TArgs, TResult>(
    actionName: string,
    handler: (ctx: TCtx, args: TArgs, userId: string) => Promise<TResult>
  ) {
    return async (ctx: TCtx, args: TArgs): Promise<TResult> => {
        const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Usuário não autenticado.");

    try {
      return await handler(ctx, args, identity.subject);
    } catch (error) {
      await captureException(error, {
        userId: identity.subject,
        action: actionName,
        extra: args as Record<string, unknown>,
      });
      throw error;
    }
  };
}