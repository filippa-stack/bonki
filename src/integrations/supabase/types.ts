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
      card_sessions: {
        Row: {
          card_id: string
          completed_at: string | null
          couple_space_id: string
          id: string
          started_at: string
        }
        Insert: {
          card_id: string
          completed_at?: string | null
          couple_space_id: string
          id?: string
          started_at?: string
        }
        Update: {
          card_id?: string
          completed_at?: string | null
          couple_space_id?: string
          id?: string
          started_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_sessions_couple_space_id_fkey"
            columns: ["couple_space_id"]
            isOneToOne: false
            referencedRelation: "couple_spaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_sessions_couple_space_id_fkey"
            columns: ["couple_space_id"]
            isOneToOne: false
            referencedRelation: "couple_spaces_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      card_takeaways: {
        Row: {
          id: string
          locked: boolean
          session_id: string
          text: string
          updated_at: string
        }
        Insert: {
          id?: string
          locked?: boolean
          session_id: string
          text?: string
          updated_at?: string
        }
        Update: {
          id?: string
          locked?: boolean
          session_id?: string
          text?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_takeaways_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "card_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      couple_card_visits: {
        Row: {
          card_id: string
          couple_space_id: string
          id: string
          last_visited_at: string
          user_id: string
        }
        Insert: {
          card_id: string
          couple_space_id: string
          id?: string
          last_visited_at?: string
          user_id: string
        }
        Update: {
          card_id?: string
          couple_space_id?: string
          id?: string
          last_visited_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "couple_card_visits_couple_space_id_fkey"
            columns: ["couple_space_id"]
            isOneToOne: false
            referencedRelation: "couple_spaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_card_visits_couple_space_id_fkey"
            columns: ["couple_space_id"]
            isOneToOne: false
            referencedRelation: "couple_spaces_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      couple_journey_meta: {
        Row: {
          couple_space_id: string
          journey_state: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          couple_space_id: string
          journey_state?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          couple_space_id?: string
          journey_state?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "couple_journey_meta_couple_space_id_fkey"
            columns: ["couple_space_id"]
            isOneToOne: false
            referencedRelation: "couple_spaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_journey_meta_couple_space_id_fkey"
            columns: ["couple_space_id"]
            isOneToOne: false
            referencedRelation: "couple_spaces_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      couple_members: {
        Row: {
          couple_space_id: string
          created_at: string
          id: string
          last_seen_at: string | null
          left_at: string | null
          left_by: string | null
          left_reason: string | null
          role: string | null
          status: string
          user_id: string
        }
        Insert: {
          couple_space_id: string
          created_at?: string
          id?: string
          last_seen_at?: string | null
          left_at?: string | null
          left_by?: string | null
          left_reason?: string | null
          role?: string | null
          status?: string
          user_id: string
        }
        Update: {
          couple_space_id?: string
          created_at?: string
          id?: string
          last_seen_at?: string | null
          left_at?: string | null
          left_by?: string | null
          left_reason?: string | null
          role?: string | null
          status?: string
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
          {
            foreignKeyName: "couple_members_couple_space_id_fkey"
            columns: ["couple_space_id"]
            isOneToOne: false
            referencedRelation: "couple_spaces_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      couple_progress: {
        Row: {
          couple_space_id: string
          created_at: string
          id: string
          journey_state: Json | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          couple_space_id: string
          created_at?: string
          id?: string
          journey_state?: Json | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          couple_space_id?: string
          created_at?: string
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
          {
            foreignKeyName: "couple_progress_couple_space_id_fkey"
            columns: ["couple_space_id"]
            isOneToOne: true
            referencedRelation: "couple_spaces_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      couple_session_completions: {
        Row: {
          completed_at: string
          couple_space_id: string
          created_at: string
          session_id: string
          step_index: number
          user_id: string
        }
        Insert: {
          completed_at?: string
          couple_space_id: string
          created_at?: string
          session_id: string
          step_index: number
          user_id: string
        }
        Update: {
          completed_at?: string
          couple_space_id?: string
          created_at?: string
          session_id?: string
          step_index?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "couple_session_completions_couple_space_id_fkey"
            columns: ["couple_space_id"]
            isOneToOne: false
            referencedRelation: "couple_spaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_session_completions_couple_space_id_fkey"
            columns: ["couple_space_id"]
            isOneToOne: false
            referencedRelation: "couple_spaces_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_session_completions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "couple_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      couple_session_steps: {
        Row: {
          couple_space_id: string
          created_at: string
          session_id: string
          step_index: number
        }
        Insert: {
          couple_space_id: string
          created_at?: string
          session_id: string
          step_index: number
        }
        Update: {
          couple_space_id?: string
          created_at?: string
          session_id?: string
          step_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "couple_session_steps_couple_space_id_fkey"
            columns: ["couple_space_id"]
            isOneToOne: false
            referencedRelation: "couple_spaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_session_steps_couple_space_id_fkey"
            columns: ["couple_space_id"]
            isOneToOne: false
            referencedRelation: "couple_spaces_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_session_steps_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "couple_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      couple_sessions: {
        Row: {
          card_id: string | null
          category_id: string | null
          couple_space_id: string
          created_at: string
          created_by: string
          ended_at: string | null
          id: string
          last_activity_at: string
          started_at: string
          status: string
        }
        Insert: {
          card_id?: string | null
          category_id?: string | null
          couple_space_id: string
          created_at?: string
          created_by: string
          ended_at?: string | null
          id?: string
          last_activity_at?: string
          started_at?: string
          status: string
        }
        Update: {
          card_id?: string | null
          category_id?: string | null
          couple_space_id?: string
          created_at?: string
          created_by?: string
          ended_at?: string | null
          id?: string
          last_activity_at?: string
          started_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "couple_sessions_couple_space_id_fkey"
            columns: ["couple_space_id"]
            isOneToOne: false
            referencedRelation: "couple_spaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_sessions_couple_space_id_fkey"
            columns: ["couple_space_id"]
            isOneToOne: false
            referencedRelation: "couple_spaces_safe"
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
          paid_at: string | null
          partner_a_name: string | null
          partner_b_name: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          invite_code: string
          invite_token: string
          paid_at?: string | null
          partner_a_name?: string | null
          partner_b_name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          invite_code?: string
          invite_token?: string
          paid_at?: string | null
          partner_a_name?: string | null
          partner_b_name?: string | null
        }
        Relationships: []
      }
      couple_takeaways: {
        Row: {
          content: string
          couple_space_id: string
          created_at: string
          created_by: string
          id: string
          session_id: string
        }
        Insert: {
          content: string
          couple_space_id: string
          created_at?: string
          created_by: string
          id?: string
          session_id: string
        }
        Update: {
          content?: string
          couple_space_id?: string
          created_at?: string
          created_by?: string
          id?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "couple_takeaways_couple_space_id_fkey"
            columns: ["couple_space_id"]
            isOneToOne: false
            referencedRelation: "couple_spaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_takeaways_couple_space_id_fkey"
            columns: ["couple_space_id"]
            isOneToOne: false
            referencedRelation: "couple_spaces_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_takeaways_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "couple_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          created_at: string
          id: string
          notify_conversation_progress: boolean
          notify_email_proposal: boolean
          notify_shared_reflection: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notify_conversation_progress?: boolean
          notify_email_proposal?: boolean
          notify_shared_reflection?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notify_conversation_progress?: boolean
          notify_email_proposal?: boolean
          notify_shared_reflection?: boolean
          updated_at?: string
          user_id?: string
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
          {
            foreignKeyName: "prompt_notes_couple_space_id_fkey"
            columns: ["couple_space_id"]
            isOneToOne: false
            referencedRelation: "couple_spaces_safe"
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
            foreignKeyName: "reflection_responses_couple_space_id_fkey"
            columns: ["couple_space_id"]
            isOneToOne: false
            referencedRelation: "couple_spaces_safe"
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
      step_reflections: {
        Row: {
          id: string
          session_id: string
          state: Database["public"]["Enums"]["reflection_state"]
          step_index: number
          text: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          session_id: string
          state?: Database["public"]["Enums"]["reflection_state"]
          step_index: number
          text?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          session_id?: string
          state?: Database["public"]["Enums"]["reflection_state"]
          step_index?: number
          text?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "step_reflections_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "couple_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      system_events: {
        Row: {
          couple_space_id: string
          created_at: string
          id: string
          payload: Json | null
          type: string
        }
        Insert: {
          couple_space_id: string
          created_at?: string
          id?: string
          payload?: Json | null
          type: string
        }
        Update: {
          couple_space_id?: string
          created_at?: string
          id?: string
          payload?: Json | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "system_events_couple_space_id_fkey"
            columns: ["couple_space_id"]
            isOneToOne: false
            referencedRelation: "couple_spaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "system_events_couple_space_id_fkey"
            columns: ["couple_space_id"]
            isOneToOne: false
            referencedRelation: "couple_spaces_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      topic_proposals: {
        Row: {
          accepted_by: string | null
          card_id: string
          category_id: string
          couple_space_id: string
          created_at: string
          declined_by: string | null
          expires_at: string | null
          id: string
          message: string | null
          proposed_by: string
          responded_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          accepted_by?: string | null
          card_id: string
          category_id: string
          couple_space_id: string
          created_at?: string
          declined_by?: string | null
          expires_at?: string | null
          id?: string
          message?: string | null
          proposed_by: string
          responded_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          accepted_by?: string | null
          card_id?: string
          category_id?: string
          couple_space_id?: string
          created_at?: string
          declined_by?: string | null
          expires_at?: string | null
          id?: string
          message?: string | null
          proposed_by?: string
          responded_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "topic_proposals_couple_space_id_fkey"
            columns: ["couple_space_id"]
            isOneToOne: false
            referencedRelation: "couple_spaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "topic_proposals_couple_space_id_fkey"
            columns: ["couple_space_id"]
            isOneToOne: false
            referencedRelation: "couple_spaces_safe"
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
      couple_spaces_safe: {
        Row: {
          created_at: string | null
          id: string | null
          paid_at: string | null
          partner_a_name: string | null
          partner_b_name: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          paid_at?: string | null
          partner_a_name?: string | null
          partner_b_name?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          paid_at?: string | null
          partner_a_name?: string | null
          partner_b_name?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      activate_couple_session: {
        Args: {
          p_card_id: string
          p_category_id: string
          p_couple_space_id: string
          p_step_count: number
        }
        Returns: string
      }
      assert_one_active_session_per_space: {
        Args: { p_couple_space_id: string }
        Returns: undefined
      }
      complete_couple_session_step: {
        Args: { p_session_id: string; p_step_index: number }
        Returns: {
          is_session_complete: boolean
          is_step_complete: boolean
          is_waiting: boolean
          partner_left: boolean
        }[]
      }
      get_active_session_state: {
        Args: never
        Returns: {
          card_id: string
          category_id: string
          current_step_index: number
          mode: string
          session_id: string
          step_completions: Json
        }[]
      }
      get_current_couple_space_id: { Args: never; Returns: string }
      get_own_invite_info: {
        Args: never
        Returns: {
          invite_code: string
          invite_token: string
        }[]
      }
      get_user_couple_space_id: { Args: { _user_id: string }; Returns: string }
      is_couple_member: {
        Args: { _space_id: string; _user_id: string }
        Returns: boolean
      }
      lock_step_reflections: {
        Args: { _session_id: string; _step_index: number }
        Returns: undefined
      }
    }
    Enums: {
      reflection_state: "draft" | "ready" | "revealed" | "locked"
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
      reflection_state: ["draft", "ready", "revealed", "locked"],
    },
  },
} as const
