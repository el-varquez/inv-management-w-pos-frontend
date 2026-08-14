export const resolveUtangPrice = (
  sellingPrice: number,
  utangMarkup: number | null,
  defaultMarkup: number
): number => sellingPrice + (utangMarkup ?? defaultMarkup);
