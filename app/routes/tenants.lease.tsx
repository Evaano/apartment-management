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
        h={620}
        offsetScrollbars
        scrollbarSize={8}
        scrollHideDelay={500}
      >
        <Grid>
          <Grid.Col span={12}>
            <Paper shadow="xs" p="md" withBorder mih={600}>
              <Title order={3}>Lease Details</Title>
              <Flex direction="column" gap="md">
                <Paper
                  shadow="xs"
                  p="md"
                  mt={"md"}
                  bg={dark ? "dark" : "gray.1"}
                >
                  <Text>
                    <strong>Lease Number:</strong> LSA-2024-1121
                    <br />
                    <strong>Tenant Name:</strong> John Doe
                    <br />
                    <strong>Property Address:</strong> 123 Elm Street, Apt. 4B,
                    Springfield, XY 67890
                    <br />
                    <strong>Landlord Name:</strong> Green Realty LLC
                    <br />
                    <strong>Lease Term:</strong> 12 months (January 1, 2024, to
                    December 31, 2024)
                    <br />
                    <strong>Monthly Rent:</strong> $1,500.00
                    <br />
                    <strong>Security Deposit:</strong> $1,500.00 (paid on
                    December 20, 2023)
                    <br />
                    <strong>Payment Due Date:</strong> 1st of each month
                    <br />
                    <strong>Late Fee:</strong> $50.00 after a 5-day grace period
                    <br />
                    <br />
                    <strong>Utilities and Responsibilities:</strong>
                    <br />
                    <strong>Electricity:</strong> Tenant's responsibility
                    <br />
                    <strong>Water/Sewer:</strong> Included in rent
                    <br />
                    <strong>Internet:</strong> Tenant's responsibility
                    <br />
                    <strong>Maintenance:</strong> Landlord responsible for
                    structural repairs; tenant responsible for minor repairs
                    under $100.
                    <br />
                    <br />
                    <strong>Renewal Terms:</strong> Tenant must notify the
                    landlord 60 days before the lease end date regarding
                    renewal.
                  </Text>
                </Paper>
              </Flex>
            </Paper>
          </Grid.Col>
        </Grid>
      </ScrollArea>
    </Container>
  );
}
