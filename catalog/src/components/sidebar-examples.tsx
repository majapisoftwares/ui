"use client";

import { useState } from "react";
import { BuildingIcon, PlusIcon, SettingsIcon, UserIcon } from "lucide-react";
import { DropdownMenuItem } from "@majapisoftwares/ui/components/dropdown-menu";
import { toast } from "@majapisoftwares/ui/components/sonner";
import { defineMessages, useMessages } from "@majapisoftwares/ui/lib/i18n";
import { UserMenu } from "@majapisoftwares/ui/patterns/user-menu";
import {
  WorkspaceSwitcher,
  type Workspace,
} from "@majapisoftwares/ui/patterns/workspace-switcher";

// Demo data: a real app loads workspaces and the user from its backend.
const messages = defineMessages({
  en: {
    personal: "Personal",
    companies: "Companies",
    main: "Main",
    sales: "Sales",
    addWorkspace: "Add workspace",
    settings: "Settings",
    switched: (name: string) => `Switched to ${name}`,
    signedOut: "Signed out (demo)",
  },
  "pt-BR": {
    personal: "Pessoal",
    companies: "Empresas",
    main: "Principal",
    sales: "Vendas",
    addWorkspace: "Adicionar workspace",
    settings: "Configurações",
    switched: (name: string) => `Workspace alterado para ${name}`,
    signedOut: "Sessão encerrada (demonstração)",
  },
});

export function ExampleWorkspaceSwitcher() {
  const t = useMessages(messages);
  const [activeId, setActiveId] = useState("majapi");
  const workspaces: Workspace[] = [
    {
      id: "personal",
      name: "Lucia",
      description: t.personal,
      icon: <UserIcon />,
      group: t.personal,
    },
    {
      id: "majapi",
      name: "Majapi",
      description: t.main,
      group: t.companies,
    },
    {
      id: "majapi-sales",
      name: "Majapi",
      description: t.sales,
      icon: <BuildingIcon />,
      group: t.companies,
    },
    { id: "numa", name: "Numa", description: t.main, group: t.companies },
  ];
  return (
    <WorkspaceSwitcher
      workspaces={workspaces}
      activeId={activeId}
      onSelect={(workspace) => {
        setActiveId(workspace.id);
        toast.success(t.switched(workspace.name));
      }}
      actions={
        <DropdownMenuItem>
          <PlusIcon />
          {t.addWorkspace}
        </DropdownMenuItem>
      }
    />
  );
}

export function ExampleUserMenu() {
  const t = useMessages(messages);
  return (
    <UserMenu
      name="Lucia"
      email="lucia@majapi.com"
      items={
        <DropdownMenuItem>
          <SettingsIcon />
          {t.settings}
        </DropdownMenuItem>
      }
      onSignOut={() => toast(t.signedOut)}
    />
  );
}
