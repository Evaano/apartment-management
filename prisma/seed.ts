import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  // Cleanup existing data
  await prisma.maintenance.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.billing.deleteMany();
  await prisma.lease.deleteMany();
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

  // Create test users
  const users = [
    {
      email: "admin.test@gmail.com",
      roleId: adminRole.id,
      mobile: "9999999",
      password: "test@123",
      username: "Admin User",
    },
    {
      email: "user.test@gmail.com",
      roleId: userRole.id,
      mobile: "7777777",
      password: "test@123",
      username: "Test User",
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

  // Create dummy lease data for the test user
  const testUser = createdUsers.find(
    (user) => user.email === "user.test@gmail.com",
  );
  if (testUser) {
    const lease = await prisma.lease.create({
      data: {
        userId: testUser.id,
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-12-31"),
        rentAmount: 1500,
        securityDeposit: 3000,
        maintenanceFee: 100,
        propertyDetails: "Apartment 202, Block A, Green Valley",
      },
    });
    console.log(`Dummy lease data created for test user: ${testUser.email}`);

    // Create dummy billing records for the lease
    const billingRecords = [
      {
        leaseId: lease.id,
        amount: 1500,
        paymentDate: new Date("2024-05-01"),
        status: "paid",
        description: "Monthly Rent",
      },
    ];

    const billingWithDueDates = billingRecords.map((record) => {
      const dueDate = new Date(record.paymentDate);
      dueDate.setDate(dueDate.getDate() + 30); // Add 30 days to payment date for due date
      return { ...record, dueDate };
    });

    // Insert billing records into the database
    await prisma.billing.createMany({
      data: billingWithDueDates,
    });

    console.log(`Billing records created for lease: ${lease.id}`);
  }

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

  await prisma.maintenance.createMany({
    data: maintenanceRecords,
  });

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
