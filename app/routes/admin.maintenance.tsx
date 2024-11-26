import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { requireUserId } from "~/session.server";
import { safeRedirect } from "~/utils";

import {
  Button,
  Group,
  Paper,
  Stack,
  Text,
  useMantineColorScheme,
} from "@mantine/core";
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

export default function AdminMaintenance({ isAdmin }: { isAdmin: boolean }) {
  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";

  // Mock data for the payments list
  const mockPayments = Array(14).fill({
    id: 1,
    description: "Payment Description",
    hasNotification: true,
  });

  return (
    <MainContainer title={"Maintenance Requests"}>
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
            </Group>
          </Paper>
        ))}
      </Stack>
    </MainContainer>
  );
}
