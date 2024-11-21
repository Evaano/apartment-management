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
  Textarea,
  Group,
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

  return (
    <Container fluid p="md">
      <Grid>
        {isMobile ? (
          <>
            <Grid.Col span={12}>
              <Paper shadow="xs" p="md" withBorder mih={600}>
                <Title order={3}>Request Maintenance</Title>
                <Textarea
                  placeholder="Describe the maintenance issue..."
                  mt="md"
                  autosize
                  minRows={2}
                  maxRows={20}
                />
                <Button mt="md">Submit</Button>
              </Paper>
            </Grid.Col>
            <Grid.Col span={12}>
              <Paper shadow="xs" p="md" withBorder mih={600}>
                <Title order={3}>Request Summary</Title>
                <Stack pt={"md"}>
                  <Paper shadow="xs" p="md" bg={dark ? "dark" : "gray.1"}>
                    <Flex direction="row" justify="space-between">
                      <Text>Broken pipe in bathroom</Text>
                      <Button variant="light" size="xs">
                        View
                      </Button>
                    </Flex>
                  </Paper>
                  <Paper shadow="xs" p="md" bg={dark ? "dark" : "gray.1"}>
                    <Flex direction="row" justify="space-between">
                      <Text>Leaky faucet in kitchen</Text>
                      <Button variant="light" size="xs">
                        View
                      </Button>
                    </Flex>
                  </Paper>
                  <Paper shadow="xs" p="md" bg={dark ? "dark" : "gray.1"}>
                    <Flex direction="row" justify="space-between">
                      <Text>Broken heater in living room</Text>
                      <Button variant="light" size="xs">
                        View
                      </Button>
                    </Flex>
                  </Paper>
                </Stack>
              </Paper>
            </Grid.Col>
          </>
        ) : (
          <>
            <Grid.Col span={6}>
              <Paper shadow="xs" p="md" withBorder mih={600}>
                <Title order={3}>Request Maintenance</Title>
                <Textarea
                  placeholder="Describe the maintenance issue..."
                  mt="md"
                  autosize
                  minRows={2}
                  maxRows={20}
                />
                <Button mt="md">Submit</Button>
              </Paper>
            </Grid.Col>
            <Grid.Col span={6}>
              <Paper shadow="xs" p="md" withBorder mih={600}>
                <Title order={3}>Request Summary</Title>
                <Stack pt={"md"}>
                  <Paper shadow="xs" p="md" bg={dark ? "dark" : "gray.1"}>
                    <Flex direction="row" justify="space-between">
                      <Text>Broken pipe in bathroom</Text>
                      <Button variant="light" size="xs">
                        View
                      </Button>
                    </Flex>
                  </Paper>
                  <Paper shadow="xs" p="md" bg={dark ? "dark" : "gray.1"}>
                    <Flex direction="row" justify="space-between">
                      <Text>Leaky faucet in kitchen</Text>
                      <Button variant="light" size="xs">
                        View
                      </Button>
                    </Flex>
                  </Paper>
                  <Paper shadow="xs" p="md" bg={dark ? "dark" : "gray.1"}>
                    <Flex direction="row" justify="space-between">
                      <Text>Broken heater in living room</Text>
                      <Button variant="light" size="xs">
                        View
                      </Button>
                    </Flex>
                  </Paper>
                </Stack>
              </Paper>
            </Grid.Col>
          </>
        )}
      </Grid>
    </Container>
  );
}
