import { AppShell, Container, rem } from "@mantine/core";
import { ReactNode } from "react";

import { Header } from "~/components/header/header";
import { Footer } from "~/components/footer/footer";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <AppShell>
      <AppShell.Header>
        <Header />
      </AppShell.Header>
      <main
        style={{
          paddingTop: "10px",
          marginTop: "60px",
          marginBottom: "40px",
        }}
      >
        <Container size={"xl"}>{children}</Container>
      </main>
      <AppShell.Footer p="md">
        <Footer />
      </AppShell.Footer>
    </AppShell>
  );
}
