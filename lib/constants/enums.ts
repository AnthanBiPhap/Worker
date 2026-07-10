export enum ProductStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}

export enum PostStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  SCHEDULED = "scheduled",
  ARCHIVED = "archived",
}

export enum LeadStatus {
  NEW = "new",
  CONTACTED = "contacted",
  QUALIFIED = "qualified",
  PROPOSAL_SENT = "proposal_sent",
  NEGOTIATING = "negotiating",
  WON = "won",
  LOST = "lost",
  SPAM = "spam",
}

export enum LeadSource {
  WEBSITE = "website",
  CHAT = "chat",
  PRODUCT_PAGE = "product_page",
  BLOG = "blog",
  PHONE = "phone",
  REFERRAL = "referral",
}

export enum UserRole {
  SUPER_ADMIN = "super_admin",
  ADMIN = "admin",
  EDITOR = "editor",
  VIEWER = "viewer",
}

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const MAX_PDF_SIZE = 20 * 1024 * 1024;
export const DEFAULT_PAGINATION_LIMIT = 12;
