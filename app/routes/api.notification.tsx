import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { prisma } from "~/db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const billId = formData.get("billId");

  if (request.method !== "POST") {
    return json({ status: "Method Not Allowed" }, { status: 405 });
  }

  const bill = await prisma.billing.findUnique({
    where: { id: billId as string },
    include: { lease: { include: { user: true } } },
  });

  if (!bill) {
    throw new Error("Bill not found");
  }

  const { amount, dueDate, description, lease } = bill;
  const { user } = lease;

  // Check if a notification already exists for this user and bill
  // If notification exists, delete it
  // If no notification exists, create a new one
  const existingNotification = await prisma.notification.findFirst({
    where: {
      userId: user.id,
      details: description,
    },
  });

  if (existingNotification) {
    await prisma.notification.delete({
      where: {
        id: existingNotification.id,
      },
    });
    return json({ success: true, action: "deleted" });
  } else {
    await prisma.notification.create({
      data: {
        userId: user.id,
        details: description,
        dueDate: dueDate,
        amount: amount,
      },
    });
    return json({ success: true, action: "created" });
  }
};
