const baseUrl = process.env.SMOKE_BASE_URL || `http://localhost:${process.env.APP_PORT || 80}`;
const timeoutMs = Number(process.env.SMOKE_TIMEOUT_MS || 30000);

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    return await fetch(url, {
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function waitForHealthy(url) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetchWithTimeout(url);
      if (response.ok) {
        return;
      }
    } catch {
      // Keep polling until timeout.
    }

    await wait(1500);
  }

  throw new Error(`Timed out waiting for ${url}`);
}

async function main() {
  const healthUrl = `${baseUrl}/api/health`;
  const frontendUrl = baseUrl;

  await waitForHealthy(healthUrl);

  const [healthResponse, frontendResponse] = await Promise.all([
    fetchWithTimeout(healthUrl),
    fetchWithTimeout(frontendUrl),
  ]);

  if (!healthResponse.ok) {
    throw new Error(`Health endpoint returned ${healthResponse.status}`);
  }

  if (!frontendResponse.ok) {
    throw new Error(`Frontend returned ${frontendResponse.status}`);
  }

  const healthPayload = await healthResponse.json();
  const frontendHtml = await frontendResponse.text();

  if (healthPayload.status !== 'ok') {
    throw new Error('Health endpoint did not return status ok');
  }

  if (!frontendHtml.includes('<!doctype html') && !frontendHtml.includes('<!DOCTYPE html')) {
    throw new Error('Frontend response is not an HTML document');
  }

  console.log(`Smoke test passed for ${baseUrl}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
