import { Text, Avatar, Paper, Button } from "@mantine/core";
import { LoaderFunctionArgs, json } from "@remix-run/node";
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

export default function UserProfileView() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div>
      <Paper radius="md" withBorder p="lg" bg="var(--mantine-color-body)">
        <Avatar
          src="https://imgur.com/LseGV35"
          size={120}
          radius={120}
          mx="auto"
        />
        <Text ta="center" fz="lg" fw={500} mt="md">
          {user.email}
        </Text>
        <div className="flex justify-center mt-3">
          <Button disabled>Edit Profile</Button>
        </div>
      </Paper>
    </div>
  );
}
