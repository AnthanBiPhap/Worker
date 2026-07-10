"use server";

import { actionFail, actionOk } from "@/lib/api/response";
import { AuthError, requireEditor } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { productSchema, type ProductInput } from "@/lib/validations/product.schema";
import type { ApiResponse } from "@/types/api.types";
import type { Json, Tables } from "@/types/database.types";

function toProductPayload(input: ProductInput, createdBy?: string) {
  return {
    category_id: input.categoryId,
    name: input.name,
    slug: input.slug,
    sku: input.sku || null,
    short_description: input.shortDescription ?? null,
    description: input.description ?? null,
    specifications: input.specifications as Json,
    price_from: input.priceFrom ?? null,
    price_to: input.priceTo ?? null,
    images: input.images as Json,
    catalog_url: input.catalogUrl || null,
    status: input.status,
    is_featured: input.isFeatured,
    sort_order: input.sortOrder,
    meta_title: input.metaTitle ?? null,
    meta_description: input.metaDescription ?? null,
    meta_keywords: input.metaKeywords ?? null,
    og_image_url: input.ogImageUrl || null,
    created_by: createdBy,
  };
}

export async function createProduct(
  input: ProductInput,
): Promise<ApiResponse<Tables<"products">>> {
  try {
    const profile = await requireEditor();
    const parsed = productSchema.safeParse(input);

    if (!parsed.success) {
      return actionFail("VALIDATION_ERROR", "Dữ liệu sản phẩm không hợp lệ", parsed.error.flatten());
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .insert(toProductPayload(parsed.data, profile.id))
      .select("*")
      .single();

    if (error) {
      return actionFail("DATABASE_ERROR", "Không thể tạo sản phẩm", error.message);
    }

    return actionOk(data);
  } catch (error) {
    if (error instanceof AuthError) {
      return actionFail(error.code, error.message);
    }

    return actionFail("UNKNOWN_ERROR", "Không thể tạo sản phẩm");
  }
}

export async function updateProduct(
  id: string,
  input: ProductInput,
): Promise<ApiResponse<Tables<"products">>> {
  try {
    await requireEditor();
    const parsed = productSchema.safeParse(input);

    if (!parsed.success) {
      return actionFail("VALIDATION_ERROR", "Dữ liệu sản phẩm không hợp lệ", parsed.error.flatten());
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .update(toProductPayload(parsed.data))
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return actionFail("DATABASE_ERROR", "Không thể cập nhật sản phẩm", error.message);
    }

    return actionOk(data);
  } catch (error) {
    if (error instanceof AuthError) {
      return actionFail(error.code, error.message);
    }

    return actionFail("UNKNOWN_ERROR", "Không thể cập nhật sản phẩm");
  }
}

export async function deleteProduct(id: string): Promise<ApiResponse<{ id: string }>> {
  try {
    await requireEditor();
    const supabase = await createClient();
    const { error } = await supabase
      .from("products")
      .update({ status: "archived" })
      .eq("id", id);

    if (error) {
      return actionFail("DATABASE_ERROR", "Không thể lưu trữ sản phẩm", error.message);
    }

    return actionOk({ id });
  } catch (error) {
    if (error instanceof AuthError) {
      return actionFail(error.code, error.message);
    }

    return actionFail("UNKNOWN_ERROR", "Không thể lưu trữ sản phẩm");
  }
}
