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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      investissements: {
        Row: {
          created_at: string
          date_investissement: string
          id: string
          nombre_parts: number
          prix_total: number
          projet_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date_investissement?: string
          id?: string
          nombre_parts: number
          prix_total: number
          projet_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date_investissement?: string
          id?: string
          nombre_parts?: number
          prix_total?: number
          projet_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investissements_projet_id_fkey"
            columns: ["projet_id"]
            isOneToOne: false
            referencedRelation: "projets"
            referencedColumns: ["id"]
          },
        ]
      }
      productions_quotidiennes: {
        Row: {
          created_at: string
          date_production: string
          id: string
          production_kwh: number
          projet_id: string
          revenus_total: number
        }
        Insert: {
          created_at?: string
          date_production: string
          id?: string
          production_kwh: number
          projet_id: string
          revenus_total: number
        }
        Update: {
          created_at?: string
          date_production?: string
          id?: string
          production_kwh?: number
          projet_id?: string
          revenus_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "productions_quotidiennes_projet_id_fkey"
            columns: ["projet_id"]
            isOneToOne: false
            referencedRelation: "projets"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          adresse: string | null
          code_postal: string | null
          created_at: string
          date_creation: string
          derniere_connexion: string | null
          email: string
          entreprise: string | null
          id: string
          nom: string | null
          pays: string | null
          prenom: string | null
          statut_investisseur: string | null
          telephone: string | null
          updated_at: string
          user_id: string
          ville: string | null
        }
        Insert: {
          adresse?: string | null
          code_postal?: string | null
          created_at?: string
          date_creation?: string
          derniere_connexion?: string | null
          email: string
          entreprise?: string | null
          id?: string
          nom?: string | null
          pays?: string | null
          prenom?: string | null
          statut_investisseur?: string | null
          telephone?: string | null
          updated_at?: string
          user_id: string
          ville?: string | null
        }
        Update: {
          adresse?: string | null
          code_postal?: string | null
          created_at?: string
          date_creation?: string
          derniere_connexion?: string | null
          email?: string
          entreprise?: string | null
          id?: string
          nom?: string | null
          pays?: string | null
          prenom?: string | null
          statut_investisseur?: string | null
          telephone?: string | null
          updated_at?: string
          user_id?: string
          ville?: string | null
        }
        Relationships: []
      }
      projets: {
        Row: {
          capacite_mw: number | null
          created_at: string
          date_creation: string
          description: string | null
          id: string
          localisation: string | null
          nom: string
          parts_disponibles: number
          parts_totales: number
          prix_par_part: number
          statut: string | null
          type_projet: string
          updated_at: string
        }
        Insert: {
          capacite_mw?: number | null
          created_at?: string
          date_creation?: string
          description?: string | null
          id?: string
          localisation?: string | null
          nom: string
          parts_disponibles: number
          parts_totales: number
          prix_par_part: number
          statut?: string | null
          type_projet: string
          updated_at?: string
        }
        Update: {
          capacite_mw?: number | null
          created_at?: string
          date_creation?: string
          description?: string | null
          id?: string
          localisation?: string | null
          nom?: string
          parts_disponibles?: number
          parts_totales?: number
          prix_par_part?: number
          statut?: string | null
          type_projet?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      v_investissements_par_investisseur: {
        Row: {
          email: string | null
          montant_total: number | null
          nombre_parts: number | null
          projet_id: string | null
          projet_nom: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investissements_projet_id_fkey"
            columns: ["projet_id"]
            isOneToOne: false
            referencedRelation: "projets"
            referencedColumns: ["id"]
          },
        ]
      }
      v_investisseur_pivot: {
        Row: {
          email: string | null
          parts_par_projet: Json | null
          user_id: string | null
        }
        Relationships: []
      }
      v_investisseur_totaux: {
        Row: {
          email: string | null
          total_montant: number | null
          total_parts: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_my_investissements: {
        Args: Record<PropertyKey, never>
        Returns: {
          email: string
          montant_total: number
          nombre_parts: number
          projet_id: string
          projet_nom: string
          user_id: string
        }[]
      }
      get_my_investisseur_pivot: {
        Args: Record<PropertyKey, never>
        Returns: {
          email: string
          parts_par_projet: Json
          user_id: string
        }[]
      }
      get_my_investisseur_totaux: {
        Args: Record<PropertyKey, never>
        Returns: {
          email: string
          total_montant: number
          total_parts: number
          user_id: string
        }[]
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
