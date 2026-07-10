import type { PaginationMeta } from "@/types/api.types";

export interface PaginationParams {
  page: number;
  limit: number;
  from: number;
  to: number;
}

export function getPaginationParams(searchParams: URLSearchParams): PaginationParams {
  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);
  const requestedLimit = Number(searchParams.get("limit") ?? 12) || 12;
  const limit = Math.min(100, Math.max(1, requestedLimit));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  return { page, limit, from, to };
}

export function getPaginationMeta(
  total: number,
  page: number,
  limit: number,
): PaginationMeta {
  return {
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}
