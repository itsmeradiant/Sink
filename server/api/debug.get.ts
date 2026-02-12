export default eventHandler(async (event) => {
  const { cloudflare } = event.context
  const { cfAccountId, cfApiToken, dataset } = useRuntimeConfig(event)

  // Mask sensitive values for security
  const maskValue = (value: string) => {
    if (!value)
      return 'NOT SET'
    if (value.length <= 8)
      return 'SET (too short to mask)'
    return `SET (${value.slice(0, 4)}...${value.slice(-4)})`
  }

  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: {
      cfAccountId: maskValue(cfAccountId),
      cfApiToken: maskValue(cfApiToken),
      dataset: dataset || 'NOT SET',
    },
    bindings: {
      hasAnalyticsBinding: !!cloudflare?.env?.ANALYTICS,
      hasKVBinding: !!cloudflare?.env?.KV,
      hasAIBinding: !!cloudflare?.env?.AI,
      hasR2Binding: !!cloudflare?.env?.R2,
    },
    tests: {} as Record<string, any>,
  }

  // Test 1: Check if Analytics Engine API is accessible
  try {
    if (!cfAccountId || !cfApiToken) {
      diagnostics.tests.analyticsEngineAPI = {
        status: 'SKIPPED',
        reason: 'Missing cfAccountId or cfApiToken',
      }
    }
    else {
      const testQuery = `SELECT COUNT(*) as total FROM ${dataset}`
      const result = await useWAE(event, testQuery)
      diagnostics.tests.analyticsEngineAPI = {
        status: 'SUCCESS',
        query: testQuery,
        result,
      }
    }
  }
  catch (error: any) {
    diagnostics.tests.analyticsEngineAPI = {
      status: 'FAILED',
      error: error.message || String(error),
      details: error.data || null,
    }
  }

  // Test 2: Check if any data exists in the dataset
  try {
    if (!cfAccountId || !cfApiToken) {
      diagnostics.tests.dataExists = {
        status: 'SKIPPED',
        reason: 'Missing cfAccountId or cfApiToken',
      }
    }
    else {
      const sampleQuery = `SELECT * FROM ${dataset} LIMIT 5`
      const result = await useWAE(event, sampleQuery)
      diagnostics.tests.dataExists = {
        status: 'SUCCESS',
        query: sampleQuery,
        rowCount: Array.isArray(result.data) ? result.data.length : 0,
        sampleData: result.data || [],
      }
    }
  }
  catch (error: any) {
    diagnostics.tests.dataExists = {
      status: 'FAILED',
      error: error.message || String(error),
    }
  }

  // Test 3: Check Analytics Engine binding write capability
  try {
    if (!cloudflare?.env?.ANALYTICS) {
      diagnostics.tests.analyticsBinding = {
        status: 'FAILED',
        reason: 'ANALYTICS binding not available',
      }
    }
    else {
      diagnostics.tests.analyticsBinding = {
        status: 'SUCCESS',
        message: 'ANALYTICS binding is available',
        note: 'Write test skipped to avoid polluting data',
      }
    }
  }
  catch (error: any) {
    diagnostics.tests.analyticsBinding = {
      status: 'FAILED',
      error: error.message || String(error),
    }
  }

  return diagnostics
})
