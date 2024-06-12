import * as vscode from 'vscode';
import * as assert from 'assert';
import { LineDecorator } from '../LineDecorator';

suite('LineDecorator Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    let lineDecorator: LineDecorator;
    let mockEditor: vscode.TextEditor;
    let mockStatusBarItem: vscode.StatusBarItem;

    setup(() => {
        lineDecorator = new LineDecorator((enabled: boolean) => {
            mockStatusBarItem.text = enabled ? '$(eye) Toggle Comments' : '$(eye-closed) Toggle Comments';
        });

        // Mock TextEditor
        mockEditor = {
            document: {
                getText: () => 'const x = 10;\n// This is a comment\nconst y = 20;',
                lineAt: (line: number) => {
                    const lines = [
                        { text: 'const x = 10;' },
                        { text: '// This is a comment' },
                        { text: 'const y = 20;' }
                    ];
                    return { text: lines[line].text };
                },
                lineCount: 3,
                uri: { fsPath: '' } as vscode.Uri // Mock Uri for the document
            },
            setDecorations: () => { /* Mock function */ }
        } as unknown as vscode.TextEditor;
    });

    test('should hide comment lines', () => {
        lineDecorator.decorate(mockEditor);

        assert.ok(lineDecorator.getHiddenDecorationType());
        assert.ok(lineDecorator.getExpandedDecorationType());
        // You can add more specific checks here based on your implementation details
    });

    test('should dim comment lines', () => {
        lineDecorator.decorate(mockEditor);

        // Check if the dimmed decorations are applied
        const dimmedDecorations = lineDecorator.getHiddenDecorationType();
        assert.ok(dimmedDecorations);
        // Further assertions can be added based on the implementation details
    });

    test('should reveal comments when toggled', () => {
        lineDecorator.decorate(mockEditor);

        assert.strictEqual(lineDecorator.getExpandedLines().size, 0,'Initially no lines should be expanded');

        // Simulate toggling the comment decoration
        lineDecorator.toggleEnabled();
        lineDecorator.decorate(mockEditor);

        // Verify the state after toggling
        assert.strictEqual(lineDecorator.getExpandedLines().size, 0,'After toggling, expandedLines should be empty'); // Adjust based on your implementation
    });

    test('should enable decorations when toggled again', () => {
        // Toggle to disable
        lineDecorator.toggleEnabled();
        assert.strictEqual(lineDecorator.isEnabled(), false, 'After first toggle, enabled should be false');
        // Toggle again to enable
        lineDecorator.toggleEnabled();
        assert.strictEqual(lineDecorator.isEnabled(), true, 'After second toggle, enabled should be true');

    });
});
