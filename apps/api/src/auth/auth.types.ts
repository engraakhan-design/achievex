export type AuthenticatedUser = {
  sub: string;
  organizationId: string;
  email: string;
  tokenVersion: number;
  roles: string[];
  permissions: string[];
};
