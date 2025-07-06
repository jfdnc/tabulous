import { createAndConnectClient } from '../src/client/index.js';
import { ShellType } from '../src/types/index.js';

async function generateMultiShellExample() {
  console.log('Connecting to MCP server...');
  
  const { client, service } = await createAndConnectClient();
  
  try {
    const command = 'docker';
    const shells: ShellType[] = ['bash', 'zsh', 'fish'];
    
    console.log(`Generating completions for ${command} across multiple shells...`);
    
    const completions = await service.generateCompletionForMultipleShells(command, shells);
    
    for (const completion of completions) {
      console.log(`\n--- ${completion.shellType.toUpperCase()} Completion ---`);
      console.log(completion.script.substring(0, 200) + '...');
      console.log(`\nInstallation for ${completion.shellType}:`);
      console.log(completion.installInstructions);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.disconnect();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  generateMultiShellExample();
}