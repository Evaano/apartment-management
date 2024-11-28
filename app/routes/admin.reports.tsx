import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { requireUserId } from "~/session.server";
import { safeRedirect } from "~/utils";

import {
  ActionIcon,
  Button,
  Center,
  Grid,
  Group,
  Paper,
  ScrollArea,
  Text,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { MainContainer } from "~/components/main-container/main-container";
import { IconBell } from "@tabler/icons-react";
import { BarChart, PieChart } from "@mantine/charts";
import { Link } from "@remix-run/react";
import { getUserWithRole } from "~/models/user.server";

export const meta: MetaFunction = () => [{ title: "User Management" }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { searchParams } = new URL(request.url);
  const redirectTo = safeRedirect(searchParams.get("redirectTo"), "/");
  const userId = await requireUserId(request, redirectTo);

  if (!userId) {
    return redirect(redirectTo);
  }

  return { userId };
};

const NOTIFICATIONS = [
  "Your rent payment is due in 5 days.",
  "Maintenance request #1234 has been resolved.",
  "Lease renewal is available starting next month.",
];

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

const MAINTENANCE_REQUESTS = [
  {
    id: 1,
    issue: "Leaky faucet in kitchen",
    status: "Pending",
  },
  {
    id: 2,
    issue: "Broken heater in living room",
    status: "Resolved",
  },
];

const LEASE_INFORMATION = {
  leaseNumber: "LN-12345",
  startDate: "2023-01-01",
  endDate: "2025-12-31",
  monthlyRent: "$1,200",
  landlordName: "John Doe",
};

export const data = [
  { name: "USA", value: 400, color: "indigo.6" },
  { name: "India", value: 300, color: "yellow.6" },
  { name: "Japan", value: 300, color: "teal.6" },
  { name: "Other", value: 200, color: "gray.6" },
];

export const barData = [
  { month: "January", Smartphones: 1200, Laptops: 900, Tablets: 200 },
  { month: "February", Smartphones: 1900, Laptops: 1200, Tablets: 400 },
  { month: "March", Smartphones: 400, Laptops: 1000, Tablets: 200 },
  { month: "April", Smartphones: 1000, Laptops: 200, Tablets: 800 },
  { month: "May", Smartphones: 800, Laptops: 1400, Tablets: 1200 },
  { month: "June", Smartphones: 750, Laptops: 600, Tablets: 1000 },
];

export default function AdminReports({ isAdmin }: { isAdmin: boolean }) {
  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";
  const isMobile = useMediaQuery("(max-width: 768px)");

  const mockPayments = Array(14).fill({
    id: 1,
    description: "Payment Description",
    hasNotification: true,
  });

  return (
    <MainContainer title="Reports">
      <Grid gutter="md">
        <Grid.Col span={{ base: 12, md: 6, lg: 6 }}>
          <Paper shadow="xs" p="md" mih={600} bg={dark ? "dark" : "gray.1"}>
            <Title order={4} py="md">
              Payment Details
            </Title>
            <ScrollArea h={400} scrollbarSize={7}>
              {mockPayments.map((payment) => (
                <Paper
                  key={payment.id}
                  withBorder
                  p="sm"
                  bg={dark ? "dark.6" : "gray.1"}
                >
                  <Group gap="lg" wrap="nowrap">
                    <Group gap="xl" wrap="nowrap" style={{ flex: 1 }}>
                      <Text size="sm" lineClamp={1} style={{ flex: 1 }}>
                        {payment.description}
                      </Text>
                    </Group>

                    <Button variant="light" size="xs">
                      Details
                    </Button>

                    <ActionIcon
                      variant="subtle"
                      color={dark ? "gray.4" : "gray.6"}
                    >
                      <IconBell size={18} />
                    </ActionIcon>
                  </Group>
                </Paper>
              ))}
            </ScrollArea>
            <Button fullWidth mt="md">
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
                  {MAINTENANCE_REQUESTS.map((request) => (
                    <Text key={request.id}>
                      {request.issue} - {request.status}
                    </Text>
                  ))}
                </Paper>
                <Button
                  variant="light"
                  fullWidth
                  mt="md"
                  component={Link}
                  to={"/admin/maintenance"}
                  style={{
                    marginTop: "auto",
                  }}
                >
                  Generate Report
                </Button>
              </Paper>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper shadow="xs" p="md" mih={300} bg={dark ? "dark" : "gray.1"}>
                <Center mt={50}>
                  <PieChart
                    withLabelsLine
                    labelsPosition="inside"
                    labelsType="percent"
                    withLabels
                    data={data}
                  />
                </Center>
              </Paper>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper shadow="xs" p="md" mih={300} bg={dark ? "dark" : "gray.1"}>
                <Center mt={50} mr={20}>
                  <BarChart
                    h={200}
                    data={barData}
                    dataKey="month"
                    series={[
                      { name: "Smartphones", color: "violet.6" },
                      { name: "Laptops", color: "blue.6" },
                      { name: "Tablets", color: "teal.6" },
                    ]}
                    tickLine="none"
                  />
                </Center>
              </Paper>
            </Grid.Col>
          </Grid>
        </Grid.Col>
      </Grid>
    </MainContainer>
  );
}
