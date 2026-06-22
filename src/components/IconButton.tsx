import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  icon: IconName;
  label: string;
  children?: ReactNode;
};

export function IconButton({ icon, label, title, children, type = "button", ...props }: IconButtonProps) {
  return (
    <button type={type} aria-label={label} title={title ?? label} {...props}>
      <Icon name={icon} />
      {children}
    </button>
  );
}
