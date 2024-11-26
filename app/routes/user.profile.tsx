import { Avatar, Button, Paper, Text } from "@mantine/core";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getUserById } from "~/models/user.server";
import { getUserId } from "~/session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserId(request);

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await getUserById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  return json({ user });
};

export default function UserProfile() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <Paper radius="md" withBorder p="lg" bg="var(--mantine-color-body)">
      <Avatar
        src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-8.png"
        size={120}
        radius={120}
        mx="auto"
      />
      <Text ta="center" fz="lg" fw={500} mt="md">
        {user.name}
      </Text>
      <Text ta="center" c="dimmed" fz="sm">
        {user.email}
      </Text>

      <Button variant="default" fullWidth mt="md">
        Edit Profile
      </Button>
    </Paper>
  );
}
