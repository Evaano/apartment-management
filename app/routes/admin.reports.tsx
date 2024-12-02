import {
  LoaderFunctionArgs,
  MetaFunction,
  SerializeFrom,
  redirect,
} from "@remix-run/node";
import { requireUserId } from "~/session.server";
import { safeRedirect } from "~/utils";

import {
  ActionIcon,
  Box,
  Button,
  Center,
  Grid,
  Group,
  Modal,
  NumberInput,
  Paper,
  ScrollArea,
  SimpleGrid,
  Text,
  Textarea,
  TextInput,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { MainContainer } from "~/components/main-container/main-container";
import { IconBell } from "@tabler/icons-react";
import { BarChart, PieChart } from "@mantine/charts";
import { Form, Link, useFetcher, useLoaderData } from "@remix-run/react";
import { prisma } from "~/db.server";
import { DateInput } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import { Billing, User } from "@prisma/client";
import type { Lease } from "~/models/lease.server";

type BillingWithRelations = Billing & {
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

  const paidBills = await prisma.billing.count({
    where: {
      deletedAt: null,
      status: "paid",
    },
  });

  const unpaidBills = await prisma.billing.count({
    where: {
      deletedAt: null,
      status: "pending",
    },
  });

  const getMaintenanceCountByMonth = async (month: number, status: string) => {
    const startDate = new Date(new Date().getFullYear(), month, 1);
    const endDate = new Date(new Date().getFullYear(), month + 1, 1);

    return prisma.maintenance.count({
      where: {
        deletedAt: null,
        status: status,
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
      },
    });
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const barData = await Promise.all(
    monthNames.map(async (monthName, index) => ({
      month: monthName,
      Pending: await getMaintenanceCountByMonth(index, "pending"),
      InProgress: await getMaintenanceCountByMonth(index, "inprogress"),
      Completed: await getMaintenanceCountByMonth(index, "completed"),
    })),
  );

  return {
    maintenanceRequests,
    bills,
    users,
    paidBills,
    unpaidBills,
    barData,
  };
};

export default function AdminReports() {
  const { maintenanceRequests, bills, paidBills, unpaidBills, barData } =
    useLoaderData<typeof loader>();
  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";
  const [selectedPayment, setSelectedPayment] =
    useState<SerializeFrom<BillingWithRelations> | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const apiFetcher = useFetcher();

  const data = [
    { name: "Paid", value: paidBills, color: "yellow" },
    { name: "Unpaid", value: unpaidBills, color: "green" },
  ];

  const handleViewDetails = (payment: SerializeFrom<BillingWithRelations>) => {
    setSelectedPayment(payment);
    open();
  };

  const handleClick = (billId: string) => {
    apiFetcher.submit(
      { billId },
      { method: "post", action: "/api/notification" },
    );
  };

  return (
    <MainContainer title="Reports">
      <Grid gutter="md">
        <Grid.Col span={{ base: 12, md: 6, lg: 6 }}>
          <Paper shadow="xs" p="md" mih={600} bg={dark ? "dark" : "gray.1"}>
            <Title order={4} py="md">
              Payment Details
            </Title>
            <ScrollArea h={400} scrollbarSize={7}>
              {bills.map((bill: SerializeFrom<BillingWithRelations>) => (
                <Paper
                  key={bill.id}
                  withBorder
                  p="sm"
                  bg={dark ? "dark.6" : "gray.1"}
                >
                  <Group gap="lg" wrap="nowrap">
                    <Group gap="xl" wrap="nowrap" style={{ flex: 1 }}>
                      <Text size="sm" lineClamp={1} style={{ flex: 1 }}>
                        {bill.description}
                      </Text>
                    </Group>

                    <Button
                      variant="light"
                      size="xs"
                      onClick={() => handleViewDetails(bill)}
                    >
                      Details
                    </Button>

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
            </ScrollArea>
            <Button
              fullWidth
              mt="md"
              component={Link}
              to={"pdf"}
              reloadDocument
            >
              Generate Report
            </Button>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6, lg: 6 }}>
          <Grid gutter="md">
            <Grid.Col span={12}>
              <Paper
                shadow="xs"
                p="md"
                mih={285}
                bg={dark ? "dark" : "gray.1"}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <Title order={4} py="md">
                  Maintenance Requests
                </Title>
                <Paper
                  shadow="xs"
                  p="md"
                  style={{
                    flexGrow: 1,
                    overflowY: "auto",
                  }}
                >
                  {maintenanceRequests.map((request) => (
                    <Text key={request.id}>
                      {request.details} - {request.status}
                    </Text>
                  ))}
                </Paper>
                <Button
                  fullWidth
                  mt="md"
                  component={Link}
                  to={"excel"}
                  reloadDocument
                >
                  Generate Report
                </Button>
              </Paper>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 4 }}>
              <Paper shadow="xs" p="md" mih={300} bg={dark ? "dark" : "gray.1"}>
                <Group justify="center" mt="xs" mb="sm" gap="lg">
                  <Box>
                    <Text c="yellow" size="sm" fw={500}>
                      ● Pending
                    </Text>
                  </Box>
                  <Box>
                    <Text c="green" size="sm" fw={500}>
                      ● Paid
                    </Text>
                  </Box>
                </Group>
                <Center>
                  <PieChart
                    withLabelsLine
                    labelsPosition="inside"
                    labelsType="percent"
                    withLabels
                    data={data}
                    mt={"lg"}
                  />
                </Center>
              </Paper>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 8 }}>
              <Paper shadow="xs" p="md" mih={300} bg={dark ? "dark" : "gray.1"}>
                <Center mt={50} mr={20}>
                  <BarChart
                    h={200}
                    data={barData}
                    dataKey="month"
                    series={[
                      { name: "Pending", color: "yellow.6" },
                      { name: "InProgress", color: "blue.6" },
                      { name: "Completed", color: "green.6" },
                    ]}
                    tickLine="none"
                  />
                </Center>
              </Paper>
            </Grid.Col>
          </Grid>
        </Grid.Col>
      </Grid>

      <Modal
        opened={opened}
        onClose={close}
        title="View Payment Details"
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
                <TextInput
                  placeholder="User to bill"
                  defaultValue={selectedPayment?.leaseId}
                  name="leaseId"
                  readOnly
                  variant={"filled"}
                />
                <TextInput
                  placeholder="Status"
                  defaultValue={selectedPayment?.status}
                  name="status"
                  readOnly
                  variant={"filled"}
                />
              </SimpleGrid>
              <SimpleGrid cols={3} my="md">
                <DateInput
                  label="Payment Date"
                  name="paymentDate"
                  highlightToday
                  defaultValue={
                    selectedPayment?.paymentDate
                      ? new Date(selectedPayment?.paymentDate)
                      : undefined
                  }
                  readOnly
                  variant={"filled"}
                />
                <DateInput
                  label="Due Date"
                  name="dueDate"
                  highlightToday
                  defaultValue={
                    selectedPayment?.dueDate
                      ? new Date(selectedPayment?.dueDate)
                      : undefined
                  }
                  readOnly
                  variant={"filled"}
                />
                <NumberInput
                  hideControls
                  label="Amount"
                  name="amount"
                  defaultValue={selectedPayment?.amount}
                  readOnly
                  variant={"filled"}
                />
              </SimpleGrid>
              <Textarea
                label="Description"
                name="description"
                defaultValue={selectedPayment?.description}
                readOnly
                variant={"filled"}
              />
            </Form>
          </>
        ) : (
          <Text>No details available</Text>
        )}
      </Modal>
    </MainContainer>
  );
}
