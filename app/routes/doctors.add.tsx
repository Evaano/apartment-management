import {
  ActionIcon,
  Button,
  Container,
  Flex,
  Group,
  Modal,
  rem,
  ScrollArea,
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

interface Doctor {
  id: string;
  name: string;
  designation: string;
}

export const meta: MetaFunction = () => [{ title: "Add Immediate Family" }];

const addDoctorSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  designation: z.string().min(1, "Designation is required"),
});

const editDoctorSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  designation: z.string().optional(),
});

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const userId = await requireUserId(request);

  const doctors = await prisma.doctor.findMany({
    where: {
      deletedAt: null,
    },
  });

  if (!doctors) {
    throw new Response(null, {
      status: 404,
      statusText: "Doctors Not Found",
    });
  }

  return json({ doctors });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const { _action, ...form } = Object.fromEntries(formData);

  if (_action === "add") {
    const validatedForm = addDoctorSchema.safeParse(form);

    if (!validatedForm.success) {
      return json(
        { errors: validatedForm.error.formErrors.fieldErrors },
        { status: 400 },
      );
    }

    const validData = validatedForm.data;

    await prisma.doctor.create({
      data: {
        name: validData.name,
        designation: validData.designation,
      },
    });
  } else if (_action === "edit") {
    const validatedForm = editDoctorSchema.safeParse(form);

    if (!validatedForm.success) {
      return json(
        { errors: validatedForm.error.formErrors.fieldErrors },
        { status: 400 },
      );
    }

    const validData = validatedForm.data;

    await prisma.doctor.update({
      where: { id: validData.id },
      data: {
        name: validData.name,
        designation: validData.designation,
      },
    });
  } else if (_action === "delete") {
    const validatedForm = editDoctorSchema.safeParse(form);

    if (!validatedForm.success) {
      return json(
        { errors: validatedForm.error.formErrors.fieldErrors },
        { status: 400 },
      );
    }

    const validData = validatedForm.data;

    await prisma.doctor.update({
      where: { id: validData.id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  return json({ errors: null }, { status: 200 });
};

export default function ManageDoctors() {
  const [addOpened, { open: openAdd, close: closeAdd }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);
  const actionData = useActionData<typeof action>();
  const formRef = useRef<HTMLFormElement>(null);
  const { doctors } = useLoaderData<typeof loader>();
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
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

  const handleEditClick = (doctor: SetStateAction<Doctor | null>) => {
    setSelectedDoctor(doctor);
    openEdit();
  };

  const handleDelete = (id: string) => {
    fetcher.submit({ id, _action: "delete" }, { method: "post" });
  };

  const openModal = (id: string) =>
    modals.openConfirmModal({
      title: "Are you sure you want to delete this doctor?",
      children: (
        <Text size="sm">
          This action will mark the doctor for deletion. The doctor will not be
          permanently removed but will be flagged as deleted in the system.
        </Text>
      ),
      labels: { confirm: "Confirm", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onCancel: () => console.log("Cancel"),
      onConfirm: () => handleDelete(id),
    });

  const rows = doctors.map((doctor) => (
    <Table.Tr key={doctor.id}>
      <Table.Td>{doctor.name}</Table.Td>
      <Table.Td>{doctor.designation}</Table.Td>
      <Table.Td>
        <Group gap={0}>
          <ActionIcon
            variant="subtle"
            color="gray"
            onClick={() => handleEditClick(doctor)}
          >
            <IconPencil
              style={{ width: rem(16), height: rem(16) }}
              stroke={1.5}
            />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="red"
            onClick={() => openModal(doctor.id)}
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
        <Title order={2}>Doctors</Title>
        <Button radius={"xl"} onClick={openAdd}>
          Add a Doctor
        </Button>
      </Flex>

      {/* Add doctor modal */}
      <Modal opened={addOpened} onClose={closeAdd} title="Add a Doctor">
        <Form method={"post"} ref={formRef}>
          <SimpleGrid cols={2} mt={"md"}>
            <TextInput
              label="Name"
              withAsterisk
              name={"name"}
              error={actionData?.errors?.name}
            />
            <TextInput
              label="Designation"
              withAsterisk
              name={"designation"}
              error={actionData?.errors?.designation}
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

      {/* Edit doctor modal */}
      <Modal opened={editOpened} onClose={closeEdit} title="Edit a Doctor">
        <Form method={"post"} ref={formRef}>
          <input type="hidden" name="id" value={selectedDoctor?.id} />
          <SimpleGrid cols={2} mt={"md"}>
            <TextInput
              label="Name"
              withAsterisk
              name={"name"}
              defaultValue={selectedDoctor?.name}
              error={actionData?.errors?.name}
            />
            <TextInput
              label="Designation"
              withAsterisk
              name={"designation"}
              defaultValue={selectedDoctor?.designation}
              error={actionData?.errors?.designation}
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
              <Table.Th>Designation</Table.Th>
              <Table.Th>Action</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </ScrollArea>
      </Table>
    </Container>
  );
}
