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
  ScrollArea,
  useMantineColorScheme,
} from "@mantine/core";

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

  return (
    <Container fluid p="md">
      <ScrollArea
        h={630}
        offsetScrollbars
        scrollbarSize={8}
        scrollHideDelay={500}
      >
        <Grid>
          <Grid.Col span={12}>
            <Paper shadow="xs" p="md" withBorder>
              <Title order={3}>Payment Details</Title>
              <Flex direction="column" gap="md">
                <Paper
                  shadow="xs"
                  p="md"
                  mt={"md"}
                  bg={dark ? "dark" : "gray.1"}
                >
                  <Flex direction="row" gap="md">
                    <Text>Payment Amount:</Text>
                    <Text>$1,200</Text>
                  </Flex>
                  <Flex direction="row" gap="md">
                    <Text>Due Date:</Text>
                    <Text>2024-12-01</Text>
                  </Flex>
                  <Flex direction="row" gap="md">
                    <Text>Details:</Text>
                    <Text>Rent payment for December 2024</Text>
                  </Flex>
                  <Flex>
                    <Button mt="md">Pay Now</Button>
                  </Flex>
                </Paper>
              </Flex>
            </Paper>
          </Grid.Col>
          <Grid.Col span={12}>
            <Paper shadow="xs" p="md" withBorder>
              <Title order={3}>Payment Summary</Title>
              <Flex direction="column" gap="md" mt={"md"}>
                <Paper shadow="xs" p="md" bg={dark ? "dark" : "gray.1"}>
                  <Flex direction="row" justify="space-between">
                    <Text>Rent Payment</Text>
                    <Button variant="light" mt="md">
                      Details
                    </Button>
                  </Flex>
                </Paper>
                <Paper shadow="xs" p="md" bg={dark ? "dark" : "gray.1"}>
                  <Flex direction="row" justify="space-between">
                    <Text>Utility Payment</Text>
                    <Button variant="light" mt="md">
                      Details
                    </Button>
                  </Flex>
                </Paper>
                <Paper shadow="xs" p="md" bg={dark ? "dark" : "gray.1"}>
                  <Flex direction="row" justify="space-between">
                    <Text>Late Fees</Text>
                    <Button variant="light" mt="md">
                      Details
                    </Button>
                  </Flex>
                </Paper>
              </Flex>
            </Paper>
          </Grid.Col>
        </Grid>
      </ScrollArea>
    </Container>
  );
}
