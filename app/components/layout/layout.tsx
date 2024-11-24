import { AppShell, Container, RemoveScroll } from "@mantine/core";
import classes from "~/components/layout/layout.module.css";
import { Header } from "~/components/header/header";
import { Footer } from "~/components/footer/footer";

interface ShellProps {
  children: React.ReactNode;
  isAdmin: boolean;
}

export function Layout({ children, isAdmin }: ShellProps) {
  return (
    <AppShell header={{ height: 81 }}>
      <AppShell.Header className={RemoveScroll.classNames.zeroRight}>
        <Container size="xl" px="md" className={classes.inner}>
          <Header isAdmin={isAdmin} />
        </Container>
      </AppShell.Header>
      <main>{children}</main>
      <AppShell.Footer>
        <Footer />
      </AppShell.Footer>
    </AppShell>
  );
}
