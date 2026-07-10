import { NextResponse } from "next/server";
import type { ApiError, ApiResponse, PaginationMeta } from "@/types/api.types";

export function ok<T>(
  data: T,
  init?: ResponseInit & { meta?: PaginationMeta },
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    { success: true, data, meta: init?.meta },
    { status: init?.status ?? 200, headers: init?.headers },
  );
}

export function fail(
  code: string,
  message: string,
  init?: ResponseInit & { details?: unknown },
): NextResponse<ApiResponse<never>> {
  const error: ApiError = { code, message, details: init?.details };

  return NextResponse.json(
    { success: false, error },
    { status: init?.status ?? 400, headers: init?.headers },
  );
}

export function actionOk<T>(data: T): ApiResponse<T> {
  return { success: true, data };
}

export function actionFail(
  code: string,
  message: string,
  details?: unknown,
): ApiResponse<never> {
  return { success: false, error: { code, message, details } };
}
