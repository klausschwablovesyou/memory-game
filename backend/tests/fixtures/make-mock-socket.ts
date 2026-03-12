export type MockSocket = WebSocket & { _sent: string[]; _closed: boolean };

export function makeMockSocket(readyState = WebSocket.OPEN): MockSocket {
  const sent: string[] = [];
  let closed = false;
  return {
    readyState,
    send(data: string) {
      sent.push(data);
    },
    close() {
      closed = true;
    },
    get _sent() {
      return sent;
    },
    get _closed() {
      return closed;
    },
    onmessage: null,
  } as unknown as MockSocket;
}
