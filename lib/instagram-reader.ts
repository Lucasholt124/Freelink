export type ReaderReply = {
  ok: boolean;
  error?: string;
  version?: string;
  status?: string;
  batch?: { seq: number; comments: unknown[] } | null;
};
export function readerRequest(
  action: "HELLO" | "START" | "POLL" | "ACK" | "STOP",
  args: Record<string, unknown> = {},
): Promise<ReaderReply> {
  return new Promise((resolve, reject) => {
    const requestId = crypto.randomUUID();
    const finish = (reply?: ReaderReply) => {
      clearTimeout(timer);
      window.removeEventListener("message", receive);
      if (reply) resolve(reply);
      else
        reject(
          new Error(
            "O complemento não respondeu. Verifique a instalação e recarregue esta página.",
          ),
        );
    };
    const receive = (event: MessageEvent) => {
      if (
        event.source !== window ||
        event.origin !== location.origin ||
        event.data?.channel !== "freelinnk-reader-response-v1" ||
        event.data.requestId !== requestId
      )
        return;
      const reply = event.data.result;
      if (!reply || typeof reply.ok !== "boolean") return;
      finish(reply);
    };
    const timer = setTimeout(() => finish(), action === "START" ? 15000 : 5000);
    window.addEventListener("message", receive);
    window.postMessage(
      { ...args, channel: "freelinnk-reader-request-v1", requestId, action },
      location.origin,
    );
  });
}
