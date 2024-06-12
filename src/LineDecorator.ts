import * as vscode from 'vscode';

interface RegExPatternConfig {
    pattern: string;
    patternStart: string;
}

export class LineDecorator {
    private hiddenDecorationType: vscode.TextEditorDecorationType;
    private expandedDecorationType: vscode.TextEditorDecorationType;
    private expandedLines: Set<number> = new Set();
    private enabled: boolean = true;
    private toggleStatusBarCallback: (enabled: boolean) => void;

    constructor(toggleStatusBarCallback: (enabled: boolean) => void) {
        this.toggleStatusBarCallback = toggleStatusBarCallback;
        // Decoration type for hidden comments
        this.hiddenDecorationType = vscode.window.createTextEditorDecorationType({
            after: {
                contentText: '…',
                color: new vscode.ThemeColor('editorLineNumber.foreground'),
                margin: '0 0 0 0',
            },
            textDecoration: 'none; display: none;',
        });

        // Decoration type for expanded comments
        this.expandedDecorationType = vscode.window.createTextEditorDecorationType({
            after: {
                contentText: '',
                color: '',
                margin: '0 0 0 0',
            },
        });
    }

    getHiddenDecorationType() {
        return this.hiddenDecorationType;
    }

    getExpandedDecorationType() {
        return this.expandedDecorationType;
    }

    getExpandedLines() {
        return this.expandedLines;
    }

    isEnabled() {
        return this.enabled;
    }

    public decorate(editor: vscode.TextEditor,line: number = -1) {
        if (!this.enabled) {
            this.clearDecorations(editor);
            return;
        }

        const patterns = this.getRegExPatterns();
        console.log('Loaded regex patterns:', patterns); // Log loaded patterns
        
        const hiddenDecorations: vscode.DecorationOptions[] = [];
        const expandedDecorations: vscode.DecorationOptions[] = [];
        let lines = [];
        if (line !== -1){
            lines.push(editor.document.lineAt(line).text);           
        }
        else{
            const text = editor.document.getText();
            lines = text.split('\n');
        }
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            for (const { pattern: pattern, patternStart: patLocStart } of patterns) {
                if (pattern.test(line)) {
                    const startPos = new vscode.Position(i, 0);
                    const endPos = new vscode.Position(i, line.length);
                
                    const hidePatternStart = line.indexOf(patLocStart);
                    const patternPos = new vscode.Position(i, hidePatternStart + patLocStart.length);
                
                    if (this.expandedLines.has(i)) {
                        // Expanded comment: show the full comment text
                        const decoration = {
                            range: new vscode.Range(startPos, endPos)
                        };
                        expandedDecorations.push(decoration);
                    } else {               
                        // Hidden comment: show `…` after `commentStart`
                        const hiddenDecoration = {
                            range: new vscode.Range(patternPos, endPos),
                            renderOptions: {
                                after: {
                                    contentText: '…',
                                    color: new vscode.ThemeColor('editorLineNumber.foreground')                                    
                                },
                                textDecoration: 'none; opacity: 0.5;'
                            }
                        };
                        
                       hiddenDecorations.push(hiddenDecoration);
                    }
                }
                
            }
        }
        
        editor.setDecorations(this.hiddenDecorationType, hiddenDecorations);
        editor.setDecorations(this.expandedDecorationType, expandedDecorations);
    }

    public toggleLineExpansion(line: number) {
        if (this.expandedLines.has(line)) {
            this.expandedLines.delete(line);
        } else {
            this.expandedLines.add(line);
        }
    }

    public toggleEnabled() {
        this.enabled = !this.enabled;
        this.toggleStatusBarCallback(this.enabled);  // Toggle the status bar item
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            this.decorate(editor);
        }
    }

    private clearDecorations(editor: vscode.TextEditor) {
        editor.setDecorations(this.hiddenDecorationType, []);
        editor.setDecorations(this.expandedDecorationType, []);
    }

    private getRegExPatterns(): { pattern: RegExp, patternStart: string }[] {
        const config = vscode.workspace.getConfiguration('letusc');
        const patterns: RegExPatternConfig[] = config.get('regexPatterns') || [];
        return patterns.map(({ pattern, patternStart }) => ({
            pattern: new RegExp(pattern),
            patternStart: patternStart
        }));
    }
}
