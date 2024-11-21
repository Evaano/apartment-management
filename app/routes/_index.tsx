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
import type { MetaFunction } from "@remix-run/node";

import classes from "~/routes-style/index.module.css";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => [{ title: "Welcome" }];

export default function Index() {
  return (
    <Container size={"xl"} pt={"xl"}>
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
            <Group justify="flex-start" mt={"lg"}>
              <Button
                component={Link}
                to={"/register"}
                radius={"xl"}
                variant={"outline"}
              >
                Register
              </Button>
              <Button component={Link} to={"/login"} radius={"xl"}>
                Login
              </Button>
            </Group>
          </Box>
        </BackgroundImage>
      </AspectRatio>
    </Container>
  );
}
