import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  mockFrom,
  mockQuoteInsert,
  mockQuoteUpdate,
  mockQuoteDelete,
  mockQuoteEq,
  mockProjectInsert,
  mockProjectUpdate,
  mockProjectDelete,
  mockProjectEq,
  mockActivityInsert,
  mockActivityUpdate,
  mockActivityDelete,
  mockActivityEq,
  mockMilestoneInsert,
  mockMilestoneUpdate,
  mockMilestoneDelete,
  mockMilestoneEq,
} = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockQuoteInsert: vi.fn(),
  mockQuoteUpdate: vi.fn(),
  mockQuoteDelete: vi.fn(),
  mockQuoteEq: vi.fn(),
  mockProjectInsert: vi.fn(),
  mockProjectUpdate: vi.fn(),
  mockProjectDelete: vi.fn(),
  mockProjectEq: vi.fn(),
  mockActivityInsert: vi.fn(),
  mockActivityUpdate: vi.fn(),
  mockActivityDelete: vi.fn(),
  mockActivityEq: vi.fn(),
  mockMilestoneInsert: vi.fn(),
  mockMilestoneUpdate: vi.fn(),
  mockMilestoneDelete: vi.fn(),
  mockMilestoneEq: vi.fn(),
}));

vi.mock('../supabase/client', () => ({
  supabase: {
    from: mockFrom,
  },
}));

import {
  createAdminActivity,
  createAdminMilestone,
  createAdminProject,
  createAdminQuote,
  deleteAdminActivity,
  deleteAdminMilestone,
  deleteAdminProject,
  deleteAdminQuote,
  updateAdminActivity,
  updateAdminMilestone,
  updateAdminProject,
  updateAdminQuote,
} from '../components/admin/adminCrmApi';

describe('admin CRM API helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockQuoteInsert.mockResolvedValue({ error: null });
    mockQuoteEq.mockResolvedValue({ error: null });
    mockQuoteUpdate.mockReturnValue({ eq: mockQuoteEq });
    mockQuoteDelete.mockReturnValue({ eq: mockQuoteEq });

    mockProjectInsert.mockResolvedValue({ error: null });
    mockProjectEq.mockResolvedValue({ error: null });
    mockProjectUpdate.mockReturnValue({ eq: mockProjectEq });
    mockProjectDelete.mockReturnValue({ eq: mockProjectEq });

    mockActivityInsert.mockResolvedValue({ error: null });
    mockActivityEq.mockResolvedValue({ error: null });
    mockActivityUpdate.mockReturnValue({ eq: mockActivityEq });
    mockActivityDelete.mockReturnValue({ eq: mockActivityEq });

    mockMilestoneInsert.mockResolvedValue({ error: null });
    mockMilestoneEq.mockResolvedValue({ error: null });
    mockMilestoneUpdate.mockReturnValue({ eq: mockMilestoneEq });
    mockMilestoneDelete.mockReturnValue({ eq: mockMilestoneEq });

    mockFrom.mockImplementation((table: string) => {
      switch (table) {
        case 'quotes':
          return {
            insert: mockQuoteInsert,
            update: mockQuoteUpdate,
            delete: mockQuoteDelete,
          };
        case 'projects':
          return {
            insert: mockProjectInsert,
            update: mockProjectUpdate,
            delete: mockProjectDelete,
          };
        case 'activity_events':
          return {
            insert: mockActivityInsert,
            update: mockActivityUpdate,
            delete: mockActivityDelete,
          };
        case 'milestones':
          return {
            insert: mockMilestoneInsert,
            update: mockMilestoneUpdate,
            delete: mockMilestoneDelete,
          };
        default:
          throw new Error(`Unexpected table mock: ${table}`);
      }
    });
  });

  it('runs a happy-path quote create/update/delete flow', async () => {
    const client = {
      id: 'client-1',
      email: 'owner@example.com',
      first_name: 'Casey',
      last_name: 'Rivera',
      company_name: 'Acme Corp',
      phone: null,
      avatar_url: null,
      role: 'client',
      created_at: '',
      updated_at: '',
    };

    const values = {
      clientId: 'client-1',
      status: 'quoted' as const,
      estimatedBudgetMin: '25000',
      estimatedBudgetMax: '50000',
      clientName: 'Casey Rivera',
      companyName: 'Acme Corp',
      description: 'Revenue Cloud implementation',
    };

    await createAdminQuote(values, client);
    await updateAdminQuote('quote-1', values, client);
    await deleteAdminQuote('quote-1');

    expect(mockFrom).toHaveBeenCalledWith('quotes');
    expect(mockQuoteInsert).toHaveBeenCalledWith({
      client_id: 'client-1',
      status: 'quoted',
      estimated_budget_min: 25000,
      estimated_budget_max: 50000,
      form_data: {
        client_name: 'Casey Rivera',
        company_name: 'Acme Corp',
        description: 'Revenue Cloud implementation',
        client_email: 'owner@example.com',
      },
    });
    expect(mockQuoteUpdate).toHaveBeenCalledWith({
      client_id: 'client-1',
      status: 'quoted',
      estimated_budget_min: 25000,
      estimated_budget_max: 50000,
      form_data: {
        client_name: 'Casey Rivera',
        company_name: 'Acme Corp',
        description: 'Revenue Cloud implementation',
        client_email: 'owner@example.com',
      },
    });
    expect(mockQuoteEq).toHaveBeenCalledWith('id', 'quote-1');
    expect(mockQuoteDelete).toHaveBeenCalled();
  });

  it('runs a happy-path project create/update/delete flow with related activity sync', async () => {
    const client = {
      id: 'client-1',
      email: 'owner@example.com',
      first_name: 'Casey',
      last_name: 'Rivera',
      company_name: 'Acme Corp',
      phone: null,
      avatar_url: null,
      role: 'client',
      created_at: '',
      updated_at: '',
    };

    const values = {
      clientId: 'client-1',
      name: 'ERP Integration',
      companyName: 'Acme Corp',
      description: 'Connect Salesforce to ERP',
      owner: 'ops@bktadvisory.com',
      status: 'build_in_progress' as const,
      targetMilestone: 'Build Phase 1',
    };

    await createAdminProject(values);
    await updateAdminProject('project-1', values, client);
    await deleteAdminProject('project-1');

    expect(mockProjectInsert).toHaveBeenCalledWith({
      client_id: 'client-1',
      name: 'ERP Integration',
      company_name: 'Acme Corp',
      description: 'Connect Salesforce to ERP',
      owner: 'ops@bktadvisory.com',
      status: 'build_in_progress',
      target_milestone: 'Build Phase 1',
    });
    expect(mockProjectUpdate).toHaveBeenCalledWith({
      client_id: 'client-1',
      name: 'ERP Integration',
      company_name: 'Acme Corp',
      description: 'Connect Salesforce to ERP',
      owner: 'ops@bktadvisory.com',
      status: 'build_in_progress',
      target_milestone: 'Build Phase 1',
    });
    expect(mockActivityUpdate).toHaveBeenCalledWith({ client_id: 'client-1' });
    expect(mockActivityEq).toHaveBeenCalledWith('record_id', 'project-1');
    expect(mockMilestoneDelete).toHaveBeenCalled();
    expect(mockProjectDelete).toHaveBeenCalled();
  });

  it('runs a happy-path activity create/update/delete flow', async () => {
    const project = {
      id: 'project-1',
      client_id: 'client-1',
      name: 'ERP Integration',
      company_name: 'Acme Corp',
      description: null,
      status: 'discovery' as const,
      owner: 'ops@bktadvisory.com',
      target_milestone: 'Discovery',
      created_at: '',
      updated_at: '',
    };

    const values = {
      projectId: 'project-1',
      type: 'build_started' as const,
      description: 'Engineering started on the connector build.',
      actor: 'ops@bktadvisory.com',
    };

    await createAdminActivity(values, project);
    await updateAdminActivity('activity-1', values, project);
    await deleteAdminActivity('activity-1');

    expect(mockActivityInsert).toHaveBeenCalledWith({
      record_id: 'project-1',
      type: 'build_started',
      description: 'Engineering started on the connector build.',
      actor: 'ops@bktadvisory.com',
      client_id: 'client-1',
    });
    expect(mockActivityUpdate).toHaveBeenCalledWith({
      record_id: 'project-1',
      type: 'build_started',
      description: 'Engineering started on the connector build.',
      actor: 'ops@bktadvisory.com',
      client_id: 'client-1',
    });
    expect(mockActivityDelete).toHaveBeenCalled();
  });

  it('runs a happy-path milestone create/update/delete flow and keeps target milestone aligned', async () => {
    const currentMilestone = {
      id: 'milestone-1',
      project_id: 'project-1',
      title: 'Build Phase 1',
      description: 'Current delivery target',
      target_date: '2026-06-01',
      completed: false,
      created_at: '',
      updated_at: '',
      project: {
        id: 'project-1',
        client_id: 'client-1',
        name: 'ERP Integration',
        company_name: 'Acme Corp',
        description: null,
        status: 'build_in_progress' as const,
        owner: 'ops@bktadvisory.com',
        target_milestone: 'Build Phase 1',
        created_at: '',
        updated_at: '',
      },
      client: null,
    };

    const values = {
      projectId: 'project-1',
      title: 'Build Phase 2',
      description: 'Expanded build scope',
      targetDate: '2026-07-01',
      completed: true,
    };

    await createAdminMilestone(values);
    await updateAdminMilestone('milestone-1', values, currentMilestone);
    await deleteAdminMilestone({
      ...currentMilestone,
      title: 'Build Phase 2',
      project: {
        ...currentMilestone.project,
        target_milestone: 'Build Phase 2',
      },
    });

    expect(mockMilestoneInsert).toHaveBeenCalledWith({
      project_id: 'project-1',
      title: 'Build Phase 2',
      description: 'Expanded build scope',
      target_date: '2026-07-01',
      completed: true,
    });
    expect(mockMilestoneUpdate).toHaveBeenCalledWith({
      project_id: 'project-1',
      title: 'Build Phase 2',
      description: 'Expanded build scope',
      target_date: '2026-07-01',
      completed: true,
    });
    expect(mockProjectUpdate).toHaveBeenCalledWith({ target_milestone: 'Build Phase 2' });
    expect(mockProjectUpdate).toHaveBeenCalledWith({ target_milestone: 'TBD' });
    expect(mockMilestoneDelete).toHaveBeenCalled();
  });
});
