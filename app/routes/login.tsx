import {
  Button,
  Checkbox,
  Container,
  Flex,
  Paper,
  TextInput,
  Text,
} from "@mantine/core";
import type {
  ActionFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useSearchParams } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { z } from "zod";

import { verifyLogin } from "~/models/user.server";
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

  const user = await verifyLogin(validatedData.email, validatedData.password);

  if (!user) {
    throw new Response(null, {
      status: 404,
      statusText: "User Not Found",
    });
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
  const redirectTo = searchParams.get("redirectTo") || "/";
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
                <Checkbox
                  id="remember"
                  name="remember"
                  style={{ marginRight: 8 }}
                />
                <Text>Remember me</Text>
              </div>
            </Flex>
          </Flex>
        </Form>
      </Paper>
    </Container>
  );
}
