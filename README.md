# 🧪 Mukai Tools - VS Code Extension

VS Code のサイドバーにカスタムツールを追加し、ターミナルでよく使うコマンドをワンクリックで実行できる拡張機能です。

---

## ✨ 主な機能

- 📌 アクティビティバーにパネルを追加
  - ターミナルのクリア
  - 新しいターミナルを開く
  - `docker compose exec -it web bash`
  - `RAILS_ENV=test` をセット
  - 現在のファイルを `rspec` 実行
  ...

---

## ⚙️ 要件

- VS Code v1.100.0 以上
- ターミナルで使いたいコマンドがシェルで実行可能であること（例: Docker, Rails）

---

## 🔧 拡張機能の設定

現時点では設定オプションはありません。将来的に追加される可能性があります。

---

## compile

```bash
vsce package
```

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