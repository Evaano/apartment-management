import type { Password, User } from "@prisma/client";
import bcrypt from "bcryptjs";

import { prisma } from "~/db.server";

export { User };

export async function getUserByEmail(email: User["email"]) {
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function createUser(
  email: string,
  username: string,
  password: string,
  mobile: string,
) {
  const hashedPassword = await bcrypt.hash(password, 10);

  const defaultRole = await prisma.role.findUnique({
    where: { name: "user" },
  });

  if (!defaultRole) {
    return null;
  }

  return prisma.user.create({
    data: {
      email,
      mobile,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
      roleId: defaultRole?.id,
      name: username,
    },
  });
}

export async function getUserById(id: User["id"]) {
  return prisma.user.findUnique({ where: { id } });
}

export async function verifyLogin(
  email: User["email"],
  password: Password["hash"],
) {
  const userWithPassword = await prisma.user.findUnique({
    where: { email },
    include: {
      password: true,
    },
  });

  if (!userWithPassword || !userWithPassword.password) {
    return null;
  }

  const isValid = await bcrypt.compare(
    password,
    userWithPassword.password.hash,
  );

  if (!isValid) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _password, ...userWithoutPassword } = userWithPassword;

  return userWithoutPassword;
}
