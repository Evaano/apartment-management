import {
  AspectRatio,
  BackgroundImage,
  Box,
  Container,
  Text,
  Title,
} from "@mantine/core";
import type { MetaFunction } from "@remix-run/node";

import classes from "~/routes-style/index.module.css";

export const meta: MetaFunction = () => [{ title: "Welcome" }];

export default function Index() {
  return (
    <Container size={"xl"} pt={"xl"}>
      <AspectRatio ratio={16 / 9} maw={1920} mx="auto" mt={"lg"}>
        <BackgroundImage src="https://i.imgur.com/uVvSIHU.jpeg" radius="lg">
          <Box m={"xl"} p={"xl"}>
            <Title className={classes.title}>HMH Waitlist Application</Title>
            <Text className={classes.description} size="xl" mt="xl">
              Easily manage your waitlist status and that of your immediate
              family members. Our application provides a seamless way for
              hospital staff to add themselves and their family to the waitlist,
              track their status, and receive timely updates and notifications.
              Enhance your healthcare experience with our comprehensive and
              user-friendly waitlist system.
            </Text>
          </Box>
        </BackgroundImage>
      </AspectRatio>
    </Container>
  );
}
