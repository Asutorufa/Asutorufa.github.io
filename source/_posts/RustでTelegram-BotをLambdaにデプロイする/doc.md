---
title: RustでTelegram BotをLambdaにデプロイする
abbrlink: '1754556687621'
date: 2025-08-07 16:51:27
updated: 2025-08-07 16:51:27
tags:
- Telegram
- Telegram Bot
- Rust
- Cargo
- Teloxide
- Lambda
categories:
- Rust
- Lambda
- Telegram
language: ja
---

Telegram BotにはサーバーとWebhookの二つの立ち上げる方法があります。Lambdaはサーバーレスだから、今回はWebhookで使用します。

最初はCargoで新たなプロジェクトを作ります。

```shell
cargo new telegram-bot
```

必要な依存を追加します。

```shell
crgo add aws_lambda_events base64 lambda_runtime serde_json serde teloxide-macros tokio teloxide cargo-lambda
```

zigをインストール

```shell
# macos
brew install zig
# lambda cliでzigのインストール方法を出力して
cargo lambda system --install-zig
```

Telegramのコマンドを宣言します

<!--チェックしてください　<==>　ご確認ください-->
```rust
#[derive(BotCommands, PartialEq, Clone, Debug)]
// いろんなパラメータに対応しています。公式ドキュメントをチェックしてください。
#[command(
    rename_rule = "lowercase",
    description = "These commands are supported:"
)]
pub enum Command {
    #[command(description = "get current user id")]
    UserID,
}
```

Telegramの処理関数を定義します
<!--more-->
```rust
pub async fn answer(
    bot: teloxide::prelude::Bot,
    msg: Message,
    cmd: Command,
) -> Result<(), RequestError> {
    let reply = match cmd {
        Command::UserID => format!("your id is: {}", from_user).to_string(),
    }

    // 返事を送信し
    bot.send_message(msg.chat.id, v)
        .reply_parameters(ReplyParameters::new(msg.id))
        .parse_mode(teloxide::types::ParseMode::MarkdownV2)
        .disable_link_preview(true)
        .await?;

    Ok(())
}
```

Telegramのルートを定義します

ここはちょっと難しいかもしれません

- `Update::filter_message()`は一般的なメッセージ
- `Update::filter_edited_message()`は更新したメッセージ
- 他の種類のメッセージは[trait.UpdateFilterExt](https://docs.rs/teloxide/latest/teloxide/dispatching/trait.UpdateFilterExt.html)にご確認ください。

`filter_command::<Command>()`はCommandによってメッセージをフィルターする。　　
例えば`filter_command`を削除して`dptree::entry().endpoint(answer)`になったら、これはすべてのメッセージをマッチする。

```rust
pub fn handler() -> Handler<'static, Result<(), RequestError>, DpHandlerDescription> {
    return dptree::entry()
        .branch(
            Update::filter_message()
                .branch(dptree::entry().filter_command::<Command>().endpoint(answer)),
        )
        .branch(
            Update::filter_edited_message()
                .branch(dptree::entry().filter_command::<Command>().endpoint(answer)),
        );
}
```

Telegram Botサーバーなら次のコードで実行できます。Lambdaには他の方法を使います。

```rust
pub struct TErrorHandler {}

impl ErrorHandler<RequestError> for TErrorHandler {
    fn handle_error(self: std::sync::Arc<Self>, error: RequestError) -> BoxFuture<'static, ()> {
        println!("error: {}", error);
        Box::pin(async move {})
    }
}

pub async fn run_bot() -> Dispatcher<Bot, RequestError, DefaultKey> {
    let bot = Bot::from_env();

    bot.set_my_commands(Command::bot_commands())
        .send()
        .await
        .unwrap();

    let handler = handler();


    let dispatcher: Dispatcher<Bot, RequestError, DefaultKey> = Dispatcher::builder(bot, handler)
        .enable_ctrlc_handler()
        .error_handler(Arc::new(TErrorHandler {}))
        .build();

    return dispatcher;
}
```

まずLambdaのエントリー関数を作ります。

```rust
#[derive(Serialize, Deserialize)]
struct Response {
    msg: String,
}

#[derive(Serialize, Deserialize)]
struct LambdaRequest {}

async fn handler(&self, event: LambdaEvent<Value>) -> Result<Response, lambda_runtime::Error> {
        let (payload, _) = event.into_parts();
        // Telegram WebhookはFunction Urlにアクセスするので、ここではLambdaFunctionUrlRequestを使います
        if let Ok(v) = serde_json::from_value::<LambdaFunctionUrlRequest>(payload.clone()) {
            return bot_handler(v).await;
        // 他にはカスタマイズした構造体を使うこともできますので、自由に定義してください。
        } else if let Ok(v) = serde_json::from_value::<LambdaRequest>(payload.clone()) {
            return request_handler(v).await;
        } else {
            return Err(lambda_runtime::Error::from("Unknown request"));
        }
}

async fn request_handler(
    &self,
    request: LambdaRequest,
) -> Result<Response, lambda_runtime::Error> {
    // TODO ...
    return Ok(Response {
        msg: "Send successful.".to_string(),
    });
}
```

Telegram Botのハンドラーを作ります。

```rust
async fn bot_handler(event: LambdaFunctionUrlRequest) -> Result<Response, lambda_runtime::Error> {
    let bot = Bot::from_env();

    let me = bot.get_me().await?;
    println!("Bot: {}, {}", me.username.as_ref().unwrap(), me.id.0);

    match event.raw_path.ok_or("Path is None")?.as_str() {
        // Function UrlをTelegram BotのWebhookに設定し
        "/tgbot/register" => {
            // UrlのHostはHTTPリクエストのドメインです
            let url = format!(
                "https://{}/tgbot",
                event
                    .request_context
                    .domain_name
                    .ok_or("domain name is none")?
            );

            println!("Registering webhook: {}", url);

            // Commandを設定する
            let _ = bot.set_my_commands(Command::bot_commands()).await;
            // Webhookを設定する
            let _ = bot.set_webhook(url::Url::parse(&url)?).send().await?;

            return Ok(Response {
                msg: format!("register telegram bot to {} successful", url).to_string(),
            });
        }

        // telegram Botのリクエストのhandler
        "/tgbot" => {
            let bytes = event.body.ok_or("body is none")?;

            // Function UrlのBodyはbase64エンコードされたものです
            let body = if event.is_base64_encoded {
                general_purpose::STANDARD.decode(bytes)?
            } else {
                bytes.as_bytes().to_vec()
            };

            println!("body: {}", String::from_utf8_lossy(&body));

            // UpdateはTelegram Botのリクストの構造体です, teloxide::types::Update
            let update: Update = serde_json::from_slice(&body)?;
            let handler = handler();
            let dependencies = dptree::deps![me.clone(), bot.clone(), update];
            // リクエスを処理する
            let result = handler.dispatch(dependencies).await;

            return match result {
                ControlFlow::Break(Ok(())) => Ok(Response {
                    msg: "Update was handled by bot.".to_string(),
                }),
                ControlFlow::Break(Err(e)) => Err(lambda_runtime::Error::from(e)),
                ControlFlow::Continue(_) => Ok(Response {
                    msg: "Update was not handled by bot.".to_string(),
                }),
            };
        }
        _ => {}
    }

    Err(lambda_runtime::Error::from(format!("404 NOT FOUND")))
}
```

次はTelegram Bot Fatherで新たなBotを作成して、Tokenを取得してください。  
Lambdaに新たな環境変数を追加します

```md
TELOXIDE_TOKEN=<Telegram Bot Token>
```

ビルド

```shell
cargo lambda build --release --bin lambda
```

デプロイ

```shell
cargo lambda deploy --binary-name lambda hj-telegram-bot
```

Webhookを登録します

```shell
curl https://<function url>/tgbot/register
```

これで完成しました。
Telegram Botに`/userid`を送信してテストしましょう。
