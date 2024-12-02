import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  MetaFunction,
  redirect,
  SerializeFrom,
} from "@remix-run/node";
import { requireUserId } from "~/session.server";
import { safeRedirect } from "~/utils";

import {
  Button,
  FileInput,
  Flex,
  Grid,
  Modal,
  Paper,
  Stack,
  Text,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { MainContainer } from "~/components/main-container/main-container";
import { prisma } from "~/db.server";
import { Form, useLoaderData } from "@remix-run/react";
import { useDisclosure } from "@mantine/hooks";
import { uploadHandler } from "~/models/utils.server";
import { parseMultipartFormData } from "@remix-run/server-runtime/dist/formData";
import { useRef, useState } from "react";
import { z } from "zod";
import { Billing, User } from "@prisma/client";
import type { Lease } from "~/models/lease.server";

type BillingWithRelations = Billing & {
  lease: (Lease & { user?: User }) | null;
};

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

  const paidPayments = await prisma.billing.findMany({
    where: {
      deletedAt: null,
      leaseId: leaseInfo.id,
      status: "paid",
    },
    orderBy: {
      paymentDate: "desc",
    },
    include: {
      lease: {
        include: {
          user: true,
        },
      },
    },
  });

  const unpaidPayments = await prisma.billing.findMany({
    where: {
      deletedAt: null,
      leaseId: leaseInfo.id,
      status: "pending",
      paymentDate: null,
    },
    orderBy: {
      paymentDate: "desc",
    },
    include: {
      lease: {
        include: {
          user: true,
        },
      },
    },
  });

  return { paidPayments, unpaidPayments };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { searchParams } = new URL(request.url);
  const redirectTo = safeRedirect(searchParams.get("redirectTo"), "/");
  const userId = await requireUserId(request, redirectTo);

  if (!userId) {
    return redirect(redirectTo);
  }

  const formData = await parseMultipartFormData(request, uploadHandler);
  const file = formData.get("file");

  console.log(file);

  const formObject = {
    billId: formData.get("billId"),
    paymentDate: formData.get("paymentDate"),
  };

  const formSchema = z.object({
    billId: z.string().cuid(),
  });

  const validatedForm = formSchema.safeParse(formObject);

  if (!validatedForm.success) {
    console.log(validatedForm.error.format());
    return json({ errors: validatedForm.error.flatten() }, { status: 400 });
  }

  const validatedData = validatedForm.data;

  console.log(validatedData);

  let filePath = "";

  if (file && typeof file !== "string") {
    // Ensure that file is not null before accessing its properties
    filePath = `public/uploads/${file.name}`;
  }

  await prisma.billing.update({
    where: {
      id: validatedData.billId,
    },
    data: {
      paymentDate: new Date(),
      filepath: filePath || null,
    },
  });

  return json({ errors: null }, { status: 200 });
};

export default function TenantsRent() {
  const { paidPayments, unpaidPayments } = useLoaderData<typeof loader>();
  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";
  const [opened, { open, close }] = useDisclosure(false);
  const [file, setFile] = useState<File | null>(null);
  const [selectedPayment, setSelectedPayment] =
    useState<SerializeFrom<BillingWithRelations> | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [openedDetailsModal, { open: openDetails, close: closeDetails }] =
    useDisclosure(false);
  const [selectedPaymentDetails, setSelectedPaymentDetails] =
    useState<SerializeFrom<BillingWithRelations> | null>(null);

  const handleViewDetails = (payment: SerializeFrom<BillingWithRelations>) => {
    setSelectedPayment(payment);
    open();
  };

  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile) {
      if (selectedFile.size <= 1024 * 1024) {
        // 1MB = 1024 * 1024 bytes
        setFile(selectedFile);
      } else {
        setFile(null);
      }
    } else {
      setFile(null);
    }
  };

  return (
    <MainContainer title="Rent">
      <Grid>
        <Grid.Col span={12}>
          <Paper shadow="xs" p="md" withBorder>
            <Title order={3}>Payment Details</Title>
            <Flex direction="column" gap="md">
              {unpaidPayments && unpaidPayments.length > 0 ? (
                unpaidPayments.map((payment) => (
                  <Paper
                    shadow="xs"
                    p="md"
                    mt={"md"}
                    bg={dark ? "dark" : "gray.1"}
                    key={payment.id}
                  >
                    <Flex direction="row" gap="md">
                      <Text>Payment Amount:</Text>
                      <Text>${payment?.amount || "N/A"}</Text>
                    </Flex>
                    <Flex direction="row" gap="md">
                      <Text>Due Date:</Text>
                      <Text>
                        {payment?.dueDate
                          ? `Due: ${new Date(
                              payment.dueDate,
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}`
                          : "N/A"}
                      </Text>
                    </Flex>
                    <Flex direction="row" gap="md">
                      <Text>Details:</Text>
                      <Text>
                        {payment?.description || "No details available"}
                      </Text>
                    </Flex>
                    <Flex>
                      <Button
                        mt="md"
                        onClick={() => handleViewDetails(payment)}
                      >
                        Pay Now
                      </Button>
                    </Flex>
                  </Paper>
                ))
              ) : (
                <Text>No unpaid payment records found.</Text>
              )}
            </Flex>
          </Paper>
        </Grid.Col>

        {/* Payment Summary Section */}
        <Grid.Col span={12}>
          <Paper shadow="xs" p="md" withBorder>
            <Title order={3}>Payment Summary</Title>
            <Flex direction="column" gap="md" mt={"md"}>
              {paidPayments && paidPayments.length > 0 ? (
                paidPayments.map((payment) => (
                  <Paper
                    shadow="xs"
                    p="md"
                    bg={dark ? "dark" : "gray.1"}
                    key={payment.id}
                  >
                    <Flex direction="row" justify="space-between">
                      <Text>{payment.description}</Text>
                      <Button
                        variant="light"
                        mt="md"
                        onClick={() => {
                          setSelectedPaymentDetails(payment);
                          openDetails();
                        }}
                      >
                        Details
                      </Button>
                    </Flex>
                  </Paper>
                ))
              ) : (
                <Text>No paid payment records found.</Text>
              )}
            </Flex>
          </Paper>
        </Grid.Col>
      </Grid>

      <Modal
        opened={opened}
        onClose={close}
        title="Upload Payment Slip"
        centered
        size="lg"
      >
        <Form
          method="post"
          encType="multipart/form-data"
          autoComplete={"off"}
          ref={formRef}
        >
          <input type={"hidden"} value={selectedPayment?.id} name={"billId"} />
          <FileInput
            label={"Upload"}
            name="file"
            variant="filled"
            placeholder="PDF or Img"
            accept=".pdf,.jpg,.jpeg,.png"
            clearable
            value={file}
            onChange={handleFileChange}
          />
          <Stack mt={"md"}>
            <Button onClick={close} color={"red"}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="filled"
              name="_action"
              value="add"
              onSubmit={close}
            >
              Submit
            </Button>
          </Stack>
        </Form>
      </Modal>

      <Modal
        opened={openedDetailsModal}
        onClose={closeDetails}
        title="Payment Details"
        centered
        size="lg"
      >
        {selectedPaymentDetails && (
          <Flex direction="column" gap="md">
            <Text>
              <strong>Amount:</strong> ${selectedPaymentDetails.amount}
            </Text>
            <Text>
              <strong>Payment Date:</strong>{" "}
              {selectedPaymentDetails.paymentDate
                ? new Date(
                    selectedPaymentDetails.paymentDate,
                  ).toLocaleDateString()
                : "N/A"}
            </Text>
            <Text>
              <strong>Description:</strong>{" "}
              {selectedPaymentDetails.description || "No details available"}
            </Text>
            <Text>
              <strong>Lease Information:</strong>{" "}
              {selectedPaymentDetails.lease?.user?.name || "N/A"}
            </Text>
          </Flex>
        )}
      </Modal>
    </MainContainer>
  );
}
