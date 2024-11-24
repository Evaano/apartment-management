import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { requireUserId } from "~/session.server";
import { safeRedirect } from "~/utils";

import {
  ActionIcon,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  useMantineColorScheme,
} from "@mantine/core";
import { IconBell } from "@tabler/icons-react";
import { MainContainer } from "~/components/main-container/main-container";

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

  // Mock data for the payments list
  const mockPayments = Array(14).fill({
    id: 1,
    description: "Payment Description",
    hasNotification: true,
  });

  return (
    <MainContainer title={"Finances"}>
      <Stack gap="xs">
        {mockPayments.map((payment) => (
          <Paper
            key={payment.id}
            withBorder
            p="sm"
            bg={dark ? "dark.6" : "gray.1"}
          >
            <Group gap="xl" wrap="nowrap" px="md">
              <Group gap="xl" wrap="nowrap" style={{ flex: 1 }}>
                <Text size="sm" lineClamp={1} style={{ flex: 1 }}>
                  {payment.description}
                </Text>
              </Group>

              <Button variant="light" size="xs">
                Details
              </Button>

              <ActionIcon variant="subtle" color={dark ? "gray.4" : "gray.6"}>
                <IconBell size={18} />
              </ActionIcon>
            </Group>
          </Paper>
        ))}
      </Stack>
    </MainContainer>
  );
}
