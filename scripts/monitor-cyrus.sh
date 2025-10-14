#!/bin/bash

# Monitor Cyrus agent activity
# Usage: ./scripts/monitor-cyrus.sh [command]
# Commands: live, logs, status, tasks

COMMAND="${1:-live}"
LOGS_DIR="/Users/laptop/.cyrus/logs"
LIVE_LOG="/tmp/cyrus-live.log"

case "$COMMAND" in
  live)
    echo "🔴 LIVE: Monitoring Cyrus stdout (Ctrl+C to exit)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    tail -f "$LIVE_LOG"
    ;;

  logs)
    TASK="${2:-latest}"
    if [ "$TASK" = "latest" ]; then
      LATEST_LOG=$(ls -t "$LOGS_DIR"/CCB-*/session-*.md 2>/dev/null | head -1)
      if [ -n "$LATEST_LOG" ]; then
        echo "📄 Latest log: $LATEST_LOG"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        cat "$LATEST_LOG"
      else
        echo "❌ No logs found in $LOGS_DIR"
      fi
    else
      # Show specific task logs
      TASK_LOG=$(ls -t "$LOGS_DIR"/"$TASK"/session-*.md 2>/dev/null | head -1)
      if [ -n "$TASK_LOG" ]; then
        echo "📄 Task log: $TASK_LOG"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        cat "$TASK_LOG"
      else
        echo "❌ No logs found for task $TASK"
      fi
    fi
    ;;

  status)
    echo "🤖 Cyrus Agent Status"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # Check if process is running
    if pgrep -f "node apps/cli/dist/app.js" > /dev/null; then
      echo "✅ Process: RUNNING"
      PID=$(pgrep -f "node apps/cli/dist/app.js")
      echo "   PID: $PID"
      echo "   Uptime: $(ps -o etime= -p "$PID")"
    else
      echo "❌ Process: NOT RUNNING"
    fi

    echo ""
    echo "📊 Recent Activity:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # Show last 5 task logs
    ls -lt "$LOGS_DIR"/CCB-*/session-*.md 2>/dev/null | head -5 | while read -r line; do
      FILEPATH=$(echo "$line" | awk '{print $NF}')
      TASK=$(basename "$(dirname "$FILEPATH")")
      TIMESTAMP=$(stat -f "%Sm" -t "%H:%M:%S" "$FILEPATH")
      echo "   $TIMESTAMP - $TASK"
    done
    ;;

  tasks)
    echo "📋 Active Cyrus Tasks"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # List all task directories with session count
    for TASK_DIR in "$LOGS_DIR"/CCB-*; do
      if [ -d "$TASK_DIR" ]; then
        TASK=$(basename "$TASK_DIR")
        SESSION_COUNT=$(ls "$TASK_DIR"/session-*.md 2>/dev/null | wc -l | xargs)
        LATEST=$(ls -t "$TASK_DIR"/session-*.md 2>/dev/null | head -1)

        if [ -n "$LATEST" ]; then
          LAST_ACTIVITY=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M" "$LATEST")
          echo "   $TASK: $SESSION_COUNT sessions | Last: $LAST_ACTIVITY"
        fi
      fi
    done
    ;;

  watch)
    TASK="${2:-CCB-208}"
    echo "👀 Watching task: $TASK (refreshes every 2 seconds)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    while true; do
      clear
      echo "👀 Watching: $TASK | $(date '+%H:%M:%S')"
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

      LATEST_LOG=$(ls -t "$LOGS_DIR"/"$TASK"/session-*.md 2>/dev/null | head -1)
      if [ -n "$LATEST_LOG" ]; then
        tail -30 "$LATEST_LOG"
      else
        echo "⏳ Waiting for task activity..."
      fi

      sleep 2
    done
    ;;

  help|*)
    echo "🤖 Cyrus Monitor - Watch Your AI Agent Work"
    echo ""
    echo "Usage: ./scripts/monitor-cyrus.sh [command] [options]"
    echo ""
    echo "Commands:"
    echo "  live              Follow stdout in real-time (default)"
    echo "  logs [task]       Show latest log (or specific task log)"
    echo "  status            Show process status and recent activity"
    echo "  tasks             List all tasks with session counts"
    echo "  watch [task]      Live refresh of specific task log"
    echo "  help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./scripts/monitor-cyrus.sh live"
    echo "  ./scripts/monitor-cyrus.sh logs CCB-208"
    echo "  ./scripts/monitor-cyrus.sh watch CCB-192"
    echo "  ./scripts/monitor-cyrus.sh status"
    ;;
esac
