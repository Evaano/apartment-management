import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { requireUserId } from "~/session.server";
import { safeRedirect } from "~/utils";

import {
  Button,
  Container,
  Grid,
  Paper,
  Title,
  Text,
  Flex,
  useMantineColorScheme,
  Stack,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";

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

  if (isMobile) {
    return (
      <Container fluid p="md">
        <Flex gap="md" direction={isMobile ? "column" : "row"} wrap="wrap">
          <Paper
            shadow="xs"
            p="md"
            className={isMobile ? "w-full" : "w-72"}
            bg={dark ? "dark" : "gray.1"}
          >
            <Stack gap="md">
              <Title order={4}>Notifications</Title>
              <Paper shadow="xs" p="md" bg={dark ? "dark" : "gray.1"}>
                {NOTIFICATIONS.map((notification, index) => (
                  <Text key={index} className="mb-2">
                    {notification}
                  </Text>
                ))}
                <Button variant="light" fullWidth className="mt-4">
                  View
                </Button>
              </Paper>
            </Stack>
          </Paper>

          <Flex
            direction="column"
            gap="md"
            className={isMobile ? "w-full" : "flex-1"}
          >
            {/* Payments Row */}
            <Flex gap="md" direction={isMobile ? "column" : "row"}>
              {/* Due Payments */}
              <Paper
                shadow="xs"
                p="md"
                className={isMobile ? "w-full" : "w-64"}
                bg={dark ? "dark" : "gray.1"}
              >
                <Stack gap="md">
                  <Title order={4}>Due Payments</Title>
                  <Paper shadow="xs" p="md" bg={dark ? "dark" : "gray.1"}>
                    {DUE_PAYMENTS.map((payment) => (
                      <Text key={payment.id} className="mb-2">
                        {payment.details} - {payment.amount} (Due:{" "}
                        {payment.dueDate})
                      </Text>
                    ))}
                  </Paper>
                  <Button fullWidth>Pay</Button>
                </Stack>
              </Paper>

              <Paper
                shadow="xs"
                p="md"
                className={isMobile ? "w-full" : "w-64"}
                bg={dark ? "dark" : "gray.1"}
              >
                <Stack gap="md">
                  <Title order={4}>Next Payment</Title>
                  <Paper shadow="xs" p="md" bg={dark ? "dark" : "gray.1"}>
                    <Text>
                      {NEXT_PAYMENT.details} - {NEXT_PAYMENT.amount}
                      <br />
                      Due: {NEXT_PAYMENT.dueDate}
                    </Text>
                  </Paper>
                  <Button fullWidth>Pay</Button>
                </Stack>
              </Paper>
            </Flex>

            <Paper
              shadow="xs"
              p="md"
              className="w-full"
              bg={dark ? "dark" : "gray.1"}
            >
              <Stack gap="md">
                <Title order={4}>Lease Info</Title>
                <Paper shadow="xs" p="md" bg={dark ? "dark" : "gray.1"}>
                  <Stack gap="xs">
                    <Text>Lease Number: {LEASE_INFORMATION.leaseNumber}</Text>
                    <Text>
                      Lease Term: {LEASE_INFORMATION.startDate} to{" "}
                      {LEASE_INFORMATION.endDate}
                    </Text>
                    <Text>Monthly Rent: {LEASE_INFORMATION.monthlyRent}</Text>
                    <Text>Landlord: {LEASE_INFORMATION.landlordName}</Text>
                  </Stack>
                </Paper>
              </Stack>
            </Paper>
          </Flex>

          <Paper
            shadow="xs"
            p="md"
            className={isMobile ? "w-full" : "w-72"}
            bg={dark ? "dark" : "gray.1"}
          >
            <Stack gap="md">
              <Title order={4}>Maintenance Requests</Title>
              <Paper shadow="xs" p="md" bg={dark ? "dark" : "gray.1"}>
                {MAINTENANCE_REQUESTS.map((request) => (
                  <Text key={request.id} className="mb-2">
                    {request.issue} - {request.status}
                  </Text>
                ))}
                <Button variant="light" fullWidth className="mt-4">
                  View
                </Button>
              </Paper>
            </Stack>
          </Paper>
        </Flex>
      </Container>
    );
  }

  return (
    <Container fluid p="md">
      <Flex
        mih={50}
        gap="md"
        justify="center"
        align="center"
        direction="row"
        wrap="wrap"
      >
        <Paper
          shadow="xs"
          p="md"
          mih={600}
          miw={300}
          mah={600}
          maw={300}
          bg={dark ? "dark" : "gray.1"}
        >
          <Title order={4}>Notifications</Title>
          <Paper shadow="xs" p="md" bg={dark ? "dark" : "gray.1"}>
            {NOTIFICATIONS.map((notification, index) => (
              <Text key={index}>{notification}</Text>
            ))}
            <Button variant="light" fullWidth mt="md">
              View
            </Button>
          </Paper>
        </Paper>
        <Flex direction="column" gap="md" mih={600} justify="space-between">
          <Flex gap="md" direction="row">
            <Paper
              shadow="xs"
              p="md"
              mih={360}
              miw={200}
              mah={360}
              maw={200}
              bg={dark ? "dark" : "gray.1"}
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Title order={4}>Due Payments</Title>
              <Paper shadow="xs" p="md" bg={dark ? "dark" : "gray.1"}>
                {DUE_PAYMENTS.map((payment) => (
                  <div key={payment.id}>
                    <Text>
                      {payment.details} - {payment.amount} (Due:{" "}
                      {payment.dueDate})
                    </Text>
                  </div>
                ))}
              </Paper>
              <Button fullWidth mt="md">
                Pay
              </Button>
            </Paper>

            <Paper
              shadow="xs"
              p="md"
              mih={360}
              miw={200}
              mah={360}
              maw={200}
              bg={dark ? "dark" : "gray.1"}
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Title order={4}>Due Payments</Title>
              <Paper shadow="xs" p="md" bg={dark ? "dark" : "gray.1"}>
                {NEXT_PAYMENT.details} - {NEXT_PAYMENT.amount} (Due:{" "}
                {NEXT_PAYMENT.dueDate})
              </Paper>
              <Button fullWidth mt="md">
                Pay
              </Button>
            </Paper>
          </Flex>
          <Paper
            shadow="xs"
            p="md"
            mih={220}
            miw={420}
            mah={220}
            maw={420}
            bg={dark ? "dark" : "gray.1"}
          >
            <Title order={4}>Lease Info</Title>
            <Paper shadow="xs" p="md" bg={dark ? "dark" : "gray.1"}>
              <Text>Lease Number: {LEASE_INFORMATION.leaseNumber}</Text>
              <Text>
                Lease Term: {LEASE_INFORMATION.startDate} to{" "}
                {LEASE_INFORMATION.endDate}
              </Text>
              <Text>Monthly Rent: {LEASE_INFORMATION.monthlyRent}</Text>
              <Text>Landlord: {LEASE_INFORMATION.landlordName}</Text>
            </Paper>
          </Paper>
        </Flex>
        <Paper
          shadow="xs"
          p="md"
          mih={600}
          miw={300}
          mah={600}
          maw={300}
          bg={dark ? "dark" : "gray.1"}
        >
          <Title order={4}>Maintenance Requests</Title>
          <Paper shadow="xs" p="md" bg={dark ? "dark" : "gray.1"}>
            {MAINTENANCE_REQUESTS.map((request) => (
              <Text key={request.id}>
                {request.issue} - {request.status}
              </Text>
            ))}
            <Button variant="light" fullWidth mt="md">
              View
            </Button>
          </Paper>
        </Paper>
      </Flex>
    </Container>
  );
}
