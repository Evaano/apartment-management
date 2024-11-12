import { showNotification } from "@mantine/notifications";
import { useMatches } from "@remix-run/react";
import { useMemo } from "react";

import type { User } from "~/models/user.server";

const DEFAULT_REDIRECT = "/";

/**
 * This should be used any time the redirect path is user-provided
 * (Like the query string on our login/signup pages). This avoids
 * open-redirect vulnerabilities.
 * @param {string} to The redirect destination
 * @param {string} defaultRedirect The redirect to use if the to is unsafe.
 */
export function safeRedirect(
  to: FormDataEntryValue | string | null | undefined,
  defaultRedirect: string = DEFAULT_REDIRECT,
) {
  if (!to || typeof to !== "string") {
    return defaultRedirect;
  }

  if (!to.startsWith("/") || to.startsWith("//")) {
    return defaultRedirect;
  }

  return to;
}

/**
 * This base hook is used in other hooks to quickly search for specific data
 * across all loader data using useMatches.
 * @param {string} id The route id
 * @returns {JSON|undefined} The router data or undefined if not found
 */
export function useMatchesData(
  id: string,
): Record<string, unknown> | undefined {
  const matchingRoutes = useMatches();
  const route = useMemo(
    () => matchingRoutes.find((route) => route.id === id),
    [matchingRoutes, id],
  );
  return route?.data as Record<string, unknown>;
}

function isUser(user: unknown): user is User {
  return (
    user != null &&
    typeof user === "object" &&
    "email" in user &&
    typeof user.email === "string"
  );
}

export function useOptionalUser(): User | undefined {
  const data = useMatchesData("root");
  if (!data || !isUser(data.user)) {
    return undefined;
  }
  return data.user;
}

export function useUser(): User {
  const maybeUser = useOptionalUser();
  if (!maybeUser) {
    throw new Error(
      "No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead.",
    );
  }
  return maybeUser;
}

export function validatePage(page: string | null) {
  const parsedPage = parseInt(page || "1", 10);
  if (Number.isNaN(parsedPage) || parsedPage < 1) {
    return 1;
  }
  return parsedPage;
}

export function validateQuery(query: string | null): string {
  if (typeof query !== "string" || query.trim() === "") {
    return "";
  }
  return query;
}

export function validateCategory(category: string | null): string {
  if (typeof category !== "string" || category.trim() === "") {
    return "";
  }
  return category;
}

export function validateSubCategory(subCategory: string | null): string {
  if (typeof subCategory !== "string" || subCategory.trim() === "") {
    return "";
  }
  return subCategory;
}

// Converts permission to an array if it's a string.
// Checks if any of the user's permissions are in the required permissions.
// Returns true if a match is found, false otherwise.
export function can(
  userPermissions: string[],
  permission: string | string[],
): boolean {
  const permissionsRequired = Array.isArray(permission)
    ? permission
    : [permission];

  for (const userPerm of userPermissions) {
    const hasPerm = permissionsRequired.includes(userPerm);
    if (hasPerm) {
      return true;
    }
  }
  return false;
}

// Define a helper function for showing error notifications
export function showErrorNotification(message: string) {
  showNotification({
    title: "Error",
    message: message,
    color: "red",
  });
}

export function showSuccessNotification(message: string) {
  showNotification({
    title: "All Good",
    message: message,
    color: "green",
  });
}

// Prevent enter submit
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export function handleKeyDown(event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
  }
}
