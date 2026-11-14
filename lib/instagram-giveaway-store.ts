import type { InstagramSession } from "./instagram-giveaway";
const DATABASE = "freelinnk-instagram-giveaways-v1";
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE, 1);
    request.onupgradeneeded = () =>
      request.result
        .createObjectStore("sessions", { keyPath: "key" })
        .createIndex("owner", "owner");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(
        new Error("Não foi possível abrir o armazenamento deste navegador."),
      );
    request.onblocked = () =>
      reject(new Error("Feche outras abas do sorteio e tente novamente."));
  });
}
export async function loadInstagramSessions(
  owner: string,
): Promise<InstagramSession[]> {
  const db = await openDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction("sessions", "readonly");
      const request = transaction
        .objectStore("sessions")
        .index("owner")
        .getAll(owner);
      request.onsuccess = () =>
        resolve(
          (request.result as { session: InstagramSession }[])
            .map((row) => row.session)
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
        );
      request.onerror = () =>
        reject(
          new Error("Não foi possível recuperar os sorteios deste navegador."),
        );
    });
  } finally {
    db.close();
  }
}
export async function saveInstagramSession(
  owner: string,
  session: InstagramSession,
) {
  const db = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction("sessions", "readwrite");
      transaction
        .objectStore("sessions")
        .put({ key: `${owner}:${session.id}`, owner, session });
      transaction.oncomplete = () => resolve();
      transaction.onerror = () =>
        reject(
          new Error(
            "Não foi possível salvar neste navegador. Exporte a lista antes de continuar.",
          ),
        );
      transaction.onabort = () =>
        reject(new Error("O salvamento foi interrompido. Tente novamente."));
    });
  } finally {
    db.close();
  }
}
