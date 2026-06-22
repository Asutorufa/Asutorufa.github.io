import clsx from "clsx";
import styles from "./toolStyles.module.css";

export const TOOL_CLASS = styles;

export function toolButton(variant: "primary" | "secondary" | "ghost", extraClass?: string) {
  return clsx(
    TOOL_CLASS.buttonBase,
    variant === "primary" && TOOL_CLASS.buttonPrimary,
    variant === "secondary" && TOOL_CLASS.buttonSecondary,
    variant === "ghost" && TOOL_CLASS.buttonGhost,
    extraClass
  );
}
