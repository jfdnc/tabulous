### Setup

Currently using [simonw/llm](https://github.com/simonw/llm) for easy prompting. Install that and set up your API keys.

For the script itself:

```bash
$ sudo chmod +x main.sh
$ sudo ./main.sh <some binary>
```

### Example log output

```bash
Command: llm
Help Output:
Usage: llm [OPTIONS] COMMAND [ARGS]...

  Access large language models from the command-line

  Documentation: https://llm.datasette.io/

  To get started, obtain an OpenAI key and set it like this:

      $ llm keys set openai
      Enter key: ...

  Then execute a prompt like this:

      llm 'Five outrageous names for a pet pelican'

Options:
  --version  Show the version and exit.
  --help     Show this message and exit.

Commands:
  prompt*       Execute a prompt
  aliases       Manage model aliases
  chat          Hold an ongoing chat with a model.
  collections   View and manage collections of embeddings
  embed         Embed text and store or return the result
  embed-models  Manage available embedding models
  embed-multi   Store embeddings for multiple strings at once
  install       Install packages from PyPI into the same environment as LLM
  keys          Manage stored API keys for different models
  logs          Tools for exploring logged prompts and responses
  models        Manage available models
  openai        Commands for working directly with the OpenAI API
  plugins       List installed plugins
  similar       Return top N similar IDs from a collection
  templates     Manage stored prompt templates
  uninstall     Uninstall Python packages from the LLM environment
LLM Response:
{"commands": ["prompt", "aliases", "chat", "collections", "embed", "embed-models", "embed-multi", "install", "keys", "logs", "models", "openai", "plugins", "similar", "templates", "uninstall"], "options": ["--version", "--help"]}
------------------------------------
Commands:
prompt  aliases  chat  collections  embed  embed-models  embed-multi  install  keys  logs  models  openai  plugins  similar  templates  uninstall
Options:
--version  --help
```

### Example completion script output

```bash
_llm_completion() {
    local cur prev
    cur=${COMP_WORDS[COMP_CWORD]}
    prev=${COMP_WORDS[COMP_CWORD-1]}

    case "${prev}" in
        llm)
            COMPREPLY=( $(compgen -W "prompt  aliases  chat  collections  embed  embed-models  embed-multi  install  keys  logs  models  openai  plugins  similar  templates  uninstall" -- "${cur}") )
            return 0
            ;;
        *)
            COMPREPLY=( $(compgen -W "--version  --help" -- "${cur}") )
            return 0
            ;;
    esac
}

complete -F _llm_completion llm
```
