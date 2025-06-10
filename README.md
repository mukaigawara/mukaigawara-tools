# 🧪 Test - VS Code Extension

VS Code のサイドバーにカスタムツールを追加し、ターミナルでよく使うコマンドをワンクリックで実行できる拡張機能です。

---

## ✨ 主な機能

- 📌 アクティビティバーにパネルを追加
- 🖱️ モダンな UI のボタンで以下の操作を即実行
  - ターミナルのクリア
  - 新しいターミナルを開く
  - `docker compose exec -it web bash`
  - `RAILS_ENV=test` をセット
  - 現在のファイルを `rspec` 実行

---

## 📸 スクリーンショット

> `images/extension-ui.png` にスクリーンショットを追加してください。

![UI](images/extension-ui.png)

---

## ⚙️ 要件

- VS Code v1.100.0 以上
- ターミナルで使いたいコマンドがシェルで実行可能であること（例: Docker, Rails）

---

## 🔧 拡張機能の設定

現時点では設定オプションはありません。将来的に追加される可能性があります。

---

## 🐞 既知の問題

- ワークスペース外のファイルを開いている場合、`rspec` コマンドが機能しません。
- 実行コマンドはすべて "MyTerminal" に送られます（将来的に選択可能にする予定）。

---

## 📦 リリースノート

### 1.0.0

- 初期リリース
- サイドパネル UI 作成
- `rspec` 実行、Docker、環境変数セットなどに対応

---

## 📚 開発者向けリンク

- [VS Code Extension API](https://code.visualstudio.com/api)
- [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

---

## ✍️ Markdown Tips

VS Code でこのファイルを開いて次のショートカットを試してみてください：

- プレビュー表示: `Shift+Cmd+V` (mac) / `Shift+Ctrl+V` (Win/Linux)
- 分割表示: `Cmd+\` (mac) / `Ctrl+\` (Win/Linux)

---

**Enjoy your development! 🚀**
 