export enum Permission {
  CREATE_BENEFICIARY = "CREATE_BENEFICIARY",
  EDIT_BENEFICIARY = "EDIT_BENEFICIARY",
  DELETE_BENEFICIARY = "DELETE_BENEFICIARY",
  IMPORT_BENEFICIARIES = "IMPORT_BENEFICIARIES",
  EXPORT_BENEFICIARIES = "EXPORT_BENEFICIARIES",
  VIEW_BENEFICIARIES = "VIEW_BENEFICIARIES",
}

export enum UserRole {
  ADMIN = "admin",
  PROGRAM_MANAGER = "program_manager",
  FELLOW = "fellow",
}

export type RoleLike =
  | {
      roleId?: string | null;
      roleName?: string | null;
      role?: { name?: string | null } | null;
      permissions?: string[];
    }
  | null
  | undefined;

export function hasPermission(
  user: { permissions?: string[] } | null | undefined,
  permission: Permission,
) {
  return !!user?.permissions?.includes(permission);
}

export function getUserRole(user: RoleLike): UserRole {
  const roleId = (user?.roleId || "").toString().toLowerCase();
  const roleName = (
    user?.roleName || user?.role?.name || ""
  ).toString().toLowerCase();

  if (roleId.includes("admin") || roleName.includes("admin")) {
    return UserRole.ADMIN;
  }

  if (roleId.includes("manager") || roleName.includes("manager")) {
    return UserRole.PROGRAM_MANAGER;
  }

  if (roleId.includes("fellow") || roleName.includes("fellow")) {
    return UserRole.FELLOW;
  }

  return UserRole.FELLOW;
}

export function isProgramManager(user: RoleLike) {
  const role = getUserRole(user);
  return role === UserRole.PROGRAM_MANAGER || role === UserRole.ADMIN;
}

export function isFellow(user: RoleLike) {
  return getUserRole(user) === UserRole.FELLOW;
}
