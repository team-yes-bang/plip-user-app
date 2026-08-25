"use client";

import { useState } from "react";
import {
  Calendar,
  Home,
  Mail,
  Music,
  Settings,
  Sparkles,
  FolderGit2,
} from "lucide-react";
import { Dock, DockItem, DockSeparator } from "@/components/ui/dock";

export default function DockPreview() {
  const [active, setActive] = useState("home");

  const items = [
    { id: "home", label: "Home", icon: Home },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "mail", label: "Mail", icon: Mail },
    { id: "music", label: "Music", icon: Music },
  ];

  return (
    <Dock>
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <DockItem
            key={item.id}
            id={item.id}
            active={active === item.id}
            onClick={() => setActive(item.id)}
            aria-label={item.label}
          >
            <Icon className="h-5 w-5" />
          </DockItem>
        );
      })}

      <DockSeparator />

      <DockItem
        id="github"
        active={active === "github"}
        onClick={() => setActive("github")}
        aria-label="GitHub"
      >
        <FolderGit2 className="h-5 w-5" />
      </DockItem>

      <DockItem
        id="sparkles"
        active={active === "sparkles"}
        onClick={() => setActive("sparkles")}
        aria-label="Sparkles"
      >
        <Sparkles className="h-5 w-5" />
      </DockItem>

      <DockItem
        id="settings"
        active={active === "settings"}
        onClick={() => setActive("settings")}
        aria-label="Settings"
      >
        <Settings className="h-5 w-5" />
      </DockItem>
    </Dock>
  );
}
