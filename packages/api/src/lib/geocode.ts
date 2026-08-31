/**
 * Validação de localização via Nominatim (OpenStreetMap).
 *
 * Gratuito, sem chave de API. Política de uso: máx 1 req/s.
 * Cache em memória para evitar repetir chamadas.
 */

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

// Cache: chave = location, valor = { valid, cachedAt }
const cache = new Map<string, { valid: boolean; cachedAt: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const RATE_LIMIT_MS = 1100; // 1.1s entre chamadas (respeitar política)
let lastCall = 0;

interface NominatimResult {
  type: string;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
  };
}

/**
 * Valida se uma string de localização representa uma cidade/região real.
 * Retorna `true` se for válida, `false` se não for encontrada ou se
 * a API estiver indisponível (fail-open).
 */
export async function validateLocation(location: string): Promise<boolean> {
  const trimmed = location.trim();
  if (!trimmed) return true; // campo opcional, vazio = válido

  // Check cache
  const cached = cache.get(trimmed);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    return cached.valid;
  }

  // Rate limiting para respeitar política do Nominatim
  const now = Date.now();
  const wait = RATE_LIMIT_MS - (now - lastCall);
  if (wait > 0) {
    await new Promise((resolve) => setTimeout(resolve, wait));
  }

  try {
    const params = new URLSearchParams({
      q: trimmed,
      format: "json",
      limit: "1",
      addressdetails: "1",
    });

    const response = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
      headers: {
        "User-Agent": "MatchFight/1.0 (dev)",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(5000),
    });

    lastCall = Date.now();

    if (!response.ok) {
      // Fail-open: se a API estiver com erro, não bloqueia o usuário
      console.warn(`[geocode] Nominatim retornou ${response.status} para "${trimmed}"`);
      cache.set(trimmed, { valid: true, cachedAt: Date.now() });
      return true;
    }

    const data = (await response.json()) as NominatimResult[] | null;

    if (!data || data.length === 0) {
      cache.set(trimmed, { valid: false, cachedAt: Date.now() });
      return false;
    }

    // Verifica se o resultado tem um tipo de localidade válido
    const result = data[0];
    if (!result) {
      cache.set(trimmed, { valid: false, cachedAt: Date.now() });
      return false;
    }
    const validTypes = ["city", "town", "village", "municipality", "administrative"];
    const isValid = result.type
      ? validTypes.includes(result.type)
      : // Se não tem type, aceita se tiver address (cidade/país)
        !!result.address?.country;

    cache.set(trimmed, { valid: isValid, cachedAt: Date.now() });
    return isValid;
  } catch (error) {
    // Fail-open: se a API falhar (timeout, rede), não bloqueia o usuário
    console.warn(`[geocode] Erro ao validar "${trimmed}":`, error);
    cache.set(trimmed, { valid: true, cachedAt: Date.now() });
    return true;
  }
}