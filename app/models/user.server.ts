import type { User } from "@prisma/client";

import { prisma } from "~/db.server";

export { User };

export async function getUserByEmail(email: User["email"]) {
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function createUser(email: string, username: string) {
  const defaultRole = await prisma.role.findUnique({
    where: { name: "user" },
  });

  if (!defaultRole) {
    return null;
  }

  return prisma.user.create({
    data: {
      email,
      roleId: defaultRole?.id,
      name: username,
    },
  });
}

export async function getUserById(id: User["id"]) {
  return prisma.user.findUnique({ where: { id } });
}
