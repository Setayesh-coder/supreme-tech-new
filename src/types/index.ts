import type React from "react";

export interface NavItem {
  name: string;
  href: string;
  icon?: React.ReactNode;
}

export interface HeaderProps {
  transparent?: boolean;
  onMenuClick?: () => void;
}
