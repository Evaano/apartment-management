import {
  Container,
  Avatar,
  UnstyledButton,
  Group,
  Text,
  Menu,
  rem,
  useMantineTheme,
  Box,
  Center,
  Image,
  Button,
} from "@mantine/core";
import { Link } from "@remix-run/react";
import { IconLogout, IconSettings, IconChevronDown } from "@tabler/icons-react";
import { useState } from "react";

import { useOptionalUser } from "~/utils";

import classes from "./header.module.css";

const links = [
  { link: "/doctors/list", label: "Home" },
  { link: "/user/family", label: "Add Immediate Family" },
  {
    link: "#2",
    label: "Management",
    links: [
      { link: "/doctors/add", label: "Add Doctor" },
      { link: "/audit-log", label: "Audit Logs" },
    ],
  },
  { link: "/contact", label: "Contact Us" },
];

export function Header() {
  const user = useOptionalUser();
  const theme = useMantineTheme();
  const [, setUserMenuOpened] = useState(false);

  // Conditionally render nav items based on user presence
  const items = user
    ? links.map((link) => {
        const menuItems = link.links?.map((item) => (
          <Menu.Item key={item.link}>
            <Link to={item.link} className={classes.link}>
              {item.label}
            </Link>
          </Menu.Item>
        ));

        if (menuItems) {
          return (
            <Menu
              key={link.label}
              trigger="hover"
              transitionProps={{ exitDuration: 0 }}
              withinPortal
              radius={"md"}
            >
              <Menu.Target>
                <a
                  href={link.link}
                  className={classes.link}
                  onClick={(event) => event.preventDefault()}
                >
                  <Center>
                    <span className={classes.linkLabel}>{link.label}</span>
                    <IconChevronDown size="0.9rem" stroke={1.5} />
                  </Center>
                </a>
              </Menu.Target>
              <Menu.Dropdown>{menuItems}</Menu.Dropdown>
            </Menu>
          );
        }

        return (
          <Link key={link.label} to={link.link} className={classes.link}>
            {link.label}
          </Link>
        );
      })
    : links
        .filter((link) => link.label === "Home" || link.label === "Contact Us")
        .map((link) => (
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
            <UnstyledButton
              component={Link}
              to="/login"
              className={classes.loginButton}
            >
              <Group gap={7}>
                <Button variant="filled" radius="xl">
                  Login
                </Button>{" "}
              </Group>
            </UnstyledButton>
          )}
        </div>
      </Container>
    </header>
  );
}
