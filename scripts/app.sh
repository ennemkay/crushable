#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

RUNTIME_DIR="${PROJECT_ROOT}/.local"
PID_FILE="${RUNTIME_DIR}/next-dev.pid"
LOG_FILE="${RUNTIME_DIR}/next-dev.log"
DATABASE_URL_VALUE="postgresql://crushable:crushable@localhost:5432/crushable?schema=public"
DOCKER_CMD=(docker)

usage() {
  cat <<'HELP'
Usage:
  scripts/app.sh start
  scripts/app.sh stop
  scripts/app.sh restart
  scripts/app.sh status
  scripts/app.sh logs

Commands:
  start    Start Postgres, run migrations/smoke check, and start Next.js dev server.
  stop     Stop the Next.js dev server and the Postgres Docker Compose service.
  restart  Stop, then start.
  status   Show Docker Compose service state and Next.js dev server state.
  logs     Follow the Next.js dev server log.
HELP
}

ensure_local_env() {
  if [[ ! -f .env ]]; then
    echo "Creating local .env..."
    cp .env.example .env
    sed -i 's/@db:5432/@localhost:5432/' .env
  fi

  export DATABASE_URL="${DATABASE_URL:-$DATABASE_URL_VALUE}"
}

ensure_tools() {
  if ! command -v docker >/dev/null 2>&1; then
    echo "Docker is not installed or is not on PATH."
    echo "Run ./scripts/setup-local-db-tools.sh first."
    exit 1
  fi

  if ! docker compose version >/dev/null 2>&1; then
    echo "Docker Compose v2 is not available."
    echo "Run ./scripts/setup-local-db-tools.sh first."
    exit 1
  fi

  if docker info >/dev/null 2>&1; then
    DOCKER_CMD=(docker)
    return 0
  fi

  if command -v sudo >/dev/null 2>&1 && sudo -n docker info >/dev/null 2>&1; then
    DOCKER_CMD=(sudo docker)
    return 0
  fi

  if command -v sudo >/dev/null 2>&1; then
    echo "Docker is installed, but this shell cannot access the Docker daemon without sudo."
    echo
    echo "You can either fix group/socket access, or run Docker commands through sudo."
    echo "To use the sudo fallback for this script, refresh sudo first:"
    echo "  sudo -v"
    echo "  npm run app:start"
    echo
    echo "To fix group/socket access, try:"
    echo "  sudo groupadd -f docker"
    echo "  sudo usermod -aG docker \"\$USER\""
    echo "  sudo chown root:docker /var/run/docker.sock"
    echo "  sudo chmod 660 /var/run/docker.sock"
    echo "  newgrp docker"
    echo
    echo "Current user/group state:"
    echo "  user: ${USER}"
    echo "  active groups: $(id -nG)"
    echo "  configured groups: $(id -nG "$USER")"
    if [[ -S /var/run/docker.sock ]]; then
      echo "  socket: $(ls -l /var/run/docker.sock)"
    fi
    exit 1
  else
    echo "Docker is installed, but this shell cannot access the Docker daemon."
    echo
    echo "Current user/group state:"
    echo "  user: ${USER}"
    echo "  active groups: $(id -nG)"
    echo "  configured groups: $(id -nG "$USER")"
    if [[ -S /var/run/docker.sock ]]; then
      echo "  socket: $(ls -l /var/run/docker.sock)"
    fi
    echo
    echo "Try one of these from your terminal:"
    echo "  newgrp docker"
    echo "  # or close this terminal and open a new one"
    echo
    echo "If that still fails, run:"
    echo "  sudo groupadd -f docker"
    echo "  sudo usermod -aG docker \"\$USER\""
    echo "  sudo systemctl restart docker"
    echo "  newgrp docker"
    exit 1
  fi
}

is_next_running() {
  [[ -f "$PID_FILE" ]] && kill -0 "$(cat "$PID_FILE")" >/dev/null 2>&1
}

wait_for_postgres() {
  echo "Waiting for Postgres to accept connections..."
  for attempt in {1..30}; do
    if "${DOCKER_CMD[@]}" compose exec -T db pg_isready -U crushable -d crushable >/dev/null 2>&1; then
      echo "Postgres is ready."
      return 0
    fi

    sleep 1
  done

  echo "Postgres did not become ready in time."
  "${DOCKER_CMD[@]}" compose logs db
  exit 1
}

start_app() {
  ensure_tools
  ensure_local_env
  mkdir -p "$RUNTIME_DIR"

  echo "Starting Postgres container..."
  "${DOCKER_CMD[@]}" compose up -d db
  wait_for_postgres

  echo "Applying database migrations..."
  npm run prisma:deploy

  echo "Running database smoke check..."
  npm run db:smoke

  if is_next_running; then
    echo "Next.js dev server is already running with PID $(cat "$PID_FILE")."
    echo "URL: http://localhost:3000"
    return 0
  fi

  echo "Starting Next.js dev server..."
  nohup npm run dev >"$LOG_FILE" 2>&1 &
  echo "$!" >"$PID_FILE"

  echo "Next.js dev server started with PID $(cat "$PID_FILE")."
  echo "URL: http://localhost:3000"
  echo "Logs: ${LOG_FILE}"
}

stop_app() {
  if is_next_running; then
    echo "Stopping Next.js dev server with PID $(cat "$PID_FILE")..."
    kill "$(cat "$PID_FILE")"
    rm -f "$PID_FILE"
  else
    echo "Next.js dev server is not running."
    rm -f "$PID_FILE"
  fi

  ensure_tools
  echo "Stopping Docker Compose services..."
  "${DOCKER_CMD[@]}" compose stop
}

show_status() {
  ensure_tools

  echo "Docker Compose services:"
  "${DOCKER_CMD[@]}" compose ps

  echo
  if is_next_running; then
    echo "Next.js dev server: running with PID $(cat "$PID_FILE")"
    echo "URL: http://localhost:3000"
  else
    echo "Next.js dev server: stopped"
  fi
}

follow_logs() {
  if [[ ! -f "$LOG_FILE" ]]; then
    echo "No Next.js dev server log exists yet."
    exit 1
  fi

  tail -f "$LOG_FILE"
}

case "${1:-}" in
  start)
    start_app
    ;;
  stop)
    stop_app
    ;;
  restart)
    stop_app
    start_app
    ;;
  status)
    show_status
    ;;
  logs)
    follow_logs
    ;;
  -h | --help | help | "")
    usage
    ;;
  *)
    echo "Unknown command: $1"
    usage
    exit 1
    ;;
esac
