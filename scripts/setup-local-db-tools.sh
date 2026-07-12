#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "Crushable local database tooling setup"
echo "Project: ${PROJECT_ROOT}"
echo

if ! command -v apt-get >/dev/null 2>&1; then
  echo "This script expects an apt-based Linux environment such as Ubuntu."
  exit 1
fi

if ! command -v sudo >/dev/null 2>&1; then
  echo "sudo is required to install Docker and PostgreSQL client tools."
  exit 1
fi

echo "Checking sudo access. You may be prompted for your password."
sudo -v

echo
echo "Updating apt package metadata..."
sudo apt-get update

echo
echo "Installing Docker, Docker Compose v2, and the PostgreSQL client..."
sudo apt-get install -y docker.io docker-compose-v2 postgresql-client

echo
echo "Trying to enable and start Docker..."
if command -v systemctl >/dev/null 2>&1; then
  if sudo systemctl enable --now docker; then
    echo "Docker service is enabled and running."
  else
    echo "Could not manage Docker with systemctl. This can be normal in WSL or containers."
  fi
else
  echo "systemctl is not available. Start Docker manually if docker commands fail."
fi

echo
echo "Ensuring docker group exists..."
sudo groupadd -f docker

if id -nG "$USER" | grep -qE '(^| )docker( |$)'; then
  echo "User ${USER} is already in the docker group."
else
  echo "Adding ${USER} to the docker group..."
  sudo usermod -aG docker "$USER"
  echo "Group membership changed. Open a new shell, log out and back in, or run: newgrp docker"
fi

echo
echo "Installed versions:"
docker --version || true
docker compose version || true
psql --version || true
echo "Active groups: $(id -nG)"
echo "Configured groups for ${USER}: $(id -nG "$USER")"
if [[ -S /var/run/docker.sock ]]; then
  echo "Docker socket: $(ls -l /var/run/docker.sock)"
fi

echo
if [[ -f "${PROJECT_ROOT}/.env" ]]; then
  echo "Local .env already exists."
else
  echo "Creating local .env for host-based Docker Compose development..."
  cp "${PROJECT_ROOT}/.env.example" "${PROJECT_ROOT}/.env"
  sed -i 's/@db:5432/@localhost:5432/' "${PROJECT_ROOT}/.env"
fi

echo
cat <<'NEXT_STEPS'
Next steps:

  cd /home/matt/codex_projects/crushable
  docker compose up -d db
  DATABASE_URL="postgresql://crushable:crushable@localhost:5432/crushable?schema=public" npm run prisma:deploy
  DATABASE_URL="postgresql://crushable:crushable@localhost:5432/crushable?schema=public" npm run db:smoke

If docker says permission denied, open a new terminal or run:

  newgrp docker

Then retry the docker compose command.
NEXT_STEPS
