// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { stringify } from 'querystring';
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "memo-mode" is now active!');

	type ConfType = {

	};
	function getconf(){
		let extensionId = 'kuromaru';
		//return vscode.workspace.getConfiguration().get(extension) as any;
		return vscode.workspace.getConfiguration().get<ConfType>(extensionId);
	}
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('kuromaru.launch', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from kuromaru!');
	});

	let timeout: NodeJS.Timer | undefined = undefined;

	// create a decorator type that we use to decorate small numbers
	const smallNumberDecorationType = vscode.window.createTextEditorDecorationType({
		borderWidth: '1px',
		borderStyle: 'solid',
		overviewRulerColor: 'blue',
		overviewRulerLane: vscode.OverviewRulerLane.Right,
		//isWholeLine:true,
		light: {
			// this color will be used in light color themes
			borderColor: 'darkblue'
		},
		dark: {
			// this color will be used in dark color themes
			borderColor: 'lightblue'
		}
	});
	
	// create a decorator type that we use to decorate large numbers
	const largeNumberDecorationType = vscode.window.createTextEditorDecorationType({
		cursor: 'crosshair',
		// use a themable color. See package.json for the declaration and default values.
		backgroundColor: { id: 'myextension.largeNumberBackground' }
	});
	const titleDeco = vscode.window.createTextEditorDecorationType({
		isWholeLine: true,
		fontStyle:'bold',
		light: {
			// this color will be used in light color themes
			borderColor: 'darkblue',
			backgroundColor: 'darkblue',
		},
		dark: {
			// this color will be used in dark color themes
			borderColor: 'lightgreen',
			backgroundColor: 'lightgreen',
		}
	});
	const subTitleDeco = vscode.window.createTextEditorDecorationType({
		//isWholeLine: true,
		fontStyle:'bold',
		light: {
			// this color will be used in light color themes
			borderColor: 'darkblue',
			backgroundColor: 'darkblue',
		},
		dark: {
			// this color will be used in dark color themes
			borderColor: 'lightgreen',
			backgroundColor: 'lightgreen',
		}
	});
	const itemDeco = vscode.window.createTextEditorDecorationType({
		//isWholeLine: true,
		fontStyle:'bold',
		light: {
			// this color will be used in light color themes
			borderColor: 'darkblue',
			backgroundColor: 'darkblue',
		},
		dark: {
			// this color will be used in dark color themes
			borderColor: 'lightgreen',
			backgroundColor: 'lightgreen',
		}
	});

	let activeEditor = vscode.window.activeTextEditor;

	function updateDecorations() {
		if (!activeEditor) {
			return;
		}
		let decomap : [RegExp, (m:RegExpExecArray) => vscode.TextEditorDecorationType][] = [
			/*
			[/\d+/gu, m => {
				if(m[0].length > 3)return largeNumberDecorationType;
				return smallNumberDecorationType;
				}],
				*/
			[/^(●+).*$/gm, m=>{
				if(m[1].length === 1){
					return titleDeco;
				}
				return subTitleDeco;
			}],
			[/^[＋]+/gm, m=>{
				return itemDeco;
			}],
			[/^X+/gm, m=>{
				return itemDeco;
			}],
			[/^\d+/gm, m => {
				if(m[0].length > 3)return largeNumberDecorationType;
				return smallNumberDecorationType;
			}],
		];


		const text = activeEditor.document.getText();
		
		//let key2poss : {[K in string]: vscode.Range[]};
		//let key2deco : {[K in string]: vscode.TextEditorDecorationType};
		let key2poss = new Map<string, vscode.DecorationOptions[]>();
		let key2deco = new Map<string, vscode.TextEditorDecorationType>();
		for(let [r, fun] of decomap){
			let match;
			while ((match = r.exec(text))) {
				const startPos = activeEditor.document.positionAt(match.index);
				const endPos = activeEditor.document.positionAt(match.index + match[0].length);
				const decoration = { range: new vscode.Range(startPos, endPos), hoverMessage: 'Number **' + match[0] + '**' };
				let deco = fun(match);
				if(!key2poss.has(deco.key)){
					key2poss.set(deco.key, []);
					key2deco.set(deco.key, deco);
				}
				key2poss.get(deco.key)!.push(decoration);
			}
		}
		for(let [key, deco] of key2deco){
			let poss = key2poss.get(key)!;
			activeEditor.setDecorations(deco, poss);
		}
		
		if(0){
			const regEx = /\d+/g;

			const smallNumbers: vscode.DecorationOptions[] = [];
			const largeNumbers: vscode.DecorationOptions[] = [];
			let match;
			while ((match = regEx.exec(text))) {
				const startPos = activeEditor.document.positionAt(match.index);
				const endPos = activeEditor.document.positionAt(match.index + match[0].length);
				const decoration = { range: new vscode.Range(startPos, endPos), hoverMessage: 'Number **' + match[0] + '**' };
				if (match[0].length < 3) {
					smallNumbers.push(decoration);
				} else {
					largeNumbers.push(decoration);
				}
			}
			activeEditor.setDecorations(smallNumberDecorationType, smallNumbers);
			activeEditor.setDecorations(largeNumberDecorationType, largeNumbers);
		}
	}

	function triggerUpdateDecorations(throttle = false) {
		//return;
		if (timeout) {
			clearTimeout(timeout);
			timeout = undefined;
		}
		if (throttle) {
			timeout = setTimeout(updateDecorations, 500);
		} else {
			updateDecorations();
		}
	}

	if (activeEditor) {
		triggerUpdateDecorations();
	}

	vscode.window.onDidChangeActiveTextEditor(editor => {
		activeEditor = editor;
		if (editor) {
			triggerUpdateDecorations();
		}
	}, null, context.subscriptions);

	vscode.workspace.onDidChangeTextDocument(event => {
		if (activeEditor && event.document === activeEditor.document) {
			triggerUpdateDecorations(true);
		}
	}, null, context.subscriptions);

	// for Outline
	class SwmfConfigDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
		public provideDocumentSymbols(
			document: vscode.TextDocument,
			token: vscode.CancellationToken): Promise<vscode.DocumentSymbol[]> {
			return new Promise((resolve, reject) => {
				let symbols: vscode.DocumentSymbol[] = [];
				for (var i = 0; i < document.lineCount; i++) {
					var line = document.lineAt(i);
					if (line.text.startsWith("●")) {
						let symbol = new vscode.DocumentSymbol(
							line.text, 'Component',
							vscode.SymbolKind.Function,
							line.range, line.range)
						symbols.push(symbol)
					}
				}
				resolve(symbols);
			});
		}
	};
	let disposable2 = vscode.languages.registerDocumentSymbolProvider(
		{scheme: "file", language: "kuromaru"}, 
		new SwmfConfigDocumentSymbolProvider());
	
	context.subscriptions.push(disposable, disposable2);
}

// this method is called when your extension is deactivated
export function deactivate() {}
