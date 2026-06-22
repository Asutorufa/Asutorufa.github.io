import clsx from "clsx";

export const TOOL_CLASS = {
  actions: "flex items-end",
  braceIcon: "font-mono text-[0.92em] font-bold",
  buttonBase:
    "inline-flex items-center justify-center gap-[0.4rem] rounded-full px-4 py-[0.62rem] leading-[1.3] transition-[background-color,border-color,color,opacity,transform] duration-[180ms] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-45",
  buttonGhost: "border border-blog-border text-blog-muted hover:bg-blog-bg hover:text-blog-text",
  buttonPrimary: "bg-blog-accent text-white hover:bg-blog-accent-active",
  buttonSecondary: "bg-blog-accent-softer text-blog-accent hover:bg-[var(--blog-accent-secondary-hover)]",
  control:
    "rounded-xl border border-blog-border bg-blog-surface-muted px-[0.85rem] py-[0.7rem] font-[inherit] leading-[1.5] text-blog-text outline-none transition-[background-color,border-color,box-shadow] duration-[180ms] focus:border-blog-accent-ring focus:bg-blog-surface focus:shadow-[var(--blog-focus-shadow)]",
  error:
    "mt-4 rounded-xl border border-[var(--blog-error-border)] bg-[var(--blog-error-bg)] px-[0.85rem] py-[0.65rem] text-[0.84rem] leading-[1.6] text-[var(--blog-error-text)]",
  field: "flex min-w-0 flex-col gap-[0.4rem]",
  fieldLabel: "text-[0.78rem] leading-[1.4] text-blog-faint",
  footerActions: "mt-4 flex flex-wrap items-center gap-[0.65rem]",
  footerButton: "max-md:flex-1",
  grid: "grid grid-cols-[minmax(0,1.1fr)_minmax(14rem,0.9fr)] gap-4 max-md:grid-cols-1",
  heading: "mb-4 flex items-center gap-[0.55rem] text-blog-text",
  headingTitle: "m-0 text-[1.05rem] font-medium leading-[1.5]",
  inlineSelect: "inline-flex items-center gap-[0.45rem]",
  jsonLayout: "grid grid-cols-2 gap-4 max-md:grid-cols-1",
  jsonPreview:
    "json-highlight-output m-0 min-h-[18rem] flex-1 overflow-auto whitespace-pre rounded-xl border border-blog-border bg-blog-surface-muted px-[0.85rem] py-[0.7rem] font-mono text-[0.95em] leading-[1.45] text-blog-text [scrollbar-color:var(--blog-scrollbar)_transparent]",
  monoTextarea: "font-mono leading-[1.45]",
  outputGrid: "mt-4 grid grid-cols-2 gap-3 max-md:grid-cols-1",
  outputItem: "min-w-0 rounded-xl border border-blog-border-muted bg-blog-surface-muted px-[0.85rem] py-[0.7rem]",
  outputLabel: "mb-1 block text-[0.75rem] leading-[1.4] text-blog-faint",
  outputValue: "block overflow-x-auto whitespace-nowrap font-mono text-[0.84rem] leading-[1.5] text-blog-heading",
  panel: "rounded-[18px] border border-blog-border-muted p-5 max-md:p-4",
  segmented: "flex gap-1 rounded-xl border border-blog-border bg-blog-surface-muted p-1",
  segmentedButton:
    "flex-1 rounded-[9px] px-[0.45rem] py-[0.55rem] text-[0.78rem] leading-[1.3] text-blog-muted transition-[background-color,color] duration-[180ms] hover:bg-blog-accent-softer hover:text-blog-accent",
  segmentedButtonActive: "bg-blog-surface text-blog-accent shadow-[0_2px_8px_rgb(0_0_0_/_0.06)]",
  select: "min-w-20 px-3 py-2",
  tabs:
    "mx-auto mb-[1.8rem] flex max-w-[34rem] gap-[0.35rem] rounded-full border border-blog-border-muted bg-blog-bg p-[0.35rem] max-md:max-w-none max-md:flex-col max-md:rounded-[18px]",
  tabButton:
    "inline-flex flex-1 items-center justify-center gap-[0.45rem] rounded-full px-[0.9rem] py-[0.65rem] text-[0.9rem] leading-[1.4] text-blog-muted transition-[background-color,box-shadow,color,transform] duration-[180ms] hover:bg-blog-accent-softer hover:text-blog-accent active:translate-y-px max-md:justify-start",
  tabButtonActive: "bg-blog-surface text-blog-accent shadow-[0_4px_12px_rgb(0_0_0_/_0.08)]",
  textarea: "min-h-[18rem] resize-y"
};

export function toolButton(variant: "primary" | "secondary" | "ghost", extraClass?: string) {
  return clsx(
    TOOL_CLASS.buttonBase,
    variant === "primary" && TOOL_CLASS.buttonPrimary,
    variant === "secondary" && TOOL_CLASS.buttonSecondary,
    variant === "ghost" && TOOL_CLASS.buttonGhost,
    extraClass
  );
}
