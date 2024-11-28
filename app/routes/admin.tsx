import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Outlet } from "@remix-run/react";

import { Layout } from "~/components/layout/layout";
import { requireUserId } from "~/session.server";
import { safeRedirect } from "~/utils";
import { getUserWithRole } from "~/models/user.server";

export const meta: MetaFunction = () => [{ title: "User Management" }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { searchParams } = new URL(request.url);
  const redirectTo = safeRedirect(searchParams.get("redirectTo"), "/");
  const userId = await requireUserId(request, redirectTo);

  if (!userId) {
    return redirect(redirectTo);
  }

  const userWithRole = await getUserWithRole(userId);

  if (!userWithRole?.role || userWithRole.role.name !== "admin") {
    return redirect(redirectTo);
  }

  return { userId };
};

export default function Admin(isAdmin: boolean) {
  return (
    <Layout isAdmin={isAdmin}>
      <Outlet />
    </Layout>
  );
}
