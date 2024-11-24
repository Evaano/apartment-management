import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { requireUserId } from "~/session.server";
import { safeRedirect } from "~/utils";

import {
  Button,
  Flex,
  Grid,
  Paper,
  Stack,
  Text,
  Textarea,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
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

export default function TenantsDashboard({ isAdmin }: { isAdmin: boolean }) {
  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";
  const isMobile = useMediaQuery("(max-width: 768px)");

  const requestSummaryItems = [
    "Broken pipe in bathroom",
    "Leaky faucet in kitchen",
    "Broken heater in living room",
  ];

  const RequestForm = () => (
    <Paper py={7} mih={{ base: "auto", md: 600 }}>
      <Textarea
        placeholder="Describe the maintenance issue..."
        mt="md"
        autosize
        minRows={2}
        maxRows={20}
      />
      <Button mt="md">Submit</Button>
    </Paper>
  );

  const RequestSummary = () => (
    <Paper py={"md"} pl={{ base: 0, md: "sm" }} mih={600}>
      <Title order={4}>Request Summary</Title>
      <Stack pt={"md"}>
        {requestSummaryItems.map((item, index) => (
          <Paper key={index} shadow="xs" p="md" bg={dark ? "dark" : "gray.1"}>
            <Flex direction="row" justify="space-between">
              <Text px={"xs"}>{item}</Text>
              <Button variant="light" size="xs" w={{ base: 70, md: "auto" }}>
                View
              </Button>
            </Flex>
          </Paper>
        ))}
      </Stack>
    </Paper>
  );

  return (
    <MainContainer title={"Maintenance Request"}>
      <Grid>
        {isMobile ? (
          <>
            <Grid.Col span={12}>
              <RequestForm />
            </Grid.Col>
            <Grid.Col span={12}>
              <RequestSummary />
            </Grid.Col>
          </>
        ) : (
          <>
            <Grid.Col span={6}>
              <RequestForm />
            </Grid.Col>
            <Grid.Col span={6}>
              <RequestSummary />
            </Grid.Col>
          </>
        )}
      </Grid>
    </MainContainer>
  );
}
