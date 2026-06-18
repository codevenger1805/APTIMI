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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          company: string
          created_at: string
          id: string
          link: string | null
          location: string | null
          notes: string | null
          role: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company: string
          created_at?: string
          id?: string
          link?: string | null
          location?: string | null
          notes?: string | null
          role: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company?: string
          created_at?: string
          id?: string
          link?: string | null
          location?: string | null
          notes?: string | null
          role?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      career_goals: {
        Row: {
          created_at: string
          id: string
          target_role: string
          timeline_months: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          target_role: string
          timeline_months?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          target_role?: string
          timeline_months?: number
          user_id?: string
        }
        Relationships: []
      }
      career_scores: {
        Row: {
          applications_score: number
          consistency_score: number
          focus_score: number
          roadmap_score: number
          skills_score: number
          total_score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          applications_score?: number
          consistency_score?: number
          focus_score?: number
          roadmap_score?: number
          skills_score?: number
          total_score?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          applications_score?: number
          consistency_score?: number
          focus_score?: number
          roadmap_score?: number
          skills_score?: number
          total_score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      focus_sessions: {
        Row: {
          duration_minutes: number
          ended_at: string | null
          id: string
          started_at: string
          task_id: string | null
          user_id: string
        }
        Insert: {
          duration_minutes: number
          ended_at?: string | null
          id?: string
          started_at?: string
          task_id?: string | null
          user_id: string
        }
        Update: {
          duration_minutes?: number
          ended_at?: string | null
          id?: string
          started_at?: string
          task_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "focus_sessions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          academic_year: string | null
          college: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          onboarded: boolean
          updated_at: string
        }
        Insert: {
          academic_year?: string | null
          college?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          onboarded?: boolean
          updated_at?: string
        }
        Update: {
          academic_year?: string | null
          college?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          onboarded?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      roadmap_milestones: {
        Row: {
          description: string | null
          id: string
          position: number
          roadmap_id: string
          title: string
          user_id: string
          week_end: number
          week_start: number
        }
        Insert: {
          description?: string | null
          id?: string
          position: number
          roadmap_id: string
          title: string
          user_id: string
          week_end: number
          week_start: number
        }
        Update: {
          description?: string | null
          id?: string
          position?: number
          roadmap_id?: string
          title?: string
          user_id?: string
          week_end?: number
          week_start?: number
        }
        Relationships: [
          {
            foreignKeyName: "roadmap_milestones_roadmap_id_fkey"
            columns: ["roadmap_id"]
            isOneToOne: false
            referencedRelation: "roadmaps"
            referencedColumns: ["id"]
          },
        ]
      }
      roadmaps: {
        Row: {
          created_at: string
          id: string
          target_role: string
          total_weeks: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          target_role: string
          total_weeks: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          target_role?: string
          total_weeks?: number
          user_id?: string
        }
        Relationships: []
      }
      skill_assessments: {
        Row: {
          id: string
          rating: number
          skill: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          rating: number
          skill: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          rating?: number
          skill?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          id: string
          milestone_id: string | null
          position: number
          title: string
          user_id: string
          week_number: number
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          milestone_id?: string | null
          position?: number
          title: string
          user_id: string
          week_number: number
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          milestone_id?: string | null
          position?: number
          title?: string
          user_id?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "tasks_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "roadmap_milestones"
            referencedColumns: ["id"]
          },
        ]
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
