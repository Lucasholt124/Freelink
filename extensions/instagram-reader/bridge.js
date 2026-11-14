// Only the giveaway workspace can request a collector session.
(() => {
  const allowed =
    (location.protocol === "https:" &&
      !location.port &&
      ["www.freelinnk.com", "freelinnk.com"].includes(location.hostname)) ||
    (location.protocol === "http:" &&
      ["localhost", "127.0.0.1"].includes(location.hostname) &&
      location.port === "5000");
  if (!allowed || !/^\/dashboard\/giveaway\/?$/.test(location.pathname)) return;
  window.addEventListener("message", async (event) => {
    const input = event.data;
    if (
      event.source !== window ||
      event.origin !== location.origin ||
      input?.channel !== "freelinnk-reader-request-v1" ||
      typeof input.requestId !== "string" ||
      input.requestId.length > 100 ||
      !["HELLO", "START", "POLL", "ACK", "STOP"].includes(input.action)
    )
      return;
    try {
      const result = await chrome.runtime.sendMessage({
        ...input,
        kind: "WORKSPACE",
      });
      window.postMessage(
        {
          channel: "freelinnk-reader-response-v1",
          requestId: input.requestId,
          result,
        },
        location.origin,
      );
    } catch {
      window.postMessage(
        {
          channel: "freelinnk-reader-response-v1",
          requestId: input.requestId,
          result: {
            ok: false,
            error:
              "O complemento foi atualizado ou desconectado. Recarregue a página.",
          },
        },
        location.origin,
      );
    }
  });
  window.addEventListener("pagehide", () => {
    chrome.runtime
      .sendMessage({ kind: "WORKSPACE", action: "STOP" })
      .catch(() => {});
  });
})();
