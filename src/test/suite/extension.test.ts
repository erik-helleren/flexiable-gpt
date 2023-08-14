import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';

// import * as myExtension from '../../extension';

suite('Extension Test Suite', function () {
	vscode.window.showInformationMessage('Start all tests.');
	suiteSetup(async () => {
		// Set the secret value to be used in the test
		await vscode.workspace.getConfiguration().update('flexiable-gpt.openai.key', process.env.OPENAI_KEY , vscode.ConfigurationTarget.Global);
		await vscode.workspace.getConfiguration().update('flexiable-gpt.max-output-tokens', 64 , vscode.ConfigurationTarget.Global);
	});

	this.beforeEach(()=>{
		vscode.workspace.getConfiguration().update('flexiable-gpt.vendor', "Test" , vscode.ConfigurationTarget.Global);
	});

	test('Actually reach out to chatGPT for data, doing substitution', async function () {
		this.timeout(30000);
		await vscode.workspace.getConfiguration().update('flexiable-gpt.vendor', "OpenAi" , vscode.ConfigurationTarget.Global);
		
		const origionalContent = 'The impact of the french revolution on US politics\n\nSome content that should be unchanged';
		// Step 1: Sets up a new file with the content
		const file = await vscode.workspace.openTextDocument({
			content: origionalContent,
			language: 'markdown'
		});
		await vscode.window.showTextDocument(file);
		// Select the first line of the file
		const selection = new vscode.Selection(new vscode.Position(0, 0), new vscode.Position(0, 99999));
		const activeTextEditor = vscode.window.activeTextEditor;
		if (!activeTextEditor) { return; }
		activeTextEditor.selection = selection;

		// Step 2: Run the command "flexiable-gpt.expand"
		await vscode.commands.executeCommand('flexiable-gpt.expand');

		// Step 3: Verify that the content of the file changes within 30 seconds
		let actualContent = activeTextEditor.document.getText();
		
		for(let i=0;i<30;i++){
			actualContent = activeTextEditor.document.getText();
			if(actualContent!==origionalContent){
				break;
			}else{
				await wait(1000);
			}
		}
		assert.notEqual(actualContent,origionalContent);
		assert(actualContent.endsWith("Some content that should be unchanged"), "Looks like text that was beyond the selection was clobbered");
		assert.doesNotMatch(actualContent, new RegExp("This is a test only stub, your app is missconfigured if you see this"));
	});
});

function wait(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms));
}
