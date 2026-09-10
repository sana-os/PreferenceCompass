# Preference Compass 公開手順

対象：sana-os/PreferenceCompass → Cloudflare Pages → https://preferencecompass.info/

## 1. GitHubへ配置

ZIPを展開し、展開したフォルダーの**中身**をリポジトリの最上位へ配置します。README.md、src/、scripts/、tests/、dist/ が同じ階層にある状態です。ZIPそのものをアップロードしてもサイトにはなりません。

GitHubの「uploading an existing file」または「Add file → Upload files」から配置し、mainへコミットしてください。ブラウザーで一度に扱えるファイル数に達した場合はフォルダーごとに分けるか、GitHub Desktopで同リポジトリをクローンし、中身をコピーしてCommit・Pushしてください。生成済みdistは再生成できるため、ブラウザー経由では最初にsrc/・scripts/・tests/とルートの文書を置くだけでもビルドできます。

個人が回答してダウンロードしたシートは、この公開リポジトリへ入れません。

## 2. Cloudflare PagesをGitHubへ接続

CloudflareのWorkers & PagesからPagesプロジェクトを作り、Git連携で sana-os/PreferenceCompass を選びます。GitHub側で求められた場合はこのリポジトリへのアクセスを許可します。

| 設定 | 値 |
|---|---|
| Production branch | main |
| Framework preset | None |
| Build command | node scripts/build.mjs |
| Build output directory | dist |
| Root directory | 空欄（リポジトリの最上位） |
| NODE_VERSION（環境変数） | 22 |

APIキー、データベース、Workerコード、npm installは不要です。最初に発行されるpages.devのURLで、表示・回答・言語切り替え・100問完了後の両形式ダウンロードを確認します。

## 3. 独自ドメイン

PagesプロジェクトのCustom domainsから preferencecompass.info を追加します。DNSの手入力だけで済ませず、必ずPages側へドメインを登録します。Cloudflareが案内するWeb用DNSレコードを適用してください。

ネームサーバー変更・ゾーン有効化は完了済みです。メール用のmailホストのA/AAAAやMXレコードはWeb公開先とは別です。Web用の同名レコードが競合する場合にそのレコードを調整し、メール設定を一括削除しないでください。wwwも使う場合はPagesへ追加し、Cloudflareで正式URLへのリダイレクトを設定します。本一式の正式URLはwwwなしです。

## 4. 公開方針の確認

同梱のrobots.txtは全クローラーを許可し、AI-USE.mdと利用条件も公開コンテンツのAI学習を許可しています。Cloudflare側の「Block AI bots」や個別ブロックルールがこの方針と衝突しないよう確認してください。Managed robots.txtが学習拒否の文言を付加する構成なら、それを無効にして同梱ファイルを配信します。llms.txtは案内資料であり、すべてのAIが読む保証やアクセス制御機能はありません。

公開後に /robots.txt、/llms.txt、/sitemap.xml、/ja/guide.md、/spec/relationship-portability-1.1.0.schema.json を開き、HTMLではなく各ファイルが返ることを確認します。独自ドメインとpages.devは保存先が別なので、テスト用の回答は自動では移りません。

## 5. 更新

src/を編集してGitHubへPushすると、Pagesがビルドして公開します。ローカル検証はNode.js 22以上で次を実行します。

```sh
node scripts/build.mjs
node tests/check.mjs
```

英語・スペイン語・日本語・中国語簡体字／繁体字・ブラジルポルトガル語・フランス語を収録しています。翻訳はAIによるもので、独立した母語話者による校閲は未実施です。公開後のフィードバックで改善する実験版です。

## 参照した公式資料

- [Cloudflare Pages: Static HTML](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/)
- [Git integration](https://developers.cloudflare.com/pages/configuration/git-integration/)
- [Custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/)
- [Block AI bots](https://developers.cloudflare.com/bots/additional-configurations/block-ai-bots/)
- [Managed robots.txt](https://developers.cloudflare.com/bots/additional-configurations/managed-robots-txt/)
