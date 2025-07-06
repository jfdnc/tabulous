import { HelpExtractorTool } from '../../../src/tools/help-extractor.js';
import { ToolContext } from '../../../src/types/index.js';

describe('HelpExtractorTool', () => {
  let tool: HelpExtractorTool;
  let context: ToolContext;

  beforeEach(() => {
    tool = new HelpExtractorTool();
    context = {
      requestId: 'test-request-1',
      timestamp: Date.now(),
      metadata: {}
    };
  });

  it('should extract help text from a valid command', async () => {
    const result = await tool.run({
      command: 'echo',
      helpFlags: ['--help'],
      timeout: 5000
    }, context);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data.command).toContain('echo');
  });

  it('should handle invalid command gracefully', async () => {
    const result = await tool.run({
      command: 'nonexistent-command-12345',
      helpFlags: ['--help'],
      timeout: 5000
    }, context);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should validate arguments', async () => {
    const result = await tool.run({
      command: '',
      helpFlags: ['--help']
    }, context);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid arguments');
  });
});