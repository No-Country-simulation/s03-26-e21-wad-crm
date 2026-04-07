export const getFormattedFullDate = (date: Date) =>
  date.toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" });
