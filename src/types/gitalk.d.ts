declare module "gitalk" {
  export default class Gitalk {
    constructor(config: Record<string, unknown>);
    render(id: string): void;
  }
}

declare module "gitalk/dist/gitalk.css";
