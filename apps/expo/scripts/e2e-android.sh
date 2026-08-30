#!/bin/bash
# Script E2E Android do MatchFight (Maestro + APK standalone)
# Roda dentro do emulador Android via reactivecircus/android-emulator-runner.
#
# O app roda como APK nativo (com.matchfight.app), compilado em
# "Build Android APK" (./gradlew assembleRelease). Sem Expo Go, sem deep
# link exp://, sem Metro — elimina as falhas de carregamento em CI headless.
set -eu

# 0. Iniciar backend Next.js (API) — o app Expo precisa dele para renderizar.
#    EXPO_PUBLIC_BASE_URL=http://10.0.2.2:3000 foi embutido no bundle durante
#    o gradle build, apontando o app para o host via emulador.
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

# 1. Instalar APK nativo (produzido pelo gradle assembleRelease)
APK="apps/expo/android/app/build/outputs/apk/release/app-release.apk"
if [ ! -f "$APK" ]; then
  echo "APK não encontrado: $APK"
  exit 1
fi
echo "==> Instalando APK nativo..."
adb install -r "$APK"

# 2. Instalar Maestro CLI
echo "==> Instalando Maestro CLI..."
curl -fsSL "https://get.maestro.mobile.dev" | bash

# 3. Rodar testes Maestro
echo "==> Rodando testes Maestro..."
~/.maestro/bin/maestro test apps/expo/.maestro --config apps/expo/.maestro/config.yaml

# 4. Cleanup
kill "$API_PID" 2>/dev/null || true
