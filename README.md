# flexiable-gpt README

Flexiable-gpt is designed for authors to help with writing blogs, briefs, articles, and books in markdown or plaintext files.  Similar to pay apps like Rytr, but without the monthly membership. To do that this extension provides some basic, core prompts that can be bound to keyboard shortcuts like "expand" and "concise".  But given that everyone has different styles and needs, this plugin allows you to build your own canned prompts via configuration.  

All of these prompts work based on selected text.  They can operate in replace/rewrite, prefix, or postfix mode.  Prefix inserts generated content before the selected text, and postfix inserts it after. 

This is currently only backed by ChatGpt from Open AI.  This means you will need an Open AI token and a payment card on file with Open Ai.  If you intend to heavily use GPT-4, set up limits on your account to avoid billing surprises.  

My hope is that the community can help provide direction for other API's, including self-hosted ones, to integrate into this extension, as well as built-in prompts and features.  

## Features

### AI backend support

| AI Backend Supported | Details |
|---|---|
| OpenAI (AKA chatGPT) | Requires a pay as you go account and a token to be provided from their [api key page](https://platform.openai.com/account/api-keys) |



### Built in AI Generation commands

All of these commands operate on selected text unless otherwise noted.  

| Command Name | Description |
|----|---|
| Expand | Take the selected text and expand upon it.  This will replace the selected text.  It will not work without a selection. |
| Condense | Take the selected text and condense it by making it more concise.  This will replace the selected text.  It will not work without a selection. |
| Alter Tone | Rewrite the selected text with a particular tone.  This will open up a quick pick window of available tones. |

I am trying to balance the overhead of having more commands with the power of shortcut keys for commonly used commands and reducing noise in the command pallet by multiplexing commands with quick edits, like tone editing.  That said, I welcome suggestions and features to add to the built-in command set.  

### Commands For Changing Settings

| Command Name | Description |
|----|---|
| Set Context | Set the "context" that is given to the AI model for the current workspace.  If you have text selected when you run this action, just the selected text is loaded into the context.  Otherwise, the whole active document is loaded as context. |

Context is simply the first system message in a chat exchange.  Consider it reusable instructions about how you want the AI to respond, context about what you want to do, or helpful data for it to answer questions about.   Read [this blog](https://docs.kanaries.net/tutorials/ChatGPT/chatgpt-context-window#understanding-the-chatgpt-context-window) for more details about context. 

Common use cases for context:

1. Describing the expectations on generated text.  I.e. setting the tone and voice of the author.  
2. Giving context around what you are writing.   I.e. an outline of a larger book or summaries of previous chapters.
3. Raw information.  I.e. A scholarly (aka dense) article or academic paper you want to summarize or focus your piece on.

Please keep in mind that all models limit total input tokens per request.  This includes the context, the prompt you use, and the text you have selected.  They also charge for it! Consider condensing your context to reduce it's size.

### Custom prompts

| Command Name | Description |
|----|---|
| Manual |  This allows you to specify a behavior (replace selected text, prefix selected text, or postfix selected text) and then type in an instruction.  For when you intend to use a prompt only once or infrequently. |
| Replace Manual | Since most commands issues are replace's, this is a shortcut for a manual replacement.  Its valid to not enter a prompt, in which case the selected text will be used as the prompt/instruction. |
| Custom | Select from the configured prompts by name. |  

If you find yourself using similar manual prompts over and over again, put them into your settings. It does require digging into the JSON configuration for this plugin, but there are examples there to help.  The options for behavior are "replace", "prefix" and "postfix".  

If you are getting really good results out of a custom prompt, consider sharing it on [GitHub as a feature request](https://github.com/erik-helleren/flexiable-gpt/issues/new).  

## Extension Settings

Please consult the configuration section of the package.json.

## Known Issues

* Chat GPT is slow, especially with GPT 4 or when requesting a lot of tokens. Waiting up to a minute for a reply is common. 
* This plugin hasn't included the streaming API yet.

## Want to help?

I freely admit that I am neither a Typescript Wizard nor an experienced extension developer.  If you find this helpful and want to contribute your coding skills, check out the [open issues on github](https://github.com/erik-helleren/flexiable-gpt/issues).  If you have ideas for how to improve this extension, but don't have the coding skills to do it, open up a [github issue](https://github.com/erik-helleren/flexiable-gpt/issues) and tag it with "enhancement".  

You can also consider [becoming a sponsor or leaving a tip](https://ko-fi.com/erikhelleren).  

## Release Notes

### 0.2.0

* Adding manual, one shot, generative feature.
* Adding rewrite with tone.  
* Improving readme
* Small UX tweaks

### 0.1.0

The initial release of flexiable-gpt.

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
