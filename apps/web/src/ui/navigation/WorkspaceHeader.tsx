"use client";

import {
  ActionIcon,
  Avatar,
  Button,
  Group,
  Menu,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import {
  Bell,
  ChevronDown,
  LogOut,
  Plus,
  Search,
  Settings,
  UserRound,
} from "lucide-react";

import styles from "./shell.module.scss";

interface WorkspaceHeaderProps {
  userName: string;
  onCreateOrganization?: () => void;
  onLogout?: () => void;
}

export default function WorkspaceHeader({
  userName,
  onCreateOrganization,
  onLogout,
}: WorkspaceHeaderProps) {
  const initials =
    userName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U";

  return (
    <header className={styles.topbar}>
      <TextInput
        className={styles.search}
        placeholder="Search anything..."
        leftSection={<Search size={16} />}
        rightSection={
          <Text size="xs" c="dimmed">
            Ctrl K
          </Text>
        }
        size="sm"
        radius="md"
        aria-label="Search"
      />

      <Group gap="sm" wrap="nowrap">
        <Button
          size="sm"
          leftSection={<Plus size={16} />}
          onClick={onCreateOrganization}
        >
          New organization
        </Button>

        <Menu shadow="md" width={220} position="bottom-end">
          <Menu.Target>
            <Tooltip label="Notifications">
              <ActionIcon
                variant="subtle"
                color="gray"
                size="lg"
                aria-label="Notifications"
              >
                <Bell size={19} />
              </ActionIcon>
            </Tooltip>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>Notifications</Menu.Label>
            <Text size="sm" c="dimmed" px="sm" py="xs">
              You&apos;re all caught up.
            </Text>
          </Menu.Dropdown>
        </Menu>

        <Menu shadow="md" width={200} position="bottom-end">
          <Menu.Target>
            <Group gap={6} style={{ cursor: "pointer" }} wrap="nowrap">
              <Avatar size={30} radius="xl">
                {initials}
              </Avatar>
              <ChevronDown size={14} />
            </Group>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>{userName}</Menu.Label>
            <Menu.Item leftSection={<UserRound size={15} />}>Profile</Menu.Item>
            <Menu.Item leftSection={<Settings size={15} />}>Settings</Menu.Item>
            <Menu.Divider />
            <Menu.Item
              color="red"
              leftSection={<LogOut size={15} />}
              onClick={onLogout}
            >
              Sign out
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </header>
  );
}
