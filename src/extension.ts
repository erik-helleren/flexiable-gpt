// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as https from "https";

type AiCallback = (response: string, errorText: string) => void;

interface AiIntegration {
	query(queryText: string, context: string | undefined, callback: AiCallback): Promise<void>;
};
class PromptQuickPickItem implements vscode.QuickPickItem {
	label: string;
	description: string;
	behavior: string;

	constructor(pc: PromptConfig) {
		this.label = pc.name;
		this.description = pc.prompt;
		this.behavior = pc.behavior;
	}
}
interface PromptConfig {
	name: string;
	prompt: string;
	behavior: string;
}

class TestStub implements AiIntegration {
	async query(queryText: string, context: string | undefined, callback: AiCallback): Promise<void> {
		callback(`This is a test only stub, your app is missconfigured if you see this.  ${queryText.substring(0, 10)} ${context?.substring(0, 10)}`, "");
	}
}

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
		const openAiChatPayload = JSON.stringify({
			model: this.model,
			// eslint-disable-next-line @typescript-eslint/naming-convention
			max_tokens: maxTokens,
			messages: messages
		});
		console.debug("Open AI Chat Payload: " + openAiChatPayload);
		request.write(openAiChatPayload);
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
	}
}

function buildIntegration(): AiIntegration {
	const config = vscode.workspace.getConfiguration();
	const vendor = config.get<string>("flexiable-gpt.vendor");
	if (!vendor) {
		throw new Error("flexiable-gpt.vendor is not defined, check your settings");
	}
	try {
		switch (vendor) {
			case "OpenAi":
				return new OpenAiChatIntegration();
			case "Test":
				return new TestStub();
			default:
				throw new Error("Unknown vendor " + vendor);
		}
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


	// Start Commands to manage settings ----------------------------------------------------------
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


	// End Commands to manage settings ----------------------------------------------------------


	// Start AI commands ----------------------------------------------------------
	context.subscriptions.push(vscode.commands.registerCommand('flexiable-gpt.expand', () => {
		replaceWithAi("Expand on the following: ");
	}));

	context.subscriptions.push(vscode.commands.registerCommand('flexiable-gpt.condense', () => {
		replaceWithAi("Rewrite the following to be more concise: ");
	}));

	context.subscriptions.push(vscode.commands.registerCommand('flexiable-gpt.tone', () => {
		const tones = vscode.workspace.getConfiguration().get<Array<string>>("flexiable-gpt.tones");
		if (!tones) {
			vscode.window.showErrorMessage("flexiable-gpt.tones setting not configured");
			return;
		}
		const selectedTone = vscode.window.showQuickPick(tones, { title: "Select a tone" });
		if (selectedTone) { replaceWithAi(`rewrite the following text to have a tone that is ${selectedTone}`); }
	}));

	// Manual, one off prompt
	context.subscriptions.push(vscode.commands.registerCommand('flexiable-gpt.manual', () => {
		const behaviorModeQuickPick = vscode.window.createQuickPick();
		behaviorModeQuickPick.title = "Please select a behavior mode (1/2)";
		behaviorModeQuickPick.items = [
			{ label: "replace", description: "Replace the selected text with generated text" },
			{ label: "prefix", description: "Insert the generated text before the selected text" },
			{ label: "postfix", description: "Insert the generated text after the selected text" },
		];
		behaviorModeQuickPick.onDidHide(() => behaviorModeQuickPick.dispose());
		behaviorModeQuickPick.onDidChangeSelection(([item]) => {
			behaviorModeQuickPick.hide();
			if (item) {
				const behaviorMode = item.label;
				vscode.window.showInputBox({ title: "Enter your prompt (2/2)" }).then((prompt) => {
					if (prompt) {
						switch (behaviorMode) {
							case "replace":
								replaceWithAi(prompt);
								break;
							case "prefix":
								appendWithAi(prompt, false, true);
								break;
							case "postfix":
								appendWithAi(prompt, false, false);
								break;
							default:
								console.error("Have an invalid item behavior: " + item);
						}
					}
				});

			}
		});
		behaviorModeQuickPick.show();
	}));

	// Manual, one off replacement prompt
	context.subscriptions.push(vscode.commands.registerCommand('flexiable-gpt.manual.replace', () => {
		const promptInput = vscode.window.createInputBox();
		promptInput.title = "Insert a prompt or just hit enter to use selected text";
		promptInput.onDidChangeValue((prompt) => {
			promptInput.hide();
			if (prompt) {
				replaceWithAi(prompt);
			} else {
				replaceWithAi("");
			}
		});
		promptInput.onDidHide(() => promptInput.dispose());
		promptInput.show();
	}));

	// Custom commands from configuration
	context.subscriptions.push(vscode.commands.registerCommand('flexiable-gpt.custom', () => {
		const quickPick = vscode.window.createQuickPick();
		quickPick.title = "Please select a configured custom prompt";
		const config = vscode.workspace.getConfiguration();
		const prompts = config.get<Array<PromptConfig>>("flexiable-gpt.prompts");
		if (!prompts) {
			throw new Error("There are no prompts specified");
		}

		quickPick.items = prompts.map((p) => {
			return new PromptQuickPickItem(p);
		});

		quickPick.onDidChangeSelection(([item]) => {
			if (item) {
				const prompt = (item as PromptQuickPickItem).description;
				switch ((item as PromptQuickPickItem).behavior) {
					case "replace":
						replaceWithAi(prompt);
						break;
					case "prefix":
						appendWithAi(prompt, false, true);
						break;
					case "postfix":
						appendWithAi(prompt, false, false);
						break;
					default:
						console.error("Have an invalid item behavior: " + item);
				}
			}
			quickPick.hide();
		});

		quickPick.onDidHide(() => quickPick.dispose());
		quickPick.show();
	}));

	// End AI commands ----------------------------------------------------------
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
			return;
		}
		const integration = buildIntegration();

		const config = vscode.workspace.getConfiguration();

		integration.query(queryPrefix ? `${queryPrefix} \n\n ${selectedText}` : selectedText, config.get<string>("flexiable-gpt.context"), (text, error) => {
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
		} else if (!selectedText) {
			vscode.window.showErrorMessage(`Text must be selected for this command`);
			return;
		}
		const integration = buildIntegration();

		const config = vscode.workspace.getConfiguration();

		integration.query(queryPrefix ? `${queryPrefix} \n\n ${selectedText}` : selectedText, config.get<string>("flexiable-gpt.context"), (text, error) => {
			if (error) {
				vscode.window.showErrorMessage(`Ai API request failed: ${error.substring(0, 25)}`);
				console.error(`flexiable-gpt: Failed to connect with the AI API: ${error}`);
			} else {
				editor.edit(editbuilder => {
					let position = selection.end;
					let textToInser = text;
					if (prepend) {
						text = text + "\n\n";
						position = selection.start;
					} else {
						text = "\n\n" + text;
					}
					const insertPosition = prepend ? selection.start : selection.end;
					editbuilder.insert(insertPosition, text);
				});
			}
		});
	}
}

// This method is called when your extension is deactivated
export function deactivate() { }
