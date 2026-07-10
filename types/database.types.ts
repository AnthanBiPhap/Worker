export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Nullable<T> = T | null;

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: Nullable<string>;
          avatar_url: Nullable<string>;
          role: "super_admin" | "admin" | "editor" | "viewer";
          phone: Nullable<string>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: Nullable<string>;
          avatar_url?: Nullable<string>;
          role?: "super_admin" | "admin" | "editor" | "viewer";
          phone?: Nullable<string>;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      product_categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: Nullable<string>;
          image_url: Nullable<string>;
          parent_id: Nullable<string>;
          sort_order: Nullable<number>;
          is_active: boolean;
          meta_title: Nullable<string>;
          meta_description: Nullable<string>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: Nullable<string>;
          image_url?: Nullable<string>;
          parent_id?: Nullable<string>;
          sort_order?: Nullable<number>;
          is_active?: boolean;
          meta_title?: Nullable<string>;
          meta_description?: Nullable<string>;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["product_categories"]["Insert"]>;
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          category_id: string;
          name: string;
          slug: string;
          sku: Nullable<string>;
          short_description: Nullable<string>;
          description: Nullable<string>;
          specifications: Json;
          price_from: Nullable<number>;
          price_to: Nullable<number>;
          images: Json;
          catalog_url: Nullable<string>;
          status: "draft" | "published" | "archived";
          is_featured: boolean;
          sort_order: Nullable<number>;
          view_count: number;
          meta_title: Nullable<string>;
          meta_description: Nullable<string>;
          meta_keywords: Nullable<string>;
          og_image_url: Nullable<string>;
          search_vector: unknown;
          created_by: Nullable<string>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          name: string;
          slug: string;
          sku?: Nullable<string>;
          short_description?: Nullable<string>;
          description?: Nullable<string>;
          specifications?: Json;
          price_from?: Nullable<number>;
          price_to?: Nullable<number>;
          images?: Json;
          catalog_url?: Nullable<string>;
          status?: "draft" | "published" | "archived";
          is_featured?: boolean;
          sort_order?: Nullable<number>;
          view_count?: number;
          meta_title?: Nullable<string>;
          meta_description?: Nullable<string>;
          meta_keywords?: Nullable<string>;
          og_image_url?: Nullable<string>;
          search_vector?: unknown;
          created_by?: Nullable<string>;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [];
      };
      product_colors: {
        Row: {
          id: string;
          product_id: string;
          name: string;
          hex_code: Nullable<string>;
          image_url: Nullable<string>;
          sort_order: Nullable<number>;
        };
        Insert: {
          id?: string;
          product_id: string;
          name: string;
          hex_code?: Nullable<string>;
          image_url?: Nullable<string>;
          sort_order?: Nullable<number>;
        };
        Update: Partial<Database["public"]["Tables"]["product_colors"]["Insert"]>;
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          title: string;
          slug: string;
          client_name: Nullable<string>;
          location: Nullable<string>;
          area: Nullable<string>;
          project_type: Nullable<string>;
          completion_date: Nullable<string>;
          description: Nullable<string>;
          images: Json;
          cover_image_url: Nullable<string>;
          is_featured: boolean;
          status: "draft" | "published" | "archived";
          meta_title: Nullable<string>;
          meta_description: Nullable<string>;
          created_by: Nullable<string>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          client_name?: Nullable<string>;
          location?: Nullable<string>;
          area?: Nullable<string>;
          project_type?: Nullable<string>;
          completion_date?: Nullable<string>;
          description?: Nullable<string>;
          images?: Json;
          cover_image_url?: Nullable<string>;
          is_featured?: boolean;
          status?: "draft" | "published" | "archived";
          meta_title?: Nullable<string>;
          meta_description?: Nullable<string>;
          created_by?: Nullable<string>;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["projects"]["Insert"]>;
        Relationships: [];
      };
      blog_categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: Nullable<string>;
          sort_order: Nullable<number>;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: Nullable<string>;
          sort_order?: Nullable<number>;
          is_active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["blog_categories"]["Insert"]>;
        Relationships: [];
      };
      blog_posts: {
        Row: {
          id: string;
          category_id: Nullable<string>;
          author_id: Nullable<string>;
          title: string;
          slug: string;
          excerpt: Nullable<string>;
          content: Nullable<string>;
          cover_image_url: Nullable<string>;
          cover_image_alt: Nullable<string>;
          status: "draft" | "published" | "scheduled" | "archived";
          published_at: Nullable<string>;
          scheduled_at: Nullable<string>;
          view_count: number;
          read_time_min: Nullable<number>;
          tags: Nullable<string[]>;
          meta_title: Nullable<string>;
          meta_description: Nullable<string>;
          meta_keywords: Nullable<string>;
          og_image_url: Nullable<string>;
          canonical_url: Nullable<string>;
          search_vector: unknown;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id?: Nullable<string>;
          author_id?: Nullable<string>;
          title: string;
          slug: string;
          excerpt?: Nullable<string>;
          content?: Nullable<string>;
          cover_image_url?: Nullable<string>;
          cover_image_alt?: Nullable<string>;
          status?: "draft" | "published" | "scheduled" | "archived";
          published_at?: Nullable<string>;
          scheduled_at?: Nullable<string>;
          view_count?: number;
          read_time_min?: Nullable<number>;
          tags?: Nullable<string[]>;
          meta_title?: Nullable<string>;
          meta_description?: Nullable<string>;
          meta_keywords?: Nullable<string>;
          og_image_url?: Nullable<string>;
          canonical_url?: Nullable<string>;
          search_vector?: unknown;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["blog_posts"]["Insert"]>;
        Relationships: [];
      };
      leads: {
        Row: {
          id: string;
          full_name: string;
          phone: string;
          email: Nullable<string>;
          company: Nullable<string>;
          lead_type: "individual" | "business" | "architect";
          source: Nullable<string>;
          source_url: Nullable<string>;
          product_interest: Nullable<string>;
          project_description: Nullable<string>;
          budget_range: Nullable<string>;
          area_size: Nullable<string>;
          location: Nullable<string>;
          status: "new" | "contacted" | "qualified" | "proposal_sent" | "negotiating" | "won" | "lost" | "spam";
          priority: "low" | "normal" | "high" | "urgent";
          assigned_to: Nullable<string>;
          notes: Nullable<string>;
          chat_session_id: Nullable<string>;
          utm_source: Nullable<string>;
          utm_medium: Nullable<string>;
          utm_campaign: Nullable<string>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          phone: string;
          email?: Nullable<string>;
          company?: Nullable<string>;
          lead_type?: "individual" | "business" | "architect";
          source?: Nullable<string>;
          source_url?: Nullable<string>;
          product_interest?: Nullable<string>;
          project_description?: Nullable<string>;
          budget_range?: Nullable<string>;
          area_size?: Nullable<string>;
          location?: Nullable<string>;
          status?: "new" | "contacted" | "qualified" | "proposal_sent" | "negotiating" | "won" | "lost" | "spam";
          priority?: "low" | "normal" | "high" | "urgent";
          assigned_to?: Nullable<string>;
          notes?: Nullable<string>;
          chat_session_id?: Nullable<string>;
          utm_source?: Nullable<string>;
          utm_medium?: Nullable<string>;
          utm_campaign?: Nullable<string>;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["leads"]["Insert"]>;
        Relationships: [];
      };
      lead_activities: {
        Row: {
          id: string;
          lead_id: string;
          user_id: Nullable<string>;
          type: "note" | "call" | "email" | "meeting" | "status_change" | "assignment";
          content: Nullable<string>;
          metadata: Nullable<Json>;
          created_at: string;
        };
        Insert: {
          id?: string;
          lead_id: string;
          user_id?: Nullable<string>;
          type: "note" | "call" | "email" | "meeting" | "status_change" | "assignment";
          content?: Nullable<string>;
          metadata?: Nullable<Json>;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["lead_activities"]["Insert"]>;
        Relationships: [];
      };
      chat_sessions: {
        Row: {
          id: string;
          session_token: string;
          visitor_id: Nullable<string>;
          messages: Json;
          lead_id: Nullable<string>;
          page_url: Nullable<string>;
          device_type: Nullable<string>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          session_token: string;
          visitor_id?: Nullable<string>;
          messages?: Json;
          lead_id?: Nullable<string>;
          page_url?: Nullable<string>;
          device_type?: Nullable<string>;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["chat_sessions"]["Insert"]>;
        Relationships: [];
      };
      media_files: {
        Row: {
          id: string;
          file_name: string;
          file_path: string;
          file_url: string;
          file_type: string;
          file_size: Nullable<number>;
          width: Nullable<number>;
          height: Nullable<number>;
          alt_text: Nullable<string>;
          folder: Nullable<string>;
          uploaded_by: Nullable<string>;
          created_at: string;
        };
        Insert: {
          id?: string;
          file_name: string;
          file_path: string;
          file_url: string;
          file_type: string;
          file_size?: Nullable<number>;
          width?: Nullable<number>;
          height?: Nullable<number>;
          alt_text?: Nullable<string>;
          folder?: Nullable<string>;
          uploaded_by?: Nullable<string>;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["media_files"]["Insert"]>;
        Relationships: [];
      };
      site_settings: {
        Row: {
          key: string;
          value: Json;
          label: Nullable<string>;
          updated_by: Nullable<string>;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: Json;
          label?: Nullable<string>;
          updated_by?: Nullable<string>;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["site_settings"]["Insert"]>;
        Relationships: [];
      };
      testimonials: {
        Row: {
          id: string;
          name: string;
          title: Nullable<string>;
          avatar_url: Nullable<string>;
          content: string;
          rating: Nullable<number>;
          project_id: Nullable<string>;
          is_active: boolean;
          sort_order: Nullable<number>;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          title?: Nullable<string>;
          avatar_url?: Nullable<string>;
          content: string;
          rating?: Nullable<number>;
          project_id?: Nullable<string>;
          is_active?: boolean;
          sort_order?: Nullable<number>;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["testimonials"]["Insert"]>;
        Relationships: [];
      };
      customers: {
        Row: {
          id: string;
          full_name: string;
          email: Nullable<string>;
          phone: Nullable<string>;
          company: Nullable<string>;
          customer_type: "individual" | "business" | "architect";
          source: Nullable<string>;
          location: Nullable<string>;
          avatar_url: Nullable<string>;
          first_seen_at: string;
          last_seen_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          email?: Nullable<string>;
          phone?: Nullable<string>;
          company?: Nullable<string>;
          customer_type?: "individual" | "business" | "architect";
          source?: Nullable<string>;
          location?: Nullable<string>;
          avatar_url?: Nullable<string>;
          first_seen_at?: string;
          last_seen_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["customers"]["Insert"]>;
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          customer_id: Nullable<string>;
          lead_id: Nullable<string>;
          title: string;
          category: Nullable<string>;
          amount: number;
          status: "delivered" | "pending" | "canceled";
          order_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number: string;
          customer_id?: Nullable<string>;
          lead_id?: Nullable<string>;
          title: string;
          category?: Nullable<string>;
          amount?: number;
          status?: "delivered" | "pending" | "canceled";
          order_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
        Relationships: [];
      };
      monthly_targets: {
        Row: {
          id: string;
          month: string;
          target_revenue: number;
          target_orders: number;
          target_customers: number;
          note: Nullable<string>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          month: string;
          target_revenue?: number;
          target_orders?: number;
          target_customers?: number;
          note?: Nullable<string>;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["monthly_targets"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type Inserts<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type Updates<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
