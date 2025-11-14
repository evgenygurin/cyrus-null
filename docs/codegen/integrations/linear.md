# Linear Integration

> Part of Codegen Platform Documentation

## Setup

1. Authorize Codegen in Linear API settings
2. Grant workspace permissions
3. Configure project access

## Capabilities

- ✅ Create issues automatically
- ✅ Update issue statuses as work progresses
- ✅ Link PRs and commits to issues
- ✅ Post progress updates in comments
- ✅ Generate sub-issues for task breakdown

## Multi-Agent Systems (Team Plan)

- Parent agents can spawn child agents via sub-issues
- Shared git branch for collaboration
- Child agents notify parent on completion
- Hierarchical task decomposition

## Triggering from Linear

```bash
# Method 1: Assign issue to Codegen
Assignee: Codegen Bot

# Method 2: Mention in comments
@codegen please implement the feature described in this ticket
```

## Agent Workflow

1. Monitor assigned Linear issues
2. Update status to "In Progress"
3. Implement solution in sandbox
4. Create PR and link to issue
5. Update issue with PR details
6. Move to "Done" when PR merged

## Example: Linear-Driven Development

```python
# Automatically process Linear issues
# (This typically runs as webhook handler)

def handle_linear_assignment(issue_data):
    """Process Linear issue assigned to Codegen."""

    # Create agent run from Linear issue
    run = agent.run(
        prompt=f"""
        Linear Issue: {issue_data['title']}
        ID: {issue_data['identifier']}

        Description:
        {issue_data['description']}

        Requirements:
        {issue_data.get('requirements', 'See description')}

        Please:
        1. Implement the requested feature
        2. Add comprehensive tests
        3. Create PR with reference to {issue_data['identifier']}
        4. Update Linear issue with PR link
        """,
        metadata={
            'source_type': 'LINEAR',
            'linear_issue_id': issue_data['id'],
            'linear_identifier': issue_data['identifier']
        }
    )

    return run
```
