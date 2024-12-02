import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  MetaFunction,
  redirect,
  SerializeFrom,
} from "@remix-run/node";
import { requireUserId } from "~/session.server";
import { formatDate, handleKeyDown, safeRedirect } from "~/utils";

import {
  Button,
  Flex,
  Group,
  Modal,
  Paper,
  ScrollArea,
  Select,
  Stack,
  Text,
  useMantineColorScheme,
} from "@mantine/core";
import { MainContainer } from "~/components/main-container/main-container";
import { prisma } from "~/db.server";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import qs from "qs";
import { z } from "zod";
import { Maintenance, User } from "@prisma/client";

export const meta: MetaFunction = () => [{ title: "User Management" }];

type MaintenanceWithRelations = Maintenance & {
  User: User;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { searchParams } = new URL(request.url);
  const redirectTo = safeRedirect(searchParams.get("redirectTo"), "/");
  const userId = await requireUserId(request, redirectTo);

  if (!userId) {
    return redirect(redirectTo);
  }

  const maintenanceRequests = await prisma.maintenance.findMany({
    where: {
      deletedAt: null,
    },
    include: {
      User: true,
    },
  });

  return { maintenanceRequests };
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
    id: z.coerce.number().int(),
    status: z.string().min(1),
  });

  const validatedForm = formSchema.safeParse(parsedText);

  console.log(validatedForm);

  if (!validatedForm.success) {
    console.log(validatedForm.error.format());
    return json({ errors: validatedForm.error.flatten() }, { status: 400 });
  }

  const validatedData = validatedForm.data;

  await prisma.maintenance.update({
    where: {
      deletedAt: null,
      id: validatedData.id,
    },
    data: {
      status: validatedData.status,
    },
  });

  return json({ errors: null }, { status: 200 });
};

export default function AdminMaintenance() {
  const { maintenanceRequests } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedRequest, setSelectedRequest] =
    useState<SerializeFrom<MaintenanceWithRelations> | null>(null);

  const handleViewDetails = (
    request: SerializeFrom<MaintenanceWithRelations>,
  ) => {
    setSelectedRequest(request);
    open();
  };

  return (
    <MainContainer title={"Maintenance Requests"}>
      <Stack gap="xs">
        <ScrollArea h={500} scrollbarSize={7}>
          {maintenanceRequests.map((request) => (
            <Paper
              key={request.id}
              shadow="xs"
              p="md"
              bg={dark ? "dark" : "gray.1"}
            >
              <Flex direction="row" justify="space-between">
                <Text>{request.details}</Text>
                <Group justify="center">
                  <Button
                    variant="light"
                    size="xs"
                    onClick={() => handleViewDetails(request)}
                  >
                    View
                  </Button>
                </Group>
              </Flex>
            </Paper>
          ))}
        </ScrollArea>
      </Stack>

      <Modal
        opened={opened}
        onClose={close}
        title="Request Details"
        centered
        size="lg"
        closeOnClickOutside={false}
      >
        <Form method="post" onKeyDown={handleKeyDown} autoComplete="off">
          {selectedRequest ? (
            <Stack>
              <Flex
                gap="md"
                justify="space-between"
                align="center"
                direction="row"
                wrap="wrap"
              >
                <Text>
                  <strong>ID:</strong> {selectedRequest.id}
                </Text>
                <input type={"hidden"} name={"id"} value={selectedRequest.id} />
                <Select
                  label="Status"
                  placeholder="Select Status"
                  defaultValue={selectedRequest.status}
                  data={[
                    { value: "pending", label: "Pending" },
                    { value: "inprogress", label: "In Progress" },
                    { value: "completed", label: "Completed" },
                  ]}
                  name={"status"}
                  error={actionData?.errors?.fieldErrors.status}
                />
              </Flex>

              <Text>
                <strong>Details:</strong> {selectedRequest.details}
              </Text>
              <Flex
                gap="md"
                justify="space-between"
                align="center"
                direction="row"
                wrap="wrap"
              >
                <Text>
                  <strong>Requested At: </strong>
                  {formatDate(selectedRequest.createdAt)}
                </Text>
                <Text>
                  <strong>Requested By: </strong>
                  {selectedRequest.User.name}
                </Text>
              </Flex>
            </Stack>
          ) : null}
          <Button mt="md" type="submit" variant="filled">
            Submit
          </Button>
        </Form>
      </Modal>
    </MainContainer>
  );
}
