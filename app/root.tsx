/* eslint-disable react/prop-types */
import "@mantine/core/styles.css";

import { ColorSchemeScript, createTheme, MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";
import "@mantine/charts/styles.css";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import { getUser } from "~/session.server";

import { Layout } from "~/components/layout/layout";

const theme = createTheme({
  fontFamily: "Segoe UI, sans-serif",
  primaryColor: "primary-blue",
  colors: {
    "primary-blue": [
      "#eeeeff",
      "#dadaf8",
      "#b2b2ea",
      "#8787dd",
      "#6462d1",
      "#4d4bcb",
      "#4140c8",
      "#3232b2",
      "#2b2ca0",
      "#21258e",
    ],
  },
});

export const meta: MetaFunction = ({ error }) => {
  return [{ title: error ? "oops!" : "Inventory" }];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUser(request);

  return json({
    user,
  });
};

export default function App() {
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
            <Layout>
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
