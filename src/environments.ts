export type EnvironmentId =
  | 'marketing'
  | 'auth'
  | 'client-portal'
  | 'admin-portal'
  | 'standalone-estimator';

export type EnvironmentKind =
  | 'marketing-site'
  | 'authentication'
  | 'client-portal'
  | 'admin-portal'
  | 'standalone-app';

export type EnvironmentHostType = 'root-app' | 'nested-app' | 'external-domain';

export type EnvironmentAuthLevel = 'public' | 'authenticated' | 'admin';

export type WeeklyChange = {
  date: string;
  title: string;
  summary: string;
  commits: string[];
};

export type EnvironmentDescriptor = {
  id: EnvironmentId;
  label: string;
  kind: EnvironmentKind;
  hostType: EnvironmentHostType;
  localUrl: string;
  livePathOrDomain: string;
  authLevel: EnvironmentAuthLevel;
  sourceRepo: string;
  entryRoute: string;
  dependsOn: EnvironmentId[];
  statusNote: string;
  weeklyChanges: WeeklyChange[];
};

export const environmentManifest: EnvironmentDescriptor[] = [
  {
    id: 'marketing',
    label: 'Marketing Site',
    kind: 'marketing-site',
    hostType: 'root-app',
    localUrl: 'http://localhost:5000/',
    livePathOrDomain: 'https://bktadvisory.com/',
    authLevel: 'public',
    sourceRepo: 'Root workspace',
    entryRoute: '/',
    dependsOn: ['auth', 'standalone-estimator'],
    statusNote:
      'Primary public shell for the brand, navigation, and traffic handoff into portal and estimator experiences.',
    weeklyChanges: [
      {
        date: '2026-04-06',
        title: 'Root routing entrypoint moved to RouterProvider',
        summary:
          'The root app now boots directly from the route tree instead of mounting the estimator shell as the app entrypoint.',
        commits: ['f06ff39'],
      },
      {
        date: '2026-04-01',
        title: 'Portal-adjacent branding and theming polish landed in the shared shell',
        summary:
          'Branding, navigation, shared layout, and styling were refined across the public-facing surface.',
        commits: ['073a3af'],
      },
    ],
  },
  {
    id: 'auth',
    label: 'Auth Gateway',
    kind: 'authentication',
    hostType: 'root-app',
    localUrl: 'http://localhost:5000/auth',
    livePathOrDomain: 'https://bktadvisory.com/auth',
    authLevel: 'public',
    sourceRepo: 'Root workspace',
    entryRoute: '/auth',
    dependsOn: ['marketing', 'client-portal'],
    statusNote:
      'Public sign-in and sign-up surface that guards access to the client and admin portal flows.',
    weeklyChanges: [
      {
        date: '2026-04-02',
        title: 'Auth and navigation integrity gaps were closed',
        summary:
          'Recent fixes tightened session-driven redirects and protected-route behavior before portal entry.',
        commits: ['4b57486'],
      },
      {
        date: '2026-04-01',
        title: 'Architecture and readiness audit documented auth flow expectations',
        summary:
          'The audit captured the current role-resolution and route-guard assumptions used across the app.',
        commits: ['b7a3a77'],
      },
    ],
  },
  {
    id: 'client-portal',
    label: 'Client Portal',
    kind: 'client-portal',
    hostType: 'root-app',
    localUrl: 'http://localhost:5000/portal',
    livePathOrDomain: 'https://bktadvisory.com/portal',
    authLevel: 'authenticated',
    sourceRepo: 'Root workspace',
    entryRoute: '/portal',
    dependsOn: ['auth', 'marketing'],
    statusNote:
      'Authenticated project dashboard for clients, using the root app route tree and shared portal theme layout.',
    weeklyChanges: [
      {
        date: '2026-04-02',
        title: 'Portal access flow stabilized with auth fixes',
        summary:
          'Protected portal entry now aligns better with role and session expectations after navigation integrity work.',
        commits: ['4b57486'],
      },
      {
        date: '2026-04-01',
        title: 'Portal branding and theming were refreshed',
        summary:
          'The portal presentation was updated to feel more cohesive with the public-facing brand system.',
        commits: ['073a3af'],
      },
    ],
  },
  {
    id: 'admin-portal',
    label: 'Admin Portal',
    kind: 'admin-portal',
    hostType: 'root-app',
    localUrl: 'http://localhost:5000/portal/admin',
    livePathOrDomain: 'https://bktadvisory.com/portal/admin',
    authLevel: 'admin',
    sourceRepo: 'Root workspace',
    entryRoute: '/portal/admin',
    dependsOn: ['auth', 'client-portal'],
    statusNote:
      'Admin-only workspace nested inside the portal route tree for quotes, projects, activities, and milestones.',
    weeklyChanges: [
      {
        date: '2026-04-02',
        title: 'Admin route protections were validated',
        summary:
          'Route integrity work and test coverage reinforced that non-admin users are redirected away from the admin workspace.',
        commits: ['4b57486'],
      },
      {
        date: '2026-04-01',
        title: 'Admin theming picked up the broader portal polish pass',
        summary:
          'The admin workspace inherited branding and styling changes from the shared portal refresh.',
        commits: ['073a3af'],
      },
    ],
  },
  {
    id: 'standalone-estimator',
    label: 'Standalone Estimator',
    kind: 'standalone-app',
    hostType: 'external-domain',
    localUrl: 'http://localhost:5001/',
    livePathOrDomain: 'https://estimator.bktadvisory.com/',
    authLevel: 'public',
    sourceRepo: 'Nested estimator workspace',
    entryRoute: '/estimator',
    dependsOn: ['marketing'],
    statusNote:
      'Standalone estimator deployment reached from the root site via a redirect boundary rather than an embedded route.',
    weeklyChanges: [
      {
        date: '2026-04-04',
        title: 'Estimator shell tests and quote mocks were added',
        summary:
          'New unit coverage landed around the estimator shell and quote rendering behavior.',
        commits: ['21406b9'],
      },
      {
        date: '2026-04-04',
        title: 'Quote UX and refinement logic were simplified',
        summary:
          'Unused refinement state was removed and quote output copy and toast behavior were tightened up.',
        commits: ['c8ff2cd'],
      },
      {
        date: '2026-04-03',
        title: 'Document export and image dependencies were expanded',
        summary:
          'The estimator gained new packages for document generation and image handling in the quote workflow.',
        commits: ['bfb9e3d'],
      },
      {
        date: '2026-04-02',
        title: 'Persona-driven estimator flow became more expressive',
        summary:
          'Persona funnel support, dynamic placeholders, and collapsible tech detail behavior were added to the estimator experience.',
        commits: ['5da6d4b', '5126661'],
      },
      {
        date: '2026-04-02',
        title: 'Document analysis upload handling was hardened',
        summary:
          'Client-side upload flow and server-side analysis limits were adjusted, including a 25 MB enforcement change.',
        commits: ['ea009a1'],
      },
      {
        date: '2026-03-30',
        title: 'Execution constraints and prompt guidance were formalized',
        summary:
          'Estimator orchestration docs were added and clarified for future implementation and QA work.',
        commits: ['6a979ee', 'd861a5d'],
      },
    ],
  },
];

export function getEnvironmentById(id: EnvironmentId): EnvironmentDescriptor | undefined {
  return environmentManifest.find((environment) => environment.id === id);
}
