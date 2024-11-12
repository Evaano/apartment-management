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
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import { getUser } from "~/session.server";

import { Layout } from "~/components/layout/layout";

const theme = createTheme({
  fontFamily: "Segoe UI, sans-serif",
  primaryColor: "hospital-green",
  colors: {
    "hospital-green": [
      "#f1faea",
      "#e4f1db",
      "#c8e2b8",
      "#abd292",
      "#91c572",
      "#81bc5d",
      "#78b851",
      "#66a241",
      "#588f38",
      "#4a7c2b",
    ],
    "hospital-blue": [
      "#e1fcff",
      "#ccf3ff",
      "#9de5fd",
      "#6ad6fb",
      "#44c9f9",
      "#2ec2f9",
      "#1dbefa",
      "#04a7df",
      "#0094c8",
      "#0080b1",
    ],
  },
});

export const meta: MetaFunction = ({ error }) => {
  return [{ title: error ? "oops!" : "Inventory" }];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return json({ user: await getUser(request) });
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
