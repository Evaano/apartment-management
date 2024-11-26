import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { requireUserId } from "~/session.server";
import { safeRedirect } from "~/utils";

import {
  Button,
  Grid,
  Paper,
  Text,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { MainContainer } from "~/components/main-container/main-container";
import { Link } from "@remix-run/react";

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

export default function TenantsDashboard({ isAdmin }: { isAdmin: boolean }) {
  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <MainContainer title="Dashboard">
      <Grid gutter="md">
        {/* Notifications Section */}
        <Grid.Col span={{ base: 12, md: 3, lg: 3 }}>
          <Paper shadow="xs" p="md" mih={600} bg={dark ? "dark" : "gray.1"}>
            <Title order={4} py="md">
              Notifications
            </Title>
            <Paper shadow="xs" p="md">
              {NOTIFICATIONS.map((notification, index) => (
                <Text key={index}>{notification}</Text>
              ))}
              <Button variant="light" fullWidth mt="md">
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
                <Title order={4} py="md">
                  Lease Info
                </Title>
                <Paper shadow="xs" p="md">
                  <Text>Lease Number: {LEASE_INFORMATION.leaseNumber}</Text>
                  <Text>
                    Lease Term: {LEASE_INFORMATION.startDate} to{" "}
                    {LEASE_INFORMATION.endDate}
                  </Text>
                  <Text>Monthly Rent: {LEASE_INFORMATION.monthlyRent}</Text>
                  <Text>Landlord: {LEASE_INFORMATION.landlordName}</Text>
                </Paper>
              </Paper>
            </Grid.Col>
          </Grid>
        </Grid.Col>

        {/* Maintenance Requests Section */}
        <Grid.Col span={{ base: 12, md: 3, lg: 3 }}>
          <Paper shadow="xs" p="md" mih={600} bg={dark ? "dark" : "gray.1"}>
            <Title order={4} py="md">
              Maintenance Requests
            </Title>
            <Paper shadow="xs" p="md">
              {MAINTENANCE_REQUESTS.map((request) => (
                <Text key={request.id}>
                  {request.issue} - {request.status}
                </Text>
              ))}
              <Button
                variant="light"
                fullWidth
                mt="md"
                component={Link}
                to={"/admin/maintenance"}
              >
                View
              </Button>
            </Paper>
          </Paper>
        </Grid.Col>
      </Grid>
    </MainContainer>
  );
}
