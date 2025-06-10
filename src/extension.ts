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
  const terminal =
    vscode.window.terminals.find(t => t.name === 'MyTerminal') ??
    vscode.window.createTerminal('MyTerminal');

  terminal.show();

  if (msg.command === 'runEcho') {
    terminal.sendText('echo "Hello from Extension!"');
  } else if (msg.command === 'runDocker') {
    terminal.sendText('docker compose exec -it web bash');
  } else if (msg.command === 'setEnv') {
	terminal.sendText('RAILS_ENV=test');
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
        .section {
          margin-bottom: 16px;
        }
        .description {
          font-size: 14px;
          margin-bottom: 8px;
          color: white;
        }
        button {
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
        button:hover {
          background-color: #333;
        }
        button:active {
          transform: scale(0.98);
        }
      </style>
    </head>
    <body>
      <div class="section">
        <button onclick="runDocker()">docker compose exec -it web bash</button>
      </div>
	  <div class="section">
        <button onclick="setEnv()">RAILS_ENV=test</button>
      </div>

      <script>
        const vscode = acquireVsCodeApi();
        function runCommand() {
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
