import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const provider = new RailsToolsProvider();
  const treeView = vscode.window.createTreeView('railsToolsView', {
    treeDataProvider: provider,
    showCollapseAll: true
  });

  context.subscriptions.push(treeView);

  const commandMap: Record<string, () => void> = {
    clearTerminal: () => withTerminal(t => t.sendText('clear', true), 'ターミナルをクリアしました'),
    newTerminal: () => {
      vscode.window.createTerminal().show();
      vscode.window.showInformationMessage('新しいターミナルを開きました');
    },
    runDocker: () => withTerminal(t => t.sendText('docker compose exec -it web bash'), 'Docker bashを起動しました'),
    setEnv: () => withTerminal(t => t.sendText('RAILS_ENV=test'), 'RAILS_ENV=testを設定しました'),
    runRspec: () => runFileCommand('rspec'),
    runRubocop: () => runFileCommand('rubocop -a'),
    runRubocopAll: () => withTerminal(t => t.sendText('rubocop -a', true), '全ファイルでRubocopを実行しました'),
  };

  Object.entries(commandMap).forEach(([name, callback]) =>
    context.subscriptions.push(
      vscode.commands.registerCommand(`railstools.${name}`, callback)
    )
  );
}

class RailsToolsProvider implements vscode.TreeDataProvider<RailsToolItem> {
  getTreeItem(element: RailsToolItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: RailsToolItem): RailsToolItem[] {
    if (!element) {
      return ['terminal', 'docker', 'rspec', 'rubocop'].map(section =>
        createSectionItem(section.toUpperCase(), section)
      );
    }

    const sectionCommands: Record<string, [string, string][]> = {
      terminal: [
        ['ターミナルをクリア', 'clearTerminal'],
        ['新しいターミナルを開く', 'newTerminal']
      ],
      docker: [
        ['docker compose exec -it web bash', 'runDocker'],
        ['RAILS_ENV=test', 'setEnv']
      ],
      rspec: [['rspec（現在のファイル）', 'runRspec']],
      rubocop: [
        ['rubocop -a（現在のファイル）', 'runRubocop'],
        ['rubocop -a（全ファイル）', 'runRubocopAll']
      ]
    };

    return sectionCommands[element.sectionId ?? '']?.map(([label, cmd]) =>
      createCommandItem(label, `railstools.${cmd}`)
    ) ?? [];
  }
}

class RailsToolItem extends vscode.TreeItem {
  constructor(
    label: string,
    collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly sectionId?: string,
    commandId?: string
  ) {
    super(label, collapsibleState);
    if (commandId) {
      this.command = { command: commandId, title: label };
      this.contextValue = 'command';
      this.tooltip = label;
    } else {
      this.contextValue = 'section';
    }
  }
}

function createSectionItem(label: string, sectionId: string) {
  return new RailsToolItem(label, vscode.TreeItemCollapsibleState.Expanded, sectionId);
}

function createCommandItem(label: string, commandId: string) {
  return new RailsToolItem(label, vscode.TreeItemCollapsibleState.None, undefined, commandId);
}

function withTerminal(action: (t: vscode.Terminal) => void, message?: string) {
  const terminal = getOrCreateTerminal();
  action(terminal);
  if (message) {return vscode.window.showInformationMessage(message);};
}

function getOrCreateTerminal(): vscode.Terminal {
  const terminal = vscode.window.activeTerminal ?? vscode.window.createTerminal('Rails Tools');
  terminal.show();
  return terminal;
}

function runFileCommand(command: string) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {return vscode.window.showErrorMessage('アクティブなエディタが見つかりません。');};

  const relativePath = vscode.workspace.asRelativePath(editor.document.uri);
  withTerminal(t => t.sendText(`${command} ${relativePath}`, true));
  vscode.window.showInformationMessage(`${command} を実行: ${relativePath}`);
}

export function deactivate() {}
