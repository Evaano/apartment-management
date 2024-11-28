import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Outlet } from "@remix-run/react";

import { Layout } from "~/components/layout/layout";
import { requireUserId } from "~/session.server";
import { safeRedirect } from "~/utils";
import { prisma } from "~/db.server";

export const meta: MetaFunction = () => [{ title: "User Management" }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { searchParams } = new URL(request.url);
  const redirectTo = safeRedirect(searchParams.get("redirectTo"), "/");
  const userId = await requireUserId(request, redirectTo);

  if (!userId) {
    return redirect(redirectTo);
  }

  // Get user and their role
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  // If no user or user is not a tenant, redirect
  if (!user || user.role.name !== "admin") {
    return redirect(redirectTo);
  }

  return { userId };
};

export default function Admin() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
