import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  MetaFunction,
  redirect,
  SerializeFrom,
} from "@remix-run/node";
import { requireUserId } from "~/session.server";
import { safeRedirect } from "~/utils";

import {
  ActionIcon,
  Button,
  Group,
  Modal,
  NumberInput,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { IconBell } from "@tabler/icons-react";
import { MainContainer } from "~/components/main-container/main-container";
import { prisma } from "~/db.server";
import {
  Form,
  useActionData,
  useFetcher,
  useLoaderData,
} from "@remix-run/react";
import { Billing, User } from "@prisma/client";
import type { Lease } from "~/models/lease.server";
import { useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { DateInput } from "@mantine/dates";
import qs from "qs";
import { z } from "zod";
import { modals } from "@mantine/modals";

export type BillingWithRelations = Billing & {
  lease: (Lease & { user?: User }) | null;
};

export const meta: MetaFunction = () => [{ title: "User Management" }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { searchParams } = new URL(request.url);
  const redirectTo = safeRedirect(searchParams.get("redirectTo"), "/");
  const userId = await requireUserId(request, redirectTo);

  if (!userId) {
    return redirect(redirectTo);
  }

  const bills = await prisma.billing.findMany({
    where: {
      deletedAt: null,
    },
    orderBy: {
      paymentDate: "desc",
    },
    include: {
      lease: {
        include: {
          user: true,
        },
      },
    },
  });

  const users = await prisma.user.findMany({
    where: {
      deletedAt: null,
      role: {
        name: "user",
      },
    },
    include: {
      lease: true,
    },
  });

  console.log(bills);

  return json({ bills, users });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { searchParams } = new URL(request.url);
  const redirectTo = safeRedirect(searchParams.get("redirectTo"), "/");
  const userId = await requireUserId(request, redirectTo);

  if (!userId) {
    return redirect(redirectTo);
  }

  const text = await request.text();
  const parsedText = qs.parse(text);

  const formSchema = z.object({
    billId: z.string().cuid().optional(),
    leaseId: z.string().cuid(),
    dueDate: z.coerce.date(),
    amount: z.coerce.number().min(0).int(),
    description: z.string().min(10),
    status: z.string().optional(),
    _action: z.enum(["add", "edit", "delete"]),
  });

  const validatedForm = formSchema.safeParse(parsedText);

  if (!validatedForm.success) {
    console.log(validatedForm.error.format());
    return json({ errors: validatedForm.error.flatten() }, { status: 400 });
  }

  const validatedData = validatedForm.data;

  if (validatedData._action === "add") {
    await prisma.billing.create({
      data: {
        leaseId: validatedData.leaseId,
        dueDate: validatedData.dueDate,
        amount: validatedData.amount,
        description: validatedData.description,
        status: "pending",
      },
    });
  }

  if (validatedData._action === "edit") {
    await prisma.billing.update({
      where: {
        id: validatedData.billId,
      },
      data: {
        leaseId: validatedData.leaseId,
        dueDate: validatedData.dueDate,
        amount: validatedData.amount,
        description: validatedData.description,
        status: validatedData.status,
      },
    });
  }

  if (validatedData._action === "delete") {
    await prisma.billing.update({
      where: {
        id: validatedData.billId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  return json({ errors: null }, { status: 200 });
};

export default function AdminFinances() {
  const { bills, users } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";
  const [selectedPayment, setSelectedPayment] =
    useState<SerializeFrom<BillingWithRelations> | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [addPaymentOpened, { open: openAddPayment, close: closeAddPayment }] =
    useDisclosure(false);
  const fetcher = useFetcher();
  const apiFetcher = useFetcher();

  const handleDelete = (payment: SerializeFrom<BillingWithRelations>) => {
    const formData = {
      billId: payment.id,
      leaseId: payment.leaseId,
      dueDate: payment.dueDate,
      amount: payment.amount,
      description: payment.description,
      status: payment.status,
      _action: "delete",
    };

    fetcher.submit(formData, { method: "post" });
  };

  const handleClick = (billId: string) => {
    apiFetcher.submit(
      { billId },
      { method: "post", action: "/api/notification" },
    );
  };

  const openModal = (payment: SerializeFrom<BillingWithRelations>) =>
    modals.openConfirmModal({
      title: "Are you sure you want to delete this user?",
      children: (
        <Text size="sm">
          This action will mark the payment for deletion. The payment will not
          be permanently removed but will be flagged as deleted in the system.
        </Text>
      ),
      labels: { confirm: "Confirm", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onCancel: () => console.log("Cancel"),
      onConfirm: () => handleDelete(payment),
    });

  const handleViewDetails = (payment: SerializeFrom<BillingWithRelations>) => {
    setSelectedPayment(payment);
    open();
  };

  return (
    <MainContainer title={"Finances"}>
      <Button mb={"md"} onClick={openAddPayment}>
        Add Payment
      </Button>
      <Stack gap="xs">
        {bills.map((bill: SerializeFrom<BillingWithRelations>) => (
          <Paper
            key={bill.id}
            withBorder
            p="sm"
            bg={dark ? "dark.6" : "gray.1"}
          >
            <Group gap="xl" wrap="nowrap" px="md">
              {/* User's name */}
              <Group gap="xl" wrap="nowrap" style={{ flex: 1 }}>
                <Text size="sm" lineClamp={1} style={{ flex: 1 }}>
                  {bill.lease?.user?.name}
                </Text>
              </Group>

              {/* Payment date */}
              <Group gap="xl" wrap="nowrap" style={{ flex: 1 }}>
                <Text size="sm" lineClamp={1} style={{ flex: 1 }}>
                  Payment Description: {bill.description}
                </Text>
              </Group>

              {/* Amount */}
              <Group gap="xl" wrap="nowrap" style={{ flex: 1 }}>
                <Text size="sm" lineClamp={1} style={{ flex: 1 }}>
                  Amount: MVR {bill.amount}
                </Text>
              </Group>

              {/* Status */}
              <Group gap="xl" wrap="nowrap" style={{ flex: 1 }}>
                <Text size="sm" lineClamp={1} style={{ flex: 1 }}>
                  Status: {bill.status}
                </Text>
              </Group>

              <Group gap="xl" wrap="nowrap" style={{ flex: 1 }}>
                <a
                  href={`public/${bill.filepath}`}
                  download="custom_filename.pdf"
                >
                  <Button>Download Attached</Button>
                </a>
              </Group>

              {/* Details Button */}
              <Button
                variant="light"
                size="xs"
                onClick={() => handleViewDetails(bill)}
              >
                Details
              </Button>

              {/* Action Icon */}
              <ActionIcon
                variant="subtle"
                color={dark ? "gray.4" : "gray.6"}
                onClick={() => handleClick(bill.id)}
              >
                <IconBell size={18} />
              </ActionIcon>
            </Group>
          </Paper>
        ))}
      </Stack>

      <Modal
        opened={addPaymentOpened}
        onClose={closeAddPayment}
        title="Add Payment"
        centered
        size="lg"
      >
        <Form method="post">
          <Select
            placeholder="User to bill"
            data={users.map((user) => ({
              value: user.lease?.id || "",
              label: user.name,
            }))}
            name="leaseId"
            error={actionData?.errors?.fieldErrors.leaseId}
          />
          <SimpleGrid cols={3} my="md">
            <DateInput
              label="Due Date"
              name="dueDate"
              highlightToday
              error={actionData?.errors?.fieldErrors.dueDate}
            />
            <NumberInput
              hideControls
              label="Amount"
              name="amount"
              error={actionData?.errors?.fieldErrors.amount}
            />
          </SimpleGrid>
          <Textarea
            label="Description"
            name="description"
            error={actionData?.errors?.fieldErrors.description}
          />
          <Stack mt={"md"}>
            <Button onClick={closeAddPayment} color={"red"}>
              Cancel
            </Button>
            <Button type="submit" variant="filled" name="_action" value="add">
              Submit
            </Button>
          </Stack>
        </Form>
      </Modal>

      <Modal
        opened={opened}
        onClose={close}
        title="View/Edit Payment Details"
        centered
        size="lg"
      >
        {selectedPayment ? (
          <>
            <Title order={5} mb={"md"}>
              {selectedPayment.lease?.propertyDetails}
            </Title>
            <Form method="post">
              <input
                type={"hidden"}
                value={selectedPayment?.id}
                name={"billId"}
              />
              <SimpleGrid cols={2} my="md">
                <Select
                  placeholder="User to bill"
                  data={users.map((user) => ({
                    value: user.lease?.id || "",
                    label: user.name,
                  }))}
                  defaultValue={selectedPayment?.leaseId}
                  name="leaseId"
                  error={actionData?.errors?.fieldErrors.leaseId}
                />
                <Select
                  placeholder="Status"
                  data={[
                    { value: "pending", label: "Pending" },
                    { value: "paid", label: "Paid" },
                  ]}
                  defaultValue={selectedPayment?.status}
                  name="status"
                  error={actionData?.errors?.fieldErrors.status}
                />
              </SimpleGrid>
              <SimpleGrid cols={3} my="md">
                <DateInput
                  label="Due Date"
                  name="dueDate"
                  highlightToday
                  defaultValue={
                    selectedPayment?.dueDate
                      ? new Date(selectedPayment?.dueDate)
                      : undefined
                  }
                  error={actionData?.errors?.fieldErrors.dueDate}
                />
                <NumberInput
                  hideControls
                  label="Amount"
                  name="amount"
                  defaultValue={selectedPayment?.amount}
                  error={actionData?.errors?.fieldErrors.amount}
                />
              </SimpleGrid>
              <Textarea
                label="Description"
                name="description"
                defaultValue={selectedPayment?.description}
                error={actionData?.errors?.fieldErrors.description}
              />
              <Group mt={"md"}>
                <Button onClick={closeAddPayment} color={"red"}>
                  Cancel
                </Button>
                <Button
                  color={"red"}
                  type="submit"
                  variant="light"
                  onClick={() => openModal(selectedPayment)}
                >
                  Delete
                </Button>
                <Button
                  type="submit"
                  variant="filled"
                  name="_action"
                  value="edit"
                >
                  Submit
                </Button>
              </Group>
            </Form>
          </>
        ) : (
          <Text>No details available</Text>
        )}
      </Modal>
    </MainContainer>
  );
}
