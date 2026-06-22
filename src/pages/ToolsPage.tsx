import clsx from "clsx";
import { useState } from "react";
import type { AppProps } from "../app/app-types";
import { Icon } from "../components/Icon";
import { UI_LABELS } from "../data/i18n";
import { JsonFormatterTool } from "../tools/JsonFormatterTool";
import { TimestampTool } from "../tools/TimestampTool";
import { TOOL_CLASS } from "../tools/toolStyles";

export function ToolsPage({ route }: AppProps) {
  const labels = UI_LABELS[route.language];
  const [activeTool, setActiveTool] = useState<"time" | "json">("time");

  return (
    <article className="content-card px-5 py-10 text-blog-text md:px-8 md:py-14 lg:px-10">
      <header className="mb-10 text-center">
        <h1 className="text-[1.7em] font-normal leading-normal text-blog-heading">{labels.tools}</h1>
      </header>

      <div className={TOOL_CLASS.tabs} role="tablist" aria-label={labels.tools}>
        <button type="button" className={clsx(TOOL_CLASS.tabButton, activeTool === "time" && TOOL_CLASS.tabButtonActive)} onClick={() => setActiveTool("time")}>
          <Icon name="clock" />
          {labels.unixTimestamp}
        </button>
        <button type="button" className={clsx(TOOL_CLASS.tabButton, activeTool === "json" && TOOL_CLASS.tabButtonActive)} onClick={() => setActiveTool("json")}>
          <span className={TOOL_CLASS.braceIcon} aria-hidden="true">
            {"{}"}
          </span>
          {labels.jsonFormatter}
        </button>
      </div>

      {activeTool === "time" ? <TimestampTool labels={labels} /> : <JsonFormatterTool labels={labels} />}
    </article>
  );
}
