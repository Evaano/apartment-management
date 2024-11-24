import { Container, Paper, ScrollArea, Title } from "@mantine/core";
import { ReactNode } from "react";
import { useMediaQuery } from "@mantine/hooks";

interface MainContainerProps {
  children: ReactNode;
  title?: string;
}

export function MainContainer({ children, title }: MainContainerProps) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  return (
    <Container fluid my={110} mx={9} maw={isMobile ? "95%" : "100%"}>
      <Paper withBorder radius="md" p="md">
        {title && (
          <Title order={3} px={"md"}>
            {title}
          </Title>
        )}
        <ScrollArea h={"64vh"} mt="md" offsetScrollbars scrollbarSize={7}>
          <Paper px={"md"}> {children}</Paper>
        </ScrollArea>
      </Paper>
    </Container>
  );
}
