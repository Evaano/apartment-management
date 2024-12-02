import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { requireUserId } from "~/session.server";
import { formatDate, safeRedirect } from "~/utils";

import {
  Anchor,
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

  const tenants = await prisma.user.findMany({
    where: {
      deletedAt: null,
      role: {
        name: "user",
      },
    },
  });

  const duePayments = await prisma.billing.findMany({
    where: {
      deletedAt: null,
      dueDate: {
        lt: new Date(),
      },
    },
  });

  const collectedPayments = await prisma.billing.findMany({
    where: {
      deletedAt: null,
      status: "paid",
    },
  });

  return { maintenanceRequests, tenants, duePayments, collectedPayments };
};

export default function AdminDashboard() {
  const { maintenanceRequests, tenants, duePayments, collectedPayments } =
    useLoaderData<typeof loader>();
  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";
  const isMobile = useMediaQuery("(max-width: 768px)");

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
    </Table.Tr>
  ));

  return (
    <MainContainer title="Dashboard">
      <Grid gutter="md">
        {/* Payments and Lease Info Section */}
        <Grid.Col span={{ base: 12, md: 6, lg: 6 }}>
          <Grid gutter="md">
            {/* Due Payments */}
            <Grid.Col span={{ base: 12, md: 12 }}>
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
                    {duePayments.map((payment) => (
                      <Text key={payment.id}>
                        {payment.description} - MVR {payment.amount} (Due:{" "}
                        {formatDate(payment.dueDate)})
                      </Text>
                    ))}
                  </Paper>
                </div>
                <Button
                  fullWidth
                  mt="md"
                  component={Link}
                  to={"/admin/finances"}
                >
                  View
                </Button>
              </Paper>
            </Grid.Col>

            {/* User Info */}
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
                  {collectedPayments.map((payment) => (
                    <Text key={payment.id}>
                      {payment.description} - MVR {payment.amount} (Due:{" "}
                      {formatDate(payment.dueDate)})
                    </Text>
                  ))}
                </Paper>
              </div>
              <div>
                <Title order={4} py="md">
                  Outstanding Payments
                </Title>
                <Paper shadow="xs" p="md">
                  {duePayments.map((payment) => (
                    <Text key={payment.id}>
                      {payment.description} - MVR {payment.amount} (Due:{" "}
                      {formatDate(payment.dueDate)})
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
                            request.status === "pending"
                              ? "yellow"
                              : request.status === "completed"
                                ? "green"
                                : request.status === "inprogress"
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
