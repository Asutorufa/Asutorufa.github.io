declare module "@renbaoshuo/markdown-it-katex" {
  import type MarkdownIt from "markdown-it";

  const plugin: MarkdownIt.PluginSimple | MarkdownIt.PluginWithOptions<Record<string, unknown>>;
  export default plugin;
}
