import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'custom-container-id-1',
      new MySidebarViewProvider(context.extensionUri)
    )
  );
}

class MySidebarViewProvider implements vscode.WebviewViewProvider {
  constructor(private readonly extensionUri: vscode.Uri) {}

  resolveWebviewView(webviewView: vscode.WebviewView) {
    webviewView.webview.options = {
      enableScripts: true,
    };

    webviewView.webview.html = this.getHtml(webviewView.webview);

    webviewView.webview.onDidReceiveMessage((msg) => {
	let terminal = vscode.window.activeTerminal;
	if (!terminal) {
	terminal = vscode.window.createTerminal('MyTerminal');
	}
	terminal.show();


      switch (msg.command) {
        case 'clearTerminal':
          // クリアは、端末へクリアコマンド送信
          // *Windowsの場合は 'cls', Mac/Linuxは 'clear' ですが環境に応じて変更してください*
          terminal.sendText('clear');
          break;

        case 'newTerminal':
          // 新しい端末を開くだけ
          vscode.window.createTerminal().show();
          break;

        case 'runDocker':
          terminal.sendText('docker compose exec -it web bash');
          break;

        case 'setEnv':
          terminal.sendText('RAILS_ENV=test');
          break;
      }
    });
  }

private getHtml(webview: vscode.Webview): string {
  return `
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          padding: 16px;
        }
        .button-row {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
        }
        .main-button {
          width: 100%;
          padding: 12px 0;
          font-size: 16px;
          color: white;
		  background-color: #111;
          border: 2px solid #111;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.3s ease, color 0.3s ease, transform 0.15s ease;
        }
		.secondary-button {
		  width: 100%;
		  padding: 8px 0;
		  font-size: 12px;
		  color: white;
		  background-color: #111;
		  border: 1px solid #111;
		  border-radius: 6px;
		  cursor: pointer;
		  transition: background-color 0.3s ease, color 0.3s ease, transform 0.15s ease;
		}
        button:hover {
          background-color: #333;
        }
        button:active {
          transform: scale(0.98);
        }
        hr {
          border: none;
          border-top: 1px solid #ddd;
          margin: 24px 0;
        }
        .section {
          margin-bottom: 16px;
        }
        .description {
          font-size: 14px;
          margin-bottom: 8px;
          color: #555;
        }
      </style>
    </head>
    <body>
      <!-- 横並びのクリア＆新規ターミナルボタン -->
      <div class="button-row">
        <button class="secondary-button" onclick="clearTerminal()">ターミナルのクリア</button>
        <button class="secondary-button" onclick="newTerminal()">新しいターミナル</button>
      </div>

      <hr>

      <!-- 縦並びの既存コマンド -->
      <div class="section">
        <div class="description">Dockerコンテナ内のbashを起動します</div>
        <button class="main-button" onclick="runDocker()">docker compose exec -it web bash</button>
      </div>

      <div class="section">
        <div class="description">RAILS_ENV=test をセットします</div>
        <button class="main-button" onclick="setEnv()">RAILS_ENV=test</button>
      </div>

      <script>
        const vscode = acquireVsCodeApi();

        function clearTerminal() {
          vscode.postMessage({ command: 'clearTerminal' });
        }
        function newTerminal() {
          vscode.postMessage({ command: 'newTerminal' });
        }
        function runEcho() {
          vscode.postMessage({ command: 'runEcho' });
        }
        function runDocker() {
          vscode.postMessage({ command: 'runDocker' });
        }
        function setEnv() {
          vscode.postMessage({ command: 'setEnv' });
        }
      </script>
    </body>
    </html>
  `;
}

}
