#!/bin/bash

# Usage: tabulous <bin>
BIN="$1"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOGFILE="tabulous_log_$TIMESTAMP.txt"
COMPLETION_DIR="/etc/bash_completion.d"
COMPLETION_FILE="$COMPLETION_DIR/tabulous_$BIN.sh"

# Check if the binary is provided
if [ -z "$BIN" ]; then
    echo "Usage: tabulous <bin>"
    exit 1
fi

# Ensure the bash completion directory exists
if [ ! -d "$COMPLETION_DIR" ]; then
    echo "Creating bash completion directory at $COMPLETION_DIR"
    sudo mkdir -p "$COMPLETION_DIR"
fi

# Function to query LLM and process command
query_llm() {
    local prompt="$1"
    echo "Querying LLM with prompt: $prompt"
    LLM_RESPONSE=$(llm "$prompt")
}

# Function to extract commands and options from LLM response
extract_commands_and_options() {
    local response="$1"
    local commands=$(echo "$response" | sed -n 's/.*"commands": \[\([^]]*\)\].*/\1/p' | sed 's/"//g' | tr ',' ' ')
    local options=$(echo "$response" | sed -n 's/.*"options": \[\([^]]*\)\].*/\1/p' | sed 's/"//g' | tr ',' ' ')
    echo "$commands" "$options"
}

# Recursive function to process commands and options
process_command() {
    local cmd="$1"
    local parent_cmd="$2"
    
    echo "Processing command: $cmd"

    # Query LLM for nested commands and options
    local prompt="Given the following --help output from the $cmd command:\n$($cmd --help 2>&1)\nPlease respond with a structured JSON-like format where 'commands' is a list of available sub-commands and 'options' is a list of available options. Format: {\"commands\": [\"command1\", \"command2\"], \"options\": [\"--option1\", \"--option2\"]}. Please do not wrap the json-styled response in any backticks or other characters."
    query_llm "$prompt"

    # Extract commands and options
    local result=$(extract_commands_and_options "$LLM_RESPONSE")
    local commands=$(echo "$result" | awk '{print $1}')
    local options=$(echo "$result" | awk '{print $2}')

    # Append commands and options to completion
    if [ -n "$commands" ]; then
        echo "Nested commands: $commands"
        for sub_cmd in $commands; do
            if [[ ! " ${PROCESSED_COMMANDS[@]} " =~ " ${sub_cmd} " ]]; then
                PROCESSED_COMMANDS+=("$sub_cmd")
                process_command "$sub_cmd" "$cmd"
            fi
        done
    fi

    if [ -n "$options" ]; then
        echo "Nested options: $options"
        ALL_OPTIONS+="$options "
    fi
}

# Initialize
PROCESSED_COMMANDS=()
ALL_OPTIONS=""

# Get the help output from the binary
HELP_OUTPUT=$($BIN --help 2>&1)

# Check if help output is empty
if [ -z "$HELP_OUTPUT" ]; then
    echo "No help output found for $BIN"
    exit 1
fi

# Enhanced prompt to the LLM
LLM_PROMPT="Given the following --help output from the $BIN command:\n$HELP_OUTPUT\nPlease respond with a structured JSON-like format where 'commands' is a list of available sub-commands and 'options' is a list of available options. Format: {\"commands\": [\"command1\", \"command2\"], \"options\": [\"--option1\", \"--option2\"]}. Please do not wrap the json-styled response in any backticks or other characters."
query_llm "$LLM_PROMPT"

# Extract initial commands and options
result=$(extract_commands_and_options "$LLM_RESPONSE")
initial_commands=$(echo "$result" | awk '{print $1}')
initial_options=$(echo "$result" | awk '{print $2}')

# Process initial commands
for cmd in $initial_commands; do
    if [[ ! " ${PROCESSED_COMMANDS[@]} " =~ " ${cmd} " ]]; then
        PROCESSED_COMMANDS+=("$cmd")
        process_command "$cmd" ""
    fi
done

# Generate the Bash completion function without external dependencies
COMPLETION_FUNC="_${BIN}_completion() {
    local cur prev
    cur=\${COMP_WORDS[COMP_CWORD]}
    prev=\${COMP_WORDS[COMP_CWORD-1]}

    case \"\${prev}\" in
        $BIN)
            COMPREPLY=( \$(compgen -W \"${initial_commands}\" -- \"\${cur}\") )
            return 0
            ;;
        *)
            COMPREPLY=( \$(compgen -W \"${ALL_OPTIONS}\" -- \"\${cur}\") )
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
