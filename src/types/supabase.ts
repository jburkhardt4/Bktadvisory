export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      accounts: {
        Row: {
          id: string;
          name: string;
          domain: string | null;
          industry: string | null;
          employee_count: number | null;
          annual_revenue: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          domain?: string | null;
          industry?: string | null;
          employee_count?: number | null;
          annual_revenue?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          domain?: string | null;
          industry?: string | null;
          employee_count?: number | null;
          annual_revenue?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      contacts: {
        Row: {
          id: string;
          account_id: string | null;
          first_name: string;
          last_name: string;
          email: string | null;
          phone: string | null;
          website_url: string | null;
          linkedin_url: string | null;
          upwork_url: string | null;
          source: Database['public']['Enums']['contact_source'];
          tags: string[];
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          account_id?: string | null;
          first_name: string;
          last_name?: string;
          email?: string | null;
          phone?: string | null;
          website_url?: string | null;
          linkedin_url?: string | null;
          upwork_url?: string | null;
          source?: Database['public']['Enums']['contact_source'];
          tags?: string[];
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          account_id?: string | null;
          first_name?: string;
          last_name?: string;
          email?: string | null;
          phone?: string | null;
          website_url?: string | null;
          linkedin_url?: string | null;
          upwork_url?: string | null;
          source?: Database['public']['Enums']['contact_source'];
          tags?: string[];
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'contacts_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'accounts';
            referencedColumns: ['id'];
          },
        ];
      };
      deals: {
        Row: {
          id: string;
          pipeline_id: string;
          contact_id: string | null;
          account_id: string | null;
          quote_id: string | null;
          name: string;
          stage: Database['public']['Enums']['deal_stage'];
          value: number;
          probability: number;
          expected_close: string | null;
          owner: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          pipeline_id: string;
          contact_id?: string | null;
          account_id?: string | null;
          quote_id?: string | null;
          name: string;
          stage?: Database['public']['Enums']['deal_stage'];
          value?: number;
          probability?: number;
          expected_close?: string | null;
          owner?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          pipeline_id?: string;
          contact_id?: string | null;
          account_id?: string | null;
          quote_id?: string | null;
          name?: string;
          stage?: Database['public']['Enums']['deal_stage'];
          value?: number;
          probability?: number;
          expected_close?: string | null;
          owner?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'deals_pipeline_id_fkey';
            columns: ['pipeline_id'];
            isOneToOne: false;
            referencedRelation: 'pipelines';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'deals_contact_id_fkey';
            columns: ['contact_id'];
            isOneToOne: false;
            referencedRelation: 'contacts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'deals_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'accounts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'deals_quote_id_fkey';
            columns: ['quote_id'];
            isOneToOne: false;
            referencedRelation: 'quotes';
            referencedColumns: ['id'];
          },
        ];
      };
      pipelines: {
        Row: {
          id: string;
          name: string;
          stages: Json;
          is_default: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          stages?: Json;
          is_default?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          stages?: Json;
          is_default?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          first_name: string | null;
          last_name: string | null;
          email: string;
          company_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          first_name?: string | null;
          last_name?: string | null;
          email: string;
          company_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string | null;
          last_name?: string | null;
          email?: string;
          company_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      quotes: {
        Row: {
          id: string;
          client_id: string | null;
          status: Database['public']['Enums']['quote_status'];
          estimated_budget_min: number | null;
          estimated_budget_max: number | null;
          form_data: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id?: string | null;
          status?: Database['public']['Enums']['quote_status'];
          estimated_budget_min?: number | null;
          estimated_budget_max?: number | null;
          form_data?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string | null;
          status?: Database['public']['Enums']['quote_status'];
          estimated_budget_min?: number | null;
          estimated_budget_max?: number | null;
          form_data?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'quotes_client_id_fkey';
            columns: ['client_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      projects: {
        Row: {
          id: string;
          client_id: string | null;
          name: string;
          company_name: string;
          description: string | null;
          status: Database['public']['Enums']['project_status'];
          owner: string;
          target_milestone: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id?: string | null;
          name: string;
          company_name: string;
          description?: string | null;
          status?: Database['public']['Enums']['project_status'];
          owner: string;
          target_milestone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string | null;
          name?: string;
          company_name?: string;
          description?: string | null;
          status?: Database['public']['Enums']['project_status'];
          owner?: string;
          target_milestone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'projects_client_id_fkey';
            columns: ['client_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      activity_events: {
        Row: {
          id: string;
          type: Database['public']['Enums']['activity_event_type'];
          client_id: string | null;
          record_id: string;
          description: string;
          actor: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          type: Database['public']['Enums']['activity_event_type'];
          client_id?: string | null;
          record_id: string;
          description?: string;
          actor?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          type?: Database['public']['Enums']['activity_event_type'];
          client_id?: string | null;
          record_id?: string;
          description?: string;
          actor?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'activity_events_client_id_fkey';
            columns: ['client_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'activity_events_record_id_fkey';
            columns: ['record_id'];
            isOneToOne: false;
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
        ];
      };
      milestones: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          description: string;
          target_date: string;
          completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          description?: string;
          target_date: string;
          completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          title?: string;
          description?: string;
          target_date?: string;
          completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'milestones_project_id_fkey';
            columns: ['project_id'];
            isOneToOne: false;
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      current_user_role: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      contact_source:
        | 'website'
        | 'upwork'
        | 'linkedin'
        | 'email'
        | 'referral'
        | 'estimator'
        | 'manual';
      deal_stage:
        | 'identified'
        | 'contacted'
        | 'responded'
        | 'qualified'
        | 'proposal_sent'
        | 'negotiation'
        | 'won'
        | 'lost';
      quote_status:
        | 'draft'
        | 'scoping'
        | 'quoted'
        | 'sent'
        | 'revision_requested'
        | 'accepted'
        | 'declined'
        | 'expired';
      project_status:
        | 'intake'
        | 'discovery'
        | 'scoping'
        | 'design_in_progress'
        | 'build_in_progress'
        | 'awaiting_client'
        | 'blocked'
        | 'uat'
        | 'completed'
        | 'archived';
      activity_event_type:
        | 'quote_generated'
        | 'quote_sent'
        | 'quote_revised'
        | 'quote_accepted'
        | 'project_created'
        | 'discovery_completed'
        | 'scope_approved'
        | 'design_started'
        | 'build_started'
        | 'client_feedback_requested'
        | 'client_feedback_received'
        | 'blocked'
        | 'unblocked'
        | 'uat_started'
        | 'completed'
        | 'archived';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
