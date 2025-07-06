import { createAndConnectClient } from '../src/client/index.js';
import { CompletionConfig } from '../src/types/index.js';

async function generateCompletionExample() {
  console.log('Connecting to MCP server...');
  
  const { client, service } = await createAndConnectClient();
  
  try {
    // Generate completion for git command
    const config: CompletionConfig = {
      targetCommand: 'git',
      shellType: 'bash'
    };
    
    console.log('Generating completion for git...');
    const completion = await service.generateCompletion(config);
    
    console.log('Generated completion script:');
    console.log(completion.script);
    
    console.log('\nInstallation instructions:');
    console.log(completion.installInstructions);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.disconnect();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  generateCompletionExample();
}