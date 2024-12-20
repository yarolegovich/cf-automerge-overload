import { DurableObject } from 'cloudflare:workers';
import { next as A } from '@automerge/automerge';

export class WebSocketObject extends DurableObject<Env> {

  public async fetch(_: Request): Promise<Response> {
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.ctx.acceptWebSocket(server);
    server.send('Hi');
    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws: WebSocket, message: string): Promise<void> {
    if (message === 'init') {
      ws.send(JSON.stringify(A.init()));
    } else if (message === 'overload') {
      let doc = A.init<any>();
      for (let i = 0; i < 15; i++) {
        doc = A.change(doc, (doc) => {
          doc.test = 'a'.repeat(20_000);
        });
      }
      ws.send(`done`);
    } else {
      ws.send(`echo: ${message}`);
    }
  }

  async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean): Promise<void> {
    console.log('ws close', { code, reason, wasClean });
    ws.close(1011);
  }

  async webSocketError(ws: WebSocket, error: unknown): Promise<void> {
    console.log('ws error', { error });
  }
}
