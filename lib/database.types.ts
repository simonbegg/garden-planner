export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      activities: {
        Row: {
          id: string
          user_id: string | null
          activity_type: string
          activity_date: string
          notes: string | null
          plant_id: string | null
          garden_layout_id: string | null
          weather_conditions: string | null
          photo_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          activity_type: string
          activity_date: string
          notes?: string | null
          plant_id?: string | null
          garden_layout_id?: string | null
          weather_conditions?: string | null
          photo_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          activity_type?: string
          activity_date?: string
          notes?: string | null
          plant_id?: string | null
          garden_layout_id?: string | null
          weather_conditions?: string | null
          photo_url?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_garden_layout_id_fkey"
            columns: ["garden_layout_id"]
            isOneToOne: false
            referencedRelation: "garden_layouts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      garden_layouts: {
        Row: {
          id: string
          user_id: string | null
          name: string
          rows: number
          columns: number
          grid: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          rows: number
          columns: number
          grid: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          rows?: number
          columns?: number
          grid?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "garden_layouts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      plants: {
        Row: {
          id: string
          user_id: string | null
          name: string
          variety: string
          type: string
          color: string
          spacing: number
          planting_time: string
          harvest_time: string
          planting_date: string | null
          care_instructions: string[]
          growth_stage: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          variety: string
          type: string
          color: string
          spacing: number
          planting_time: string
          harvest_time: string
          planting_date?: string | null
          care_instructions?: string[]
          growth_stage?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          variety?: string
          type?: string
          color?: string
          spacing?: number
          planting_time?: string
          harvest_time?: string
          planting_date?: string | null
          care_instructions?: string[]
          growth_stage?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          email: string
          display_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
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
