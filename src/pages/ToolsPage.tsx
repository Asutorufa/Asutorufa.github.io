import clsx from "clsx";
import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { AppProps } from "../app/app-types";
import { MotionPresets } from "../animation/motion-presets";
import { Icon } from "../components/Icon";
import { useSiteLabels } from "../components/SiteLanguageProvider";
import { JsonFormatterTool } from "../tools/JsonFormatterTool";
import { TimestampTool } from "../tools/TimestampTool";
import { TOOL_CLASS } from "../tools/toolStyles";

type ToolId = "time" | "json";

export function ToolsPage({ route }: AppProps) {
  const labels = useSiteLabels(route.language);
  const [activeTool, setActiveTool] = useState<ToolId>("time");
  const indicatorId = useId();
  const prefersReducedMotion = useReducedMotion();
  const tools: Array<{ id: ToolId; label: string; icon: "clock" | "json" }> = [
    { id: "time", label: labels.unixTimestamp, icon: "clock" },
    { id: "json", label: labels.jsonFormatter, icon: "json" }
  ];

  return (
    <article className="content-card px-5 py-10 text-blog-text md:px-8 md:py-14 lg:px-10">
      <header className="mb-10 text-center">
        <h1 className="text-[1.7em] font-semibold leading-normal tracking-[-0.01em] text-blog-heading">{labels.tools}</h1>
      </header>

      <div className={TOOL_CLASS.tabs} role="tablist" aria-label={labels.tools}>
        {tools.map((tool) => {
          const active = activeTool === tool.id;
          return (
            <motion.button
              key={tool.id}
              type="button"
              className={clsx(TOOL_CLASS.tabButton, active && TOOL_CLASS.tabButtonActive)}
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTool(tool.id)}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
              transition={prefersReducedMotion ? MotionPresets.instant : MotionPresets.fast}
            >
              {active ? (
                <motion.span
                  className={TOOL_CLASS.tabIndicator}
                  layoutId={`tool-tab-${indicatorId}`}
                  transition={prefersReducedMotion ? MotionPresets.instant : MotionPresets.spring}
                />
              ) : null}
              <span className={TOOL_CLASS.tabContent}>
                {tool.icon === "clock" ? (
                  <Icon name="clock" />
                ) : (
                  <span className={TOOL_CLASS.braceIcon} aria-hidden="true">
                    {"{}"}
                  </span>
                )}
                {tool.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeTool}
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
          transition={prefersReducedMotion ? MotionPresets.instant : MotionPresets.fast}
        >
          {activeTool === "time" ? <TimestampTool labels={labels} /> : <JsonFormatterTool labels={labels} />}
        </motion.div>
      </AnimatePresence>
    </article>
  );
}
