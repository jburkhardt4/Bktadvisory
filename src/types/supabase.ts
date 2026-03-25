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
      profiles: {
        Row: {
          id: string;
          first_name: string | null;
          last_name: string | null;
          email: string;
          company_name: string | null;
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
          client_name: string;
          company_name: string;
          amount: number;
          status: Database['public']['Enums']['quote_status'];
          description: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_name: string;
          company_name: string;
          amount: number;
          status?: Database['public']['Enums']['quote_status'];
          description?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_name?: string;
          company_name?: string;
          amount?: number;
          status?: Database['public']['Enums']['quote_status'];
          description?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          name: string;
          company_name: string;
          status: Database['public']['Enums']['project_status'];
          owner: string;
          target_milestone: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          company_name: string;
          status?: Database['public']['Enums']['project_status'];
          owner: string;
          target_milestone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          company_name?: string;
          status?: Database['public']['Enums']['project_status'];
          owner?: string;
          target_milestone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      opportunities: {
        Row: {
          id: string;
          name: string;
          company_name: string;
          status: Database['public']['Enums']['opportunity_status'];
          value: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          company_name: string;
          status?: Database['public']['Enums']['opportunity_status'];
          value: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          company_name?: string;
          status?: Database['public']['Enums']['opportunity_status'];
          value?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      activity_events: {
        Row: {
          id: string;
          type: Database['public']['Enums']['activity_event_type'];
          project_id: string;
          description: string;
          timestamp: string;
          actor: string;
        };
        Insert: {
          id?: string;
          type: Database['public']['Enums']['activity_event_type'];
          project_id: string;
          description?: string;
          timestamp?: string;
          actor: string;
        };
        Update: {
          id?: string;
          type?: Database['public']['Enums']['activity_event_type'];
          project_id?: string;
          description?: string;
          timestamp?: string;
          actor?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'activity_events_project_id_fkey';
            columns: ['project_id'];
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
      [_ in never]: never;
    };
    Enums: {
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
      opportunity_status:
        | 'discovery'
        | 'solutioning'
        | 'proposal_prepared'
        | 'proposal_sent'
        | 'negotiation'
        | 'closed_won'
        | 'closed_lost';
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
