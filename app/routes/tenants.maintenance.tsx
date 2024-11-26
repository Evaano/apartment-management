import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  MetaFunction,
  redirect,
} from "@remix-run/node";
import { requireUserId } from "~/session.server";
import { formatDate, handleKeyDown, safeRedirect } from "~/utils";

import {
  Badge,
  Button,
  Flex,
  Grid,
  Group,
  Modal,
  Paper,
  ScrollArea,
  Stack,
  Text,
  Textarea,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { MainContainer } from "~/components/main-container/main-container";
import qs from "qs";
import { prisma } from "~/db.server";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { z } from "zod";

export const meta: MetaFunction = () => [{ title: "User Management" }];

type UserInfo = {
  email: string;
  name: string;
};

type Maintenance = {
  id: number;
  details: string;
  userId: string;
  User: UserInfo;
  status: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
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
      userId,
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

  const DetailsSchema = z.object({
    details: z
      .string()
      .min(1, { message: "Details cannot be empty" })
      .refine(
        (val) =>
          val
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line.length > 0).length > 0,
        { message: "Details must contain meaningful text" },
      ),
  });

  const validatedForm = DetailsSchema.safeParse(parsedText);

  if (!validatedForm.success) {
    console.log(validatedForm.error.format());
    return json({ errors: validatedForm.error.flatten() }, { status: 400 });
  }

  const validatedData = validatedForm.data;

  await prisma.maintenance.create({
    data: {
      details: validatedData.details,
      status: "Pending",
      userId,
    },
  });

  return json({ errors: null }, { status: 200 });
};

export default function TenantsMaintenance() {
  const { maintenanceRequests } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedRequest, setSelectedRequest] = useState<Maintenance | null>(
    null,
  );

  const gridSpan = isMobile ? 12 : 6;

  const handleViewDetails = (request: Maintenance) => {
    setSelectedRequest(request);
    open();
  };

  return (
    <MainContainer title="Maintenance">
      <Grid>
        <Grid.Col span={gridSpan}>
          <Paper shadow="xs" p="md" withBorder mih={600}>
            <Title order={3}>Request Maintenance</Title>
            <Form method="post" onKeyDown={handleKeyDown} autoComplete="off">
              <Textarea
                placeholder="Describe the maintenance issue..."
                mt="md"
                autosize
                minRows={2}
                maxRows={20}
                name={"details"}
                error={actionData?.errors?.fieldErrors.details}
              />
              <Button mt="md" type="submit" variant="filled">
                Submit
              </Button>
            </Form>
          </Paper>
        </Grid.Col>
        <Grid.Col span={gridSpan}>
          <Paper shadow="xs" p="md" withBorder mih={600}>
            <Title order={3}>Request Summary</Title>
            <Stack pt={"md"}>
              <ScrollArea h={500} scrollbarSize={7}>
                {maintenanceRequests.map((request) => (
                  <Paper
                    key={request.id}
                    shadow="xs"
                    p="md"
                    bg={dark ? "dark" : "gray.1"}
                  >
                    <Flex direction="row" justify="space-between">
                      <Text lineClamp={1}>{request.details}</Text>
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
          </Paper>
        </Grid.Col>
      </Grid>

      <Modal
        opened={opened}
        onClose={close}
        title="Request Details"
        centered
        size="lg"
      >
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
              <Group>
                <Text>
                  <strong>Status:</strong>
                </Text>
                <Badge
                  variant="light"
                  color={
                    selectedRequest.status === "Pending"
                      ? "yellow"
                      : selectedRequest.status === "Completed"
                        ? "green"
                        : selectedRequest.status === "In Progress"
                          ? "blue"
                          : "gray"
                  }
                >
                  {selectedRequest.status}
                </Badge>
              </Group>
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
        ) : (
          <Text>No details available</Text>
        )}
      </Modal>
    </MainContainer>
  );
}
