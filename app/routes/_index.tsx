import {
  AspectRatio,
  BackgroundImage,
  Box,
  Button,
  Container,
  Group,
  Text,
  Title,
} from "@mantine/core";
import { LoaderFunctionArgs, MetaFunction, redirect } from "@remix-run/node";

import classes from "~/routes-style/index.module.css";
import { Link, useLoaderData } from "@remix-run/react";
import { safeRedirect, useOptionalUser } from "~/utils";
import { requireUserId } from "~/session.server";
import { prisma } from "~/db.server";

export const meta: MetaFunction = () => [{ title: "Welcome" }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { searchParams } = new URL(request.url);
  const redirectTo = safeRedirect(searchParams.get("redirectTo"), "/");
  const userId = await requireUserId(request, redirectTo);

  if (!userId) {
    return redirect(redirectTo);
  }

  const adminRole = await prisma.role.findFirst({
    where: {
      name: "admin",
    },
    select: {
      id: true,
    },
  });

  return { adminRole };
};

export default function Index() {
  const { adminRole } = useLoaderData<typeof loader>();
  const user = useOptionalUser();
  const isAdmin = user?.roleId === adminRole?.id;

  return (
    <Container size={"xl"} pt={120}>
      <AspectRatio ratio={16 / 9} maw={1920} mx="auto" mt={"lg"}>
        <BackgroundImage
          src="https://i.imgur.com/zaPcCFF.jpeg"
          radius="lg"
          mih={520}
          mah={650}
        >
          <Box m={"xl"} p={"xl"}>
            <Title className={classes.title}>
              Jifuti (Apartment Management System)
            </Title>
            <Text className={classes.description} size="xl" mt="xl">
              Simplify property management with our all-in-one platform. Manage
              tenants, track maintenance, collect rent, and generate reports—all
              in one place. Streamlined, secure, and designed for you.
            </Text>
            <Group justify="flex-start" mt="lg">
              {user ? (
                isAdmin ? (
                  <Button
                    to="/admin/dashboard"
                    component={Link}
                    radius="xl"
                    variant="filled"
                  >
                    Go to Admin Dashboard
                  </Button>
                ) : (
                  <Button
                    to="/tenants/dashboard"
                    component={Link}
                    radius="xl"
                    variant="filled"
                  >
                    Go to Tenant Dashboard
                  </Button>
                )
              ) : (
                <>
                  <Button
                    component={Link}
                    to="/register"
                    radius="xl"
                    variant="outline"
                  >
                    Register
                  </Button>
                  <Button component={Link} to="/login" radius="xl">
                    Login
                  </Button>
                </>
              )}
            </Group>
          </Box>
        </BackgroundImage>
      </AspectRatio>
    </Container>
  );
}
