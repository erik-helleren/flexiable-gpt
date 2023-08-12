# flexiable-gpt README

Flexiable-gpt is designed to work for authors to help with writing blogs, briefs, articles, and books.  Similar to pay apps like Rytr. To do that we provide some basic, core prompts for you to use like "expand" and "concise".  But given that we all have different styles and needs, this plugin allows you to build your own prompts via configuration.  

Those custom prompts can operate in replace/rewrite, prefix, or postfix mode.    

This is currently only backed by chat-gpt, but it was designed to be extensible with other chat style completion API's.  This means you will need an open AI token and have a payment card on file.  I recommend you set aggressive limits on open AI to limit surprises on your invoice.  

## Features

### AI backend support
| AI Backend Supported | Details |
|---|---|
| OpenAI (AKA chatGPT) | Requires a pay as you go account and a token to be provided from their [api key page](https://platform.openai.com/account/api-keys) |

### Built in commands
| Command Name | Description |
|----|---|
| Expand | Take the selected text and expand upon it.  This will replace the selected text.  It will not work without a selection. |
| Concise | Take the selected text and make it more concise.  This will replace the selected text.  It will not work without a selection. |
| Context | Context is simply a first system message in a chat exchange.  Consider it reusable instructions about how you want the AI to respond or helpful data for it to answer questions about.  If you have text selected when you run this action, just the selected text is loaded into context.  Otherwise, the whole active document is loaded as context. |

### Custom prompts

All custom prompts have a display name, a prompt, and a behavior.  They require that text be selected, otherwise they will error.  Behavior impacts how it interacts with the existing text.  The message that is actually sent to the AI service `{prompt} \n\n {selected text}`.

If you are getting really good results out of a custom prompt, consider sharing it on [github as a feature request](https://github.com/erik-helleren/flexiable-gpt/issues/new).  

## Requirements

No Extra requirements

## Extension Settings

Please consult the configuration section of the package.json.

## Known Issues

* Chat GPT isn't fast, especially if you pick GPT 4.  Its typical to have to way up to a minute for a response.  If its taking too long, consider decreasing your max output tokens.
* This plugin hasn't integrating the streaming API.  

## Want to help

I freely admit that I am neither a Typescript Wizard nor an experienced extension developer.  If you find this helpful and want to contribute, checkout the [open issues on github](https://github.com/erik-helleren/flexiable-gpt/issues).  

If that's not your cup of tea, consider [becoming a sponsor or leaving a tip](https://ko-fi.com/erikhelleren).  

## Release Notes

Users appreciate release notes as you update your extension.

### 0.1.0

Initial release of flexiable-gpt

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
