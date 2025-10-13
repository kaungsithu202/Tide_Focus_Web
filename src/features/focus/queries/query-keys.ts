export const categoryKeys = {
  all: ["categories"] as const,
  category: (id: number) => [...categoryKeys.all, id] as const,
};
