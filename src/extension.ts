// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { LineFoldingProvider } from './FoldingProvider';
import { LineDecorator } from './LineDecorator';

let decorator: LineDecorator;
let isEditingDisabled = true;
let currentLine = -1;
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const languages = ['c', 'cpp', 'objective-c', 'objective-cpp'];
	 languages.forEach(language => {
		 context.subscriptions.push(
			 vscode.languages.registerFoldingRangeProvider({ language }, new LineFoldingProvider())
		 );		 
	 });

	decorator = new LineDecorator((enabled: boolean) => {
        statusBarItem.text = enabled ? '$(lock)' : '$(unlock)';
		statusBarItem.tooltip = enabled ? 'ReadOnly' : 'Edit';
    });

	const activeEditor = vscode.window.activeTextEditor;
	 if (activeEditor) {
		 decorator.decorate(activeEditor);
	 }
 
	 vscode.window.onDidChangeActiveTextEditor(editor => {
		 if (editor) {
			 decorator.decorate(editor);
		 }
	 }, null, context.subscriptions);
 
	vscode.workspace.onDidChangeTextDocument(event => {
		const activeEditor = vscode.window.activeTextEditor;
		if (activeEditor && event.document === activeEditor.document) {
			decorator.decorate(activeEditor);
		}
	}, null, context.subscriptions);
 
	 vscode.workspace.onDidChangeConfiguration(event => {
		 if (event.affectsConfiguration('letusc.regexPatterns')) {
			console.log('Configuration changed');
			 const activeEditor = vscode.window.activeTextEditor;
			 if (activeEditor) {
				 decorator.decorate(activeEditor);
			 }
		 }
	 }, null, context.subscriptions);
	 // Function to handle line changes
	 function handleLineChange(activeEditor: vscode.TextEditor, newLine: number) {        
        decorator.toggleLineExpansion(currentLine); // Toggle the previous line
		decorator.toggleLineExpansion(newLine);
        decorator.decorate(activeEditor); // Decorate the new line
        currentLine = newLine; // Update the current line
    }
	 vscode.window.onDidChangeTextEditorSelection(event => {
		const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor) {
            const newLine = activeEditor.selection.active.line;
            handleLineChange(activeEditor, newLine);
        }		
	 }, null, context.subscriptions);

	 vscode.window.onDidChangeTextEditorVisibleRanges(event => {
		const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor) {
            const newLine = activeEditor.selection.active.line;
            handleLineChange(activeEditor, newLine);
        }		
	 },null, context.subscriptions);

	 // Command to toggle the decorator
	 const toggleDecoratorCommand = vscode.commands.registerCommand('letusc.toggleLinesHide', () => {
		decorator.toggleEnabled();
		isEditingDisabled = decorator.isEnabled();
	});

	 // Register a command to intercept typing
	 context.subscriptions.push(
        vscode.commands.registerCommand('type', (args) => {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                if (isEditingDisabled) {
                    if (isNavigationKey(args.text)) {
                        // Allow navigation keys
                        vscode.commands.executeCommand('default:type', args);
                    } else {
                        // Prevent other keys
                        vscode.window.showInformationMessage('Editing is disabled');
                    }
                } else {
                    // Allow all keys when editing is enabled
                    vscode.commands.executeCommand('default:type', args);
                }
            }
        })
    );

	function isNavigationKey(key: string): boolean {
        const navigationKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'];
        return navigationKeys.includes(key);
    }

	

	// Optional: Command to toggle comments manually
	const toggleCommentCommand = vscode.commands.registerCommand('letusc.toggleLineHide', () => {
		const activeEditor = vscode.window.activeTextEditor;
		if (activeEditor) {
			const line = activeEditor.selection.active.line;
			decorator.toggleLineExpansion(line);
			decorator.decorate(activeEditor);
		}
	});

   // Create a status bar item
   let statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
   statusBarItem.command = 'letusc.toggleLinesHide';
   statusBarItem.text = '$(lock)'; 
   //console.log('Status bar item text:', statusBarItem.text);
   statusBarItem.tooltip = 'ReadOnly';
   statusBarItem.show();
   context.subscriptions.push(statusBarItem);
   context.subscriptions.push(toggleDecoratorCommand);
   context.subscriptions.push(toggleCommentCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {}
