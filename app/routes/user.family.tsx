import {
  ActionIcon,
  Button,
  Container,
  Flex,
  Group,
  Modal,
  rem,
  ScrollArea,
  Select,
  SimpleGrid,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import {
  Form,
  useActionData,
  useFetcher,
  useLoaderData,
} from "@remix-run/react";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import { SetStateAction, useEffect, useRef, useState } from "react";
import { z } from "zod";

import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";

interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  nationalId: string;
}

export const meta: MetaFunction = () => [{ title: "Add Immediate Family" }];

const addSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  relation: z.string().min(1, "Relation is required"),
  nationalId: z
    .string()
    .min(1, "National ID is required")
    .regex(
      /^A\d{6}$/,
      "National ID must start with 'A' and be followed by 6 digits",
    ),
});

const editSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  relation: z.string().optional(),
  nationalId: z
    .string()
    .min(1, "National ID is required")
    .regex(
      /^A\d{6}$/,
      "National ID must start with 'A' and be followed by 6 digits",
    )
    .optional(),
});

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);

  const userFamily = await prisma.user.findFirst({
    where: {
      id: userId,
    },
    include: {
      familyMembers: {
        where: {
          deletedAt: null,
        },
      },
    },
  });

  if (!userFamily || !userFamily.familyMembers) {
    throw new Response(null, {
      status: 404,
      statusText: "User Family Not Found",
    });
  }

  return json({ userFamily });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const { _action, ...form } = Object.fromEntries(formData);
  const userId = await requireUserId(request);

  const userFamily = await prisma.user.findFirst({
    where: {
      id: userId,
    },
    include: {
      familyMembers: true,
    },
  });

  if (!userFamily || !userFamily.familyMembers) {
    throw new Response(null, {
      status: 404,
      statusText: "User Vendor Not Found",
    });
  }

  if (_action === "add") {
    const validatedForm = addSchema.safeParse(form);

    if (!validatedForm.success) {
      return json(
        { errors: validatedForm.error.formErrors.fieldErrors },
        { status: 400 },
      );
    }

    const validData = validatedForm.data;

    await prisma.familyMember.create({
      data: {
        name: validData.name,
        relation: validData.relation,
        nationalId: validData.nationalId,
        user: {
          connect: { id: userId },
        },
      },
    });
  } else if (_action === "edit") {
    const validatedForm = editSchema.safeParse(form);

    if (!validatedForm.success) {
      return json(
        { errors: validatedForm.error.formErrors.fieldErrors },
        { status: 400 },
      );
    }

    const validData = validatedForm.data;

    await prisma.familyMember.update({
      where: { id: validData.id },
      data: {
        name: validData.name,
        relation: validData.relation,
        nationalId: validData.nationalId,
      },
    });
  } else if (_action === "delete") {
    const validatedForm = editSchema.safeParse(form);

    if (!validatedForm.success) {
      return json(
        { errors: validatedForm.error.formErrors.fieldErrors },
        { status: 400 },
      );
    }

    const validData = validatedForm.data;

    await prisma.familyMember.update({
      where: { id: validData.id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  return json({ errors: null }, { status: 200 });
};

// Could use file system and store the image in public/uploads but for this assignment image url is fine.
export default function AddFamily() {
  const [addOpened, { open: openAdd, close: closeAdd }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);
  const actionData = useActionData<typeof action>();
  const formRef = useRef<HTMLFormElement>(null);
  const { userFamily } = useLoaderData<typeof loader>();
  const [selectedFamilyMember, setSelectedFamilyMember] =
    useState<FamilyMember | null>(null);
  const fetcher = useFetcher();

  useEffect(() => {
    if (actionData?.errors === null) {
      notifications.show({
        title: "All Good!",
        message: "Action executed successfully! 😺",
        autoClose: 3000,
      });
      formRef.current?.reset();
      window.location.reload();
    }
  }, [actionData]);

  const handleEditClick = (
    familyMember: SetStateAction<FamilyMember | null>,
  ) => {
    setSelectedFamilyMember(familyMember);
    openEdit();
  };

  const handleDelete = (id: string) => {
    fetcher.submit({ id: id, _action: "delete" }, { method: "post" });
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

  const rows = userFamily.familyMembers.map((familyMember) => (
    <Table.Tr key={familyMember.id}>
      <Table.Td>{familyMember.name}</Table.Td>
      <Table.Td>
        {familyMember.relation.charAt(0).toUpperCase() +
          familyMember.relation.slice(1)}
      </Table.Td>
      <Table.Td>{familyMember.nationalId}</Table.Td>
      <Table.Td>
        <Group gap={0}>
          <ActionIcon
            variant="subtle"
            color="gray"
            onClick={() => handleEditClick(familyMember)}
          >
            <IconPencil
              style={{ width: rem(16), height: rem(16) }}
              stroke={1.5}
            />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="red"
            onClick={() => openModal(familyMember.id)}
          >
            <IconTrash
              style={{ width: rem(16), height: rem(16) }}
              stroke={1.5}
            />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Container size={"xl"}>
      <Flex justify={"space-between"}>
        <Title order={2}>Family Members</Title>
        <Button radius={"xl"} onClick={openAdd}>
          Add a Family Member
        </Button>
      </Flex>

      {/* Add family modal */}
      <Modal opened={addOpened} onClose={closeAdd} title="Add a Family Member">
        <Form method={"post"} ref={formRef}>
          <SimpleGrid cols={2} mt={"md"}>
            <TextInput
              label="Name"
              withAsterisk
              name={"name"}
              error={actionData?.errors?.name}
            />
            <Select
              label="Relation"
              withAsterisk
              name={"relation"}
              data={[
                { value: "mother", label: "Mother" },
                { value: "father", label: "Father" },
                { value: "sister", label: "Sister" },
                { value: "brother", label: "Brother" },
                { value: "husband", label: "Husband" },
                { value: "wife", label: "Wife" },
                { value: "children", label: "Children" },
              ]}
            />
          </SimpleGrid>

          <SimpleGrid cols={2} mt={"md"}>
            <TextInput
              label="National ID"
              withAsterisk
              name={"nationalId"}
              error={actionData?.errors?.nationalId}
            />
          </SimpleGrid>

          <Group justify="space-between" mt="md">
            <Button
              type={"submit"}
              variant={"filled"}
              mt={"md"}
              name={"_action"}
              value={"add"}
            >
              Submit
            </Button>
          </Group>
        </Form>
      </Modal>

      {/* Edit family modal */}
      <Modal
        opened={editOpened}
        onClose={closeEdit}
        title="Edit a Family Member"
      >
        <Form method={"post"} ref={formRef}>
          <input type="hidden" name="id" value={selectedFamilyMember?.id} />
          <SimpleGrid cols={2} mt={"md"}>
            <TextInput
              label="Name"
              withAsterisk
              name={"name"}
              defaultValue={selectedFamilyMember?.name}
              error={actionData?.errors?.name}
            />
            <Select
              label="Relation"
              withAsterisk
              name={"relation"}
              defaultValue={selectedFamilyMember?.relation}
              data={[
                { value: "mother", label: "Mother" },
                { value: "father", label: "Father" },
                { value: "sister", label: "Sister" },
                { value: "brother", label: "Brother" },
                { value: "husband", label: "Husband" },
                { value: "wife", label: "Wife" },
                { value: "children", label: "Children" },
              ]}
            />
          </SimpleGrid>

          <SimpleGrid cols={2} mt={"md"}>
            <TextInput
              label="National ID"
              withAsterisk
              name={"nationalId"}
              defaultValue={selectedFamilyMember?.nationalId}
              error={actionData?.errors?.nationalId}
            />
          </SimpleGrid>

          <Group justify="space-between" mt="md">
            <Button
              type={"submit"}
              color={"hospital-blue"}
              variant={"filled"}
              mt={"md"}
              name={"_action"}
              value={"edit"}
            >
              Submit
            </Button>
          </Group>
        </Form>
      </Modal>

      <Table stickyHeader stickyHeaderOffset={0} mt={"xl"}>
        <ScrollArea h={600} offsetScrollbars scrollbarSize={8}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Relation</Table.Th>
              <Table.Th>National ID</Table.Th>
              <Table.Th>Action</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </ScrollArea>
      </Table>
    </Container>
  );
}
