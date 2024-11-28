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
  await prisma.maintenance.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();

  // Create roles
  const userRole = await prisma.role.create({
    data: {
      name: "user",
      permissions: ["view-maintenance", "create-maintenance-request"],
    },
  });

  const adminRole = await prisma.role.create({
    data: {
      name: "admin",
      permissions: [
        "manage-waitlist",
        "view-waitlist",
        "edit-user",
        "view-all-maintenance",
        "manage-maintenance",
      ],
    },
  });

  // Write role IDs to .env file
  const envPath = path.join(__dirname, "..", ".env");

  // Read the existing .env file content
  let envContent = fs.existsSync(envPath)
    ? fs.readFileSync(envPath, "utf8")
    : "";

  // Remove existing role ID entries
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

  // Create test users
  const users = [
    {
      email: "evaan.ibrahim",
      roleId: adminRole.id,
      mobile: "9190402",
      password: "test@123",
      username: "Evaan Rasheed",
    },
    {
      email: "evaan.test",
      roleId: userRole.id,
      mobile: "9190402",
      password: "test@123",
      username: "Evaan Rasheed",
    },
  ];

  const createdUsers = await Promise.all(
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

  // Create maintenance records
  const maintenanceRecords = [
    {
      details: "AC unit repair in Room 101",
      userId: createdUsers[1].id,
      status: "Pending",
    },
    {
      details: "Elevator maintenance scheduled",
      userId: createdUsers[1].id,
      status: "In Progress",
    },
    {
      details: "Plumbing issue in cafeteria resolved",
      userId: createdUsers[1].id,
      status: "Completed",
    },
  ];

  await prisma.maintenance.createMany({ data: maintenanceRecords });

  // Create audit logs
  const auditLogs = [
    { action: "Database seeded", person: "admin" },
    { action: "User created", person: "admin" },
    { action: "Role assigned", person: "admin" },
    { action: "System settings updated", person: "admin" },
    { action: "User logged in", person: "admin" },
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
