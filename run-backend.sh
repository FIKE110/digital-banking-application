#!/usr/bin/env bash
# Starts the backend microservices locally with `mvn spring-boot:run`.
# Skips the customer-webapp (frontend) entirely.
#
# Usage:
#   ./run-backend.sh          # start all backend services
#   ./run-backend.sh stop     # stop all started services
#
# Requires: Maven (prefers ./mvnw, then homebrew/MAVEN_HOME, then PATH),
#           and PostgreSQL / RabbitMQ / Redis / Mailhog running
#           (e.g. `docker compose up -d postgres redis rabbitmq mailhog`).

set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

LOGS_DIR="$ROOT/.backend-logs"
PIDS_FILE="$ROOT/.backend-pids"
mkdir -p "$LOGS_DIR"

# ---- pick a Maven that actually works ---------------------------------------
MVN=""
if [ -x "$ROOT/mvnw" ]; then
  MVN="$ROOT/mvnw"
else
  for c in /opt/homebrew/opt/maven/bin/mvn /usr/local/opt/maven/bin/mvn "$MAVEN_HOME/bin/mvn" mvn; do
    if command -v "$c" >/dev/null 2>&1; then MVN="$c"; break; fi
  done
fi
if [ -z "$MVN" ]; then
  echo "ERROR: Maven not found. Install Maven or set MAVEN_HOME." >&2
  exit 1
fi

# ---- docker compose command --------------------------------------------------
if command -v docker >/dev/null 2>&1; then
  if docker compose version >/dev/null 2>&1; then COMPOSE="docker compose"; else COMPOSE="docker-compose"; fi
else
  echo "ERROR: docker not found. Install Docker to run the infra stack." >&2
  exit 1
fi

# ---- stop subcommand ----------------------------------------------------------
if [ "${1:-}" = "stop" ]; then
  if [ -f "$PIDS_FILE" ]; then
    echo "==> Stopping backend services..."
    while read -r pid; do
      [ -n "$pid" ] && kill "$pid" 2>/dev/null && echo "    killed $pid" || true
    done < "$PIDS_FILE"
    rm -f "$PIDS_FILE"
  else
    echo "No .backend-pids file found — nothing to stop."
  fi
  echo "==> Infra still running. Stop it with: $COMPOSE down"
  exit 0
fi

echo "Using Maven: $MVN"
"$MVN" -v | head -1

# ---- 0) start infra (detached / background) ----------------------------------
echo "==> Starting infra (postgres, redis, rabbitmq, mailhog) in background..."
$COMPOSE up -d postgres redis rabbitmq mailhog

echo "==> Waiting for postgres & rabbitmq to be ready..."
ready=0
for i in $(seq 1 45); do
  pg_ok=0; rmq_ok=0
  $COMPOSE exec -T postgres pg_isready -U banking -d banking_db >/dev/null 2>&1 && pg_ok=1
  $COMPOSE exec -T rabbitmq rabbitmqctl status >/dev/null 2>&1 && rmq_ok=1
  if [ "$pg_ok" = 1 ] && [ "$rmq_ok" = 1 ]; then ready=1; break; fi
  sleep 2
done
if [ "$ready" = 1 ]; then
  echo "    infra ready."
else
  echo "    WARNING: infra not ready after wait — backend services may fail to connect." >&2
fi

# ---- 1) install shared library modules (not runnable) -----------------------
echo "==> Building shared library modules (common-lib, core-lib, core-data-lib)..."
"$MVN" -q -pl common-lib,core-lib,core-data-lib -am install -DskipTests

# ---- 2) start each runnable service -----------------------------------------
SERVICES="core-app-service email-service audit-service api-gateway-service"
: > "$PIDS_FILE"

for svc in $SERVICES; do
  echo "==> Starting $svc (log: $LOGS_DIR/$svc.log)"
  nohup "$MVN" -pl "$svc" spring-boot:run -DskipTests > "$LOGS_DIR/$svc.log" 2>&1 &
  echo $! >> "$PIDS_FILE"
done

echo
echo "==> All backend services are starting (infra already up via Docker)."
echo "    PIDs: $(tr '\n' ' ' < "$PIDS_FILE")"
echo "    Logs: tail -f $LOGS_DIR/<service>.log"
echo "    Stop services: ./run-backend.sh stop"
echo "    Stop infra:     $COMPOSE down"
echo
echo "    Ports: core-app=8081  email=8090  audit=8091  gateway=8080"
echo "    Gateway is the public entrypoint: http://localhost:8080/api/v1"
