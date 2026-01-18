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
      evaluations: {
        Row: {
          claude_model: string
          claude_model_version: string | null
          created_at: string | null
          estimated_cost_usd: number | null
          feedback_text: string
          id: string
          input_tokens: number | null
          interview_id: string
          output_tokens: number | null
          updated_at: string | null
        }
        Insert: {
          claude_model: string
          claude_model_version?: string | null
          created_at?: string | null
          estimated_cost_usd?: number | null
          feedback_text: string
          id?: string
          input_tokens?: number | null
          interview_id: string
          output_tokens?: number | null
          updated_at?: string | null
        }
        Update: {
          claude_model?: string
          claude_model_version?: string | null
          created_at?: string | null
          estimated_cost_usd?: number | null
          feedback_text?: string
          id?: string
          input_tokens?: number | null
          interview_id?: string
          output_tokens?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_interview_id_fkey"
            columns: ["interview_id"]
            isOneToOne: true
            referencedRelation: "interviews"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_types: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          num_stations: number
          slug: string
          station_time_limit_seconds: number | null
          total_duration_minutes: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          num_stations: number
          slug: string
          station_time_limit_seconds?: number | null
          total_duration_minutes?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          num_stations?: number
          slug?: string
          station_time_limit_seconds?: number | null
          total_duration_minutes?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      interviews: {
        Row: {
          completed_at: string | null
          created_at: string | null
          current_station_index: number | null
          id: string
          interview_type_id: string
          last_activity_at: string | null
          school_name: string | null
          settings: Json | null
          started_at: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          current_station_index?: number | null
          id?: string
          interview_type_id: string
          last_activity_at?: string | null
          school_name?: string | null
          settings?: Json | null
          started_at?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          current_station_index?: number | null
          id?: string
          interview_type_id?: string
          last_activity_at?: string | null
          school_name?: string | null
          settings?: Json | null
          started_at?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interviews_interview_type_id_fkey"
            columns: ["interview_type_id"]
            isOneToOne: false
            referencedRelation: "interview_types"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          interview_type_id: string
          is_active: boolean | null
          prompt: string
          station_number: number | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          interview_type_id: string
          is_active?: boolean | null
          prompt: string
          station_number?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          interview_type_id?: string
          is_active?: boolean | null
          prompt?: string
          station_number?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_interview_type_id_fkey"
            columns: ["interview_type_id"]
            isOneToOne: false
            referencedRelation: "interview_types"
            referencedColumns: ["id"]
          },
        ]
      }
      responses: {
        Row: {
          audio_duration_seconds: number | null
          completed_at: string | null
          created_at: string | null
          id: string
          interview_id: string
          question_id: string
          response_text: string
          started_at: string | null
          station_number: number
          time_spent_seconds: number | null
          transcribed_at: string | null
          transcription_error: string | null
          transcription_status: string | null
          updated_at: string | null
        }
        Insert: {
          audio_duration_seconds?: number | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          interview_id: string
          question_id: string
          response_text: string
          started_at?: string | null
          station_number: number
          time_spent_seconds?: number | null
          transcribed_at?: string | null
          transcription_error?: string | null
          transcription_status?: string | null
          updated_at?: string | null
        }
        Update: {
          audio_duration_seconds?: number | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          interview_id?: string
          question_id?: string
          response_text?: string
          started_at?: string | null
          station_number?: number
          time_spent_seconds?: number | null
          transcribed_at?: string | null
          transcription_error?: string | null
          transcription_status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "responses_interview_id_fkey"
            columns: ["interview_id"]
            isOneToOne: false
            referencedRelation: "interviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string | null
          default_claude_model: string | null
          display_name: string | null
          enable_audio_mode: boolean | null
          enable_deepgram: boolean | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          default_claude_model?: string | null
          display_name?: string | null
          enable_audio_mode?: boolean | null
          enable_deepgram?: boolean | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          default_claude_model?: string | null
          display_name?: string | null
          enable_audio_mode?: boolean | null
          enable_deepgram?: boolean | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
