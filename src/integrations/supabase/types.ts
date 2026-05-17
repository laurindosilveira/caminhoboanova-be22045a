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
      achievement_definitions: {
        Row: {
          bonus_points: number
          church_id: string | null
          created_at: string
          description: string
          icon: string
          id: string
          is_active: boolean
          is_secret: boolean
          key: string
          metric: string
          sort_order: number
          target: number
          title: string
          updated_at: string
        }
        Insert: {
          bonus_points?: number
          church_id?: string | null
          created_at?: string
          description?: string
          icon?: string
          id?: string
          is_active?: boolean
          is_secret?: boolean
          key: string
          metric: string
          sort_order?: number
          target?: number
          title: string
          updated_at?: string
        }
        Update: {
          bonus_points?: number
          church_id?: string | null
          created_at?: string
          description?: string
          icon?: string
          id?: string
          is_active?: boolean
          is_secret?: boolean
          key?: string
          metric?: string
          sort_order?: number
          target?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievement_definitions_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
      achievement_unlocks: {
        Row: {
          achievement_key: string
          bonus_points: number
          church_id: string | null
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_key: string
          bonus_points?: number
          church_id?: string | null
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_key?: string
          bonus_points?: number
          church_id?: string | null
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievement_unlocks_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
      activities: {
        Row: {
          church_id: string | null
          created_at: string
          id: string
          order_num: number
          points: number
          subtitle: string | null
          title: string
          type: string
        }
        Insert: {
          church_id?: string | null
          created_at?: string
          id?: string
          order_num: number
          points?: number
          subtitle?: string | null
          title: string
          type: string
        }
        Update: {
          church_id?: string | null
          created_at?: string
          id?: string
          order_num?: number
          points?: number
          subtitle?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_removal_log: {
        Row: {
          activity_id: string
          activity_title: string
          activity_type: string
          church_id: string | null
          id: string
          notes: string | null
          points_removed: number
          removed_at: string
          removed_by: string
          target_user_id: string
        }
        Insert: {
          activity_id: string
          activity_title?: string
          activity_type: string
          church_id?: string | null
          id?: string
          notes?: string | null
          points_removed?: number
          removed_at?: string
          removed_by: string
          target_user_id: string
        }
        Update: {
          activity_id?: string
          activity_title?: string
          activity_type?: string
          church_id?: string | null
          id?: string
          notes?: string | null
          points_removed?: number
          removed_at?: string
          removed_by?: string
          target_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_removal_log_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
      area_pastors: {
        Row: {
          area: string
          church_id: string | null
          id: string
          pastor_name: string
          phone: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          area: string
          church_id?: string | null
          id?: string
          pastor_name?: string
          phone?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          area?: string
          church_id?: string | null
          id?: string
          pastor_name?: string
          phone?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "area_pastors_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
      areas: {
        Row: {
          church_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          church_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          church_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "areas_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          church_id: string | null
          confirmation_source: string | null
          confirmed_by: string | null
          created_at: string
          event_id: string
          id: string
          justification: string | null
          leader_confirmed_at: string | null
          status: string
          user_id: string
          user_requested_at: string | null
        }
        Insert: {
          church_id?: string | null
          confirmation_source?: string | null
          confirmed_by?: string | null
          created_at?: string
          event_id: string
          id?: string
          justification?: string | null
          leader_confirmed_at?: string | null
          status?: string
          user_id: string
          user_requested_at?: string | null
        }
        Update: {
          church_id?: string | null
          confirmation_source?: string | null
          confirmed_by?: string | null
          created_at?: string
          event_id?: string
          id?: string
          justification?: string | null
          leader_confirmed_at?: string | null
          status?: string
          user_id?: string
          user_requested_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      authorized_system_admins: {
        Row: {
          created_at: string
          created_by: string | null
          email: string
          id: string
          is_active: boolean
          notes: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email: string
          id?: string
          is_active?: boolean
          notes?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string
          id?: string
          is_active?: boolean
          notes?: string | null
        }
        Relationships: []
      }
      challenge_participants: {
        Row: {
          challenge_id: string
          church_id: string | null
          completed: boolean
          completed_at: string | null
          file_url: string | null
          id: string
          joined_at: string
          response_text: string | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          church_id?: string | null
          completed?: boolean
          completed_at?: string | null
          file_url?: string | null
          id?: string
          joined_at?: string
          response_text?: string | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          church_id?: string | null
          completed?: boolean
          completed_at?: string | null
          file_url?: string | null
          id?: string
          joined_at?: string
          response_text?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_participants_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "community_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_participants_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
      church_subscriptions: {
        Row: {
          activities: string | null
          average_age: string | null
          church_address: string | null
          church_email: string
          church_id: string | null
          church_name: string
          church_phone: string | null
          created_at: string
          id: string
          is_active: boolean | null
          member_count: string | null
          member_limit: number | null
          needs: string | null
          objectives: string | null
          pastor_email: string | null
          pastor_name: string
          pastor_phone: string | null
          pastor_role: string | null
          preferences: string | null
          recommended_plan: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          activities?: string | null
          average_age?: string | null
          church_address?: string | null
          church_email: string
          church_id?: string | null
          church_name: string
          church_phone?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          member_count?: string | null
          member_limit?: number | null
          needs?: string | null
          objectives?: string | null
          pastor_email?: string | null
          pastor_name: string
          pastor_phone?: string | null
          pastor_role?: string | null
          preferences?: string | null
          recommended_plan?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          activities?: string | null
          average_age?: string | null
          church_address?: string | null
          church_email?: string
          church_id?: string | null
          church_name?: string
          church_phone?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          member_count?: string | null
          member_limit?: number | null
          needs?: string | null
          objectives?: string | null
          pastor_email?: string | null
          pastor_name?: string
          pastor_phone?: string | null
          pastor_role?: string | null
          preferences?: string | null
          recommended_plan?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "church_subscriptions_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
      churches: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          primary_color: string | null
          secondary_color: string | null
          slug: string
          state: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          primary_color?: string | null
          secondary_color?: string | null
          slug: string
          state?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          primary_color?: string | null
          secondary_color?: string | null
          slug?: string
          state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      communities: {
        Row: {
          area_id: string
          church_id: string | null
          created_at: string
          created_by: string | null
          id: string
          name: string
        }
        Insert: {
          area_id: string
          church_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
        }
        Update: {
          area_id?: string
          church_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "communities_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communities_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
      community_challenges: {
        Row: {
          area: string | null
          church_id: string | null
          community: string | null
          created_at: string
          created_by: string | null
          description: string | null
          emoji: string
          end_date: string
          id: string
          requires_file: boolean
          requires_text: boolean
          start_date: string
          title: string
        }
        Insert: {
          area?: string | null
          church_id?: string | null
          community?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          emoji?: string
          end_date: string
          id?: string
          requires_file?: boolean
          requires_text?: boolean
          start_date: string
          title: string
        }
        Update: {
          area?: string | null
          church_id?: string | null
          community?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          emoji?: string
          end_date?: string
          id?: string
          requires_file?: boolean
          requires_text?: boolean
          start_date?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_challenges_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
      community_chat: {
        Row: {
          church_id: string | null
          community: string
          created_at: string
          file_type: string | null
          file_url: string | null
          id: string
          message: string
          reply_to: string | null
          reply_to_name: string | null
          reply_to_text: string | null
          user_id: string
          user_name: string
        }
        Insert: {
          church_id?: string | null
          community: string
          created_at?: string
          file_type?: string | null
          file_url?: string | null
          id?: string
          message: string
          reply_to?: string | null
          reply_to_name?: string | null
          reply_to_text?: string | null
          user_id: string
          user_name: string
        }
        Update: {
          church_id?: string | null
          community?: string
          created_at?: string
          file_type?: string | null
          file_url?: string | null
          id?: string
          message?: string
          reply_to?: string | null
          reply_to_name?: string | null
          reply_to_text?: string | null
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_chat_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_chat_reply_to_fkey"
            columns: ["reply_to"]
            isOneToOne: false
            referencedRelation: "community_chat"
            referencedColumns: ["id"]
          },
        ]
      }
      community_settings: {
        Row: {
          church_id: string | null
          community: string
          id: string
          updated_at: string
          updated_by: string | null
          verse_of_week: string | null
          verse_reference: string | null
          whatsapp_link: string | null
        }
        Insert: {
          church_id?: string | null
          community: string
          id?: string
          updated_at?: string
          updated_by?: string | null
          verse_of_week?: string | null
          verse_reference?: string | null
          whatsapp_link?: string | null
        }
        Update: {
          church_id?: string | null
          community?: string
          id?: string
          updated_at?: string
          updated_by?: string | null
          verse_of_week?: string | null
          verse_reference?: string | null
          whatsapp_link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_settings_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
      course_unlocks: {
        Row: {
          area: string
          church_id: string | null
          course_id: string
          id: string
          unlocked_at: string
          unlocked_by: string
        }
        Insert: {
          area: string
          church_id?: string | null
          course_id: string
          id?: string
          unlocked_at?: string
          unlocked_by: string
        }
        Update: {
          area?: string
          church_id?: string | null
          course_id?: string
          id?: string
          unlocked_at?: string
          unlocked_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_unlocks_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_unlocks_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          church_id: string | null
          created_at: string
          id: string
          order_num: number
          subtitle: string | null
          title: string
        }
        Insert: {
          church_id?: string | null
          created_at?: string
          id?: string
          order_num: number
          subtitle?: string | null
          title: string
        }
        Update: {
          church_id?: string | null
          created_at?: string
          id?: string
          order_num?: number
          subtitle?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_event_types: {
        Row: {
          area: string | null
          church_id: string | null
          created_at: string
          created_by: string | null
          emoji: string
          gives_points: boolean
          id: string
          label: string
          points: number
          value: string
        }
        Insert: {
          area?: string | null
          church_id?: string | null
          created_at?: string
          created_by?: string | null
          emoji?: string
          gives_points?: boolean
          id?: string
          label: string
          points?: number
          value: string
        }
        Update: {
          area?: string | null
          church_id?: string | null
          created_at?: string
          created_by?: string | null
          emoji?: string
          gives_points?: boolean
          id?: string
          label?: string
          points?: number
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_event_types_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
      data_export_audit: {
        Row: {
          church_id: string | null
          created_at: string
          export_type: string
          id: string
          metadata: Json
          scope: string
          status: string
          user_id: string
        }
        Insert: {
          church_id?: string | null
          created_at?: string
          export_type: string
          id?: string
          metadata?: Json
          scope: string
          status: string
          user_id?: string
        }
        Update: {
          church_id?: string | null
          created_at?: string
          export_type?: string
          id?: string
          metadata?: Json
          scope?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_export_audit_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
      devotional_content: {
        Row: {
          activity_id: string | null
          bible_reference: string
          bible_text: string
          church_id: string | null
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
          worship_song_id: string | null
        }
        Insert: {
          activity_id?: string | null
          bible_reference?: string
          bible_text?: string
          church_id?: string | null
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
          worship_song_id?: string | null
        }
        Update: {
          activity_id?: string | null
          bible_reference?: string
          bible_text?: string
          church_id?: string | null
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
          worship_song_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "devotional_content_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "devotional_content_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "devotional_content_worship_song_id_fkey"
            columns: ["worship_song_id"]
            isOneToOne: false
            referencedRelation: "worship_songs"
            referencedColumns: ["id"]
          },
        ]
      }
      devotional_progress: {
        Row: {
          awarded_points: number | null
          church_id: string | null
          completed_at: string
          devotional_id: string
          id: string
          is_recovery: boolean
          override_release_id: string | null
          user_id: string
        }
        Insert: {
          awarded_points?: number | null
          church_id?: string | null
          completed_at?: string
          devotional_id: string
          id?: string
          is_recovery?: boolean
          override_release_id?: string | null
          user_id: string
        }
        Update: {
          awarded_points?: number | null
          church_id?: string | null
          completed_at?: string
          devotional_id?: string
          id?: string
          is_recovery?: boolean
          override_release_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "devotional_progress_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "devotional_progress_devotional_id_fkey"
            columns: ["devotional_id"]
            isOneToOne: false
            referencedRelation: "devotional_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "devotional_progress_override_release_id_fkey"
            columns: ["override_release_id"]
            isOneToOne: false
            referencedRelation: "user_devotional_overrides"
            referencedColumns: ["id"]
          },
        ]
      }
      devotional_responses: {
        Row: {
          church_id: string | null
          created_at: string
          devotional_id: string
          id: string
          question_index: number
          response: string
          updated_at: string
          user_id: string
        }
        Insert: {
          church_id?: string | null
          created_at?: string
          devotional_id: string
          id?: string
          question_index: number
          response?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          church_id?: string | null
          created_at?: string
          devotional_id?: string
          id?: string
          question_index?: number
          response?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "devotional_responses_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "devotional_responses_progress_fkey"
            columns: ["user_id", "devotional_id"]
            isOneToOne: false
            referencedRelation: "devotional_progress"
            referencedColumns: ["user_id", "devotional_id"]
          },
        ]
      }
      devotional_worship_songs: {
        Row: {
          church_id: string | null
          created_at: string | null
          devotional_id: string
          id: string
          worship_song_id: string
        }
        Insert: {
          church_id?: string | null
          created_at?: string | null
          devotional_id: string
          id?: string
          worship_song_id: string
        }
        Update: {
          church_id?: string | null
          created_at?: string | null
          devotional_id?: string
          id?: string
          worship_song_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "devotional_worship_songs_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "devotional_worship_songs_devotional_id_fkey"
            columns: ["devotional_id"]
            isOneToOne: false
            referencedRelation: "devotional_content"
            referencedColumns: ["activity_id"]
          },
          {
            foreignKeyName: "devotional_worship_songs_worship_song_id_fkey"
            columns: ["worship_song_id"]
            isOneToOne: false
            referencedRelation: "worship_songs"
            referencedColumns: ["id"]
          },
        ]
      }
      discipleship_plans: {
        Row: {
          aptidao: string | null
          challenges: string | null
          church_id: string | null
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
          church_id?: string | null
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
          church_id?: string | null
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
        Relationships: [
          {
            foreignKeyName: "discipleship_plans_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
      event_photos: {
        Row: {
          caption: string | null
          church_id: string | null
          created_at: string
          event_id: string
          file_url: string
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          user_id: string
        }
        Insert: {
          caption?: string | null
          church_id?: string | null
          created_at?: string
          event_id: string
          file_url: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id: string
        }
        Update: {
          caption?: string | null
          church_id?: string | null
          created_at?: string
          event_id?: string
          file_url?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_photos_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_photos_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          area: string | null
          church_id: string | null
          community: string | null
          created_at: string
          created_by: string | null
          description: string | null
          event_date: string
          id: string
          linked_lesson_id: string | null
          location: string | null
          released_devotional_days: number[] | null
          target_user_id: string | null
          title: string
          turma_id: string | null
          type: string
        }
        Insert: {
          area?: string | null
          church_id?: string | null
          community?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_date: string
          id?: string
          linked_lesson_id?: string | null
          location?: string | null
          released_devotional_days?: number[] | null
          target_user_id?: string | null
          title: string
          turma_id?: string | null
          type?: string
        }
        Update: {
          area?: string | null
          church_id?: string | null
          community?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_date?: string
          id?: string
          linked_lesson_id?: string | null
          location?: string | null
          released_devotional_days?: number[] | null
          target_user_id?: string | null
          title?: string
          turma_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_linked_lesson_id_fkey"
            columns: ["linked_lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      game_config: {
        Row: {
          church_id: string | null
          key: string
          updated_at: string
          value: number
        }
        Insert: {
          church_id?: string | null
          key: string
          updated_at?: string
          value: number
        }
        Update: {
          church_id?: string | null
          key?: string
          updated_at?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "game_config_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
      leader_guide: {
        Row: {
          bible_texts: string[]
          church_id: string | null
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
        }
        Insert: {
          bible_texts?: string[]
          church_id?: string | null
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
        }
        Update: {
          bible_texts?: string[]
          church_id?: string | null
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
        }
        Relationships: [
          {
            foreignKeyName: "leader_guide_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leader_guide_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      leader_meeting_notes: {
        Row: {
          area: Database["public"]["Enums"]["area_name"] | null
          church_id: string | null
          created_at: string
          follow_up_notes: string | null
          id: string
          leader_id: string
          lesson_id: string
          participation_notes: string | null
          pastoral_care_notes: string | null
          questions_notes: string | null
          spiritual_notes: string | null
          updated_at: string
        }
        Insert: {
          area?: Database["public"]["Enums"]["area_name"] | null
          church_id?: string | null
          created_at?: string
          follow_up_notes?: string | null
          id?: string
          leader_id: string
          lesson_id: string
          participation_notes?: string | null
          pastoral_care_notes?: string | null
          questions_notes?: string | null
          spiritual_notes?: string | null
          updated_at?: string
        }
        Update: {
          area?: Database["public"]["Enums"]["area_name"] | null
          church_id?: string | null
          created_at?: string
          follow_up_notes?: string | null
          id?: string
          leader_id?: string
          lesson_id?: string
          participation_notes?: string | null
          pastoral_care_notes?: string | null
          questions_notes?: string | null
          spiritual_notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leader_meeting_notes_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leader_meeting_notes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_content: {
        Row: {
          audio_link: string
          bible_texts: string[]
          church_id: string | null
          created_at: string
          greeting: string
          icebreaker: string
          id: string
          lesson_id: string
          pdf_link: string
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
          church_id?: string | null
          created_at?: string
          greeting?: string
          icebreaker?: string
          id?: string
          lesson_id: string
          pdf_link?: string
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
          church_id?: string | null
          created_at?: string
          greeting?: string
          icebreaker?: string
          id?: string
          lesson_id?: string
          pdf_link?: string
          practice?: string
          prayer_prompt?: string
          questions?: string[]
          summary?: string
          updated_at?: string
          video_link?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_content_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_responses: {
        Row: {
          awarded_points: number | null
          church_id: string | null
          created_at: string
          id: string
          lesson_id: string
          override_release_id: string | null
          question_key: string
          response: string
          updated_at: string
          user_id: string
        }
        Insert: {
          awarded_points?: number | null
          church_id?: string | null
          created_at?: string
          id?: string
          lesson_id: string
          override_release_id?: string | null
          question_key: string
          response?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          awarded_points?: number | null
          church_id?: string | null
          created_at?: string
          id?: string
          lesson_id?: string
          override_release_id?: string | null
          question_key?: string
          response?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_responses_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_responses_override_release_id_fkey"
            columns: ["override_release_id"]
            isOneToOne: false
            referencedRelation: "user_lesson_overrides"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          church_id: string | null
          course_id: string
          created_at: string
          devotional_mode: string
          id: string
          objective: string | null
          order_num: number
          title: string
          topics: string[] | null
        }
        Insert: {
          church_id?: string | null
          course_id: string
          created_at?: string
          devotional_mode?: string
          id?: string
          objective?: string | null
          order_num: number
          title: string
          topics?: string[] | null
        }
        Update: {
          church_id?: string | null
          course_id?: string
          created_at?: string
          devotional_mode?: string
          id?: string
          objective?: string | null
          order_num?: number
          title?: string
          topics?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
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
          church_id: string | null
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
          church_id?: string | null
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
          church_id?: string | null
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
            foreignKeyName: "meeting_evaluations_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_evaluations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      message_reactions: {
        Row: {
          church_id: string | null
          created_at: string
          emoji: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          church_id?: string | null
          created_at?: string
          emoji: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          church_id?: string | null
          created_at?: string
          emoji?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reactions_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_views: {
        Row: {
          church_id: string | null
          id: string
          message_id: string
          user_id: string
          viewed_at: string
        }
        Insert: {
          church_id?: string | null
          id?: string
          message_id: string
          user_id: string
          viewed_at?: string
        }
        Update: {
          church_id?: string | null
          id?: string
          message_id?: string
          user_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_views_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_views_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          area: string | null
          body: string
          church_id: string | null
          community: string | null
          created_at: string
          id: string
          sent_by: string | null
          title: string
          turma_id: string | null
        }
        Insert: {
          area?: string | null
          body: string
          church_id?: string | null
          community?: string | null
          created_at?: string
          id?: string
          sent_by?: string | null
          title: string
          turma_id?: string | null
        }
        Update: {
          area?: string | null
          body?: string
          church_id?: string | null
          community?: string | null
          created_at?: string
          id?: string
          sent_by?: string | null
          title?: string
          turma_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          church_id: string | null
          created_at: string
          devocional: boolean
          eventos: boolean
          id: string
          master_enabled: boolean
          mensagens: boolean
          preferred_hour: number
          streak: boolean
          timezone: string
          updated_at: string
          user_id: string
          whatsapp_checkin: boolean
          whatsapp_desafio: boolean
          whatsapp_devocional: boolean
          whatsapp_enabled: boolean
        }
        Insert: {
          church_id?: string | null
          created_at?: string
          devocional?: boolean
          eventos?: boolean
          id?: string
          master_enabled?: boolean
          mensagens?: boolean
          preferred_hour?: number
          streak?: boolean
          timezone?: string
          updated_at?: string
          user_id: string
          whatsapp_checkin?: boolean
          whatsapp_desafio?: boolean
          whatsapp_devocional?: boolean
          whatsapp_enabled?: boolean
        }
        Update: {
          church_id?: string | null
          created_at?: string
          devocional?: boolean
          eventos?: boolean
          id?: string
          master_enabled?: boolean
          mensagens?: boolean
          preferred_hour?: number
          streak?: boolean
          timezone?: string
          updated_at?: string
          user_id?: string
          whatsapp_checkin?: boolean
          whatsapp_desafio?: boolean
          whatsapp_devocional?: boolean
          whatsapp_enabled?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          link: string | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      pastoral_notes: {
        Row: {
          admin_id: string
          church_id: string | null
          content: string
          created_at: string
          id: string
          is_private: boolean
          note_type: string
          user_id: string
        }
        Insert: {
          admin_id: string
          church_id?: string | null
          content: string
          created_at?: string
          id?: string
          is_private?: boolean
          note_type?: string
          user_id: string
        }
        Update: {
          admin_id?: string
          church_id?: string | null
          content?: string
          created_at?: string
          id?: string
          is_private?: boolean
          note_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pastoral_notes_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_votes: {
        Row: {
          church_id: string | null
          id: string
          option_index: number
          poll_id: string
          user_id: string
          voted_at: string
        }
        Insert: {
          church_id?: string | null
          id?: string
          option_index: number
          poll_id: string
          user_id: string
          voted_at?: string
        }
        Update: {
          church_id?: string | null
          id?: string
          option_index?: number
          poll_id?: string
          user_id?: string
          voted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      polls: {
        Row: {
          area: string | null
          church_id: string | null
          community: string
          created_at: string
          created_by: string
          emoji: string
          ends_at: string | null
          id: string
          is_active: boolean
          options: string[]
          question: string
        }
        Insert: {
          area?: string | null
          church_id?: string | null
          community: string
          created_at?: string
          created_by: string
          emoji?: string
          ends_at?: string | null
          id?: string
          is_active?: boolean
          options?: string[]
          question: string
        }
        Update: {
          area?: string | null
          church_id?: string | null
          community?: string
          created_at?: string
          created_by?: string
          emoji?: string
          ends_at?: string | null
          id?: string
          is_active?: boolean
          options?: string[]
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "polls_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
      prayer_diary: {
        Row: {
          answered_at: string | null
          area: string | null
          content: string
          created_at: string | null
          id: string
          request_id: string | null
          response: string | null
          title: string
          turma_id: string | null
          user_id: string
        }
        Insert: {
          answered_at?: string | null
          area?: string | null
          content: string
          created_at?: string | null
          id?: string
          request_id?: string | null
          response?: string | null
          title: string
          turma_id?: string | null
          user_id: string
        }
        Update: {
          answered_at?: string | null
          area?: string | null
          content?: string
          created_at?: string | null
          id?: string
          request_id?: string | null
          response?: string | null
          title?: string
          turma_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prayer_diary_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "prayer_diary_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "prayer_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      prayer_interactions: {
        Row: {
          created_at: string
          id: string
          request_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          request_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          request_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prayer_interactions_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "prayer_interactions_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "prayer_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      prayer_pairs: {
        Row: {
          church_id: string | null
          community: string
          created_at: string
          id: string
          user_a_confirmed: boolean
          user_a_id: string
          user_a_name: string
          user_a_testimony: string | null
          user_b_confirmed: boolean
          user_b_id: string
          user_b_name: string
          user_b_testimony: string | null
          week_start: string
        }
        Insert: {
          church_id?: string | null
          community: string
          created_at?: string
          id?: string
          user_a_confirmed?: boolean
          user_a_id: string
          user_a_name?: string
          user_a_testimony?: string | null
          user_b_confirmed?: boolean
          user_b_id: string
          user_b_name?: string
          user_b_testimony?: string | null
          week_start: string
        }
        Update: {
          church_id?: string | null
          community?: string
          created_at?: string
          id?: string
          user_a_confirmed?: boolean
          user_a_id?: string
          user_a_name?: string
          user_a_testimony?: string | null
          user_b_confirmed?: boolean
          user_b_id?: string
          user_b_name?: string
          user_b_testimony?: string | null
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "prayer_pairs_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
      prayer_requests: {
        Row: {
          area: string
          church_id: string | null
          community: string | null
          content: string
          created_at: string
          id: string
          is_sensitive: boolean | null
          prayers_count: number | null
          status: string
          turma_id: string | null
          updated_at: string
          user_id: string
          visibility: string
        }
        Insert: {
          area: string
          church_id?: string | null
          community?: string | null
          content: string
          created_at?: string
          id?: string
          is_sensitive?: boolean | null
          prayers_count?: number | null
          status?: string
          turma_id?: string | null
          updated_at?: string
          user_id: string
          visibility: string
        }
        Update: {
          area?: string
          church_id?: string | null
          community?: string | null
          content?: string
          created_at?: string
          id?: string
          is_sensitive?: boolean | null
          prayers_count?: number | null
          status?: string
          turma_id?: string | null
          updated_at?: string
          user_id?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "prayer_requests_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prayer_requests_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "prayer_requests_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      privacy_requests: {
        Row: {
          admin_notes: string | null
          church_id: string | null
          created_at: string
          details: string | null
          id: string
          request_type: string
          resolved_at: string | null
          resolved_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          church_id?: string | null
          created_at?: string
          details?: string | null
          id?: string
          request_type: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          admin_notes?: string | null
          church_id?: string | null
          created_at?: string
          details?: string | null
          id?: string
          request_type?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "privacy_requests_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          area: Database["public"]["Enums"]["area_name"]
          avatar_url: string | null
          birth_date: string
          church_id: string | null
          community: Database["public"]["Enums"]["community_name"]
          confirmation_year: number | null
          created_at: string
          email: string | null
          enrollment_status: string | null
          enrollment_status_updated_at: string | null
          enrollment_status_updated_by: string | null
          father_name: string | null
          father_phone: string | null
          full_name: string
          id: string
          mother_name: string | null
          mother_phone: string | null
          phone: string
          role: Database["public"]["Enums"]["app_role"] | null
          turma_id: string | null
          updated_at: string
          user_id: string
          whatsapp_last_blocked_at: string | null
          whatsapp_last_blocked_reason: string | null
          whatsapp_number: string | null
          whatsapp_validation_status: string | null
        }
        Insert: {
          address?: string | null
          area: Database["public"]["Enums"]["area_name"]
          avatar_url?: string | null
          birth_date: string
          church_id?: string | null
          community: Database["public"]["Enums"]["community_name"]
          confirmation_year?: number | null
          created_at?: string
          email?: string | null
          enrollment_status?: string | null
          enrollment_status_updated_at?: string | null
          enrollment_status_updated_by?: string | null
          father_name?: string | null
          father_phone?: string | null
          full_name: string
          id?: string
          mother_name?: string | null
          mother_phone?: string | null
          phone: string
          role?: Database["public"]["Enums"]["app_role"] | null
          turma_id?: string | null
          updated_at?: string
          user_id: string
          whatsapp_last_blocked_at?: string | null
          whatsapp_last_blocked_reason?: string | null
          whatsapp_number?: string | null
          whatsapp_validation_status?: string | null
        }
        Update: {
          address?: string | null
          area?: Database["public"]["Enums"]["area_name"]
          avatar_url?: string | null
          birth_date?: string
          church_id?: string | null
          community?: Database["public"]["Enums"]["community_name"]
          confirmation_year?: number | null
          created_at?: string
          email?: string | null
          enrollment_status?: string | null
          enrollment_status_updated_at?: string | null
          enrollment_status_updated_by?: string | null
          father_name?: string | null
          father_phone?: string | null
          full_name?: string
          id?: string
          mother_name?: string | null
          mother_phone?: string | null
          phone?: string
          role?: Database["public"]["Enums"]["app_role"] | null
          turma_id?: string | null
          updated_at?: string
          user_id?: string
          whatsapp_last_blocked_at?: string | null
          whatsapp_last_blocked_reason?: string | null
          whatsapp_number?: string | null
          whatsapp_validation_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      push_activation_reminders: {
        Row: {
          church_id: string | null
          created_at: string
          dismissed_at: string | null
          id: string
          sent_by: string
          target_user_id: string
        }
        Insert: {
          church_id?: string | null
          created_at?: string
          dismissed_at?: string | null
          id?: string
          sent_by: string
          target_user_id: string
        }
        Update: {
          church_id?: string | null
          created_at?: string
          dismissed_at?: string | null
          id?: string
          sent_by?: string
          target_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_activation_reminders_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
      push_automation_config: {
        Row: {
          body: string
          church_id: string | null
          description: string | null
          enabled: boolean
          key: string
          title: string
          updated_at: string
        }
        Insert: {
          body: string
          church_id?: string | null
          description?: string | null
          enabled?: boolean
          key: string
          title: string
          updated_at?: string
        }
        Update: {
          body?: string
          church_id?: string | null
          description?: string | null
          enabled?: boolean
          key?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_automation_config_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
      push_notification_log: {
        Row: {
          body: string
          church_id: string | null
          created_at: string
          failed_count: number
          id: string
          sent_by: string | null
          sent_count: number
          target: string
          target_value: string | null
          title: string
          type: string
        }
        Insert: {
          body?: string
          church_id?: string | null
          created_at?: string
          failed_count?: number
          id?: string
          sent_by?: string | null
          sent_count?: number
          target?: string
          target_value?: string | null
          title?: string
          type?: string
        }
        Update: {
          body?: string
          church_id?: string | null
          created_at?: string
          failed_count?: number
          id?: string
          sent_by?: string | null
          sent_count?: number
          target?: string
          target_value?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_notification_log_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
      push_scheduled: {
        Row: {
          body: string
          church_id: string | null
          created_at: string
          created_by: string | null
          id: string
          scheduled_at: string
          sent: boolean
          sent_at: string | null
          sent_count: number | null
          target: string
          target_value: string | null
          title: string
        }
        Insert: {
          body: string
          church_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          scheduled_at: string
          sent?: boolean
          sent_at?: string | null
          sent_count?: number | null
          target?: string
          target_value?: string | null
          title: string
        }
        Update: {
          body?: string
          church_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          scheduled_at?: string
          sent?: boolean
          sent_at?: string | null
          sent_count?: number | null
          target?: string
          target_value?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_scheduled_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth: string
          church_id: string | null
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auth: string
          church_id?: string | null
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auth?: string
          church_id?: string | null
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
      ranking_seasons: {
        Row: {
          church_id: string | null
          closed_at: string
          closed_by: string
          community: string
          course_id: string
          created_at: string
          id: string
          total_participants: number
          winners: Json
        }
        Insert: {
          church_id?: string | null
          closed_at?: string
          closed_by: string
          community: string
          course_id: string
          created_at?: string
          id?: string
          total_participants?: number
          winners?: Json
        }
        Update: {
          church_id?: string | null
          closed_at?: string
          closed_by?: string
          community?: string
          course_id?: string
          created_at?: string
          id?: string
          total_participants?: number
          winners?: Json
        }
        Relationships: [
          {
            foreignKeyName: "ranking_seasons_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ranking_seasons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      spiritual_assessments: {
        Row: {
          church_id: string | null
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
          church_id?: string | null
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
          church_id?: string | null
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
        Relationships: [
          {
            foreignKeyName: "spiritual_assessments_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonies: {
        Row: {
          church_id: string | null
          community: string
          content: string
          created_at: string
          id: string
          user_id: string
          user_name: string
        }
        Insert: {
          church_id?: string | null
          community: string
          content: string
          created_at?: string
          id?: string
          user_id: string
          user_name: string
        }
        Update: {
          church_id?: string | null
          community?: string
          content?: string
          created_at?: string
          id?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "testimonies_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
      turma_lesson_content: {
        Row: {
          audio_link: string | null
          bible_texts: string[] | null
          church_id: string | null
          created_at: string
          created_by: string | null
          greeting: string | null
          icebreaker: string | null
          id: string
          lesson_id: string
          pdf_link: string | null
          practice: string | null
          prayer_prompt: string | null
          questions: string[] | null
          summary: string | null
          turma_id: string
          updated_at: string
          video_link: string | null
        }
        Insert: {
          audio_link?: string | null
          bible_texts?: string[] | null
          church_id?: string | null
          created_at?: string
          created_by?: string | null
          greeting?: string | null
          icebreaker?: string | null
          id?: string
          lesson_id: string
          pdf_link?: string | null
          practice?: string | null
          prayer_prompt?: string | null
          questions?: string[] | null
          summary?: string | null
          turma_id: string
          updated_at?: string
          video_link?: string | null
        }
        Update: {
          audio_link?: string | null
          bible_texts?: string[] | null
          church_id?: string | null
          created_at?: string
          created_by?: string | null
          greeting?: string | null
          icebreaker?: string | null
          id?: string
          lesson_id?: string
          pdf_link?: string | null
          practice?: string | null
          prayer_prompt?: string | null
          questions?: string[] | null
          summary?: string | null
          turma_id?: string
          updated_at?: string
          video_link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "turma_lesson_content_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "turma_lesson_content_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "turma_lesson_content_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      turmas: {
        Row: {
          area: string | null
          church_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          year: number
        }
        Insert: {
          area?: string | null
          church_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          year?: number
        }
        Update: {
          area?: string | null
          church_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "turmas_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
      user_devotional_overrides: {
        Row: {
          available_from: string | null
          available_until: string | null
          church_id: string | null
          created_at: string
          custom_points: number | null
          devotional_id: string
          granted_by: string | null
          id: string
          is_unlocked: boolean
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          available_from?: string | null
          available_until?: string | null
          church_id?: string | null
          created_at?: string
          custom_points?: number | null
          devotional_id: string
          granted_by?: string | null
          id?: string
          is_unlocked?: boolean
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          available_from?: string | null
          available_until?: string | null
          church_id?: string | null
          created_at?: string
          custom_points?: number | null
          devotional_id?: string
          granted_by?: string | null
          id?: string
          is_unlocked?: boolean
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_devotional_overrides_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_devotional_overrides_devotional_id_fkey"
            columns: ["devotional_id"]
            isOneToOne: false
            referencedRelation: "devotional_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_devotional_overrides_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_devotional_overrides_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_lesson_overrides: {
        Row: {
          available_from: string | null
          available_until: string | null
          church_id: string | null
          created_at: string
          custom_points: number | null
          granted_by: string | null
          id: string
          is_unlocked: boolean
          lesson_id: string
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          available_from?: string | null
          available_until?: string | null
          church_id?: string | null
          created_at?: string
          custom_points?: number | null
          granted_by?: string | null
          id?: string
          is_unlocked?: boolean
          lesson_id: string
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          available_from?: string | null
          available_until?: string | null
          church_id?: string | null
          created_at?: string
          custom_points?: number | null
          granted_by?: string | null
          id?: string
          is_unlocked?: boolean
          lesson_id?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_lesson_overrides_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_lesson_overrides_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_lesson_overrides_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_lesson_overrides_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_progress: {
        Row: {
          activity_id: string
          church_id: string | null
          completed_at: string
          id: string
          user_id: string
        }
        Insert: {
          activity_id: string
          church_id?: string | null
          completed_at?: string
          id?: string
          user_id: string
        }
        Update: {
          activity_id?: string
          church_id?: string | null
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
          {
            foreignKeyName: "user_progress_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          admin_area: string | null
          church_id: string | null
          id: string
          is_super: boolean
          is_super_admin: boolean | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          admin_area?: string | null
          church_id?: string | null
          id?: string
          is_super?: boolean
          is_super_admin?: boolean | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          admin_area?: string | null
          church_id?: string | null
          id?: string
          is_super?: boolean
          is_super_admin?: boolean | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_reminder_config: {
        Row: {
          description: string | null
          enabled: boolean
          key: string
          message_template: string
          threshold: number
          updated_at: string
        }
        Insert: {
          description?: string | null
          enabled?: boolean
          key: string
          message_template: string
          threshold?: number
          updated_at?: string
        }
        Update: {
          description?: string | null
          enabled?: boolean
          key?: string
          message_template?: string
          threshold?: number
          updated_at?: string
        }
        Relationships: []
      }
      whatsapp_reminder_log: {
        Row: {
          blocked_reason_code: string | null
          church_id: string | null
          error_detail: string | null
          id: string
          is_resent: boolean
          message: string
          phone: string
          reference_id: string | null
          reminder_type: string
          resent_at: string | null
          resent_by: string | null
          sent_at: string
          status: string
          user_id: string
        }
        Insert: {
          blocked_reason_code?: string | null
          church_id?: string | null
          error_detail?: string | null
          id?: string
          is_resent?: boolean
          message: string
          phone: string
          reference_id?: string | null
          reminder_type: string
          resent_at?: string | null
          resent_by?: string | null
          sent_at?: string
          status?: string
          user_id: string
        }
        Update: {
          blocked_reason_code?: string | null
          church_id?: string | null
          error_detail?: string | null
          id?: string
          is_resent?: boolean
          message?: string
          phone?: string
          reference_id?: string | null
          reminder_type?: string
          resent_at?: string | null
          resent_by?: string | null
          sent_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_reminder_log_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
      worship_attendance: {
        Row: {
          church_id: string | null
          created_at: string
          event_type: string
          id: string
          preacher_name: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          user_id: string
          worship_date: string
          worship_time: string
        }
        Insert: {
          church_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          preacher_name: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id: string
          worship_date: string
          worship_time: string
        }
        Update: {
          church_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          preacher_name?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id?: string
          worship_date?: string
          worship_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "worship_attendance_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
      worship_songs: {
        Row: {
          artist: string
          church_id: string | null
          created_at: string
          id: string
          is_active: boolean | null
          platform: string
          theme: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          artist: string
          church_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          platform: string
          theme?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          artist?: string
          church_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          platform?: string
          theme?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "worship_songs_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
      year_promotion_requests: {
        Row: {
          church_id: string | null
          from_year: number
          id: string
          requested_at: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          to_year: number
          turma_id: string | null
          user_id: string
        }
        Insert: {
          church_id?: string | null
          from_year?: number
          id?: string
          requested_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          to_year?: number
          turma_id?: string | null
          user_id: string
        }
        Update: {
          church_id?: string | null
          from_year?: number
          id?: string
          requested_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          to_year?: number
          turma_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "year_promotion_requests_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "year_promotion_requests_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_manage_church: { Args: { _church_id: string }; Returns: boolean }
      delete_push_scheduled: { Args: { _id: string }; Returns: undefined }
      delete_user_from_discipleship: {
        Args: { _target_user_id: string }
        Returns: Json
      }
      get_all_areas: {
        Args: never
        Returns: {
          created_at: string
          created_by: string
          description: string
          id: string
          name: string
        }[]
      }
      get_all_communities: {
        Args: never
        Returns: {
          area_id: string
          created_at: string
          created_by: string
          id: string
          name: string
        }[]
      }
      get_area_birthdays: {
        Args: { _area: string; _month?: number }
        Returns: {
          area: string
          birth_date: string
          community: string
          full_name: string
          user_id: string
        }[]
      }
      get_auth_church_id: { Args: never; Returns: string }
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
      get_game_config: {
        Args: never
        Returns: {
          key: string
          value: number
        }[]
      }
      get_my_area: {
        Args: never
        Returns: Database["public"]["Enums"]["area_name"]
      }
      get_my_church_id: { Args: never; Returns: string }
      get_my_community: {
        Args: never
        Returns: Database["public"]["Enums"]["community_name"]
      }
      get_push_automation_config: {
        Args: never
        Returns: {
          body: string
          description: string
          enabled: boolean
          key: string
          title: string
        }[]
      }
      get_push_scheduled_pending: {
        Args: never
        Returns: {
          body: string
          created_at: string
          id: string
          scheduled_at: string
          target: string
          target_value: string
          title: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      insert_push_scheduled: {
        Args: {
          _body: string
          _created_by: string
          _scheduled_at: string
          _target: string
          _target_value: string
          _title: string
        }
        Returns: string
      }
      is_authorized_system_admin: { Args: never; Returns: boolean }
      is_super_admin:
        | { Args: never; Returns: boolean }
        | { Args: { _user_id?: string }; Returns: boolean }
      update_push_automation_config: {
        Args: { _body: string; _enabled: boolean; _key: string; _title: string }
        Returns: undefined
      }
      upsert_game_config_item: {
        Args: { _key: string; _value: number }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "user" | "admin" | "lider" | "super_admin"
      area_name: "Área 1" | "Área 2" | "DISCIPULADO JEMIAC"
      community_name:
        | "Martim Lutero"
        | "Bom Pastor"
        | "Rincão Fundo"
        | "Rincão Frente"
        | "Linha Brasil"
        | "Iriá Pira 1"
        | "Iriá Pira 2"
        | "JEMIAC"
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
      app_role: ["user", "admin", "lider", "super_admin"],
      area_name: ["Área 1", "Área 2", "DISCIPULADO JEMIAC"],
      community_name: [
        "Martim Lutero",
        "Bom Pastor",
        "Rincão Fundo",
        "Rincão Frente",
        "Linha Brasil",
        "Iriá Pira 1",
        "Iriá Pira 2",
        "JEMIAC",
      ],
    },
  },
} as const
