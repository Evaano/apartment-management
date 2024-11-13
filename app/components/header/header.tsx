import {
  Container,
  Avatar,
  UnstyledButton,
  Group,
  Text,
  Menu,
  rem,
  Box,
  Image,
} from "@mantine/core";
import { Link } from "@remix-run/react";
import { IconLogout, IconSettings, IconChevronDown } from "@tabler/icons-react";
import { useState } from "react";

import { useOptionalUser } from "~/utils";

import classes from "./header.module.css";

interface HeaderProps {
  isAdmin: boolean;
}

export function Header({ isAdmin }: HeaderProps) {
  const user = useOptionalUser();
  const [, setUserMenuOpened] = useState(false);

  const links = isAdmin
    ? [
        { link: "/", label: "Dashboard" },
        { link: "/", label: "Tenants" },
        { link: "/", label: "Finances" },
        { link: "/", label: "Reports" },
        { link: "/", label: "Maintenance" },
      ]
    : [
        { link: "/", label: "Dashboard" },
        { link: "/", label: "Rent Payment" },
        { link: "/", label: "Lease Info" },
        { link: "/", label: "Maintenance" },
      ];

  const items = links.map((link) => (
    <Link key={link.label} to={link.link} className={classes.link}>
      {link.label}
    </Link>
  ));

  const handleLogout = async () => {
    const response = await fetch("/logout", { method: "POST" });
    if (response.ok) {
      window.location.href = "/";
    } else {
      console.error("Logout failed");
    }
  };

  return (
    <header className={classes.header}>
      <Container size="xl">
        <div className={classes.inner}>
          <Box>
            <Image
              radius="md"
              h={60}
              w="auto"
              fit="contain"
              src="https://imgur.com/fkVVyJO.png"
            />
          </Box>
          <Group gap={5} visibleFrom="sm">
            {items}
          </Group>
          {user ? (
            <Menu
              width={260}
              position="bottom-end"
              radius={"md"}
              transitionProps={{ transition: "pop-top-right" }}
              onClose={() => setUserMenuOpened(false)}
              onOpen={() => setUserMenuOpened(true)}
              withinPortal
            >
              <Menu.Target>
                <UnstyledButton>
                  <Group gap={7}>
                    <Avatar
                      src={
                        "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-2.png"
                      }
                      alt={user?.email}
                      radius="xl"
                      size={20}
                    />
                    <Text fw={500} size="sm" lh={1} mr={3}>
                      {user?.email}
                    </Text>
                    <IconChevronDown
                      style={{ width: rem(12), height: rem(12) }}
                      stroke={1.5}
                    />
                  </Group>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Settings</Menu.Label>
                <Menu.Item
                  leftSection={
                    <IconSettings
                      style={{ width: rem(16), height: rem(16) }}
                      stroke={1.5}
                    />
                  }
                >
                  Account settings
                </Menu.Item>
                <Menu.Item
                  onClick={handleLogout}
                  leftSection={
                    <IconLogout
                      style={{ width: rem(16), height: rem(16) }}
                      stroke={1.5}
                    />
                  }
                >
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          ) : (
            <></>
          )}
        </div>
      </Container>
    </header>
  );
}
