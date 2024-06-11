import * as vscode from 'vscode';

export class LineFoldingProvider implements vscode.FoldingRangeProvider {
    provideFoldingRanges(
        document: vscode.TextDocument,
        context: vscode.FoldingContext,
        token: vscode.CancellationToken
    ): vscode.FoldingRange[] | Thenable<vscode.FoldingRange[]> {
        const foldingRanges: vscode.FoldingRange[] = [];

        // Regular expressions for single-line and multi-line comments
        const multiLineCommentStartRegex = /^\s*\/\*.*$/;
        const multiLineCommentEndRegex = /^.*\*\/\s*$/;

        let isMultiLineComment = false;
        let multiLineCommentStart = 0;

        for (let line = 0; line < document.lineCount; line++) {
            const lineText = document.lineAt(line).text;

            if (multiLineCommentStartRegex.test(lineText)) {
                // Multi-line comment start
                isMultiLineComment = true;
                multiLineCommentStart = line;
            }

            if (isMultiLineComment && multiLineCommentEndRegex.test(lineText)) {
                // Multi-line comment end
                foldingRanges.push(new vscode.FoldingRange(multiLineCommentStart, line, vscode.FoldingRangeKind.Comment));
                isMultiLineComment = false;
            }
        }
        console.log(`Total folding ranges: ${foldingRanges.length}`);
        return foldingRanges;
    }
}
