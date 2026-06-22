import clsx from "clsx";
import { useEffect, useMemo, useRef, useState } from "react";
import { LANGUAGE_META } from "../data/i18n";
import type { SiteLanguage } from "../types/content";
import { Icon } from "./Icon";
import { IconButton } from "./IconButton";
import styles from "./GitalkComments.module.css";

type GitalkCommentsProps = {
  id: string;
  language?: SiteLanguage;
};

type GitHubUser = {
  login: string;
  avatar_url: string;
  html_url: string;
};

type GitHubIssue = {
  number: number;
  html_url: string;
  comments: number;
  comments_url: string;
};

type GitHubComment = {
  id: number;
  html_url: string;
  body: string;
  body_html?: string;
  created_at: string;
  user: GitHubUser;
};

type CommentCopy = {
  adminOnly: string;
  cancel: string;
  comments: (count: number) => string;
  delete: string;
  deleteConfirm: string;
  edit: string;
  empty: string;
  error: string;
  first: string;
  initIssue: string;
  issueLink: (issueNumber: number) => string;
  loadMore: string;
  loading: string;
  login: string;
  loginToComment: string;
  logout: string;
  markdown: string;
  placeholder: string;
  reply: string;
  retry: string;
  save: string;
  submit: string;
};

const GITHUB_API = "https://api.github.com";
const TOKEN_STORAGE_KEY = "asutorufa:github-comments-token";
const DRAFT_STORAGE_PREFIX = "asutorufa:github-comments-draft:";

const COMMENT_CONFIG = {
  owner: "Asutorufa",
  repo: "Asutorufa.github.io",
  clientID: "c800a9b9d97b6bef0dfe",
  clientSecret: "cb3b257598e1a7b9910007c148a33f0054864ef7",
  proxy: "https://cors-anywhere.azm.workers.dev/https://github.com/login/oauth/access_token",
  admin: ["Asutorufa"],
  labels: ["Gitalk"],
  perPage: 10
};

const COMMENT_COPY: Record<SiteLanguage, CommentCopy> = {
  en: {
    adminOnly: "The comment thread has not been initialized yet.",
    cancel: "Cancel",
    comments: (count) => `${count} comment${count === 1 ? "" : "s"}`,
    delete: "Delete",
    deleteConfirm: "Delete this comment?",
    edit: "Edit",
    empty: "No comments yet.",
    error: "Failed to load comments.",
    first: "Be the first to leave a comment.",
    initIssue: "Initialize thread",
    issueLink: (issueNumber) => `GitHub Issue #${issueNumber}`,
    loadMore: "Load more",
    loading: "Loading comments...",
    login: "Login with GitHub",
    loginToComment: "Login with GitHub to comment.",
    logout: "Logout",
    markdown: "Markdown is supported.",
    placeholder: "Leave a comment",
    reply: "Reply",
    retry: "Retry",
    save: "Save",
    submit: "Submit"
  },
  ja: {
    adminOnly: "コメントスレッドはまだ初期化されていません。",
    cancel: "キャンセル",
    comments: (count) => `${count} 件のコメント`,
    delete: "削除",
    deleteConfirm: "このコメントを削除しますか？",
    edit: "編集",
    empty: "コメントはまだありません。",
    error: "コメントの読み込みに失敗しました。",
    first: "最初にコメントを残しましょう。",
    initIssue: "スレッドを作成",
    issueLink: (issueNumber) => `GitHub Issue #${issueNumber}`,
    loadMore: "もっと見る",
    loading: "コメントを読み込んでいます...",
    login: "GitHub でログイン",
    loginToComment: "コメントするには GitHub でログインしてください。",
    logout: "ログアウト",
    markdown: "Markdown 記法をサポートしています。",
    placeholder: "コメントを残す",
    reply: "返信",
    retry: "再試行",
    save: "保存",
    submit: "送信"
  },
  "zh-Hans": {
    adminOnly: "评论线程还没有初始化。",
    cancel: "取消",
    comments: (count) => `${count} 条评论`,
    delete: "删除",
    deleteConfirm: "删除这条评论？",
    edit: "编辑",
    empty: "还没有评论。",
    error: "评论加载失败。",
    first: "来留下第一条评论吧。",
    initIssue: "初始化评论",
    issueLink: (issueNumber) => `GitHub Issue #${issueNumber}`,
    loadMore: "加载更多",
    loading: "正在加载评论...",
    login: "使用 GitHub 登录",
    loginToComment: "登录 GitHub 后即可评论。",
    logout: "退出登录",
    markdown: "支持 Markdown 语法。",
    placeholder: "留下评论",
    reply: "回复",
    retry: "重试",
    save: "保存",
    submit: "提交"
  }
};

function commentButton(variant: "primary" | "secondary") {
  return clsx(styles.buttonBase, styles.button, variant === "primary" ? styles.buttonPrimary : styles.buttonSecondary);
}

export function GitalkComments({ id, language = "ja" }: GitalkCommentsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [activated, setActivated] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [issue, setIssue] = useState<GitHubIssue | null>(null);
  const [comments, setComments] = useState<GitHubComment[]>([]);
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [token, setToken] = useState("");
  const [draft, setDraft] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [updatingCommentId, setUpdatingCommentId] = useState<number | null>(null);
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const copy = COMMENT_COPY[language];
  const dateFormatter = useMemo(() => {
    return new Intl.DateTimeFormat(LANGUAGE_META[language].dateLocale, {
      dateStyle: "medium",
      timeStyle: "short"
    });
  }, [language]);
  const isAdmin = user ? COMMENT_CONFIG.admin.includes(user.login) : false;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    if (!("IntersectionObserver" in window)) {
      setActivated(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        setActivated(true);
      },
      { rootMargin: "360px 0px" }
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, [id]);

  useEffect(() => {
    if (!activated) return undefined;

    let cancelled = false;
    const load = async () => {
      setStatus("loading");
      setError("");
      setDraft(readDraft(id));

      try {
        let nextToken = await consumeOAuthCode();
        let nextUser: GitHubUser | null = null;

        if (nextToken) {
          try {
            nextUser = await githubFetch<GitHubUser>("/user", undefined, nextToken);
          } catch {
            nextToken = "";
            clearStoredToken();
          }
        }

        const nextIssue = await requestIssue(id, nextToken);
        const nextComments = nextIssue ? await requestComments(nextIssue, 1, nextToken) : [];

        if (cancelled) return;
        setToken(nextToken);
        setUser(nextUser);
        setIssue(nextIssue);
        setComments(nextComments);
        setPage(1);
        setHasMore(Boolean(nextIssue && nextComments.length < nextIssue.comments));
        setStatus("ready");
      } catch (loadError) {
        if (cancelled) return;
        setError(errorMessage(loadError));
        setStatus("error");
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [activated, id]);

  const refresh = () => {
    setActivated(false);
    window.requestAnimationFrame(() => setActivated(true));
  };

  const login = (draftOverride = draft) => {
    writeDraft(id, draftOverride);
    const url = new URL("https://github.com/login/oauth/authorize");
    url.searchParams.set("client_id", COMMENT_CONFIG.clientID);
    url.searchParams.set("redirect_uri", cleanCurrentUrl());
    url.searchParams.set("scope", "public_repo");
    window.location.href = url.toString();
  };

  const logout = () => {
    clearStoredToken();
    setToken("");
    setUser(null);
  };

  const updateDraft = (value: string) => {
    setDraft(value);
    writeDraft(id, value);
  };

  const replyTo = (comment: GitHubComment) => {
    const replyDraft = appendReplyDraft(draft, comment);
    updateDraft(replyDraft);

    if (!token || !user) {
      login(replyDraft);
      return;
    }

    textareaRef.current?.focus();
    window.requestAnimationFrame(() => {
      textareaRef.current?.scrollIntoView({ block: "center" });
      textareaRef.current?.setSelectionRange(replyDraft.length, replyDraft.length);
    });
  };

  const startEdit = (comment: GitHubComment) => {
    setEditingCommentId(comment.id);
    setEditDraft(comment.body);
    setError("");
  };

  const cancelEdit = () => {
    setEditingCommentId(null);
    setEditDraft("");
  };

  const saveEdit = async (comment: GitHubComment) => {
    if (!token || !user || !editDraft.trim()) return;
    setUpdatingCommentId(comment.id);
    setError("");

    try {
      const updatedComment = await githubFetch<GitHubComment>(
        `/repos/${COMMENT_CONFIG.owner}/${COMMENT_CONFIG.repo}/issues/comments/${comment.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({ body: editDraft.trim() })
        },
        token
      );
      setComments((current) => current.map((item) => (item.id === updatedComment.id ? updatedComment : item)));
      cancelEdit();
    } catch (updateError) {
      setError(errorMessage(updateError));
    } finally {
      setUpdatingCommentId(null);
    }
  };

  const deleteComment = async (comment: GitHubComment) => {
    if (!token || !user || !window.confirm(copy.deleteConfirm)) return;
    setDeletingCommentId(comment.id);
    setError("");

    try {
      await githubFetch<void>(
        `/repos/${COMMENT_CONFIG.owner}/${COMMENT_CONFIG.repo}/issues/comments/${comment.id}`,
        {
          method: "DELETE"
        },
        token
      );
      setComments((current) => current.filter((item) => item.id !== comment.id));
      setIssue((current) => (current ? { ...current, comments: Math.max(0, current.comments - 1) } : current));
      if (editingCommentId === comment.id) cancelEdit();
    } catch (deleteError) {
      setError(errorMessage(deleteError));
    } finally {
      setDeletingCommentId(null);
    }
  };

  const initializeIssue = async () => {
    if (!token || !isAdmin) return;
    setInitializing(true);
    setError("");

    try {
      const nextIssue = await githubFetch<GitHubIssue>(
        `/repos/${COMMENT_CONFIG.owner}/${COMMENT_CONFIG.repo}/issues`,
        {
          method: "POST",
          body: JSON.stringify({
            title: document.title,
            body: issueBody(),
            labels: [...COMMENT_CONFIG.labels, id]
          })
        },
        token
      );
      setIssue(nextIssue);
      setComments([]);
      setHasMore(false);
    } catch (initError) {
      setError(errorMessage(initError));
    } finally {
      setInitializing(false);
    }
  };

  const submitComment = async () => {
    if (!draft.trim()) return;
    if (!token || !user) {
      login();
      return;
    }
    if (!issue) return;

    setSubmitting(true);
    setError("");
    try {
      const comment = await githubFetch<GitHubComment>(
        issue.comments_url,
        {
          method: "POST",
          body: JSON.stringify({ body: draft.trim() })
        },
        token
      );
      setComments((current) => [...current, comment]);
      setIssue({ ...issue, comments: issue.comments + 1 });
      setDraft("");
      removeDraft(id);
      setHasMore(false);
    } catch (submitError) {
      setError(errorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  const loadMore = async () => {
    if (!issue || loadingMore) return;
    setLoadingMore(true);
    setError("");

    try {
      const nextPage = page + 1;
      const nextComments = await requestComments(issue, nextPage, token);
      setComments((current) => mergeComments(current, nextComments));
      setPage(nextPage);
      setHasMore(page * COMMENT_CONFIG.perPage + nextComments.length < issue.comments);
    } catch (moreError) {
      setError(errorMessage(moreError));
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div ref={containerRef} className={styles.root}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <p className={styles.title}>{copy.comments(issue?.comments ?? comments.length)}</p>
          {issue ? (
            <a className={styles.issue} href={issue.html_url} target="_blank" rel="noreferrer">
              {copy.issueLink(issue.number)}
            </a>
          ) : null}
        </div>
        <div className={styles.actions}>
          {user ? (
            <>
              <a className={styles.user} href={user.html_url} target="_blank" rel="noreferrer">
                <img className={styles.userAvatar} src={user.avatar_url} alt="" />
                <span className={styles.userName}>{user.login}</span>
              </a>
              <IconButton icon="log-out" label={copy.logout} className={clsx(styles.buttonBase, styles.iconButton)} onClick={logout} />
            </>
          ) : (
            <button type="button" className={commentButton("secondary")} onClick={() => login()}>
              <Icon name="github" />
              <span>{copy.login}</span>
            </button>
          )}
        </div>
      </div>

      {status === "loading" || status === "idle" ? <p className={styles.statusText}>{copy.loading}</p> : null}

      {status === "error" ? (
        <div className={clsx(styles.statusBox, styles.statusError)}>
          <p>{copy.error}</p>
          {error ? <p className={styles.errorDetail}>{error}</p> : null}
          <button type="button" className={commentButton("secondary")} onClick={refresh}>
            <Icon name="refresh" />
            <span>{copy.retry}</span>
          </button>
        </div>
      ) : null}

      {status === "ready" && !issue ? (
        <div className={styles.empty}>
          <p>{copy.adminOnly}</p>
          {isAdmin ? (
            <button type="button" className={commentButton("primary")} onClick={initializeIssue} disabled={initializing}>
              <Icon name="github" />
              <span>{initializing ? copy.loading : copy.initIssue}</span>
            </button>
          ) : user ? null : (
            <button type="button" className={commentButton("primary")} onClick={() => login()}>
              <Icon name="log-in" />
              <span>{copy.login}</span>
            </button>
          )}
        </div>
      ) : null}

      {status === "ready" && issue ? (
        <>
          <div className={styles.form}>
            {user ? (
              <>
                <textarea
                  className={styles.textarea}
                  ref={textareaRef}
                  value={draft}
                  onChange={(event) => updateDraft(event.target.value)}
                  placeholder={copy.placeholder}
                  rows={4}
                />
                <div className={styles.formFooter}>
                  <span>{copy.markdown}</span>
                  <button type="button" className={commentButton("primary")} onClick={submitComment} disabled={!draft.trim() || submitting}>
                    <Icon name="send" />
                    <span>{submitting ? copy.loading : copy.submit}</span>
                  </button>
                </div>
              </>
            ) : (
              <div className={styles.loginPrompt}>
                <span>{copy.loginToComment}</span>
                <button type="button" className={commentButton("primary")} onClick={() => login()}>
                  <Icon name="github" />
                  <span>{copy.login}</span>
                </button>
              </div>
            )}
          </div>

          {error ? <p className={clsx(styles.statusText, styles.errorDetail)}>{error}</p> : null}

          <div className={styles.list}>
            {comments.length ? (
              comments.map((comment) => {
                const canEdit = user?.login === comment.user.login;
                const canDelete = canEdit || isAdmin;
                const isEditing = editingCommentId === comment.id;
                const isUpdating = updatingCommentId === comment.id;
                const isDeleting = deletingCommentId === comment.id;

                return (
                  <article className={styles.comment} key={comment.id}>
                    <a href={comment.user.html_url} target="_blank" rel="noreferrer">
                      <img className={styles.commentAvatarImg} src={comment.user.avatar_url} alt="" loading="lazy" />
                    </a>
                    <div className={styles.commentMain}>
                      <div className={styles.meta}>
                        <a className={styles.metaUser} href={comment.user.html_url} target="_blank" rel="noreferrer">
                          {comment.user.login}
                        </a>
                        <a className={styles.metaTime} href={comment.html_url} target="_blank" rel="noreferrer">
                          {dateFormatter.format(new Date(comment.created_at))}
                        </a>
                        <div className={styles.commentActions}>
                          <button type="button" className={styles.action} onClick={() => replyTo(comment)}>
                            <Icon name="reply" />
                            <span>{copy.reply}</span>
                          </button>
                          {canEdit ? (
                            <button type="button" className={styles.action} onClick={() => startEdit(comment)} disabled={isDeleting}>
                              <Icon name="edit" />
                              <span>{copy.edit}</span>
                            </button>
                          ) : null}
                          {canDelete ? (
                            <button
                              type="button"
                              className={clsx(styles.action, styles.actionDanger)}
                              onClick={() => void deleteComment(comment)}
                              disabled={isDeleting || isUpdating}
                            >
                              <Icon name="trash" />
                              <span>{isDeleting ? copy.loading : copy.delete}</span>
                            </button>
                          ) : null}
                        </div>
                      </div>

                      {isEditing ? (
                        <div className={styles.edit}>
                          <textarea className={styles.editTextarea} value={editDraft} onChange={(event) => setEditDraft(event.target.value)} rows={4} />
                          <div className={styles.editActions}>
                            <button type="button" className={commentButton("secondary")} onClick={cancelEdit} disabled={isUpdating}>
                              <span>{copy.cancel}</span>
                            </button>
                            <button
                              type="button"
                              className={commentButton("primary")}
                              onClick={() => void saveEdit(comment)}
                              disabled={!editDraft.trim() || isUpdating}
                            >
                              <Icon name="send" />
                              <span>{isUpdating ? copy.loading : copy.save}</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className={styles.body} dangerouslySetInnerHTML={{ __html: comment.body_html ?? escapeHtml(comment.body) }} />
                      )}
                    </div>
                  </article>
                );
              })
            ) : (
              <p className={styles.emptyLine}>{copy.first}</p>
            )}
          </div>

          {hasMore ? (
            <button type="button" className={clsx(styles.buttonBase, styles.buttonSecondary, styles.loadMore)} onClick={loadMore} disabled={loadingMore}>
              <Icon name="refresh" />
              <span>{loadingMore ? copy.loading : copy.loadMore}</span>
            </button>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

async function requestIssue(id: string, token: string) {
  const labels = new URLSearchParams({
    labels: [...COMMENT_CONFIG.labels, id].join(","),
    per_page: "1",
    state: "open"
  });
  const issues = await githubFetch<GitHubIssue[]>(`/repos/${COMMENT_CONFIG.owner}/${COMMENT_CONFIG.repo}/issues?${labels}`, undefined, token);
  return issues[0] ?? null;
}

async function requestComments(issue: GitHubIssue, page: number, token: string) {
  const params = new URLSearchParams({
    per_page: String(COMMENT_CONFIG.perPage),
    page: String(page)
  });
  return githubFetch<GitHubComment[]>(`${issue.comments_url}?${params}`, undefined, token);
}

async function githubFetch<T>(pathOrUrl: string, init?: RequestInit, token?: string): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/vnd.github.v3.full+json");
  if (init?.body) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `token ${token}`);

  const response = await fetch(pathOrUrl.startsWith("http") ? pathOrUrl : `${GITHUB_API}${pathOrUrl}`, {
    ...init,
    headers
  });
  const text = await response.text();
  const payload = text ? (JSON.parse(text) as unknown) : null;

  if (!response.ok) {
    const message = isGitHubError(payload) ? payload.message : response.statusText;
    throw new Error(message);
  }

  return payload as T;
}

async function consumeOAuthCode() {
  const storedToken = readStoredToken();
  const url = new URL(window.location.href);
  const code = url.searchParams.get("code");
  if (!code) return storedToken;

  const response = await fetch(COMMENT_CONFIG.proxy, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      client_id: COMMENT_CONFIG.clientID,
      client_secret: COMMENT_CONFIG.clientSecret,
      code
    })
  });
  const payload = (await response.json()) as { access_token?: string; error?: string; error_description?: string };
  removeOAuthCodeFromUrl(url);

  if (!payload.access_token) {
    throw new Error(payload.error_description ?? payload.error ?? "GitHub OAuth failed");
  }

  writeStoredToken(payload.access_token);
  return payload.access_token;
}

function removeOAuthCodeFromUrl(url: URL) {
  url.searchParams.delete("code");
  url.searchParams.delete("state");
  window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
}

function cleanCurrentUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete("code");
  url.searchParams.delete("state");
  return url.toString();
}

function issueBody() {
  const description = document.querySelector<HTMLMetaElement>('meta[name="description"]')?.content.trim();
  return [window.location.href, description].filter(Boolean).join("\n\n");
}

function mergeComments(current: GitHubComment[], next: GitHubComment[]) {
  const seen = new Set(current.map((comment) => comment.id));
  return [...current, ...next.filter((comment) => !seen.has(comment.id))];
}

function appendReplyDraft(currentDraft: string, comment: GitHubComment) {
  const quote = comment.body
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter(Boolean)
    .slice(0, 8)
    .join("\n");
  const truncated = comment.body.split(/\r?\n/).filter(Boolean).length > 8;
  const quotedLines = `${quote}${truncated ? "\n..." : ""}`
    .split(/\r?\n/)
    .map((line) => `> ${line}`)
    .join("\n");
  const reply = `@${comment.user.login}\n\n${quotedLines}\n\n`;
  const separator = currentDraft.trim() ? "\n\n" : "";
  return `${currentDraft.trimEnd()}${separator}${reply}`;
}

function draftKey(id: string) {
  return `${DRAFT_STORAGE_PREFIX}${id}`;
}

function readStoredToken() {
  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function writeStoredToken(token: string) {
  try {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch {
    // Login still works for the current render even if storage is unavailable.
  }
}

function clearStoredToken() {
  try {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // Ignore storage failures.
  }
}

function readDraft(id: string) {
  try {
    return window.localStorage.getItem(draftKey(id)) ?? "";
  } catch {
    return "";
  }
}

function writeDraft(id: string, draft: string) {
  try {
    if (draft) window.localStorage.setItem(draftKey(id), draft);
    else window.localStorage.removeItem(draftKey(id));
  } catch {
    // Draft persistence is best-effort.
  }
}

function removeDraft(id: string) {
  try {
    window.localStorage.removeItem(draftKey(id));
  } catch {
    // Ignore storage failures.
  }
}

function isGitHubError(value: unknown): value is { message: string } {
  return typeof value === "object" && value !== null && "message" in value && typeof (value as { message: unknown }).message === "string";
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return "&#39;";
    }
  });
}
