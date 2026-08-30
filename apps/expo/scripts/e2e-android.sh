#!/bin/bash
# Script E2E Android do MatchFight (Maestro + Expo Go)
# Roda dentro do emulador Android via reactivecircus/android-emulator-runner.
set -eu

# 0. Iniciar backend Next.js (API) — o app Expo precisa dele para renderizar.
#    O app usa getBaseUrl() que resolve para http://10.0.2.2:3000 no emulador.
echo "==> Iniciando backend Next.js..."
pnpm --filter @acme/nextjs start > /tmp/api.log 2>&1 &
API_PID=$!

for i in $(seq 1 60); do
  if curl -sf "http://127.0.0.1:3000" > /dev/null 2>&1; then
    echo "API ready after ${i}x2s"
    break
  fi
  if ! kill -0 "$API_PID" 2>/dev/null; then
    echo "API process died. Log:"
    cat /tmp/api.log
    exit 1
  fi
  sleep 2
done

if ! curl -sf "http://127.0.0.1:3000" > /dev/null 2>&1; then
  echo "API failed to start. Log:"
  cat /tmp/api.log
  exit 1
fi

cd apps/expo

# 1. Instalar Expo Go APK (via GitHub Releases oficial - Expo-Go-54.0.8 para SDK 54)
echo "==> Baixando Expo Go APK..."
wget -q --header="Accept: application/octet-stream" \
  "https://github.com/expo/expo-go-releases/releases/download/Expo-Go-54.0.8/Expo-Go-54.0.8.apk" \
  -O /tmp/expo-go.apk
echo "==> Instalando Expo Go no emulador..."
adb install -r /tmp/expo-go.apk

# 2. Iniciar Metro bundler em background (expo local do monorepo via pnpm)
# CI=1 desativa o modo interativo; host lan (default) já bind em 0.0.0.0
echo "==> Iniciando Metro bundler..."
CI=1 pnpm exec expo start --port 8081 > /tmp/metro.log 2>&1 &
METRO_PID=$!
echo "Metro PID: $METRO_PID"

# 3. Poll do status do Metro (120s max)
for i in $(seq 1 60); do
  if curl -sf "http://127.0.0.1:8081/status" > /dev/null 2>&1; then
    echo "Metro bundler ready after ${i}x2s"
    break
  fi
  if ! kill -0 "$METRO_PID" 2>/dev/null; then
    echo "Metro bundler process died. Log:"
    cat /tmp/metro.log
    exit 1
  fi
  sleep 2
done

if ! curl -sf "http://127.0.0.1:8081/status" > /dev/null 2>&1; then
  echo "Metro bundler failed to start. Log:"
  cat /tmp/metro.log
  exit 1
fi

# 3b. Pré-aquecer o bundle do Metro (primeiro build é lento; sem isso o
#     assertVisible do Maestro estoura antes do app renderizar)
echo "==> Pré-aquecendo bundle do Metro..."
curl -sf "http://127.0.0.1:8081/index.bundle?platform=android&dev=true&minify=false" -o /tmp/warm.bundle.js || echo "warm falhou (prosseguindo mesmo assim)"

# 4. Instalar Maestro CLI
echo "==> Instalando Maestro CLI..."
curl -fsSL "https://get.maestro.mobile.dev" | bash

# 5. Rodar testes Maestro
echo "==> Rodando testes Maestro..."
~/.maestro/bin/maestro test .maestro --config .maestro/config.yaml

# 6. Cleanup
kill "$METRO_PID" 2>/dev/null || true
kill "$API_PID" 2>/dev/null || true
