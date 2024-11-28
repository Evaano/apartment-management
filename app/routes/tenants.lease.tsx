import {
  json,
  LoaderFunctionArgs,
  MetaFunction,
  redirect,
} from "@remix-run/node";
import { requireUserId } from "~/session.server";
import { safeRedirect } from "~/utils";

import { Flex, Grid, Paper, Text, useMantineColorScheme } from "@mantine/core";
import { MainContainer } from "~/components/main-container/main-container";
import { prisma } from "~/db.server";
import { useLoaderData } from "@remix-run/react";

export const meta: MetaFunction = () => [{ title: "User Management" }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { searchParams } = new URL(request.url);
  const redirectTo = safeRedirect(searchParams.get("redirectTo"), "/");
  const userId = await requireUserId(request, redirectTo);

  if (!userId) {
    return redirect(redirectTo);
  }

  const leaseInfo = await prisma.lease.findUnique({
    where: {
      deletedAt: null,
      userId: userId,
    },
    include: {
      user: true,
    },
  });

  if (!leaseInfo) {
    throw new Response("Lease info not found", {
      status: 404,
    });
  }

  return json({ leaseInfo });
};

export default function TenantsLease() {
  const { leaseInfo } = useLoaderData<typeof loader>();
  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";

  return (
    <MainContainer title="Lease Info">
      <Grid>
        <Grid.Col span={12} key={leaseInfo.id}>
          <Paper shadow="xs" p="md" withBorder mih={600}>
            <Flex direction="column" gap="md">
              <Paper shadow="xs" p="md" mt="md" bg={dark ? "dark" : "gray.1"}>
                <Text>
                  <strong>Tenant Name:</strong> {leaseInfo.user?.name || "N/A"}
                  <br />
                  <strong>Property Address:</strong>{" "}
                  {leaseInfo.propertyDetails || "N/A"}
                  <br />
                  <strong>Lease Term:</strong>{" "}
                  {new Date(leaseInfo.startDate).toLocaleDateString()} to{" "}
                  {new Date(leaseInfo.endDate).toLocaleDateString()}
                  <br />
                  <strong>Monthly Rent:</strong> $
                  {leaseInfo.rentAmount.toLocaleString()}
                  <br />
                  <strong>Security Deposit:</strong> $
                  {leaseInfo.securityDeposit.toLocaleString()}
                  <br />
                  <strong>Maintenance Fee:</strong> $
                  {leaseInfo.maintenanceFee.toLocaleString()}
                  <br />
                  <br />
                  <strong>Created At:</strong>{" "}
                  {new Date(leaseInfo.createdAt).toLocaleDateString()}
                  <br />
                  <strong>Last Updated:</strong>{" "}
                  {new Date(leaseInfo.updatedAt).toLocaleDateString()}
                </Text>
              </Paper>
            </Flex>
          </Paper>
        </Grid.Col>
      </Grid>
    </MainContainer>
  );
}
