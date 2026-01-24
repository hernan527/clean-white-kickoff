export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      companies: {
        Row: {
          address: string | null
          created_at: string | null
          created_by: string | null
          cuit: string | null
          custom_domain: string | null
          email: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          phone: string | null
          primary_color: string | null
          secondary_color: string | null
          slug: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          created_by?: string | null
          cuit?: string | null
          custom_domain?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          phone?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          slug?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          created_by?: string | null
          cuit?: string | null
          custom_domain?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          slug?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      company_members: {
        Row: {
          company_id: string
          created_at: string | null
          id: string
          invited_by: string | null
          is_active: boolean | null
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          id?: string
          invited_by?: string | null
          is_active?: boolean | null
          role: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          id?: string
          invited_by?: string | null
          is_active?: boolean | null
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      quote_views: {
        Row: {
          downloaded_pdf: boolean | null
          id: string
          ip_address: string | null
          quote_id: string
          referrer: string | null
          time_on_page: number | null
          user_agent: string | null
          viewed_at: string | null
        }
        Insert: {
          downloaded_pdf?: boolean | null
          id?: string
          ip_address?: string | null
          quote_id: string
          referrer?: string | null
          time_on_page?: number | null
          user_agent?: string | null
          viewed_at?: string | null
        }
        Update: {
          downloaded_pdf?: boolean | null
          id?: string
          ip_address?: string | null
          quote_id?: string
          referrer?: string | null
          time_on_page?: number | null
          user_agent?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_views_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "saved_quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_quotes: {
        Row: {
          access_code: string | null
          client_email: string | null
          client_name: string | null
          client_phone: string | null
          company_id: string | null
          created_at: string | null
          custom_message: string | null
          edited_prices: Json | null
          family_group: string | null
          first_viewed_at: string | null
          form_data: Json
          id: string
          is_public: boolean | null
          last_viewed_at: string | null
          notes: string | null
          pdf_html: string | null
          plan_ids: string[] | null
          public_token: string | null
          quote_name: string | null
          request_type: string | null
          residence_zone: string | null
          status: string | null
          updated_at: string | null
          user_id: string
          view_count: number | null
        }
        Insert: {
          access_code?: string | null
          client_email?: string | null
          client_name?: string | null
          client_phone?: string | null
          company_id?: string | null
          created_at?: string | null
          custom_message?: string | null
          edited_prices?: Json | null
          family_group?: string | null
          first_viewed_at?: string | null
          form_data: Json
          id?: string
          is_public?: boolean | null
          last_viewed_at?: string | null
          notes?: string | null
          pdf_html?: string | null
          plan_ids?: string[] | null
          public_token?: string | null
          quote_name?: string | null
          request_type?: string | null
          residence_zone?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          view_count?: number | null
        }
        Update: {
          access_code?: string | null
          client_email?: string | null
          client_name?: string | null
          client_phone?: string | null
          company_id?: string | null
          created_at?: string | null
          custom_message?: string | null
          edited_prices?: Json | null
          family_group?: string | null
          first_viewed_at?: string | null
          form_data?: Json
          id?: string
          is_public?: boolean | null
          last_viewed_at?: string | null
          notes?: string | null
          pdf_html?: string | null
          plan_ids?: string[] | null
          public_token?: string | null
          quote_name?: string | null
          request_type?: string | null
          residence_zone?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "saved_quotes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity: {
        Row: {
          browser: string | null
          city: string | null
          clicks: number | null
          country: string | null
          created_at: string | null
          device_type: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: string | null
          latitude: number | null
          longitude: number | null
          os: string | null
          page_url: string | null
          referrer: string | null
          scroll_depth: number | null
          session_id: string | null
          session_start: string | null
          time_on_page: number | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          browser?: string | null
          city?: string | null
          clicks?: number | null
          country?: string | null
          created_at?: string | null
          device_type?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          latitude?: number | null
          longitude?: number | null
          os?: string | null
          page_url?: string | null
          referrer?: string | null
          scroll_depth?: number | null
          session_id?: string | null
          session_start?: string | null
          time_on_page?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          browser?: string | null
          city?: string | null
          clicks?: number | null
          country?: string | null
          created_at?: string | null
          device_type?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          latitude?: number | null
          longitude?: number | null
          os?: string | null
          page_url?: string | null
          referrer?: string | null
          scroll_depth?: number | null
          session_id?: string | null
          session_start?: string | null
          time_on_page?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vendor_profiles: {
        Row: {
          business_name: string | null
          created_at: string | null
          id: string
          instagram_url: string | null
          is_public: boolean | null
          linkedin_url: string | null
          logo_url: string | null
          nickname: string | null
          phone: string | null
          primary_color: string | null
          secondary_color: string | null
          slug: string | null
          updated_at: string | null
          user_id: string
          whatsapp: string | null
        }
        Insert: {
          business_name?: string | null
          created_at?: string | null
          id?: string
          instagram_url?: string | null
          is_public?: boolean | null
          linkedin_url?: string | null
          logo_url?: string | null
          nickname?: string | null
          phone?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          slug?: string | null
          updated_at?: string | null
          user_id: string
          whatsapp?: string | null
        }
        Update: {
          business_name?: string | null
          created_at?: string | null
          id?: string
          instagram_url?: string | null
          is_public?: boolean | null
          linkedin_url?: string | null
          logo_url?: string | null
          nickname?: string | null
          phone?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          slug?: string | null
          updated_at?: string | null
          user_id?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_admin_dashboard_stats: { Args: never; Returns: Json }
      get_admin_user_activity: {
        Args: { p_limit?: number; p_offset?: number; p_user_id?: string }
        Returns: {
          browser: string
          city: string
          country: string
          created_at: string
          device_type: string
          event_data: Json
          event_type: string
          id: string
          ip_address: string
          os: string
          page_url: string
          session_id: string
          time_on_page: number
          user_email: string
          user_id: string
        }[]
      }
      get_admin_users_list: {
        Args: never
        Returns: {
          avatar_url: string
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          last_sign_in: string
          phone: string
          role: string
        }[]
      }
      get_user_company_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_company_admin: {
        Args: { _company_id: string; _user_id: string }
        Returns: boolean
      }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
      record_quote_view: {
        Args: {
          p_access_code?: string
          p_ip_address?: string
          p_quote_id: string
          p_referrer?: string
          p_user_agent?: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "vendor" | "admin" | "company_admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["user", "vendor", "admin", "company_admin"],
    },
  },
} as const
