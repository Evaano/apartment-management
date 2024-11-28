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

export default function AdminFinances() {
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
