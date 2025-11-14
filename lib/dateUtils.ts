export const getBrazilDate = (): string => {
  const now = new Date();
  const brazilTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  const year = brazilTime.getFullYear();
  const month = String(brazilTime.getMonth() + 1).padStart(2, "0");
  const day = String(brazilTime.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getBrazilTime = (): string => {
  const now = new Date();
  const brazilTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  const hours = String(brazilTime.getHours()).padStart(2, "0");
  const minutes = String(brazilTime.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

export const getBrazilDatePlusDays = (days: number): string => {
  const now = new Date();
  const brazilTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  brazilTime.setDate(brazilTime.getDate() + days);
  const year = brazilTime.getFullYear();
  const month = String(brazilTime.getMonth() + 1).padStart(2, "0");
  const day = String(brazilTime.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
