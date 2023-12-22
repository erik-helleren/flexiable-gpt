
import * as vscode from 'vscode';

type AiCallback = (response: string, errorText: string) => void;


interface AiIntegration {
	query(queryText: string, context: string | undefined, callback: AiCallback): Promise<void>;
};

class TestStub implements AiIntegration {
	async query(queryText: string, context: string | undefined, callback: AiCallback): Promise<void> {
		callback(`This is a test only stub, your app is missconfigured if you see this.  ${queryText} ${context}`, "");
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
		const headers = {
			"Content-Type": "application/json",
			Authorization: `Bearer ${this.apiKey}`,
		};

		let messages = [];
		if (context) {
			messages.push({ role: "system", content: context });
		}
		messages.push({ role: "user", content: queryText });

		const openAiChatPayload = JSON.stringify({
			model: this.model,
			max_tokens: maxTokens,
			messages: messages,
		});
		console.debug("Open AI Chat Payload: " + openAiChatPayload);

		fetch("https://api.openai.com/v1/chat/completions", {
			method: "POST",
			headers: headers,
			body: openAiChatPayload,
		})
			.then((response) => response.json())
			.then((data) => {
				const openAiResult = data.choices[0].message.content;
				console.debug("Extracted text from open AI: " + openAiResult);
				callback(openAiResult, "");
			})
			.catch((error) => {
				console.error(error);
				callback("", error.message);
			});
	}
}


export function buildIntegration(): AiIntegration {
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