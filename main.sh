#!/bin/bash

# Usage: tabulous <bin>
BIN="$1"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOGDIR="./logs"
LOGFILE="$LOGDIR/tabulous_log_$TIMESTAMP.txt"
COMPLETION_DIR="/etc/bash_completion.d"
COMPLETION_FILE="$COMPLETION_DIR/tabulous_$BIN.sh"

# Check if the binary is provided
if [ -z "$BIN" ]; then
    echo "Usage: tabulous <bin>"
    exit 1
fi

# Ensure the logging directory exists
if [ ! -d "$LOGDIR" ]; then
    echo "Creating logs directory at $LOGDIR"
    sudo mkdir -p "$LOGDIR"
fi

# Ensure the bash completion directory exists
if [ ! -d "$COMPLETION_DIR" ]; then
    echo "Creating bash completion directory at $COMPLETION_DIR"
    sudo mkdir -p "$COMPLETION_DIR"
fi

# Get the help output from the binary
HELP_OUTPUT=$($BIN --help 2>&1)

# Check if help output is empty
if [ -z "$HELP_OUTPUT" ]; then
    echo "No help output found for $BIN"
    exit 1
fi

# Enhanced prompt to the LLM
LLM_PROMPT="Given the following --help output from the $BIN command:\n$HELP_OUTPUT\nPlease respond with a structured JSON-like format where 'commands' is a list of available sub-commands and 'options' is a list of available options. Format: {\"commands\": [\"command1\", \"command2\"], \"options\": [\"--option1\", \"--option2\"]}. Please do not wrap the json-styled response in any backticks or other characters, I'm going to parse it as a raw string."
LLM_RESPONSE=$(llm "$LLM_PROMPT")

# Log the LLM response to a timestamped file
echo "Command: $BIN" >> "$LOGFILE"
echo "Help Output:" >> "$LOGFILE"
echo "$HELP_OUTPUT" >> "$LOGFILE"
echo "LLM Response:" >> "$LOGFILE"
echo "$LLM_RESPONSE" >> "$LOGFILE"
echo "------------------------------------" >> "$LOGFILE"

# Extract the commands
COMMANDS=$(echo "$LLM_RESPONSE" | sed -n 's/.*"commands": \[\([^]]*\)\].*/\1/p' | sed 's/"//g' | tr ',' ' ')

# Extract the options
OPTIONS=$(echo "$LLM_RESPONSE" | sed -n 's/.*"options": \[\([^]]*\)\].*/\1/p' | sed 's/"//g' | tr ',' ' ')


echo "Commands:" >> "$LOGFILE"
echo "$COMMANDS" >> "$LOGFILE"
echo "Options:" >> "$LOGFILE"
echo "$OPTIONS" >> "$LOGFILE"

# Generate the Bash completion function without external dependencies
COMPLETION_FUNC="_${BIN}_completion() {
    local cur prev
    cur=\${COMP_WORDS[COMP_CWORD]}
    prev=\${COMP_WORDS[COMP_CWORD-1]}

    case \"\${prev}\" in
        $BIN)
            COMPREPLY=( \$(compgen -W \"${COMMANDS}\" -- \"\${cur}\") )
            return 0
            ;;
        *)
            COMPREPLY=( \$(compgen -W \"${OPTIONS}\" -- \"\${cur}\") )
            return 0
            ;;
    esac
}

complete -F _${BIN}_completion $BIN
"

# Check if the completion file already exists
if [ -f "$COMPLETION_FILE" ]; then
    echo "Completion file for $BIN already exists at $COMPLETION_FILE. Overwriting."
else
    echo "Creating completion file for $BIN at $COMPLETION_FILE."
fi

# Write the completion function to the file, creating it if necessary
echo "$COMPLETION_FUNC" | sudo tee "$COMPLETION_FILE" > /dev/null

# Source the completion file to enable it in the current session
source "$COMPLETION_FILE"

echo "Tab completion for $BIN has been registered and sourced."
echo "Log has been saved to $LOGFILE"
