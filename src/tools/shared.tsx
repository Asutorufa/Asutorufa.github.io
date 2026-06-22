import type { UiLabels } from "../types/content";
import { TOOL_CLASS } from "./toolStyles";

export type ToolLabels = ReturnType<typeof toolLabels>;

export function OutputItem({ label, value }: { label: string; value: string }) {
  return (
    <div className={TOOL_CLASS.outputItem}>
      <span className={TOOL_CLASS.outputLabel}>{label}</span>
      <code className={TOOL_CLASS.outputValue}>{value || "-"}</code>
    </div>
  );
}

export function toolLabels(labels: UiLabels) {
  const isJapanese = labels.tools === "ツール";
  const isChinese = labels.tools === "工具";

  if (isChinese) {
    return {
      ...labels,
      timestamp: "时间戳",
      unit: "单位",
      auto: "自动",
      seconds: "秒",
      milliseconds: "毫秒",
      localTime: "本地时间",
      now: "当前时间",
      unixSeconds: "Unix 秒",
      unixMilliseconds: "Unix 毫秒",
      isoTime: "ISO 时间",
      utcTime: "UTC 时间",
      invalidTimestamp: "请输入有效的 Unix 时间戳。",
      invalidDate: "请输入有效的本地时间。",
      jsonInput: "JSON 输入",
      jsonOutput: "格式化结果",
      formattedResult: "格式化后的 JSON 会显示在这里",
      indent: "缩进",
      format: "格式化",
      minify: "压缩",
      copy: "复制",
      copied: "已复制",
      clear: "清空",
      history: "最近记录",
      clearHistory: "清空记录",
      deleteHistory: "删除记录",
      noHistory: "格式化或压缩 JSON 后会保留最近 20 条记录。",
      minified: "已压缩",
      invalidJson: "JSON 格式不正确。"
    };
  }

  if (isJapanese) {
    return {
      ...labels,
      timestamp: "タイムスタンプ",
      unit: "単位",
      auto: "自動",
      seconds: "秒",
      milliseconds: "ミリ秒",
      localTime: "ローカル時刻",
      now: "現在時刻",
      unixSeconds: "Unix 秒",
      unixMilliseconds: "Unix ミリ秒",
      isoTime: "ISO 時刻",
      utcTime: "UTC 時刻",
      invalidTimestamp: "有効な Unix タイムスタンプを入力してください。",
      invalidDate: "有効なローカル時刻を入力してください。",
      jsonInput: "JSON 入力",
      jsonOutput: "整形結果",
      formattedResult: "整形された JSON がここに表示されます",
      indent: "インデント",
      format: "整形",
      minify: "圧縮",
      copy: "コピー",
      copied: "コピー済み",
      clear: "クリア",
      history: "最近の履歴",
      clearHistory: "履歴をクリア",
      deleteHistory: "履歴を削除",
      noHistory: "JSON を整形または圧縮すると、最近 20 件が保存されます。",
      minified: "圧縮済み",
      invalidJson: "JSON の形式が正しくありません。"
    };
  }

  return {
    ...labels,
    timestamp: "Timestamp",
    unit: "Unit",
    auto: "Auto",
    seconds: "Seconds",
    milliseconds: "Milliseconds",
    localTime: "Local time",
    now: "Now",
    unixSeconds: "Unix seconds",
    unixMilliseconds: "Unix milliseconds",
    isoTime: "ISO time",
    utcTime: "UTC time",
    invalidTimestamp: "Enter a valid Unix timestamp.",
    invalidDate: "Enter a valid local time.",
    jsonInput: "JSON input",
    jsonOutput: "Formatted output",
    formattedResult: "Formatted JSON will appear here",
    indent: "Indent",
    format: "Format",
    minify: "Minify",
    copy: "Copy",
    copied: "Copied",
    clear: "Clear",
    history: "Recent history",
    clearHistory: "Clear history",
    deleteHistory: "Delete history",
    noHistory: "Format or minify JSON to keep the latest 20 records.",
    minified: "Minified",
    invalidJson: "Invalid JSON."
  };
}
