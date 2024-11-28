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
  Anchor,
  Button,
  Group,
  Modal,
  NumberInput,
  SimpleGrid,
  Table,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { MainContainer } from "~/components/main-container/main-container";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import { modals } from "@mantine/modals";
import {
  Form,
  useActionData,
  useFetcher,
  useLoaderData,
} from "@remix-run/react";
import { prisma } from "~/db.server";
import { useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import type { Lease } from "~/models/lease.server";
import { User } from "@prisma/client";
import qs from "qs";
import { z } from "zod";

type UserWithRelations = User & {
  lease: Lease | null;
};

export const meta: MetaFunction = () => [{ title: "User Management" }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { searchParams } = new URL(request.url);
  const redirectTo = safeRedirect(searchParams.get("redirectTo"), "/");
  const userId = await requireUserId(request, redirectTo);

  if (!userId) {
    return redirect(redirectTo);
  }

  const tenants = await prisma.user.findMany({
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

  return json({ tenants });
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

  const formSchema = z
    .object({
      id: z.string().cuid(),
      email: z.string().email("Invalid email address"),
      name: z.string().min(2, "Name must be at least 2 characters long"),
      mobile: z
        .string()
        .regex(/^\d{7,10}$/, "Mobile number must be 7-10 digits"),

      // Lease fields
      leaseStart: z.coerce.date(),
      leaseEnd: z.coerce.date(),
      rentAmount: z.coerce.number().min(0).int(),
      securityDeposit: z.coerce.number().min(0).int(),
      maintenanceFee: z.coerce.number().min(0).int(),
      property: z.string().min(10),
    })
    .refine((data) => data.leaseEnd > data.leaseStart, {
      message: "Lease end date must be after lease start date",
      path: ["leaseEnd"],
    });

  const validatedForm = formSchema.safeParse(parsedText);

  if (!validatedForm.success) {
    console.log(validatedForm.error.format());
    return json({ errors: validatedForm.error.flatten() }, { status: 400 });
  }

  const validatedData = validatedForm.data;

  await prisma.user.update({
    where: {
      id: validatedData.id,
      deletedAt: null,
    },
    data: {
      email: validatedData.email,
      name: validatedData.name,
      mobile: validatedData.mobile,
      lease: {
        upsert: {
          create: {
            startDate: validatedData.leaseStart,
            endDate: validatedData.leaseEnd,
            rentAmount: validatedData.rentAmount,
            securityDeposit: validatedData.securityDeposit,
            maintenanceFee: validatedData.maintenanceFee,
            propertyDetails: validatedData.property,
          },
          update: {
            startDate: validatedData.leaseStart,
            endDate: validatedData.leaseEnd,
            rentAmount: validatedData.rentAmount,
            securityDeposit: validatedData.securityDeposit,
            maintenanceFee: validatedData.maintenanceFee,
            propertyDetails: validatedData.property,
          },
        },
      },
    },
  });

  return json({ errors: null }, { status: 200 });
};

export default function AdminTenants() {
  const { tenants } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const fetcher = useFetcher();
  const [selectedUser, setSelectedUser] =
    useState<SerializeFrom<UserWithRelations> | null>(null);
  const [editOpened, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);

  const handleEditClick = (user: SerializeFrom<UserWithRelations>) => {
    setSelectedUser(user);
    openEdit();
  };

  const handleDelete = (userId: string) => {
    fetcher.submit({ id: userId, _action: "delete" }, { method: "post" });
  };

  const openModal = (id: string) =>
    modals.openConfirmModal({
      title: "Are you sure you want to delete this user?",
      children: (
        <Text size="sm">
          This action will mark the user for deletion. The user will not be
          permanently removed but will be flagged as deleted in the system.
        </Text>
      ),
      labels: { confirm: "Confirm", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onCancel: () => console.log("Cancel"),
      onConfirm: () => handleDelete(id),
    });

  const rows = tenants.map((user) => (
    <Table.Tr key={user.name}>
      <Table.Td>
        <Group gap="sm">
          <Text fz="sm" fw={500}>
            {user.name}
          </Text>
        </Group>
      </Table.Td>

      <Table.Td>
        <Anchor component="button" size="sm" c={"primary-blue"}>
          {user.email}
        </Anchor>
      </Table.Td>
      <Table.Td>
        <Text fz="sm">{user.mobile}</Text>
      </Table.Td>
      <Table.Td>
        <Group gap={0} justify="flex-end">
          <ActionIcon
            variant="subtle"
            color="gray"
            onClick={() => handleEditClick(user)}
          >
            <IconPencil size={16} stroke={1.5} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="red"
            onClick={() => openModal(user.id)}
          >
            <IconTrash size={16} stroke={1.5} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <MainContainer title={"Tenants"}>
      <Table.ScrollContainer minWidth={800}>
        <Table verticalSpacing="xs">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th>Mobile</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      {/* Edit user modal */}
      <Modal opened={editOpened} onClose={closeEdit} title="Edit User">
        <Form method="post">
          <input type="hidden" name="id" value={selectedUser?.id} />
          <Title order={4}>Tenant Info</Title>
          <SimpleGrid cols={2} my="md">
            <TextInput
              label="Email"
              withAsterisk
              name="email"
              defaultValue={selectedUser?.email}
              error={actionData?.errors?.fieldErrors.email}
            />
            <TextInput
              label="Full Name"
              withAsterisk
              name="name"
              defaultValue={selectedUser?.name}
              error={actionData?.errors?.fieldErrors.name}
            />
            <TextInput
              label="Mobile"
              withAsterisk
              name="mobile"
              defaultValue={selectedUser?.mobile}
              error={actionData?.errors?.fieldErrors.mobile}
            />
          </SimpleGrid>
          <Title order={4}>Lease Info</Title>
          <SimpleGrid cols={2} my="md">
            <DateInput
              label="Start Date"
              name="leaseStart"
              defaultValue={
                selectedUser?.lease?.startDate
                  ? new Date(selectedUser?.lease.startDate)
                  : undefined
              }
              error={actionData?.errors?.fieldErrors.leaseStart}
            />
            <DateInput
              label="End Date"
              name="leaseEnd"
              defaultValue={
                selectedUser?.lease?.endDate
                  ? new Date(selectedUser?.lease.endDate)
                  : undefined
              }
              error={actionData?.errors?.fieldErrors.leaseEnd}
            />
            <NumberInput
              hideControls
              label="Rent Amount"
              name="rentAmount"
              defaultValue={selectedUser?.lease?.rentAmount}
              error={actionData?.errors?.fieldErrors.rentAmount}
            />
            <NumberInput
              hideControls
              label="Security Deposit"
              name="securityDeposit"
              defaultValue={selectedUser?.lease?.securityDeposit}
              error={actionData?.errors?.fieldErrors.securityDeposit}
            />
            <NumberInput
              hideControls
              label="Maintenance Fee"
              name="maintenanceFee"
              defaultValue={selectedUser?.lease?.maintenanceFee}
              error={actionData?.errors?.fieldErrors.maintenanceFee}
            />
          </SimpleGrid>
          <Textarea
            label="Property Details"
            name="property"
            defaultValue={selectedUser?.lease?.propertyDetails}
            error={actionData?.errors?.fieldErrors.property}
          />

          <Group justify="flex-end" mt="md">
            <Button type="submit" variant="filled" mt="md">
              Submit
            </Button>
          </Group>
        </Form>
      </Modal>
    </MainContainer>
  );
}
