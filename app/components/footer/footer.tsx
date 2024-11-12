import { Container, Group, ActionIcon, rem } from "@mantine/core";
import {
  IconBrandTwitter,
  IconBrandYoutube,
  IconBrandInstagram,
} from "@tabler/icons-react";
import classes from "./footer.module.css";
import { ToggleButton } from "~/components/toggle-button/toggle-button";

export function Footer() {
  return (
    <Container className={classes.inner} size={"xl"}>
      <Group gap={0} className={classes.links} justify="flex-end" wrap="nowrap">
        <ActionIcon size="lg" color="gray" variant="subtle">
          <IconBrandTwitter
            style={{ width: rem(18), height: rem(18) }}
            stroke={1.5}
          />
        </ActionIcon>
        <ActionIcon size="lg" color="gray" variant="subtle">
          <IconBrandYoutube
            style={{ width: rem(18), height: rem(18) }}
            stroke={1.5}
          />
        </ActionIcon>
        <ActionIcon size="lg" color="gray" variant="subtle">
          <IconBrandInstagram
            style={{ width: rem(18), height: rem(18) }}
            stroke={1.5}
          />
        </ActionIcon>
      </Group>
      <ToggleButton />
    </Container>
  );
}
