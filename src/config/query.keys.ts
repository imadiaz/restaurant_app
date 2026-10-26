import type { StatisticsFilterDto } from "../service/statistics.service";

const scope = (id?: string) => id ?? "all";

export const queryKeys = {
  categories: {
    all: ["categories"] as const,
  },
  coupons: {
    all: ["coupons"] as const,
    list: (restaurantId?: string) => ["coupons", scope(restaurantId)] as const,
  },
  drivers: {
    all: ["drivers"] as const,
    list: (restaurantId?: string) => ["drivers", scope(restaurantId)] as const,
    locations: (restaurantId?: string) =>
      ["drivers", scope(restaurantId), "locations"] as const,
  },
  menuSections: {
    all: ["menu-sections"] as const,
    list: (restaurantId?: string) =>
      ["menu-sections", scope(restaurantId)] as const,
  },
  modifiers: {
    all: ["modifiers"] as const,
    list: (restaurantId?: string) =>
      ["modifiers", scope(restaurantId)] as const,
  },
  orders: {
    all: ["orders"] as const,
    historyScope: (restaurantId?: string) =>
      ["orders", scope(restaurantId), "history"] as const,
    history: (restaurantId: string | undefined, search: string, status: string, page: number, pageSize: number) =>
      ["orders", scope(restaurantId), "history", search, status, page, pageSize] as const,
    detail: (restaurantId?: string, orderId?: string) =>
      ["orders", scope(restaurantId), "detail", orderId] as const,
    list: (restaurantId?: string, status = "all") =>
      ["orders", scope(restaurantId), status] as const,
  },
  payments: {
    debtSession: (restaurantId: string | null, sessionId: string | null) =>
      ["payments", "debt-session", restaurantId, sessionId] as const,
    status: (restaurantId?: string) =>
      ["payments", "status", scope(restaurantId)] as const,
  },
  products: {
    all: ["products"] as const,
    list: (restaurantId?: string) => ["products", scope(restaurantId)] as const,
  },
  productImports: {
    list: (restaurantId: string) => ['product-imports', restaurantId] as const,
    detail: (restaurantId: string, id?: string) => ['product-import', restaurantId, id] as const,
  },
  promotions: {
    all: ["promotions"] as const,
    list: (restaurantId?: string) =>
      ["promotions", scope(restaurantId)] as const,
  },
  restaurants: {
    all: ["restaurants"] as const,
    list: () => ["restaurants", "all"] as const,
    detail: (restaurantId: string) => ["restaurants", restaurantId] as const,
    fees: (restaurantId?: string) =>
      ["restaurants", scope(restaurantId), "fees"] as const,
  },
  roles: {
    all: ["roles"] as const,
  },
  schedules: {
    detail: (restaurantId?: string) =>
      ["schedules", scope(restaurantId)] as const,
    overrides: (restaurantId?: string) =>
      ["schedules", scope(restaurantId), "overrides"] as const,
  },
  statistics: {
    resource: (resource: string, filters: StatisticsFilterDto) =>
      [
        "statistics",
        resource,
        filters.restaurantId ?? "all",
        filters.startDate ?? null,
        filters.endDate ?? null,
        filters.paymentMethod ?? "all",
      ] as const,
  },
  users: {
    all: ["users"] as const,
    list: (restaurantId?: string) => ["users", scope(restaurantId)] as const,
  },
} as const;
