
import * as matter from "gray-matter";
import * as vscode from 'vscode';


export async function parseDoucument(uri: vscode.Uri): Promise<matter.GrayMatterFile<string>> {
    const uint8Data = await vscode.workspace.fs.readFile(uri);
    var textDocument = new TextDecoder().decode(uint8Data);
    const matterResult = matter(textDocument);
    return matterResult;
}
export async function buildContext(uri: vscode.Uri): Promise<string> {
    const currentDocument = await parseDoucument(uri);
    console.debug("Current doucment URL: " + uri);
    console.debug("Current Document: " + JSON.stringify(currentDocument));

    var context = "";

    if (currentDocument.data.references) {
        for (const reference of currentDocument.data.references) {
            console.debug("Loading Reference: " + JSON.stringify(reference));
            const referenceDocument = await parseDoucument(vscode.Uri.file(reference));
            console.debug("Reference Document: " + JSON.stringify(referenceDocument));
            context = context + referenceDocument.content;
        }
    }
    return context;
}