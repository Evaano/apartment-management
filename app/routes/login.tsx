import { Button, Container, Flex, Paper, TextInput } from "@mantine/core";
import type {
  ActionFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useSearchParams } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { z } from "zod";

import { createUser, getUserByEmail } from "~/models/user.server";
import { createUserSession, getUserId } from "~/session.server";

export const meta: MetaFunction = () => [{ title: "Login" }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return json({});
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const { ...form } = Object.fromEntries(formData);

  const validatedForm = z
    .object({
      email: z
        .string()
        .min(1, { message: "Username cannot be empty" })
        .transform((val) => val.toLowerCase()),
      password: z.string().min(1, { message: "Password cannot be empty" }),
      redirectTo: z.string(),
      remember: z.string().optional(),
    })
    .safeParse(form);

  if (!validatedForm.success) {
    return json(
      { errors: validatedForm.error.formErrors.fieldErrors },
      { status: 400 },
    );
  }

  const validatedData = validatedForm.data;

  // AD Authentication
  const loginFormData = new FormData();
  loginFormData.append("username", validatedData.email);
  loginFormData.append("password", validatedData.password);

  const response = await fetch(`${process.env.API_URL}`, {
    method: "POST",
    body: loginFormData,
  });

  if (!response.ok) {
    return json(
      { errors: { email: "Invalid username or password", password: null } },
      { status: 400 },
    );
  }

  const data = await response.json();

  if (!data.status && data.is_aduser) {
    return json(
      { errors: { email: "Username and password incorrect", password: null } },
      { status: 400 },
    );
  } else if (!data.status && !data.is_aduser) {
    return json(
      { errors: { email: "Username and password incorrect", password: null } },
      { status: 400 },
    );
  }

  // Check if user exists in the local database
  let user = await getUserByEmail(validatedData.email);

  if (!user) {
    const username = JSON.parse(data.data).fullname;
    user = await createUser(validatedData.email, username);
  }

  if (!user) {
    return json(
      {
        errors: { email: "Failed to create or retrieve user", password: null },
      },
      { status: 500 },
    );
  }

  return createUserSession({
    redirectTo: validatedData.redirectTo,
    remember: validatedData.remember === "on",
    request,
    userId: user.id,
  });
};

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/doctors/list";
  const actionData = useActionData<typeof action>();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);

  return (
    <Container size="xs" pt="xl" mt="xl">
      <Paper p="xl" shadow="xs" withBorder>
        <Form method="post" className="space-y-6">
          <Flex direction="column" align="center" gap="md">
            <TextInput
              ref={emailRef}
              id="email"
              name="email"
              placeholder="Your Hmh username"
              label="Username"
              variant="filled"
              type="text"
              autoComplete="email"
              error={actionData?.errors?.email}
              style={{
                width: 450,
              }}
            />
            <TextInput
              ref={passwordRef}
              id="password"
              name="password"
              label="Password"
              placeholder="Login Password"
              variant="filled"
              type="password"
              autoComplete="current-password"
              error={actionData?.errors?.password}
              style={{
                width: 450,
              }}
            />
            <input type="hidden" name="redirectTo" value={redirectTo} />
            <Flex
              direction="row"
              align="center"
              justify="space-between"
              style={{ width: "100%" }}
              mt={"md"}
            >
              <Button type="submit">Log in</Button>
              <div style={{ display: "flex", alignItems: "center" }}>
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  style={{ marginRight: 8 }}
                />
                <label htmlFor="remember" style={{ color: "#04a7df" }}>
                  Remember me
                </label>
              </div>
            </Flex>
          </Flex>
        </Form>
      </Paper>
    </Container>
  );
}
