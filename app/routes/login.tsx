import {
  Button,
  Checkbox,
  Container,
  Flex,
  Paper,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import type {
  ActionFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import { useRef } from "react";
import { z } from "zod";

import { verifyLogin } from "~/models/user.server";
import { createUserSession, getUserId } from "~/session.server";
import { useOptionalUser } from "~/utils";

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
      email: z.string().email("Invalid email address"),
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
    return json({ errors: { user: "User not found" } }, { status: 400 });
  }

  return createUserSession({
    redirectTo: validatedData.redirectTo,
    remember: validatedData.remember === "on",
    request,
    userId: user.id,
    userRole: user.role.name,
  });
};

export default function Login() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";
  const actionData = useActionData<typeof action>();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const user = useOptionalUser();
  console.log(user?.roleId);

  return (
    <Container size="xs" pt={120} mt="xl">
      <Paper p="xl" shadow="xs" withBorder>
        <Title order={1} mb="lg">
          Login
        </Title>
        <Form method="post" className="space-y-6">
          <Flex direction="column" align="center" gap="md">
            <TextInput
              ref={emailRef}
              id="email"
              name="email"
              label="Username"
              variant="filled"
              type="text"
              autoComplete="email"
              error={actionData?.errors?.email || actionData?.errors?.user}
              w={{ md: 440, base: 260 }}
            />
            <TextInput
              ref={passwordRef}
              id="password"
              name="password"
              label="Password"
              variant="filled"
              type="password"
              autoComplete="current-password"
              error={actionData?.errors?.password}
              w={{ md: 440, base: 260 }}
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
          <Text size="sm" c="dimmed" pt={"md"}>
            Dont have an account?{" "}
            <Link
              style={{ color: "var(--mantine-color-blue-filled)" }}
              to={{
                pathname: "/register",
                search: searchParams.toString(),
              }}
            >
              Register
            </Link>
          </Text>
        </Form>
      </Paper>
    </Container>
  );
}
