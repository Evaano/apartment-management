import {
  LoaderFunctionArgs,
  MetaFunction,
  SerializeFrom,
} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { requireUserId } from "~/session.server";
import { formatDate, safeRedirect } from "~/utils";

import {
  ActionIcon,
  Badge,
  Button,
  Flex,
  Grid,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Text,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { MainContainer } from "~/components/main-container/main-container";
import { Link, useLoaderData } from "@remix-run/react";
import { prisma } from "~/db.server";
import { IconBell } from "@tabler/icons-react";
import { endOfMonth, startOfMonth } from "date-fns";

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
      userId,
    },
    include: {
      User: true,
    },
  });

  const notifications = await prisma.notification.findMany({
    where: {
      userId,
    },
  });

  const leaseInfo = await prisma.lease.findUnique({
    where: {
      deletedAt: null,
      userId: userId,
    },
    include: {
      user: true,
    },
  });

  if (!leaseInfo) {
    throw new Response("Lease info not found", {
      status: 404,
    });
  }

  const duePayments = await prisma.billing.findMany({
    where: {
      deletedAt: null,
      leaseId: leaseInfo.id,
      status: "pending",
      dueDate: {
        lt: new Date(),
      },
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

  const startOfCurrentMonth = startOfMonth(new Date());
  const endOfCurrentMonth = endOfMonth(new Date());

  const nextPayment = await prisma.billing.findFirst({
    where: {
      deletedAt: null,
      leaseId: leaseInfo.id,
      status: "pending",
      dueDate: {
        gte: startOfCurrentMonth,
        lte: endOfCurrentMonth,
      },
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

  console.log(nextPayment);

  return {
    maintenanceRequests,
    notifications,
    leaseInfo,
    duePayments,
    nextPayment,
  };
};

export default function TenantsDashboard() {
  const {
    maintenanceRequests,
    notifications,
    leaseInfo,
    duePayments,
    nextPayment,
  } = useLoaderData<typeof loader>();
  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";

  return (
    <MainContainer title="Dashboard">
      <Grid gutter="md">
        {/* Notifications Section */}
        <Grid.Col span={{ base: 12, md: 3, lg: 3 }}>
          <Paper shadow="xs" p="md" mih={600} bg={dark ? "dark" : "gray.1"}>
            <Title order={4} pb="md">
              Notifications
            </Title>
            <Paper shadow="xs" p="md">
              <Stack gap="xs">
                {notifications.map((bill) => (
                  <Paper
                    key={bill.id}
                    withBorder
                    p="sm"
                    bg={dark ? "dark.6" : "gray.1"}
                  >
                    <Text size="sm" lineClamp={1} style={{ flex: 1 }}>
                      Payment Description: {bill.details}
                    </Text>

                    <Text size="sm" lineClamp={1} style={{ flex: 1 }}>
                      Amount: MVR {bill.amount}
                    </Text>

                    <Text size="sm" lineClamp={1} style={{ flex: 1 }}>
                      Due: {formatDate(bill.dueDate)}
                    </Text>
                  </Paper>
                ))}
              </Stack>

              <Button
                variant="light"
                fullWidth
                mt="md"
                component={Link}
                to={"/tenants/rent"}
              >
                View
              </Button>
            </Paper>
          </Paper>
        </Grid.Col>

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
                  <Title order={4} pb="md">
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
                <Button fullWidth mt="md" component={Link} to={"/tenants/rent"}>
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
                  <Title order={4} pb="md">
                    Next Payment
                  </Title>
                  <Paper shadow="xs" p="md">
                    {nextPayment?.description || ""}
                    {nextPayment?.amount ? ` - MVR ${nextPayment.amount}` : ""}
                    {nextPayment?.dueDate
                      ? ` Due: ${new Date(
                          nextPayment.dueDate,
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}`
                      : ""}
                  </Paper>
                </div>
                <Button fullWidth mt="md" component={Link} to={"/tenants/rent"}>
                  Pay
                </Button>
              </Paper>
            </Grid.Col>

            {/* Lease Info */}
            <Grid.Col span={12}>
              <Paper shadow="xs" p="md" mih={285} bg={dark ? "dark" : "gray.1"}>
                <Title order={4} pb="md">
                  Lease Info
                </Title>
                <Paper shadow="xs" p="md">
                  <strong>Tenant Name:</strong> {leaseInfo.user?.name || "N/A"}
                  <br />
                  <strong>Property Address:</strong>{" "}
                  {leaseInfo.propertyDetails || "N/A"}
                  <br />
                  <strong>Lease Term:</strong>{" "}
                  {new Date(leaseInfo.startDate).toLocaleDateString()} to{" "}
                  {new Date(leaseInfo.endDate).toLocaleDateString()}
                  <br />
                  <strong>Monthly Rent:</strong> $
                  {leaseInfo.rentAmount.toLocaleString()}
                  <br />
                  <strong>Security Deposit:</strong> $
                  {leaseInfo.securityDeposit.toLocaleString()}
                  <br />
                  <strong>Maintenance Fee:</strong> $
                  {leaseInfo.maintenanceFee.toLocaleString()}
                  <br />
                </Paper>
              </Paper>
            </Grid.Col>
          </Grid>
        </Grid.Col>

        {/* Maintenance Requests Section */}
        <Grid.Col span={{ base: 12, md: 3, lg: 3 }}>
          <Paper shadow="xs" p="md" mih={600} bg={dark ? "dark" : "gray.1"}>
            <Title order={4} pb="md">
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
                to={"/tenants/maintenance"}
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
