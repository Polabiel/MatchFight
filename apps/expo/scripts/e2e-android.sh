#!/bin/bash
# Script E2E Android do MatchFight (Maestro + APK debug + Metro)
# Roda dentro do emulador Android via reactivecircus/android-emulator-runner.
#
# O APK debug (com.matchfight.app) carrega o bundle JS do Metro em runtime.
# Sem Expo Go, sem deep link exp:// — usa launchApp com o appId nativo.
# Debug (em vez de release) evita crash do react-native-css/worklets que
# ocorre com Hermes bytecode embutido no release.
set -eu

# 0. Iniciar backend Next.js (API) — o app Expo precisa dele para renderizar.
#    EXPO_PUBLIC_BASE_URL=http://10.0.2.2:3000 aponta o app para o host via emulador.
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

# 1. Iniciar Metro bundler em background (precisa estar ativo para o debug APK)
echo "==> Iniciando Metro bundler..."
cd apps/expo
CI=1 pnpm exec expo start --port 8081 > /tmp/metro.log 2>&1 &
METRO_PID=$!
echo "Metro PID: $METRO_PID"
cd ../..

# 2. Poll do status do Metro (120s max)
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

# 2b. Pré-aquecer o bundle do Metro (primeira compilação é lenta)
echo "==> Pré-aquecendo bundle do Metro..."
curl -sf "http://127.0.0.1:8081/index.bundle?platform=android&dev=true&minify=false" -o /tmp/warm.bundle.js || echo "warm falhou (prosseguindo mesmo assim)"

# 3. Instalar APK debug (produzido pelo gradle assembleDebug)
APK="apps/expo/android/app/build/outputs/apk/debug/app-debug.apk"
if [ ! -f "$APK" ]; then
  echo "APK não encontrado: $APK"
  cat /tmp/metro.log
  exit 1
fi
echo "==> Instalando APK debug..."
adb install -r "$APK"

# 4. Instalar Maestro CLI
echo "==> Instalando Maestro CLI..."
curl -fsSL "https://get.maestro.mobile.dev" | bash

# 5. Rodar testes Maestro
echo "==> Rodando testes Maestro..."
~/.maestro/bin/maestro test apps/expo/.maestro --config apps/expo/.maestro/config.yaml

# 6. Cleanup
kill "$METRO_PID" 2>/dev/null || true
kill "$API_PID" 2>/dev/null || true
