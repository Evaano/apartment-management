import {
  Badge,
  Card,
  Container,
  Flex,
  Group,
  Pagination,
  Paper,
  Text,
} from "@mantine/core";
import {
  json,
  LoaderFunctionArgs,
  MetaFunction,
  redirect,
} from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { format } from "date-fns";

import { getUser } from "~/session.server";
import { safeRedirect } from "~/utils";
import { prisma } from "~/db.server";

export const meta: MetaFunction = () => [{ title: "Action Log" }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { searchParams } = new URL(request.url);
  const redirectTo = safeRedirect(searchParams.get("redirectTo"), "/");
  const user = await getUser(request);
  const pageParam = searchParams.get("page");
  const page = pageParam ? parseInt(pageParam, 10) : 1;
  const logsPerPage = 5;

  if (!user) {
    return redirect(redirectTo);
  }

  const [logs, totalCount] = await prisma.$transaction([
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * logsPerPage,
      take: logsPerPage,
    }),
    prisma.auditLog.count(),
  ]);

  const totalPages = Math.ceil(totalCount / logsPerPage);

  return json({ logs, totalCount, totalPages });
};

export default function AuditLog() {
  const { logs, totalPages } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  const handleSearchParamsChange = (
    searchParams: URLSearchParams,
    key: string,
    value: string,
  ) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set(key, value);
    return newSearchParams;
  };

  const logsByDate = logs.reduce(
    (groups: Record<string, (typeof logs)[0][]>, log) => {
      const date = format(new Date(log.createdAt), "yyyy-MM-dd");
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(log);
      return groups;
    },
    {},
  );

  return (
    <Paper>
      <Container size="xl" pt="xl" mt="xl">
        <Card>
          <Text>Logs</Text>
          {Object.entries(logsByDate).map(([date, logs]) => (
            <div key={date}>
              <Text>{date}</Text>
              {logs.map((log) => (
                <Card key={log.id}>
                  <Flex
                    mih={50}
                    gap="md"
                    justify="space-between"
                    align="center"
                    direction="row"
                    wrap="wrap"
                  >
                    <Text>{log.action}</Text>
                    <Badge color={"hospital-blue"}>
                      {new Date(log.createdAt).toLocaleString()}
                    </Badge>
                  </Flex>
                  <Text size="sm" c="dimmed" mt={4}>
                    {log.person}
                  </Text>
                </Card>
              ))}
            </div>
          ))}
        </Card>

        <Flex justify="space-between" align="center" mt="lg">
          <Flex justify="center" style={{ flexGrow: 1 }}>
            <Pagination.Root
              total={totalPages}
              onChange={(newPage) => {
                const newSearchParams = handleSearchParamsChange(
                  searchParams,
                  "page",
                  String(newPage),
                );
                setSearchParams(newSearchParams);
              }}
            >
              <Group gap={"sm"} mt="lg">
                <Pagination.First />
                <Pagination.Previous />
                <Pagination.Items />
                <Pagination.Next />
                <Pagination.Last />
              </Group>
            </Pagination.Root>
          </Flex>
        </Flex>
      </Container>
    </Paper>
  );
}
