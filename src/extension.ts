// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as https from "https";

type AiCallback = (response: string, errorText: string) => void;

interface AiIntegration {
	query(queryText: string, context: string | undefined, callback: AiCallback): Promise<void>;
};

class OpenAiChatIntegration implements AiIntegration {
	apiKey: string;
	model: string;
	constructor() {
		const config = vscode.workspace.getConfiguration();
		const key = config.get<string>("flexiable-gpt.openai.key");
		if (!key) {
			throw new Error("Open AI Key missing from settings");
		}
		const model = config.get<string>("flexiable-gpt.openai.model");
		if (!model) {
			throw new Error("Open AI Model not set in settings");
		}
		this.apiKey = key;
		this.model = model;
	}
	async query(queryText: string, context: string | undefined, callback: AiCallback): Promise<void> {
		vscode.window.showInformationMessage(`Querying ChatGPT ${this.model}. Please Wait`);
		const config = vscode.workspace.getConfiguration();
		var maxTokens = config.get<number>("flexiable-gpt.max-output-tokens");
		if (!maxTokens) {
			maxTokens = 256;
			vscode.window.showErrorMessage("No max-output-tokens defined, using 256.");
		}

		let responseText = "";
		const request = https.request(
			{
				hostname: "api.openai.com",
				path: "/v1/chat/completions",
				method: "POST",
				headers: {
					"Content-Type": "application/json", // eslint-disable-line @typescript-eslint/naming-convention
					Authorization: `Bearer ${this.apiKey}`, // eslint-disable-line @typescript-eslint/naming-convention
				},
			},
			response => {
				response.on("data", data => {
					console.debug("Data from Open AI: " + data.toString());
					responseText += data.toString();
				});
			}
		);
		let messages = [];
		if (context) {
			messages.push({ role: "system", content: context });
		}
		messages.push({ role: "user", content: queryText });
		request.write(
			JSON.stringify({
				model: this.model,
				// eslint-disable-next-line @typescript-eslint/naming-convention
				max_tokens: maxTokens,
				messages: messages
			})
		);
		request.end();
		request.on("close", () => {
			const openAiResult = JSON.parse(responseText).choices[0].message.content;
			console.debug("Extractd test from open AI: " + openAiResult);
			callback(openAiResult, "");
		});
		request.on("error", error => {
			console.error(error);
			callback("", error.message + responseText);
		});
		//TODO actually implement this method to return a string
		const text = "Here is my chatGPT content.  So much content";
		callback(text, "");
	}
}
function buildIntegration(): AiIntegration {
	try {
		return new OpenAiChatIntegration();
	} catch (error: any) {
		let message = "Unknown Error";
		if (error instanceof Error) { message = error.message; }
		vscode.window.showErrorMessage(`Failed to setup API: ${message}.`);
		throw error;
	}
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "flexiable-gpt" is now active!');


	// Start Commands to manage settings
	context.subscriptions.push(vscode.commands.registerCommand('flexiable-gpt.set-context', () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const document = editor.document;
			const selection = editor.selection;
			const selectedText = document.getText(selection);
			const entireFileContents = document.getText();
			const newContext = selectedText || entireFileContents;
			vscode.workspace.getConfiguration().update("flexiable-gpt.context", newContext);
			vscode.window.showInformationMessage(`Updated context: ${newContext.substring(0, 50)}...`);
		}
	}));


	// End Commands to manage settings

	// Start AI commands --------
	context.subscriptions.push(vscode.commands.registerCommand('flexiable-gpt.expand', () => {
		replaceWithAi("Expand on the following: ");
	}));


	// End AI commands --------





}

function replaceWithAi(queryPrefix: string) {
	const editor = vscode.window.activeTextEditor;

	if (editor) {
		const document = editor.document;
		const selection = editor.selection;
		const selectedText = document.getText(selection);

		//TODO if no selection, error and abort.
		if (!selectedText) {
			vscode.window.showErrorMessage(`Text must be selected for this command`);
		}
		const integration = buildIntegration();

		const config = vscode.workspace.getConfiguration();

		integration.query(`${queryPrefix} \n\n ${selectedText}`, config.get<string>("flexiable-gpt.context"), (text, error) => {
			if (error) {
				vscode.window.showErrorMessage(`Ai API request failed: ${error.substring(0, 25)}`);
				console.error(`flexiable-gpt: Failed to connect with the AI API: ${error}`);
			} else {
				editor.edit(editbuilder => {
					editbuilder.replace(selection, text);
				});
			}
		});
	}
}

function appendWithAi(queryPrefix: string, useFullPageIfNothingSelected = false, prepend = false) {
	const editor = vscode.window.activeTextEditor;

	if (editor) {
		const document = editor.document;
		let selection = editor.selection;
		let selectedText = document.getText(selection);

		if (!selectedText && useFullPageIfNothingSelected) {
			selectedText = editor.document.getText();
			selection = new vscode.Selection(
				new vscode.Position(0, 0),
				new vscode.Position(
					document.lineCount,
					document.lineAt(document.lineCount - 1).range.end.character
				)
			);
		} else {
			throw new Error("This command requires a selection");
		}
		const integration = buildIntegration();

		const config = vscode.workspace.getConfiguration();

		integration.query(`${queryPrefix} \n\n ${selectedText}`, config.get<string>("flexiable-gpt.context"), (text, error) => {
			if (error) {
				vscode.window.showErrorMessage(`Ai API request failed: ${error.substring(0, 25)}`);
				console.error(`flexiable-gpt: Failed to connect with the AI API: ${error}`);
			} else {
				editor.edit(editbuilder => {
					const insertPosition = prepend ? selection.start : selection.end;
					editbuilder.insert(insertPosition, text);
				});
			}
		});
	}
}

// This method is called when your extension is deactivated
export function deactivate() { }
