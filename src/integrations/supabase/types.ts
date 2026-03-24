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
          contact_id: string
          created_at: string
          description: string
          id: string
          type: string
          user_id: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          description?: string
          id?: string
          type?: string
          user_id: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          description?: string
          id?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          case_number: string
          case_type: string
          client_name: string
          contact_id: string | null
          created_at: string
          created_by: string
          id: string
          lawyer_name: string
          notes: string | null
          stage: Database["public"]["Enums"]["case_stage"]
          updated_at: string
          urgency: Database["public"]["Enums"]["case_urgency"]
        }
        Insert: {
          case_number?: string
          case_type?: string
          client_name?: string
          contact_id?: string | null
          created_at?: string
          created_by: string
          id?: string
          lawyer_name?: string
          notes?: string | null
          stage?: Database["public"]["Enums"]["case_stage"]
          updated_at?: string
          urgency?: Database["public"]["Enums"]["case_urgency"]
        }
        Update: {
          case_number?: string
          case_type?: string
          client_name?: string
          contact_id?: string | null
          created_at?: string
          created_by?: string
          id?: string
          lawyer_name?: string
          notes?: string | null
          stage?: Database["public"]["Enums"]["case_stage"]
          updated_at?: string
          urgency?: Database["public"]["Enums"]["case_urgency"]
        }
        Relationships: [
          {
            foreignKeyName: "cases_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          cpf: string | null
          created_at: string
          created_by: string
          date_of_birth: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          pipeline_stage: Database["public"]["Enums"]["pipeline_stage"]
          status: Database["public"]["Enums"]["contact_status"]
          updated_at: string
        }
        Insert: {
          cpf?: string | null
          created_at?: string
          created_by: string
          date_of_birth?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          pipeline_stage?: Database["public"]["Enums"]["pipeline_stage"]
          status?: Database["public"]["Enums"]["contact_status"]
          updated_at?: string
        }
        Update: {
          cpf?: string | null
          created_at?: string
          created_by?: string
          date_of_birth?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          pipeline_stage?: Database["public"]["Enums"]["pipeline_stage"]
          status?: Database["public"]["Enums"]["contact_status"]
          updated_at?: string
        }
        Relationships: []
      }
      deadlines: {
        Row: {
          case_id: string | null
          case_number: string
          client_name: string
          completed: boolean
          created_at: string
          created_by: string
          deadline_type: string
          due_date: string
          id: string
          lawyer_name: string
          updated_at: string
        }
        Insert: {
          case_id?: string | null
          case_number?: string
          client_name?: string
          completed?: boolean
          created_at?: string
          created_by: string
          deadline_type?: string
          due_date: string
          id?: string
          lawyer_name?: string
          updated_at?: string
        }
        Update: {
          case_id?: string | null
          case_number?: string
          client_name?: string
          completed?: boolean
          created_at?: string
          created_by?: string
          deadline_type?: string
          due_date?: string
          id?: string
          lawyer_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deadlines_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          position: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string
          id: string
          position?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          position?: string
          updated_at?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value?: string
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      case_stage:
        | "contract_signed"
        | "document_collection"
        | "petition_filed"
        | "inss_analysis"
        | "medical_exam"
        | "awaiting_decision"
        | "approved"
        | "denied"
      case_urgency: "green" | "yellow" | "orange" | "red"
      contact_status: "lead" | "client" | "inactive"
      pipeline_stage:
        | "new_lead"
        | "in_contact"
        | "consultation_scheduled"
        | "client"
        | "closed"
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
      app_role: ["admin", "user"],
      case_stage: [
        "contract_signed",
        "document_collection",
        "petition_filed",
        "inss_analysis",
        "medical_exam",
        "awaiting_decision",
        "approved",
        "denied",
      ],
      case_urgency: ["green", "yellow", "orange", "red"],
      contact_status: ["lead", "client", "inactive"],
      pipeline_stage: [
        "new_lead",
        "in_contact",
        "consultation_scheduled",
        "client",
        "closed",
      ],
    },
  },
} as const
