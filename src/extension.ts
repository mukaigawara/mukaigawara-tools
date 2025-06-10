import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const provider = new RailsToolsProvider();
  const treeView = vscode.window.createTreeView('railsToolsView', {
    treeDataProvider: provider,
    showCollapseAll: true,
  });

  context.subscriptions.push(treeView);

  const commandMap: Record<string, () => void> = {
    clearTerminal: () =>
      withTerminal((t) => t.sendText('clear', true), 'ターミナルをクリアしました'),
    deleteTerminal: () => {
      const terminal = vscode.window.activeTerminal;
      if (terminal) {
        terminal.dispose();
        vscode.window.showInformationMessage('現在のターミナルを削除しました');
      } else {
        vscode.window.showErrorMessage('ターミナルが見つかりません');
      }
    },
    newTerminal: () => {
      vscode.window.createTerminal().show();
      vscode.window.showInformationMessage('新しいターミナルを開きました');
    },
    runDockerBash: () => withTerminal((t) => t.sendText('docker compose exec -it web bash')),
    runDockerAttach: () => withTerminal((t) => t.sendText('docker attach mflow-backend-web-1')),
    setEnv: () => withTerminal((t) => t.sendText('RAILS_ENV=test')),
    runRspec: () => runFileCommand('rspec'),
    runRubocop: () => runFileCommand('rubocop -a'),
    runRubocopAll: () => withTerminal((t) => t.sendText('rubocop -a', true)),
    runRailsConsole: () => withTerminal((t) => t.sendText('rails console')),
    runRailsConsoleSandbox: () => withTerminal((t) => t.sendText('rails console -s')),
    runDbMigrate: () => withTerminal((t) => t.sendText('rails db:migrate')),
    runDbMigrateStatus: () => withTerminal((t) => t.sendText('rails db:migrate:status')),
    runDbRollback: () => withTerminal((t) => t.sendText('rails db:rollback')),
    runRailsGenerateModel: () => withTerminal((t) => t.sendText('rails generate model')),
    runRailsGenerateController: () => withTerminal((t) => t.sendText('rails generate controller')),
    runRailsGenerateMigration: () => withTerminal((t) => t.sendText('rails generate migration')),
    runRailsGenerateJob: () => withTerminal((t) => t.sendText('rails generate job')),
    gitMergeDevelop: () => withTerminal((t) => t.sendText('git merge develop')),
  };

  Object.entries(commandMap).forEach(([name, callback]) =>
    context.subscriptions.push(vscode.commands.registerCommand(`railstools.${name}`, callback))
  );
}

const sectionNames = ['terminal', 'docker', 'rspec', 'rubocop', 'rails', 'git'] as const;
type SectionName = (typeof sectionNames)[number];

class RailsToolsProvider implements vscode.TreeDataProvider<RailsToolItem> {
  getTreeItem(element: RailsToolItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: RailsToolItem): RailsToolItem[] {
    if (!element) {
      return sectionNames.map((section) => createSectionItem(section.toUpperCase(), section));
    }

    const sectionCommands: Record<SectionName, [string, string][]> = {
      terminal: [
        ['現在のターミナルをクリア', 'clearTerminal'],
        ['現在のターミナルを削除', 'deleteTerminal'],
        ['新しいターミナルを開く', 'newTerminal'],
      ],
      docker: [
        ['docker compose exec -it web bash', 'runDockerBash'],
        ['docker attach mflow-backend-web-1', 'runDockerAttach'],
        ['RAILS_ENV=test', 'setEnv'],
      ],
      rspec: [['rspec（現在のファイル）', 'runRspec']],
      rubocop: [
        ['rubocop -a（現在のファイル）', 'runRubocop'],
        ['rubocop -a（全ファイル）', 'runRubocopAll'],
      ],
      rails: [
        ['rails console', 'runRailsConsole'],
        ['rails console -s', 'runRailsConsoleSandbox'],
        ['rails db:migrate', 'runDbMigrate'],
        ['rails db:migrate:status', 'runDbMigrateStatus'],
        ['rails db:rollback', 'runDbRollback'],
        ['rails generate model', 'runRailsGenerateModel'],
        ['rails generate controller', 'runRailsGenerateController'],
        ['rails generate migration', 'runRailsGenerateMigration'],
        ['rails generate job', 'runRailsGenerateJob'],
      ],
      git: [['git merge develop', 'gitMergeDevelop']],
    };

    return (
      sectionCommands[element.sectionId as SectionName]?.map(([label, cmd]) =>
        createCommandItem(label, `railstools.${cmd}`)
      ) ?? []
    );
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
  if (message) {
    return vscode.window.showInformationMessage(message);
  }
}

function getOrCreateTerminal(): vscode.Terminal {
  const terminal = vscode.window.activeTerminal ?? vscode.window.createTerminal('Rails Tools');
  terminal.show();
  return terminal;
}

function runFileCommand(command: string) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return vscode.window.showErrorMessage('アクティブなエディタが見つかりません。');
  }

  const relativePath = vscode.workspace.asRelativePath(editor.document.uri);
  withTerminal((t) => t.sendText(`${command} ${relativePath}`, true));
  vscode.window.showInformationMessage(`${command} を実行: ${relativePath}`);
}

export function deactivate() {}
