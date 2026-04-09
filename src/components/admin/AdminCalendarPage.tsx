import { useCallback, useMemo, useState } from 'react';
import { Calendar, dateFnsLocalizer, type View } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { useCalendarEvents, type CalendarEventInput } from './useCalendarEvents';
import {
  PORTAL_PANEL_SURFACE_CLASS,
  PORTAL_PRIMARY_ACTION_CLASS,
  PORTAL_SECONDARY_ACTION_CLASS,
} from '../portal/portalBranding';

// ---------------------------------------------------------------------------
// Localizer
// ---------------------------------------------------------------------------

const locales = { 'en-US': enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

// ---------------------------------------------------------------------------
// DnD wrapper
// ---------------------------------------------------------------------------

const DnDCalendar = withDragAndDrop(Calendar);

// ---------------------------------------------------------------------------
// Types for react-big-calendar
// ---------------------------------------------------------------------------

interface BigCalEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  resource?: {
    description: string;
    location: string;
    syncStatus: string;
    googleEventId: string | null;
    dealId: string | null;
    projectId: string | null;
    contactId: string | null;
  };
}

// ---------------------------------------------------------------------------
// Event modal
// ---------------------------------------------------------------------------

interface EventFormState {
  title: string;
  description: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  allDay: boolean;
  location: string;
}

const EMPTY_FORM: EventFormState = {
  title: '',
  description: '',
  startDate: '',
  startTime: '09:00',
  endDate: '',
  endTime: '10:00',
  allDay: false,
  location: '',
};

function toFormState(start: Date, end: Date): Partial<EventFormState> {
  return {
    startDate: format(start, 'yyyy-MM-dd'),
    startTime: format(start, 'HH:mm'),
    endDate: format(end, 'yyyy-MM-dd'),
    endTime: format(end, 'HH:mm'),
  };
}

function formToInput(f: EventFormState): CalendarEventInput {
  const startAt = f.allDay
    ? new Date(`${f.startDate}T00:00:00`).toISOString()
    : new Date(`${f.startDate}T${f.startTime}`).toISOString();
  const endAt = f.allDay
    ? new Date(`${f.endDate}T23:59:59`).toISOString()
    : new Date(`${f.endDate}T${f.endTime}`).toISOString();

  return {
    title: f.title,
    description: f.description || undefined,
    start_at: startAt,
    end_at: endAt,
    all_day: f.allDay,
    location: f.location || undefined,
  };
}

// ---------------------------------------------------------------------------
// Inline SVG Icons (per guidelines: no lucide-react in app code)
// ---------------------------------------------------------------------------

const RefreshIcon = ({ className }: { className?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

const LinkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const UnlinkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m18.84 12.25 1.72-1.71h-.02a5.004 5.004 0 0 0-.12-7.07 5.006 5.006 0 0 0-6.95 0l-1.72 1.71" />
    <path d="m5.17 11.75-1.71 1.71a5.004 5.004 0 0 0 .12 7.07 5.006 5.006 0 0 0 6.95 0l1.71-1.71" />
    <line x1="8" y1="2" x2="8" y2="5" />
    <line x1="2" y1="8" x2="5" y2="8" />
    <line x1="16" y1="19" x2="16" y2="22" />
    <line x1="19" y1="16" x2="22" y2="16" />
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const GoogleCalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <rect x="3" y="3" width="18" height="18" rx="3" fill="#4285F4" />
    <rect x="5" y="8" width="14" height="11" rx="1" fill="white" />
    <rect x="7" y="3" width="2" height="4" rx="0.5" fill="#EA4335" />
    <rect x="15" y="3" width="2" height="4" rx="0.5" fill="#EA4335" />
    <rect x="7" y="10" width="3" height="2" rx="0.5" fill="#34A853" />
    <rect x="11" y="10" width="3" height="2" rx="0.5" fill="#FBBC05" />
    <rect x="7" y="14" width="3" height="2" rx="0.5" fill="#4285F4" />
    <rect x="11" y="14" width="3" height="2" rx="0.5" fill="#EA4335" />
  </svg>
);

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function AdminCalendarPage() {
  const {
    events: rawEvents,
    loading,
    syncing,
    error,
    gcalConnected,
    createEvent,
    updateEvent,
    deleteEvent,
    syncFromGoogle,
    connectGoogleCalendar,
    disconnectGoogleCalendar,
  } = useCalendarEvents();

  const [view, setView] = useState<View>('week');
  const [date, setDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formState, setFormState] = useState<EventFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Map DB events to react-big-calendar format
  const calEvents: BigCalEvent[] = useMemo(
    () =>
      rawEvents.map((e) => ({
        id: e.id,
        title: e.title,
        start: new Date(e.start_at),
        end: new Date(e.end_at),
        allDay: e.all_day,
        resource: {
          description: e.description,
          location: e.location,
          syncStatus: e.sync_status,
          googleEventId: e.google_event_id,
          dealId: e.deal_id,
          projectId: e.project_id,
          contactId: e.contact_id,
        },
      })),
    [rawEvents],
  );

  // Open modal for creating
  const openCreate = useCallback((start?: Date, end?: Date) => {
    const now = new Date();
    const s = start ?? now;
    const e = end ?? new Date(s.getTime() + 60 * 60 * 1000);
    setEditingId(null);
    setFormState({ ...EMPTY_FORM, ...toFormState(s, e) });
    setModalOpen(true);
  }, []);

  // Open modal for editing
  const openEdit = useCallback(
    (event: BigCalEvent) => {
      const raw = rawEvents.find((e) => e.id === event.id);
      if (!raw) return;
      setEditingId(raw.id);
      setFormState({
        title: raw.title,
        description: raw.description,
        startDate: format(new Date(raw.start_at), 'yyyy-MM-dd'),
        startTime: format(new Date(raw.start_at), 'HH:mm'),
        endDate: format(new Date(raw.end_at), 'yyyy-MM-dd'),
        endTime: format(new Date(raw.end_at), 'HH:mm'),
        allDay: raw.all_day,
        location: raw.location,
      });
      setModalOpen(true);
    },
    [rawEvents],
  );

  // Handle slot select (click on empty time)
  const handleSelectSlot = useCallback(
    (slotInfo: { start: Date; end: Date }) => {
      openCreate(slotInfo.start, slotInfo.end);
    },
    [openCreate],
  );

  // Handle DnD move/resize
  const handleEventDrop = useCallback(
    async ({ event, start, end }: { event: BigCalEvent; start: Date | string; end: Date | string }) => {
      const s = start instanceof Date ? start : new Date(start);
      const e = end instanceof Date ? end : new Date(end);
      await updateEvent(event.id, {
        start_at: s.toISOString(),
        end_at: e.toISOString(),
      });
    },
    [updateEvent],
  );

  const handleEventResize = useCallback(
    async ({ event, start, end }: { event: BigCalEvent; start: Date | string; end: Date | string }) => {
      const s = start instanceof Date ? start : new Date(start);
      const e = end instanceof Date ? end : new Date(end);
      await updateEvent(event.id, {
        start_at: s.toISOString(),
        end_at: e.toISOString(),
      });
    },
    [updateEvent],
  );

  // Form submit
  const handleSave = useCallback(async () => {
    if (!formState.title.trim() || !formState.startDate || !formState.endDate) return;
    setSaving(true);
    try {
      const input = formToInput(formState);
      if (editingId) {
        await updateEvent(editingId, input);
      } else {
        await createEvent(input);
      }
      setModalOpen(false);
    } catch (err) {
      console.error('Failed to save event:', err);
    } finally {
      setSaving(false);
    }
  }, [formState, editingId, createEvent, updateEvent]);

  const handleDelete = useCallback(async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      await deleteEvent(editingId);
      setModalOpen(false);
    } catch (err) {
      console.error('Failed to delete event:', err);
    } finally {
      setSaving(false);
    }
  }, [editingId, deleteEvent]);

  // Form field updater
  const setField = useCallback(
    <K extends keyof EventFormState>(key: K, value: EventFormState[K]) => {
      setFormState((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  // Custom event styling
  const eventPropGetter = useCallback(
    (event: BigCalEvent) => {
      const isSynced = event.resource?.googleEventId;
      return {
        style: {
          backgroundColor: isSynced ? '#1a73e8' : '#4f46e5',
          borderRadius: '6px',
          border: 'none',
          color: '#fff',
          fontSize: '12px',
          padding: '2px 6px',
        },
      };
    },
    [],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="bkt-loading-spinner animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Calendar</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {gcalConnected
              ? 'Synced with Google Calendar (primary)'
              : 'Local calendar — connect Google Calendar for two-way sync'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {gcalConnected ? (
            <>
              <button
                type="button"
                onClick={() => { void syncFromGoogle(); }}
                disabled={syncing}
                className={`${PORTAL_SECONDARY_ACTION_CLASS} gap-1.5`}
              >
                <RefreshIcon className={syncing ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">{syncing ? 'Syncing…' : 'Sync Now'}</span>
              </button>
              <button
                type="button"
                onClick={() => { void disconnectGoogleCalendar(); }}
                className={`${PORTAL_SECONDARY_ACTION_CLASS} gap-1.5 text-red-600 dark:text-red-400`}
              >
                <UnlinkIcon />
                <span className="hidden sm:inline">Disconnect</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={connectGoogleCalendar}
              className={`${PORTAL_SECONDARY_ACTION_CLASS} gap-1.5`}
            >
              <GoogleCalendarIcon />
              <span>Connect Google Calendar</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => openCreate()}
            className={`${PORTAL_PRIMARY_ACTION_CLASS} gap-1.5`}
          >
            <PlusIcon />
            <span>New Event</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Calendar */}
      <div className={`${PORTAL_PANEL_SURFACE_CLASS} overflow-hidden`}>
        <div className="bkt-calendar-wrapper p-2 sm:p-4" style={{ height: 'calc(100vh - 280px)', minHeight: '500px' }}>
          <DnDCalendar
            localizer={localizer}
            events={calEvents}
            view={view}
            date={date}
            onView={setView}
            onNavigate={setDate}
            onSelectEvent={(event) => openEdit(event as BigCalEvent)}
            onSelectSlot={handleSelectSlot}
            onEventDrop={(args) => { void handleEventDrop(args as Parameters<typeof handleEventDrop>[0]); }}
            onEventResize={(args) => { void handleEventResize(args as Parameters<typeof handleEventResize>[0]); }}
            selectable
            resizable
            popup
            views={['month', 'week', 'day', 'agenda']}
            step={30}
            timeslots={2}
            defaultView="week"
            eventPropGetter={eventPropGetter as never}
            style={{ height: '100%' }}
          />
        </div>
      </div>

      {/* Event modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}
          role="dialog"
          aria-modal="true"
          aria-label={editingId ? 'Edit event' : 'New event'}
        >
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
                {editingId ? 'Edit Event' : 'New Event'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                aria-label="Close"
              >
                <XIcon />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label htmlFor="event-title" className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="event-title"
                  type="text"
                  value={formState.title}
                  onChange={(e) => setField('title', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  placeholder="Meeting with client…"
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="event-description" className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                  Description
                </label>
                <textarea
                  id="event-description"
                  value={formState.description}
                  onChange={(e) => setField('description', e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="event-location" className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                  Location
                </label>
                <input
                  id="event-location"
                  type="text"
                  value={formState.location}
                  onChange={(e) => setField('location', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  placeholder="Google Meet, Office, etc."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="event-allday"
                  type="checkbox"
                  checked={formState.allDay}
                  onChange={(e) => setField('allDay', e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="event-allday" className="text-xs text-slate-600 dark:text-slate-400">
                  All day event
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="event-start-date" className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="event-start-date"
                    type="date"
                    value={formState.startDate}
                    onChange={(e) => setField('startDate', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                {!formState.allDay && (
                  <div>
                    <label htmlFor="event-start-time" className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                      Start Time
                    </label>
                    <input
                      id="event-start-time"
                      type="time"
                      value={formState.startTime}
                      onChange={(e) => setField('startTime', e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="event-end-date" className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="event-end-date"
                    type="date"
                    value={formState.endDate}
                    onChange={(e) => setField('endDate', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                {!formState.allDay && (
                  <div>
                    <label htmlFor="event-end-time" className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                      End Time
                    </label>
                    <input
                      id="event-end-time"
                      type="time"
                      value={formState.endTime}
                      onChange={(e) => setField('endTime', e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => { void handleDelete(); }}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    <TrashIcon />
                    Delete
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className={PORTAL_SECONDARY_ACTION_CLASS}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => { void handleSave(); }}
                  disabled={saving || !formState.title.trim() || !formState.startDate || !formState.endDate}
                  className={`${PORTAL_PRIMARY_ACTION_CLASS} disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  {saving ? 'Saving…' : editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
