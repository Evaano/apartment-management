import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "url";
import { dirname } from "path";

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const prisma = new PrismaClient();

async function seed() {
  // Cleanup existing data
  await prisma.user.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();
  await prisma.auditLog.deleteMany();

  // Create roles
  const userRole = await prisma.role.create({ data: { name: "user" } });
  const adminRole = await prisma.role.create({ data: { name: "admin" } });

  // Write user role ID to .env file
  const envPath = path.join(__dirname, "..", ".env");

  // Read the existing .env file content
  let envContent = fs.existsSync(envPath)
    ? fs.readFileSync(envPath, "utf8")
    : "";

  // Remove existing DEFAULT_USER_ROLE_ID and ADMIN_ROLE_ID entries
  envContent = envContent
    .split("\n")
    .filter(
      (line) =>
        !line.startsWith("DEFAULT_USER_ROLE_ID=") &&
        !line.startsWith("ADMIN_ROLE_ID="),
    )
    .join("\n");

  // Append new role IDs
  envContent += `\nDEFAULT_USER_ROLE_ID="${userRole.id}"\n`;
  envContent += `ADMIN_ROLE_ID="${adminRole.id}"\n`;

  // Write updated content back to .env file
  fs.writeFileSync(envPath, envContent.trim(), "utf8");

  console.log(`User roles have been written to .env file`);

  // Create permissions
  const permissions = ["manage-waitlist", "view-waitlist", "edit-user"];
  const createdPermissions = await Promise.all(
    permissions.map((name) => prisma.permission.create({ data: { name } })),
  );

  // Assign permissions to roles
  await prisma.rolePermission.createMany({
    data: createdPermissions.map((permission) => ({
      roleId: adminRole.id,
      permissionId: permission.id,
    })),
  });

  // Create test users
  const users = [
    {
      email: "evaan.ibrahim",
      roleId: adminRole.id,
      mobile: "9190402",
      password: "test@123",
      username: "Evaan Rasheed",
    },
  ];

  await Promise.all(
    users.map(async ({ email, roleId, mobile, password, username }) => {
      const hashedPassword = await bcrypt.hash(password, 10);
      return prisma.user.create({
        data: {
          email,
          mobile,
          password: {
            create: {
              hash: hashedPassword,
            },
          },
          roleId,
          name: username,
        },
      });
    }),
  );

  // Create audit logs
  const auditLogs = [
    { action: "Database seeded", person: "admin" },
    { action: "Database seeded again", person: "admin" },
    { action: "User created", person: "admin" },
    { action: "Role assigned", person: "admin" },
    { action: "Permission updated", person: "admin" },
    { action: "System settings updated", person: "admin" },
    { action: "User logged in", person: "admin" },
    { action: "User logged out", person: "admin" },
    { action: "Database backup created", person: "admin" },
  ];

  for (const log of auditLogs) {
    await prisma.auditLog.create({
      data: log,
    });
  }

  console.log("Database seeded successfully 🌱");
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
