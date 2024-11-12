import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { json } from "@remix-run/node";
import {
  Paper,
  Title,
  Text,
  Stack,
  Container,
  Pagination,
  Flex,
  Group,
  Button,
} from "@mantine/core";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { searchParams } = new URL(request.url);
  const pageParam = searchParams.get("page");
  const page = pageParam ? parseInt(pageParam, 10) : 1;
  const itemsPerPage = 6;

  const [doctors, totalDoctors] = await Promise.all([
    prisma.doctor.findMany({
      skip: (page - 1) * itemsPerPage,
      take: itemsPerPage,
    }),
    prisma.doctor.count(),
  ]);

  return json({
    doctors,
    totalPages: Math.ceil(totalDoctors / itemsPerPage),
    currentPage: page,
  });
};

export const meta: MetaFunction = () => {
  return [
    { title: "Doctors" },
    { name: "description", content: "List of doctors" },
  ];
};

export default function Doctors() {
  const { doctors, totalPages } = useLoaderData<typeof loader>();
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

  return (
    <Container size="xl" pt="xl" mt="xl">
      <Title order={2} mb="xl">
        Doctors
      </Title>
      <Stack>
        {doctors.map((doctor) => (
          <Paper key={doctor.id} shadow="xs" p="md">
            <Flex align="center" justify="space-between">
              <div>
                <Text fw={500}>{doctor.name}</Text>
                <Text size="sm" c="dimmed">
                  {doctor.designation}
                </Text>
              </div>
              <Button radius={"xl"}>Waitlist</Button>
            </Flex>
          </Paper>
        ))}
      </Stack>

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
  );
}
