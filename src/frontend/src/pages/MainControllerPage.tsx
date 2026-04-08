import MainControllerLayout from "@/components/MainControllerLayout";
import AccessControlPage from "./maincontroller/AccessControlPage";
import AutomationPage from "./maincontroller/AutomationPage";
import BackupSecurityPage from "./maincontroller/BackupSecurityPage";
import DatabasePage from "./maincontroller/DatabasePage";
import SystemConfigPage from "./maincontroller/SystemConfigPage";

const PAGE_LABELS: Record<string, string> = {
  database: "Database",
  "access-control": "Access Control",
  automation: "Automation",
  "system-config": "System Config",
  "backup-security": "Backup & Security",
};

interface Props {
  onLogout: () => void;
}

import { useState } from "react";

export default function MainControllerPage({ onLogout }: Props) {
  const [currentPage, setCurrentPage] = useState("database");

  return (
    <MainControllerLayout
      currentPage={currentPage}
      onPageChange={setCurrentPage}
      onLogout={onLogout}
      pageLabel={PAGE_LABELS[currentPage] ?? "Main Controller"}
    >
      {currentPage === "database" && <DatabasePage />}
      {currentPage === "access-control" && <AccessControlPage />}
      {currentPage === "automation" && <AutomationPage />}
      {currentPage === "system-config" && <SystemConfigPage />}
      {currentPage === "backup-security" && <BackupSecurityPage />}
    </MainControllerLayout>
  );
}
