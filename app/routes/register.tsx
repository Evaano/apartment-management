import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { z } from "zod";
import {
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Container,
  Title,
  Text,
  Box,
  Paper,
} from "@mantine/core";

import { createUser, getUserByEmail } from "~/models/user.server";
import { createUserSession, getUserId } from "~/session.server";
import { safeRedirect } from "~/utils";

const SignupSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  mobile: z.string().min(6, "Mobile must be at least 6 characters"),
  redirectTo: z.string(),
});

export const meta: MetaFunction = () => [{ title: "Sign Up" }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return json({});
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const rawData = {
    email: formData.get("email"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    password: formData.get("password"),
    redirectTo: formData.get("redirectTo"),
    mobile: formData.get("mobile"),
  };

  const validatedForm = SignupSchema.safeParse(rawData);

  if (!validatedForm.success) {
    return json(
      { errors: validatedForm.error.formErrors.fieldErrors },
      { status: 400 },
    );
  }

  const validatedData = validatedForm.data;

  const redirectTo = safeRedirect(validatedData.redirectTo, "/");

  const existingUser = await getUserByEmail(validatedData.email);
  if (existingUser) {
    throw new Response("User already exists", {
      status: 400,
      statusText: "User Already Exists",
    });
  }

  const username = `${validatedData.firstName.toLowerCase()}_${validatedData.lastName.toLowerCase()}`;

  const user = await createUser(
    validatedData.email,
    username,
    validatedData.password,
    validatedData.mobile,
  );

  if (!user) {
    throw new Response("Error creating user", {
      status: 500,
      statusText: "Internal Server Error",
    });
  }

  return createUserSession({
    redirectTo,
    remember: false,
    request,
    userId: user.id,
  });
};

export default function Join() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? undefined;
  const actionData = useActionData<typeof action>();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.firstName) {
      firstNameRef.current?.focus();
    } else if (actionData?.errors?.lastName) {
      lastNameRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);

  return (
    <Container size="xs" pt={{ md: "xl", base: 0 }} mt="xl">
      <Paper p="xl" shadow="xs" withBorder>
        <Title order={1} mb="lg">
          Register
        </Title>

        <Form method="post">
          <Stack gap="md">
            <TextInput
              ref={firstNameRef}
              label="First Name"
              name="firstName"
              required
              error={actionData?.errors?.firstName}
            />

            <TextInput
              ref={lastNameRef}
              label="Last Name"
              name="lastName"
              required
              error={actionData?.errors?.lastName}
            />

            <TextInput
              ref={emailRef}
              label="Email Address"
              name="email"
              type="email"
              required
              autoComplete="email"
              error={actionData?.errors?.email}
            />

            <TextInput
              ref={emailRef}
              label="Mobile No"
              name="mobile"
              required
              error={actionData?.errors?.mobile}
            />

            <PasswordInput
              ref={passwordRef}
              label="Password"
              name="password"
              required
              autoComplete="new-password"
              error={actionData?.errors?.password}
            />

            <input type="hidden" name="redirectTo" value={redirectTo} />

            <Button type="submit" fullWidth>
              Create Account
            </Button>
            <Text size="sm" c="dimmed">
              Already have an account?{" "}
              <Link
                style={{ color: "var(--mantine-color-blue-filled)" }}
                to={{
                  pathname: "/login",
                  search: searchParams.toString(),
                }}
              >
                Log in
              </Link>
            </Text>
          </Stack>
        </Form>
      </Paper>
    </Container>
  );
}
