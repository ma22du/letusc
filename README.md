# LetUsC Shortcuts

A Visual Studio Code extension to help C++ programmers.

## Features

- Hide and show lines with a single command.
- Dim lines to reduce distraction.

## Installation

1. Download the `.vsix` file from the release page.
2. Open Visual Studio Code.
3. Go to the Extensions view by clicking on the Extensions icon in the Activity Bar on the side of the window or pressing `Ctrl+Shift+X`.
4. Click on the three dots (More Actions) at the top right of the Extensions view, and select `Install from VSIX...`.
5. Navigate to the location where the `.vsix` file is stored, select it, and click `Open`.

## Usage

To toggle hide lines, use the command `Toggle Hide Lines` available in the Command Palette (`Ctrl+Shift+P`).

You can also toggle the hide lines through the key binding **_Ctrl+`_**

 Or from the status bar lock icon.

When this option is active / enabled you are not allowed to edit the current active document.

## Configuration

The extension can be configured with custom regex patterns in the `settings.json` file.

```json
"letusc.regexPatterns": [
    {
        "pattern": "^\\s*\\/\\/.*",
        "patternStart": "//"
    },
    {
        "pattern": "^\\s*LOG",
        "patternStart": "LOG"
    }
]
