export const categoryKeys = {
  all: ["categories"] as const,
  category: (id: string) => [...categoryKeys.all, id] as const,
};
