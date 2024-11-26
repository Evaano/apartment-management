import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { requireUserId } from "~/session.server";
import { safeRedirect } from "~/utils";

import {
  ActionIcon,
  Anchor,
  Avatar,
  Badge,
  Button,
  Flex,
  Grid,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Table,
  Text,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { MainContainer } from "~/components/main-container/main-container";
import { Link, useLoaderData } from "@remix-run/react";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import { prisma } from "~/db.server";

export const meta: MetaFunction = () => [{ title: "User Management" }];

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
      status: {
        not: "Completed",
      },
    },
    include: {
      User: true,
    },
  });

  return { maintenanceRequests };
};

const NEXT_PAYMENT = {
  amount: "$1,200",
  dueDate: "2024-12-01",
  details: "Rent payment for December 2024.",
};

const DUE_PAYMENTS = [
  {
    id: 1,
    amount: "$1,200",
    dueDate: "2024-11-25",
    details: "Rent payment for November 2024.",
  },
  {
    id: 2,
    amount: "$100",
    dueDate: "2024-11-20",
    details: "Utility payment for October 2024.",
  },
];

const tenants = [
  {
    avatar:
      "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-1.png",
    name: "Robert Wolfkisser",
    email: "rob_wolf@gmail.com",
    phone: "+44 (452) 886 09 12",
  },
  {
    avatar:
      "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-7.png",
    name: "Jill Jailbreaker",
    email: "jj@breaker.com",
    phone: "+44 (934) 777 12 76",
  },
  {
    avatar:
      "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-2.png",
    name: "Henry Silkeater",
    email: "henry@silkeater.io",
    phone: "+44 (901) 384 88 34",
  },
  {
    avatar:
      "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-3.png",
    name: "Bill Horsefighter",
    email: "bhorsefighter@gmail.com",
    phone: "+44 (667) 341 45 22",
  },
  {
    avatar:
      "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-10.png",
    name: "Jeremy Footviewer",
    email: "jeremy@foot.dev",
    phone: "+44 (881) 245 65 65",
  },
];

export default function AdminDashboard() {
  const { maintenanceRequests } = useLoaderData<typeof loader>();
  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";
  const isMobile = useMediaQuery("(max-width: 768px)");

  const rows = tenants.map((item) => (
    <Table.Tr key={item.name}>
      <Table.Td>
        <Group gap="sm">
          <Avatar size={30} src={item.avatar} radius={30} />
          <Text fz="sm" fw={500}>
            {item.name}
          </Text>
        </Group>
      </Table.Td>

      <Table.Td>
        <Anchor component="button" size="sm" c={"primary-blue"}>
          {item.email}
        </Anchor>
      </Table.Td>
      <Table.Td>
        <Text fz="sm">{item.phone}</Text>
      </Table.Td>
      <Table.Td>
        <Group gap={0} justify="flex-end">
          <ActionIcon variant="subtle" color="gray">
            <IconPencil size={16} stroke={1.5} />
          </ActionIcon>
          <ActionIcon variant="subtle" color="red">
            <IconTrash size={16} stroke={1.5} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <MainContainer title="Dashboard">
      <Grid gutter="md">
        {/* Payments and Lease Info Section */}
        <Grid.Col span={{ base: 12, md: 6, lg: 6 }}>
          <Grid gutter="md">
            {/* Due Payments */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper
                shadow="xs"
                p="md"
                mih={300}
                bg={dark ? "dark" : "gray.1"}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <Title order={4} py="md">
                    Due Payments
                  </Title>
                  <Paper shadow="xs" p="md">
                    {DUE_PAYMENTS.map((payment) => (
                      <Text key={payment.id}>
                        {payment.details} - {payment.amount} (Due:{" "}
                        {payment.dueDate})
                      </Text>
                    ))}
                  </Paper>
                </div>
                <Button fullWidth mt="md">
                  Pay
                </Button>
              </Paper>
            </Grid.Col>

            {/* Next Payment */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper
                shadow="xs"
                p="md"
                mih={300}
                bg={dark ? "dark" : "gray.1"}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <Title order={4} py="md">
                    Next Payment
                  </Title>
                  <Paper shadow="xs" p="md">
                    {NEXT_PAYMENT.details} - {NEXT_PAYMENT.amount} (Due:{" "}
                    {NEXT_PAYMENT.dueDate})
                  </Paper>
                </div>
                <Button fullWidth mt="md">
                  Pay
                </Button>
              </Paper>
            </Grid.Col>

            {/* Lease Info */}
            <Grid.Col span={12}>
              <Paper shadow="xs" p="md" mih={285} bg={dark ? "dark" : "gray.1"}>
                <Table.ScrollContainer
                  minWidth={isMobile ? 234 : 800}
                  maw={isMobile ? 234 : undefined}
                  h={250}
                >
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
              </Paper>
            </Grid.Col>
          </Grid>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 3, lg: 3 }}>
          <Paper shadow="xs" p="md" mih={600} bg={dark ? "dark" : "gray.1"}>
            <Title order={4} py="md">
              Financial Overview
            </Title>
            <ScrollArea h={500} scrollbarSize={7}>
              <div>
                <Title order={4} py="md">
                  Collected Payments
                </Title>
                <Paper shadow="xs" p="md">
                  {DUE_PAYMENTS.map((payment) => (
                    <Text key={payment.id}>
                      {payment.details} - {payment.amount} (Due:{" "}
                      {payment.dueDate})
                    </Text>
                  ))}
                </Paper>
              </div>
              <div>
                <Title order={4} py="md">
                  Outstanding Payments
                </Title>
                <Paper shadow="xs" p="md">
                  {DUE_PAYMENTS.map((payment) => (
                    <Text key={payment.id}>
                      {payment.details} - {payment.amount} (Due:{" "}
                      {payment.dueDate})
                    </Text>
                  ))}
                </Paper>
              </div>
              <div>
                <Title order={4} py="md">
                  Outstanding Payments
                </Title>
                <Paper shadow="xs" p="md">
                  {DUE_PAYMENTS.map((payment) => (
                    <Text key={payment.id}>
                      {payment.details} - {payment.amount} (Due:{" "}
                      {payment.dueDate})
                    </Text>
                  ))}
                </Paper>
              </div>
            </ScrollArea>
          </Paper>
        </Grid.Col>

        {/* Maintenance Requests Section */}
        <Grid.Col span={{ base: 12, md: 3, lg: 3 }}>
          <Paper shadow="xs" p="md" mih={600} bg={dark ? "dark" : "gray.1"}>
            <Title order={4} py="md">
              Maintenance Requests
            </Title>
            <Stack pt={"md"}>
              <ScrollArea h={400} scrollbarSize={7}>
                {maintenanceRequests.map((request) => (
                  <Paper key={request.id} shadow="xs" p="md">
                    <Flex direction="row" justify="space-between">
                      <Text lineClamp={1}>{request.details}</Text>
                      <Group justify="center">
                        <Badge
                          fullWidth
                          variant="light"
                          color={
                            request.status === "Pending"
                              ? "yellow"
                              : request.status === "Completed"
                                ? "green"
                                : request.status === "In Progress"
                                  ? "blue"
                                  : "gray"
                          }
                        >
                          {request.status}
                        </Badge>
                      </Group>
                    </Flex>
                  </Paper>
                ))}
              </ScrollArea>
              <Button
                variant="light"
                fullWidth
                mt="md"
                component={Link}
                to={"/admin/maintenance"}
              >
                View
              </Button>
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>
    </MainContainer>
  );
}
