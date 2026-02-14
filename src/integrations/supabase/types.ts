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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      couple_members: {
        Row: {
          couple_space_id: string
          created_at: string
          id: string
          last_seen_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          couple_space_id: string
          created_at?: string
          id?: string
          last_seen_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          couple_space_id?: string
          created_at?: string
          id?: string
          last_seen_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "couple_members_couple_space_id_fkey"
            columns: ["couple_space_id"]
            isOneToOne: false
            referencedRelation: "couple_spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      couple_progress: {
        Row: {
          couple_space_id: string
          created_at: string
          current_session: Json | null
          id: string
          journey_state: Json | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          couple_space_id: string
          created_at?: string
          current_session?: Json | null
          id?: string
          journey_state?: Json | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          couple_space_id?: string
          created_at?: string
          current_session?: Json | null
          id?: string
          journey_state?: Json | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "couple_progress_couple_space_id_fkey"
            columns: ["couple_space_id"]
            isOneToOne: true
            referencedRelation: "couple_spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      couple_spaces: {
        Row: {
          created_at: string
          id: string
          invite_code: string
          invite_token: string
          partner_a_name: string | null
          partner_b_name: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          invite_code: string
          invite_token: string
          partner_a_name?: string | null
          partner_b_name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          invite_code?: string
          invite_token?: string
          partner_a_name?: string | null
          partner_b_name?: string | null
        }
        Relationships: []
      }
      prompt_notes: {
        Row: {
          author_label: string | null
          card_id: string
          content: string
          couple_space_id: string
          created_at: string
          id: string
          is_highlight: boolean
          prompt_id: string
          section_id: string
          shared_at: string | null
          updated_at: string
          user_id: string
          visibility: string
        }
        Insert: {
          author_label?: string | null
          card_id: string
          content?: string
          couple_space_id: string
          created_at?: string
          id?: string
          is_highlight?: boolean
          prompt_id: string
          section_id: string
          shared_at?: string | null
          updated_at?: string
          user_id: string
          visibility?: string
        }
        Update: {
          author_label?: string | null
          card_id?: string
          content?: string
          couple_space_id?: string
          created_at?: string
          id?: string
          is_highlight?: boolean
          prompt_id?: string
          section_id?: string
          shared_at?: string | null
          updated_at?: string
          user_id?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompt_notes_couple_space_id_fkey"
            columns: ["couple_space_id"]
            isOneToOne: false
            referencedRelation: "couple_spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      redundant_purchases: {
        Row: {
          created_at: string
          id: string
          merged_into_space_id: string
          notes: string | null
          original_space_id: string
          resolved: boolean
          resolved_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          merged_into_space_id: string
          notes?: string | null
          original_space_id: string
          resolved?: boolean
          resolved_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          merged_into_space_id?: string
          notes?: string | null
          original_space_id?: string
          resolved?: boolean
          resolved_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      reflection_responses: {
        Row: {
          content: string
          couple_space_id: string
          created_at: string
          id: string
          reflection_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string
          couple_space_id: string
          created_at?: string
          id?: string
          reflection_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          couple_space_id?: string
          created_at?: string
          id?: string
          reflection_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reflection_responses_couple_space_id_fkey"
            columns: ["couple_space_id"]
            isOneToOne: false
            referencedRelation: "couple_spaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reflection_responses_reflection_id_fkey"
            columns: ["reflection_id"]
            isOneToOne: false
            referencedRelation: "prompt_notes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_backups: {
        Row: {
          background_color: string | null
          cards: Json | null
          categories: Json | null
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          background_color?: string | null
          cards?: Json | null
          categories?: Json | null
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          background_color?: string | null
          cards?: Json | null
          categories?: Json | null
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          background_color: string | null
          cards: Json | null
          categories: Json | null
          created_at: string
          device_id: string | null
          id: string
          site_settings: Json | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          background_color?: string | null
          cards?: Json | null
          categories?: Json | null
          created_at?: string
          device_id?: string | null
          id?: string
          site_settings?: Json | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          background_color?: string | null
          cards?: Json | null
          categories?: Json | null
          created_at?: string
          device_id?: string | null
          id?: string
          site_settings?: Json | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_couple_space_id: { Args: { _user_id: string }; Returns: string }
      is_couple_member: {
        Args: { _space_id: string; _user_id: string }
        Returns: boolean
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
