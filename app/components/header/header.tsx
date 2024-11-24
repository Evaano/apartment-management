import {
  Avatar,
  Box,
  Burger,
  Container,
  Drawer,
  Group,
  Image,
  Menu,
  rem,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { Link } from "@remix-run/react";
import { IconChevronDown, IconLogout, IconSettings } from "@tabler/icons-react";
import { useState } from "react";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";

import { useOptionalUser } from "~/utils";

import classes from "./header.module.css";

interface HeaderProps {
  isAdmin: boolean;
}

export function Header({ isAdmin }: HeaderProps) {
  const user = useOptionalUser();
  const [, setUserMenuOpened] = useState(false);
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
    useDisclosure(false);
  const isMobile = useMediaQuery("(max-width: 767px)");

  const links = isAdmin
    ? [
        { link: "/admin/dashboard", label: "Dashboard" },
        { link: "/admin/tenants", label: "Tenants" },
        { link: "/admin/finances", label: "Finances" },
        { link: "/admin/reports", label: "Reports" },
        { link: "/admin/maintenance", label: "Maintenance" },
      ]
    : [
        { link: "/tenants/dashboard", label: "Dashboard" },
        { link: "/tenants/rent", label: "Rent Payment" },
        { link: "/tenants/lease", label: "Lease Info" },
        { link: "/tenants/maintenance", label: "Maintenance" },
      ];

  const handleLogout = async () => {
    const response = await fetch("/logout", { method: "POST" });
    if (response.ok) {
      window.location.href = "/";
    } else {
      console.error("Logout failed");
    }
  };

  const UserMenu = () => (
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
          component={Link}
          to={`/user/profile`}
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
  );

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
              src="https://i.imgur.com/1DJjs0E.png"
            />
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Group gap={5}>
              {links.map((link) => (
                <Link key={link.label} to={link.link} className={classes.link}>
                  {link.label}
                </Link>
              ))}
            </Group>
          )}

          {/* Mobile Hamburger */}

          {isMobile && <Burger opened={drawerOpened} onClick={toggleDrawer} />}

          {/* User Menu */}
          {user && (isMobile ? null : <UserMenu />)}

          {/* Mobile Navigation Drawer */}
          <Drawer
            opened={drawerOpened}
            onClose={closeDrawer}
            size="100%"
            padding="md"
            zIndex={1000000}
          >
            <Stack gap="xl" px={"lg"}>
              {/* User Info for Mobile */}
              {user && (
                <Group>
                  <Avatar
                    src={
                      "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-2.png"
                    }
                    alt={user?.email}
                    radius="xl"
                    size={40}
                  />
                  <div>
                    <Text fw={500}>{user?.email}</Text>
                  </div>
                </Group>
              )}

              {/* Mobile Navigation Links */}
              {links.map((link) => (
                <Link
                  key={link.label}
                  to={link.link}
                  className={classes.link}
                  onClick={closeDrawer}
                >
                  {link.label}
                </Link>
              ))}

              {/* User Menu Items in Mobile Drawer */}
              {user && isMobile && (
                <>
                  <Link
                    to="/user/profile"
                    className={classes.link}
                    onClick={closeDrawer}
                  >
                    Account Settings
                  </Link>
                  <UnstyledButton
                    onClick={() => {
                      handleLogout().then(() => closeDrawer());
                    }}
                    className={classes.link}
                  >
                    Logout
                  </UnstyledButton>
                </>
              )}
            </Stack>
          </Drawer>
        </div>
      </Container>
    </header>
  );
}
