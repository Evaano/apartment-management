/* eslint-disable react/prop-types */
import "@mantine/core/styles.css";

import { MantineProvider, createTheme, ColorSchemeScript } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";

import { getUser } from "~/session.server";

import { Layout } from "~/components/layout/layout";

const theme = createTheme({
  fontFamily: "Segoe UI, sans-serif",
  primaryColor: "idk-pink",
  colors: {
    "idk-pink": [
      "#ffe9f2",
      "#ffd0e0",
      "#fb9fbe",
      "#f86b99",
      "#f5407b",
      "#f42667",
      "#f5175d",
      "#da094e",
      "#c30044",
      "#ac003a",
    ],
  },
});

export const meta: MetaFunction = ({ error }) => {
  return [{ title: error ? "oops!" : "Inventory" }];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUser(request);
  const isAdmin = user?.roleId === process.env.ADMIN_ROLE_ID;

  return json({ user, isAdmin });
};

export default function App() {
  const { user, isAdmin } = useLoaderData<typeof loader>();

  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
        <ColorSchemeScript />
        <title></title>
      </head>
      <body className="h-full">
        <MantineProvider theme={theme} defaultColorScheme={"light"}>
          <ModalsProvider>
            <Notifications />
            <Layout isAdmin={isAdmin}>
              <Outlet />
            </Layout>
            <ScrollRestoration />
            <Scripts />
          </ModalsProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
