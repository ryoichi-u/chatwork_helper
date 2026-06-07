import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Credentials } from '../bridge/events';
import { markRoomRead } from './markRoomRead';

const credentials: Credentials = {
  myid: '12345',
  accessToken: 'token-abc',
  clientVer: '2.0',
  language: 'ja',
};

afterEach(() => {
  vi.unstubAllGlobals();
});

function stubFetch(ok = true, status = 200) {
  const fetchMock = vi.fn().mockResolvedValue({ ok, status });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('markRoomRead', () => {
  it('gateway.php へ既読化 POST を送る', async () => {
    const fetchMock = stubFetch();
    await markRoomRead({
      hostname: 'www.chatwork.com',
      room: { roomId: '100', lastChatId: 'm-2' },
      credentials,
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://www.chatwork.com/gateway.php?cmd=read&myid=12345&_v=2.0&_av=5&ln=ja');
    expect(init.method).toBe('POST');
    expect(init.credentials).toBe('include');

    const body = init.body as URLSearchParams;
    expect(body.get('room_id')).toBe('100');
    expect(body.get('unread')).toBe('0');
    expect(body.get('last_chat_id')).toBe('m-2');
    expect(body.get('_t')).toBe('token-abc');
  });

  it('lastChatId が無ければ last_chat_id を送らない', async () => {
    const fetchMock = stubFetch();
    await markRoomRead({
      hostname: 'www.chatwork.com',
      room: { roomId: '100' },
      credentials,
    });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((init.body as URLSearchParams).has('last_chat_id')).toBe(false);
  });

  it('HTTP エラー時は例外を投げる（トークンはメッセージに含めない）', async () => {
    stubFetch(false, 403);
    await expect(
      markRoomRead({ hostname: 'www.chatwork.com', room: { roomId: '100' }, credentials }),
    ).rejects.toThrowError(/HTTP 403/);

    await expect(
      markRoomRead({ hostname: 'www.chatwork.com', room: { roomId: '100' }, credentials }),
    ).rejects.not.toThrowError(/token-abc/);
  });
});
