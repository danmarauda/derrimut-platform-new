# Claude Flow Hivemind Context

This directory contains context files for Claude Flow Hivemind execution.

## Files

### `context.json`
Machine-readable project context including:
- Project overview
- Current state metrics
- Integration details
- Task summary
- Key file references

### `hivemind-context.md`
Human-readable comprehensive context including:
- Project overview
- Current state analysis
- Execution plan summary
- Key information
- Code patterns
- Execution guidelines
- Success criteria

### `agents.json`
Structured agent and task data including:
- Agent definitions with skills and deliverables
- Task details with dependencies
- Phase organization
- Parallelization strategy
- Success criteria per phase

### `agent-instructions.md`
Detailed instructions for each agent including:
- General guidelines for all agents
- Agent-specific instructions
- Communication protocol
- Progress tracking template

### `progress.md`
Progress tracking file to be updated daily with:
- Overall progress
- Phase progress
- Agent progress
- Daily updates
- Blockers
- Learnings

## Usage

1. **For Agents:** Read `hivemind-context.md` first, then `agent-instructions.md`
2. **For Coordination:** Check `agents.json` for dependencies and parallelization
3. **For Tracking:** Update `progress.md` daily
4. **For Reference:** Use `context.json` for programmatic access

## Quick Start

1. Read `.claude-flow/hivemind-context.md`
2. Review your assigned tasks in `HIVEMIND_EXECUTION_PLAN.md`
3. Follow instructions in `.claude-flow/agent-instructions.md`
4. Update `.claude-flow/progress.md` as you work

## Related Files

- `HIVEMIND_EXECUTION_PLAN.md` - Full execution plan
- `HIVEMIND_TASK_BREAKDOWN.md` - Detailed task breakdown
- `PRODUCTION_LAUNCH_CHECKLIST.md` - Production checklist
- `PRODUCTION_READINESS_ANALYSIS.md` - Current state analysis

