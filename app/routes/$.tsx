import { Center, Container, Title } from "@mantine/core";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => [{ title: "Welcome" }];

export default function Index() {
  return (
    <Container size={"xl"} pt={"xl"} mt={"xl"}>
      <Center>
        <Title order={1}>Might wanna look at the URL</Title>
      </Center>
    </Container>
  );
}
