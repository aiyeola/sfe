import { api, ApiError } from './client'

describe('api client', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('rejects with ApiError on non-2xx responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json({ error: { code: 'NOT_FOUND', message: 'Transaction x not found' } }, { status: 404 })
      )
    )
    const err = await api.get('/transactions/x').catch((e: unknown) => e)
    expect(err).toBeInstanceOf(ApiError)
    expect(err).toMatchObject({ status: 404, code: 'NOT_FOUND', message: 'Transaction x not found' })
  })

  it('rejects with ApiError when the error body is not JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('Bad gateway', { status: 502 }))
    )
    await expect(api.get('/me')).rejects.toMatchObject({ status: 502, code: 'UNKNOWN' })
  })

  it('resolves with the body on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json({ data: { ok: true } }))
    )
    await expect(api.get('/me')).resolves.toEqual({ data: { ok: true } })
  })
})
