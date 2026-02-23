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
      activities: {
        Row: {
          created_at: string
          id: string
          order_num: number
          points: number
          subtitle: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_num: number
          points?: number
          subtitle?: string | null
          title: string
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          order_num?: number
          points?: number
          subtitle?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      attendance: {
        Row: {
          created_at: string
          event_id: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      community_chat: {
        Row: {
          community: string
          created_at: string
          id: string
          message: string
          user_id: string
          user_name: string
        }
        Insert: {
          community: string
          created_at?: string
          id?: string
          message: string
          user_id: string
          user_name: string
        }
        Update: {
          community?: string
          created_at?: string
          id?: string
          message?: string
          user_id?: string
          user_name?: string
        }
        Relationships: []
      }
      community_settings: {
        Row: {
          community: string
          id: string
          updated_at: string
          updated_by: string | null
          verse_of_week: string | null
          verse_reference: string | null
          whatsapp_link: string | null
        }
        Insert: {
          community: string
          id?: string
          updated_at?: string
          updated_by?: string | null
          verse_of_week?: string | null
          verse_reference?: string | null
          whatsapp_link?: string | null
        }
        Update: {
          community?: string
          id?: string
          updated_at?: string
          updated_by?: string | null
          verse_of_week?: string | null
          verse_reference?: string | null
          whatsapp_link?: string | null
        }
        Relationships: []
      }
      courses: {
        Row: {
          created_at: string
          id: string
          order_num: number
          subtitle: string | null
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_num: number
          subtitle?: string | null
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          order_num?: number
          subtitle?: string | null
          title?: string
        }
        Relationships: []
      }
      devotional_content: {
        Row: {
          activity_id: string | null
          bible_reference: string
          bible_text: string
          created_at: string
          day_number: number
          id: string
          lesson_id: string | null
          practice: string
          prayer: string
          questions: string[]
          reflection: string
          title: string
          updated_at: string
        }
        Insert: {
          activity_id?: string | null
          bible_reference?: string
          bible_text?: string
          created_at?: string
          day_number?: number
          id?: string
          lesson_id?: string | null
          practice?: string
          prayer?: string
          questions?: string[]
          reflection?: string
          title?: string
          updated_at?: string
        }
        Update: {
          activity_id?: string | null
          bible_reference?: string
          bible_text?: string
          created_at?: string
          day_number?: number
          id?: string
          lesson_id?: string | null
          practice?: string
          prayer?: string
          questions?: string[]
          reflection?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "devotional_content_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      devotional_progress: {
        Row: {
          completed_at: string
          devotional_id: string
          id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          devotional_id: string
          id?: string
          user_id: string
        }
        Update: {
          completed_at?: string
          devotional_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "devotional_progress_devotional_id_fkey"
            columns: ["devotional_id"]
            isOneToOne: false
            referencedRelation: "devotional_content"
            referencedColumns: ["id"]
          },
        ]
      }
      discipleship_plans: {
        Row: {
          aptidao: string | null
          challenges: string | null
          created_at: string
          health_status: string
          id: string
          is_priority: boolean
          last_contact_at: string | null
          next_steps: string | null
          objectives: string | null
          pastor_notes: string | null
          recommendations: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          aptidao?: string | null
          challenges?: string | null
          created_at?: string
          health_status?: string
          id?: string
          is_priority?: boolean
          last_contact_at?: string | null
          next_steps?: string | null
          objectives?: string | null
          pastor_notes?: string | null
          recommendations?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          aptidao?: string | null
          challenges?: string | null
          created_at?: string
          health_status?: string
          id?: string
          is_priority?: boolean
          last_contact_at?: string | null
          next_steps?: string | null
          objectives?: string | null
          pastor_notes?: string | null
          recommendations?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          area: string | null
          community: string | null
          created_at: string
          created_by: string | null
          description: string | null
          event_date: string
          id: string
          location: string | null
          title: string
          type: string
        }
        Insert: {
          area?: string | null
          community?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_date: string
          id?: string
          location?: string | null
          title: string
          type?: string
        }
        Update: {
          area?: string | null
          community?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_date?: string
          id?: string
          location?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      lesson_content: {
        Row: {
          audio_link: string
          bible_texts: string[]
          created_at: string
          greeting: string
          icebreaker: string
          id: string
          lesson_id: string
          practice: string
          prayer_prompt: string
          questions: string[]
          summary: string
          updated_at: string
          video_link: string
        }
        Insert: {
          audio_link?: string
          bible_texts?: string[]
          created_at?: string
          greeting?: string
          icebreaker?: string
          id?: string
          lesson_id: string
          practice?: string
          prayer_prompt?: string
          questions?: string[]
          summary?: string
          updated_at?: string
          video_link?: string
        }
        Update: {
          audio_link?: string
          bible_texts?: string[]
          created_at?: string
          greeting?: string
          icebreaker?: string
          id?: string
          lesson_id?: string
          practice?: string
          prayer_prompt?: string
          questions?: string[]
          summary?: string
          updated_at?: string
          video_link?: string
        }
        Relationships: []
      }
      lesson_responses: {
        Row: {
          created_at: string
          id: string
          lesson_id: string
          question_key: string
          response: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lesson_id: string
          question_key: string
          response?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lesson_id?: string
          question_key?: string
          response?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lessons: {
        Row: {
          course_id: string
          created_at: string
          id: string
          objective: string | null
          order_num: number
          title: string
          topics: string[] | null
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          objective?: string | null
          order_num: number
          title: string
          topics?: string[] | null
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          objective?: string | null
          order_num?: number
          title?: string
          topics?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_evaluations: {
        Row: {
          admin_id: string
          created_at: string
          engagement_score: number | null
          event_id: string
          id: string
          notes: string | null
          participation_score: number | null
          understanding_score: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_id: string
          created_at?: string
          engagement_score?: number | null
          event_id: string
          id?: string
          notes?: string | null
          participation_score?: number | null
          understanding_score?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_id?: string
          created_at?: string
          engagement_score?: number | null
          event_id?: string
          id?: string
          notes?: string | null
          participation_score?: number | null
          understanding_score?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_evaluations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          area: string | null
          body: string
          community: string | null
          created_at: string
          id: string
          sent_by: string | null
          title: string
        }
        Insert: {
          area?: string | null
          body: string
          community?: string | null
          created_at?: string
          id?: string
          sent_by?: string | null
          title: string
        }
        Update: {
          area?: string | null
          body?: string
          community?: string | null
          created_at?: string
          id?: string
          sent_by?: string | null
          title?: string
        }
        Relationships: []
      }
      pastoral_notes: {
        Row: {
          admin_id: string
          content: string
          created_at: string
          id: string
          is_private: boolean
          note_type: string
          user_id: string
        }
        Insert: {
          admin_id: string
          content: string
          created_at?: string
          id?: string
          is_private?: boolean
          note_type?: string
          user_id: string
        }
        Update: {
          admin_id?: string
          content?: string
          created_at?: string
          id?: string
          is_private?: boolean
          note_type?: string
          user_id?: string
        }
        Relationships: []
      }
      prayer_requests: {
        Row: {
          amen_count: number
          community: string
          content: string
          created_at: string
          id: string
          is_anonymous: boolean
          user_id: string
          user_name: string
        }
        Insert: {
          amen_count?: number
          community: string
          content: string
          created_at?: string
          id?: string
          is_anonymous?: boolean
          user_id: string
          user_name: string
        }
        Update: {
          amen_count?: number
          community?: string
          content?: string
          created_at?: string
          id?: string
          is_anonymous?: boolean
          user_id?: string
          user_name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          area: Database["public"]["Enums"]["area_name"]
          birth_date: string
          community: Database["public"]["Enums"]["community_name"]
          created_at: string
          full_name: string
          id: string
          phone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          area: Database["public"]["Enums"]["area_name"]
          birth_date: string
          community: Database["public"]["Enums"]["community_name"]
          created_at?: string
          full_name: string
          id?: string
          phone: string
          updated_at?: string
          user_id: string
        }
        Update: {
          area?: Database["public"]["Enums"]["area_name"]
          birth_date?: string
          community?: Database["public"]["Enums"]["community_name"]
          created_at?: string
          full_name?: string
          id?: string
          phone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      spiritual_assessments: {
        Row: {
          created_at: string
          doubt_score: number | null
          id: string
          month: number
          needs_pastor: boolean
          notes: string | null
          prayer_score: number | null
          presence_score: number | null
          struggle_score: number | null
          user_id: string
          year: number
        }
        Insert: {
          created_at?: string
          doubt_score?: number | null
          id?: string
          month: number
          needs_pastor?: boolean
          notes?: string | null
          prayer_score?: number | null
          presence_score?: number | null
          struggle_score?: number | null
          user_id: string
          year: number
        }
        Update: {
          created_at?: string
          doubt_score?: number | null
          id?: string
          month?: number
          needs_pastor?: boolean
          notes?: string | null
          prayer_score?: number | null
          presence_score?: number | null
          struggle_score?: number | null
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          activity_id: string
          completed_at: string
          id: string
          user_id: string
        }
        Insert: {
          activity_id: string
          completed_at?: string
          id?: string
          user_id: string
        }
        Update: {
          activity_id?: string
          completed_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_community_area: {
        Args: { _community: Database["public"]["Enums"]["community_name"] }
        Returns: Database["public"]["Enums"]["area_name"]
      }
      get_community_ranking: {
        Args: { _community: Database["public"]["Enums"]["community_name"] }
        Returns: {
          completed_count: number
          faith_points: number
          full_name: string
          user_id: string
        }[]
      }
      get_my_area: {
        Args: never
        Returns: Database["public"]["Enums"]["area_name"]
      }
      get_my_community: {
        Args: never
        Returns: Database["public"]["Enums"]["community_name"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "admin"
      area_name: "Área 1" | "Área 2"
      community_name:
        | "Martim Lutero"
        | "Bom Pastor"
        | "Rincão Fundo"
        | "Rincão Frente"
        | "Linha Brasil"
        | "Iriá Pira 1"
        | "Iriá Pira 2"
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
      app_role: ["user", "admin"],
      area_name: ["Área 1", "Área 2"],
      community_name: [
        "Martim Lutero",
        "Bom Pastor",
        "Rincão Fundo",
        "Rincão Frente",
        "Linha Brasil",
        "Iriá Pira 1",
        "Iriá Pira 2",
      ],
    },
  },
} as const
