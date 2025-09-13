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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          customer_email: string
          customer_name: string
          gateway: string
          gateway_order_id: string | null
          gateway_transaction_id: string | null
          id: string
          payment_id: string
          status: string
          tier: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          customer_email: string
          customer_name: string
          gateway: string
          gateway_order_id?: string | null
          gateway_transaction_id?: string | null
          id?: string
          payment_id: string
          status?: string
          tier: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          customer_email?: string
          customer_name?: string
          gateway?: string
          gateway_order_id?: string | null
          gateway_transaction_id?: string | null
          id?: string
          payment_id?: string
          status?: string
          tier?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      resumes: {
        Row: {
          courses: Json | null
          created_at: string
          education: Json | null
          experience: Json | null
          id: string
          personal_info: Json | null
          projects: Json | null
          skills: Json | null
          summary: string | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          courses?: Json | null
          created_at?: string
          education?: Json | null
          experience?: Json | null
          id?: string
          personal_info?: Json | null
          projects?: Json | null
          skills?: Json | null
          summary?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          courses?: Json | null
          created_at?: string
          education?: Json | null
          experience?: Json | null
          id?: string
          personal_info?: Json | null
          projects?: Json | null
          skills?: Json | null
          summary?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          max_scans: number | null
          scan_count: number | null
          status: string
          tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          max_scans?: number | null
          scan_count?: number | null
          status?: string
          tier: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          max_scans?: number | null
          scan_count?: number | null
          status?: string
          tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tailored_resumes: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          job_description: string
          original_content: Json
          tailored_content: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          job_description: string
          original_content: Json
          tailored_content: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          job_description?: string
          original_content?: Json
          tailored_content?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tailoring_usage: {
        Row: {
          created_at: string
          id: string
          last_reset_date: string
          monthly_count: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_reset_date?: string
          monthly_count?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_reset_date?: string
          monthly_count?: number
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string
          email_notifications: boolean | null
          id: string
          marketing_emails: boolean | null
          paypal_client_id: string | null
          paypal_client_secret: string | null
          paypal_production_mode: boolean | null
          paypal_webhook_id: string | null
          two_factor_auth: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_notifications?: boolean | null
          id?: string
          marketing_emails?: boolean | null
          paypal_client_id?: string | null
          paypal_client_secret?: string | null
          paypal_production_mode?: boolean | null
          paypal_webhook_id?: string | null
          two_factor_auth?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_notifications?: boolean | null
          id?: string
          marketing_emails?: boolean | null
          paypal_client_id?: string | null
          paypal_client_secret?: string | null
          paypal_production_mode?: boolean | null
          paypal_webhook_id?: string | null
          two_factor_auth?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_tailored_resumes: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      increment_tailoring_usage: {
        Args: { user_uuid: string }
        Returns: number
      }
      reset_monthly_tailoring_usage: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
