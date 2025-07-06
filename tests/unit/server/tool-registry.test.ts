import { ToolRegistry } from '../../../src/server/tool-registry.js';
import { BaseTool } from '../../../src/tools/base.js';
import { ToolContext, ToolResult } from '../../../src/types/index.js';

class MockTool extends BaseTool {
  constructor() {
    super('mock-tool', 'A mock tool for testing');
  }

  protected validateArgs(args: Record<string, any>): void {
    if (!args.input) {
      throw new Error('input is required');
    }
  }

  async execute(args: Record<string, any>, context: ToolContext): Promise<ToolResult> {
    return {
      success: true,
      data: { output: `processed: ${args.input}` }
    };
  }
}

describe('ToolRegistry', () => {
  let registry: ToolRegistry;
  let mockTool: MockTool;
  let context: ToolContext;

  beforeEach(() => {
    registry = new ToolRegistry();
    mockTool = new MockTool();
    context = {
      requestId: 'test-request-1',
      timestamp: Date.now(),
      metadata: {}
    };
  });

  it('should register a tool', () => {
    registry.register(mockTool);
    expect(registry.getTool('mock-tool')).toBe(mockTool);
  });

  it('should execute a registered tool', async () => {
    registry.register(mockTool);
    
    const result = await registry.executeTool('mock-tool', { input: 'test' }, context);
    
    expect(result.success).toBe(true);
    expect(result.data.output).toBe('processed: test');
  });

  it('should handle tool not found', async () => {
    await expect(registry.executeTool('nonexistent', {}, context))
      .rejects.toThrow('Tool not found: nonexistent');
  });
});