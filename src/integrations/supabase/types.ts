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
      anonymous_slider_submission: {
        Row: {
          card_index: number
          checkin_reflection: string | null
          couple_space_id: string
          created_at: string
          cycle_id: number
          id: string
          link_token: string
          migrated_to_user_id: string | null
          slider_responses: Json
        }
        Insert: {
          card_index: number
          checkin_reflection?: string | null
          couple_space_id: string
          created_at?: string
          cycle_id?: number
          id?: string
          link_token: string
          migrated_to_user_id?: string | null
          slider_responses: Json
        }
        Update: {
          card_index?: number
          checkin_reflection?: string | null
          couple_space_id?: string
          created_at?: string
          cycle_id?: number
          id?: string
          link_token?: string
          migrated_to_user_id?: string | null
          slider_responses?: Json
        }
        Relationships: [
          {
            foreignKeyName: "anonymous_slider_submission_couple_space_id_fkey"
            columns: ["couple_space_id"]
            isOneToOne: false
            referencedRelation: "couple_spaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anonymous_slider_submission_couple_space_id_fkey"
            columns: ["couple_space_id"]
            isOneToOne: false
            referencedRelation: "couple_spaces_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      beta_feedback: {
        Row: {
          couple_space_id: string
          id: string
          response_text: string | null
          session_id: string | null
          submitted_at: string
        }
        Insert: {
          couple_space_id: string
          id?: string
          response_text?: string | null
          session_id?: string | null
          submitted_at?: string
        }
        Update: {
          couple_space_id?: string
          id?: string
          response_text?: string | null
          session_id?: string | null
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "beta_feedback_couple_space_id_fkey"
            columns: ["couple_space_id"]
            isOneToOne: false
            referencedRelation: "couple_spaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beta_feedback_couple_space_id_fkey"
            columns: ["couple_space_id"]
            isOneToOne: false
            referencedRelation: "couple_spaces_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beta_feedback_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "couple_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
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
          product_id: string
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
          product_id?: string
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
          product_id?: string
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
          {
            foreignKeyName: "couple_sessions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      couple_spaces: {
        Row: {
          created_at: string
          id: string
          paid_at: string | null
          partner_a_name: string | null
          partner_b_name: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          paid_at?: string | null
          partner_a_name?: string | null
          partner_b_name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          paid_at?: string | null
          partner_a_name?: string | null
          partner_b_name?: string | null
        }
        Relationships: []
      }
      couple_state: {
        Row: {
          ceremony_reflection: string | null
          couple_space_id: string
          created_at: string
          current_card_index: number
          current_touch: Database["public"]["Enums"]["touch_type"]
          cycle_id: number
          last_activity_at: string
          maintenance_card_index: number
          maintenance_last_delivered: string | null
          migration_pending: boolean
          partner_link_token: string | null
          partner_nudge_sent_at: string | null
          partner_tier: Database["public"]["Enums"]["partner_tier"]
          phase: Database["public"]["Enums"]["journey_phase"]
          purchase_status: Database["public"]["Enums"]["purchase_status"]
          purchased_by: string | null
          return_ritual_shown_for_card: number | null
          tier_2_partner_name: string | null
          tier_2_pseudo_id: string | null
          updated_at: string
        }
        Insert: {
          ceremony_reflection?: string | null
          couple_space_id: string
          created_at?: string
          current_card_index?: number
          current_touch?: Database["public"]["Enums"]["touch_type"]
          cycle_id?: number
          last_activity_at?: string
          maintenance_card_index?: number
          maintenance_last_delivered?: string | null
          migration_pending?: boolean
          partner_link_token?: string | null
          partner_nudge_sent_at?: string | null
          partner_tier?: Database["public"]["Enums"]["partner_tier"]
          phase?: Database["public"]["Enums"]["journey_phase"]
          purchase_status?: Database["public"]["Enums"]["purchase_status"]
          purchased_by?: string | null
          return_ritual_shown_for_card?: number | null
          tier_2_partner_name?: string | null
          tier_2_pseudo_id?: string | null
          updated_at?: string
        }
        Update: {
          ceremony_reflection?: string | null
          couple_space_id?: string
          created_at?: string
          current_card_index?: number
          current_touch?: Database["public"]["Enums"]["touch_type"]
          cycle_id?: number
          last_activity_at?: string
          maintenance_card_index?: number
          maintenance_last_delivered?: string | null
          migration_pending?: boolean
          partner_link_token?: string | null
          partner_nudge_sent_at?: string | null
          partner_tier?: Database["public"]["Enums"]["partner_tier"]
          phase?: Database["public"]["Enums"]["journey_phase"]
          purchase_status?: Database["public"]["Enums"]["purchase_status"]
          purchased_by?: string | null
          return_ritual_shown_for_card?: number | null
          tier_2_partner_name?: string | null
          tier_2_pseudo_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "couple_state_couple_space_id_fkey"
            columns: ["couple_space_id"]
            isOneToOne: true
            referencedRelation: "couple_spaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_state_couple_space_id_fkey"
            columns: ["couple_space_id"]
            isOneToOne: true
            referencedRelation: "couple_spaces_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      couple_takeaways: {
        Row: {
          content: string
          couple_space_id: string
          created_at: string
          created_by: string
          id: string
          session_id: string
          speaker_label: string | null
        }
        Insert: {
          content: string
          couple_space_id: string
          created_at?: string
          created_by: string
          id?: string
          session_id: string
          speaker_label?: string | null
        }
        Update: {
          content?: string
          couple_space_id?: string
          created_at?: string
          created_by?: string
          id?: string
          session_id?: string
          speaker_label?: string | null
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
      journey_insights_cache: {
        Row: {
          computed_at: string
          couple_space_id: string
          cycle_id: number
          insights: Json
        }
        Insert: {
          computed_at?: string
          couple_space_id: string
          cycle_id?: number
          insights?: Json
        }
        Update: {
          computed_at?: string
          couple_space_id?: string
          cycle_id?: number
          insights?: Json
        }
        Relationships: [
          {
            foreignKeyName: "journey_insights_cache_couple_space_id_fkey"
            columns: ["couple_space_id"]
            isOneToOne: true
            referencedRelation: "couple_spaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journey_insights_cache_couple_space_id_fkey"
            columns: ["couple_space_id"]
            isOneToOne: true
            referencedRelation: "couple_spaces_safe"
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
      onboarding_events: {
        Row: {
          couple_space_id: string | null
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          couple_space_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          couple_space_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_events_couple_space_id_fkey"
            columns: ["couple_space_id"]
            isOneToOne: false
            referencedRelation: "couple_spaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_events_couple_space_id_fkey"
            columns: ["couple_space_id"]
            isOneToOne: false
            referencedRelation: "couple_spaces_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      product_interest: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          price_sek: number | null
          stripe_price_id: string | null
        }
        Insert: {
          created_at?: string
          id: string
          is_active?: boolean
          name: string
          price_sek?: number | null
          stripe_price_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          price_sek?: number | null
          stripe_price_id?: string | null
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
      question_bookmarks: {
        Row: {
          bookmarked_at: string
          card_id: string
          couple_space_id: string
          id: string
          is_active: boolean
          product_id: string
          prompt_index: number
          question_text: string
          session_id: string
          stage_index: number
        }
        Insert: {
          bookmarked_at?: string
          card_id: string
          couple_space_id: string
          id?: string
          is_active?: boolean
          product_id?: string
          prompt_index: number
          question_text: string
          session_id: string
          stage_index: number
        }
        Update: {
          bookmarked_at?: string
          card_id?: string
          couple_space_id?: string
          id?: string
          is_active?: boolean
          product_id?: string
          prompt_index?: number
          question_text?: string
          session_id?: string
          stage_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "question_bookmarks_couple_space_id_fkey"
            columns: ["couple_space_id"]
            isOneToOne: false
            referencedRelation: "couple_spaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_bookmarks_couple_space_id_fkey"
            columns: ["couple_space_id"]
            isOneToOne: false
            referencedRelation: "couple_spaces_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_bookmarks_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_bookmarks_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "couple_sessions"
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
      session_state: {
        Row: {
          card_index: number
          couple_space_id: string
          created_at: string
          current_prompt_index: number
          current_session: number
          current_step: Database["public"]["Enums"]["session_step"]
          cycle_id: number
          id: string
          paused_at: string | null
          paused_reason: string | null
          session_1_completed: boolean
          session_2_completed: boolean
          session_lock: string | null
          session_lock_heartbeat: string | null
          session_type: string | null
          skip_status: Database["public"]["Enums"]["skip_status"]
          updated_at: string
        }
        Insert: {
          card_index: number
          couple_space_id: string
          created_at?: string
          current_prompt_index?: number
          current_session?: number
          current_step?: Database["public"]["Enums"]["session_step"]
          cycle_id?: number
          id?: string
          paused_at?: string | null
          paused_reason?: string | null
          session_1_completed?: boolean
          session_2_completed?: boolean
          session_lock?: string | null
          session_lock_heartbeat?: string | null
          session_type?: string | null
          skip_status?: Database["public"]["Enums"]["skip_status"]
          updated_at?: string
        }
        Update: {
          card_index?: number
          couple_space_id?: string
          created_at?: string
          current_prompt_index?: number
          current_session?: number
          current_step?: Database["public"]["Enums"]["session_step"]
          cycle_id?: number
          id?: string
          paused_at?: string | null
          paused_reason?: string | null
          session_1_completed?: boolean
          session_2_completed?: boolean
          session_lock?: string | null
          session_lock_heartbeat?: string | null
          session_type?: string | null
          skip_status?: Database["public"]["Enums"]["skip_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_state_couple_space_id_fkey"
            columns: ["couple_space_id"]
            isOneToOne: false
            referencedRelation: "couple_spaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_state_couple_space_id_fkey"
            columns: ["couple_space_id"]
            isOneToOne: false
            referencedRelation: "couple_spaces_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      step_reflections: {
        Row: {
          id: string
          product_id: string
          session_id: string
          speaker_label: string | null
          state: Database["public"]["Enums"]["reflection_state"]
          step_index: number
          text: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          product_id?: string
          session_id: string
          speaker_label?: string | null
          state?: Database["public"]["Enums"]["reflection_state"]
          step_index: number
          text?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          product_id?: string
          session_id?: string
          speaker_label?: string | null
          state?: Database["public"]["Enums"]["reflection_state"]
          step_index?: number
          text?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "step_reflections_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
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
      threshold_mood: {
        Row: {
          card_index: number
          couple_space_id: string
          created_at: string
          cycle_id: number
          id: string
          mood: string
          user_id: string
        }
        Insert: {
          card_index: number
          couple_space_id: string
          created_at?: string
          cycle_id?: number
          id?: string
          mood: string
          user_id: string
        }
        Update: {
          card_index?: number
          couple_space_id?: string
          created_at?: string
          cycle_id?: number
          id?: string
          mood?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "threshold_mood_couple_space_id_fkey"
            columns: ["couple_space_id"]
            isOneToOne: false
            referencedRelation: "couple_spaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "threshold_mood_couple_space_id_fkey"
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
      user_card_state: {
        Row: {
          card_index: number
          checkin_reflection: string | null
          couple_space_id: string
          created_at: string
          cycle_id: number
          id: string
          notes: Json
          reflection_skipped: boolean
          session_1_takeaway: string | null
          session_type: string | null
          slider_completed_at: string | null
          slider_responses: Json | null
          takeaway: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          card_index: number
          checkin_reflection?: string | null
          couple_space_id: string
          created_at?: string
          cycle_id?: number
          id?: string
          notes?: Json
          reflection_skipped?: boolean
          session_1_takeaway?: string | null
          session_type?: string | null
          slider_completed_at?: string | null
          slider_responses?: Json | null
          takeaway?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          card_index?: number
          checkin_reflection?: string | null
          couple_space_id?: string
          created_at?: string
          cycle_id?: number
          id?: string
          notes?: Json
          reflection_skipped?: boolean
          session_1_takeaway?: string | null
          session_type?: string | null
          slider_completed_at?: string | null
          slider_responses?: Json | null
          takeaway?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_card_state_couple_space_id_fkey"
            columns: ["couple_space_id"]
            isOneToOne: false
            referencedRelation: "couple_spaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_card_state_couple_space_id_fkey"
            columns: ["couple_space_id"]
            isOneToOne: false
            referencedRelation: "couple_spaces_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      user_product_access: {
        Row: {
          granted_at: string
          granted_via: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          granted_at?: string
          granted_via?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          granted_at?: string
          granted_via?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_product_access_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
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
      abandon_active_session: {
        Args: { p_session_id: string }
        Returns: undefined
      }
      acquire_session_lock: {
        Args: { p_card_index: number; p_couple_space_id: string }
        Returns: Json
      }
      activate_couple_session:
        | {
            Args: {
              p_card_id: string
              p_category_id: string
              p_couple_space_id: string
              p_step_count: number
            }
            Returns: string
          }
        | {
            Args: {
              p_card_id: string
              p_category_id: string
              p_couple_space_id: string
              p_product_id?: string
              p_step_count: number
            }
            Returns: string
          }
      advance_card: {
        Args: {
          p_couple_space_id: string
          p_session_1_takeaway?: string
          p_takeaway?: string
        }
        Returns: Json
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
      complete_slider_checkin: {
        Args: {
          p_card_index: number
          p_checkin_reflection?: string
          p_couple_space_id: string
          p_slider_responses: Json
        }
        Returns: Json
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
      get_user_couple_space_id: { Args: { _user_id: string }; Returns: string }
      is_couple_member: {
        Args: { _space_id: string; _user_id: string }
        Returns: boolean
      }
      lock_step_reflections: {
        Args: { _session_id: string; _step_index: number }
        Returns: undefined
      }
      reset_slider_checkin: {
        Args: { p_couple_space_id: string }
        Returns: undefined
      }
      session_heartbeat: {
        Args: {
          p_card_index: number
          p_couple_space_id: string
          p_device_id: string
        }
        Returns: Json
      }
      skip_card: { Args: { p_couple_space_id: string }; Returns: Json }
      upsert_card_visit: {
        Args: {
          p_card_id: string
          p_couple_space_id: string
          p_user_id: string
          p_visited_at?: string
        }
        Returns: undefined
      }
    }
    Enums: {
      journey_phase: "program" | "ceremony" | "maintenance" | "restart"
      partner_tier: "tier_1" | "tier_2" | "tier_3"
      purchase_status: "free_trial" | "purchased"
      reflection_state: "draft" | "ready" | "revealed" | "locked"
      session_step: "oppna" | "vand" | "tankom" | "gor"
      skip_status: "none" | "available" | "skipped" | "auto_advanced"
      touch_type: "slider_checkin" | "session_1" | "session_2" | "complete"
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
      journey_phase: ["program", "ceremony", "maintenance", "restart"],
      partner_tier: ["tier_1", "tier_2", "tier_3"],
      purchase_status: ["free_trial", "purchased"],
      reflection_state: ["draft", "ready", "revealed", "locked"],
      session_step: ["oppna", "vand", "tankom", "gor"],
      skip_status: ["none", "available", "skipped", "auto_advanced"],
      touch_type: ["slider_checkin", "session_1", "session_2", "complete"],
    },
  },
} as const
