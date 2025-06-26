export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_permissions: {
        Row: {
          admin_id: string | null
          created_at: string | null
          granted_by: string | null
          id: string
          permission_level: string
          resource_type: string
        }
        Insert: {
          admin_id?: string | null
          created_at?: string | null
          granted_by?: string | null
          id?: string
          permission_level: string
          resource_type: string
        }
        Update: {
          admin_id?: string | null
          created_at?: string | null
          granted_by?: string | null
          id?: string
          permission_level?: string
          resource_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_permissions_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_permissions_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "admin_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          context: Json | null
          conversation_type: string | null
          created_at: string
          description: string | null
          ended_at: string | null
          id: string
          initial_query: string | null
          last_activity: string
          message_count: number | null
          session_metadata: Json | null
          status: string | null
          thread_id: string | null
          title: string | null
          total_tokens_used: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          context?: Json | null
          conversation_type?: string | null
          created_at: string
          description?: string | null
          ended_at?: string | null
          id: string
          initial_query?: string | null
          last_activity: string
          message_count?: number | null
          session_metadata?: Json | null
          status?: string | null
          thread_id?: string | null
          title?: string | null
          total_tokens_used?: number | null
          updated_at: string
          user_id: string
        }
        Update: {
          context?: Json | null
          conversation_type?: string | null
          created_at?: string
          description?: string | null
          ended_at?: string | null
          id?: string
          initial_query?: string | null
          last_activity?: string
          message_count?: number | null
          session_metadata?: Json | null
          status?: string | null
          thread_id?: string | null
          title?: string | null
          total_tokens_used?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_messages: {
        Row: {
          id: string
          conversation_id: string
          role: string
          content: string
          content_type: string | null
          metadata: Json | null
          processed: boolean | null
          error_message: string | null
          embedding: string | null
          created_at: string
          updated_at: string | null
          specialist_type: string | null
          agent_id: string | null
        }
        Insert: {
          id?: string
          conversation_id: string
          role: string
          content: string
          content_type?: string | null
          metadata?: Json | null
          processed?: boolean | null
          error_message?: string | null
          embedding?: string | null
          created_at?: string
          updated_at?: string | null
          specialist_type?: string | null
          agent_id?: string | null
        }
        Update: {
          id?: string
          conversation_id?: string
          role?: string
          content?: string
          content_type?: string | null
          metadata?: Json | null
          processed?: boolean | null
          error_message?: string | null
          embedding?: string | null
          created_at?: string
          updated_at?: string | null
          specialist_type?: string | null
          agent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          climate_focus: string[] | null
          contact_info: Json | null
          created_at: string | null
          description: string | null
          email: string | null
          first_name: string | null
          full_name: string | null
          id: string
          last_name: string | null
          organization_name: string | null
          organization_type: string | null
          partnership_level: string | null
          profile_completed: boolean | null
          role: string | null
          updated_at: string | null
          user_type: string | null
          verified: boolean | null
          website: string | null
        }
        Insert: {
          climate_focus?: string[] | null
          contact_info?: Json | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id: string
          last_name?: string | null
          organization_name?: string | null
          organization_type?: string | null
          partnership_level?: string | null
          profile_completed?: boolean | null
          role?: string | null
          updated_at?: string | null
          user_type?: string | null
          verified?: boolean | null
          website?: string | null
        }
        Update: {
          climate_focus?: string[] | null
          contact_info?: Json | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          last_name?: string | null
          organization_name?: string | null
          organization_type?: string | null
          partnership_level?: string | null
          profile_completed?: boolean | null
          role?: string | null
          updated_at?: string | null
          user_type?: string | null
          verified?: boolean | null
          website?: string | null
        }
        Relationships: []
      }
      resumes: {
        Row: {
          id: string
          user_id: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          status: string
          analysis_result: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          status?: string
          analysis_result?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          status?: string
          analysis_result?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "resumes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_type: {
        Args: { user_id: string }
        Returns: string
      }
      is_admin: {
        Args: { user_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "user" | "partner" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never
