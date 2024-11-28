import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { requireUserId } from "~/session.server";
import { safeRedirect } from "~/utils";

import {
  Button,
  Flex,
  Grid,
  Paper,
  Text,
  Title,
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

export default function TenantsRent() {
  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";

  return (
    <MainContainer title="Rent">
      <Grid>
        <Grid.Col span={12}>
          <Paper shadow="xs" p="md" withBorder>
            <Title order={3}>Payment Details</Title>
            <Flex direction="column" gap="md">
              <Paper shadow="xs" p="md" mt={"md"} bg={dark ? "dark" : "gray.1"}>
                <Flex direction="row" gap="md">
                  <Text>Payment Amount:</Text>
                  <Text>$1,200</Text>
                </Flex>
                <Flex direction="row" gap="md">
                  <Text>Due Date:</Text>
                  <Text>2024-12-01</Text>
                </Flex>
                <Flex direction="row" gap="md">
                  <Text>Details:</Text>
                  <Text>Rent payment for December 2024</Text>
                </Flex>
                <Flex>
                  <Button mt="md">Pay Now</Button>
                </Flex>
              </Paper>
            </Flex>
          </Paper>
        </Grid.Col>
        <Grid.Col span={12}>
          <Paper shadow="xs" p="md" withBorder>
            <Title order={3}>Payment Summary</Title>
            <Flex direction="column" gap="md" mt={"md"}>
              <Paper shadow="xs" p="md" bg={dark ? "dark" : "gray.1"}>
                <Flex direction="row" justify="space-between">
                  <Text>Rent Payment</Text>
                  <Button variant="light" mt="md">
                    Details
                  </Button>
                </Flex>
              </Paper>
              <Paper shadow="xs" p="md" bg={dark ? "dark" : "gray.1"}>
                <Flex direction="row" justify="space-between">
                  <Text>Utility Payment</Text>
                  <Button variant="light" mt="md">
                    Details
                  </Button>
                </Flex>
              </Paper>
              <Paper shadow="xs" p="md" bg={dark ? "dark" : "gray.1"}>
                <Flex direction="row" justify="space-between">
                  <Text>Late Fees</Text>
                  <Button variant="light" mt="md">
                    Details
                  </Button>
                </Flex>
              </Paper>
            </Flex>
          </Paper>
        </Grid.Col>
      </Grid>
    </MainContainer>
  );
}
