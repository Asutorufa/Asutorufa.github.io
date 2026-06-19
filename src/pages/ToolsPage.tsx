import { useState } from "react";
import type { AppProps } from "../app/app-types";
import { Icon } from "../components/Icon";
import { UI_LABELS } from "../data/i18n";
import { JsonFormatterTool } from "../tools/JsonFormatterTool";
import { TimestampTool } from "../tools/TimestampTool";

export function ToolsPage({ route }: AppProps) {
  const labels = UI_LABELS[route.language];
  const [activeTool, setActiveTool] = useState<"time" | "json">("time");

  return (
    <article className="content-card tools-page px-5 py-10 md:px-8 md:py-14 lg:px-10">
      <header className="mb-10 text-center">
        <h1 className="text-[1.7em] font-normal leading-normal text-[#555]">{labels.tools}</h1>
      </header>

      <div className="tools-tabs" role="tablist" aria-label={labels.tools}>
        <button type="button" className={activeTool === "time" ? "is-active" : ""} onClick={() => setActiveTool("time")}>
          <Icon name="clock" />
          {labels.unixTimestamp}
        </button>
        <button type="button" className={activeTool === "json" ? "is-active" : ""} onClick={() => setActiveTool("json")}>
          <span className="tools-brace-icon" aria-hidden="true">
            {"{}"}
          </span>
          {labels.jsonFormatter}
        </button>
      </div>

      {activeTool === "time" ? <TimestampTool labels={labels} /> : <JsonFormatterTool labels={labels} />}
    </article>
  );
}
