// license: MIT
// repo: https://github.com/TooTallNate/proxy
// with customize logic
import assert from "assert";
import debug from "debug";
import http, { IncomingMessage, RequestOptions, ServerResponse } from "http";
import net from "net";
import WebSocket from "ws";

const log = debug("ws-client");

/**
 * create a socks5 proxy with target ws proxy server
 */
export class ProxyClient {
  private _wsServerAddr: string;
  private _localProxyServer: http.Server;
  private _localProxyPort: string | number;
  private _wsHeaders: { [key: string]: string };

  /**
   *
   * @param serverAddr server addr, like 'ws://server.host.com:80'
   * @param localPort local http proxy port
   * @param wsHeaders additional headers on ws request
   */
  constructor(serverAddr: string, localPort: string | number = 0, wsHeaders: { [key: string]: string } = {}) {
    this._wsServerAddr = serverAddr;
    this._localProxyServer = http.createServer();
    this._localProxyPort = localPort;
    this._wsHeaders = wsHeaders;
  }

  private createWebSocket(host: string, port: string | number) {
    return new WebSocket(this._wsServerAddr, {
      headers: {
        "x-proxy-host": host,
        "x-proxy-port": port || 80,
        ...this._wsHeaders
      }
    });
  }

  public createAgent(): http.Agent {
    return new (class ProxyAgent extends http.Agent {
      private _client: ProxyClient;
      constructor(client: ProxyClient) {
        super();
        this._client = client;
      }
      createConnection(opts: RequestOptions, cb: Function) {
        const ws = this._client.createWebSocket(opts.host, opts.port || 80);
        const stream = WebSocket.createWebSocketStream(ws);
        ws.on("open", () => {
          cb(null, stream);
        });
        ws.on("error", (err) => {
          cb(err);
        });
      }
    })(this);
  }

  public async ready(): Promise<number> {
    return new Promise((resolve, reject) => {
      this._localProxyServer.listen(parseInt(this._localProxyPort as any, 10), () => {
        const port = this._localProxyServer.address()?.["port"];
        log("proxy ready on port: %s", port);
        resolve(port);
      });
      this._localProxyServer.once("error", reject);
      this._localProxyServer.on("request", this._onRequest.bind(this));
      this._localProxyServer.on("connect", this._onConnect.bind(this));
    });
  }

  private _onRequest(request: IncomingMessage, response: ServerResponse) {
    log("proxy accept request: %s", request.url);

    const uri = new URL(request.url);

    const proxyRequest = http.request({
      port: uri.port || 80,
      hostname: uri.hostname,
      method: request.method,
      path: uri.pathname,
      headers: request.headers,
      protocol: uri.protocol,
      agent: this.createAgent()
    });

    request.pipe(proxyRequest);

    // TODO error handling

    request.on("end", () => {
      proxyRequest.end();
    });

    proxyRequest.on("response", (proxyResponse) => {
      response.writeHead(proxyResponse.statusCode, proxyResponse.httpVersion, proxyResponse.headers);
      proxyResponse.pipe(response);
      proxyResponse.on("end", () => {
        response.end();
      });
    });
  }

  public async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      this._localProxyServer.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * HTTP CONNECT proxy requests.
   */
  private _onConnect(req: IncomingMessage, proxyClientSocket: net.Socket, head: any) {
    assert(!head || 0 == head.length, '"head" should be empty for proxy requests');

    let res = new http.ServerResponse(req);
    res.shouldKeepAlive = false;
    res.chunkedEncoding = false;
    res.useChunkedEncodingByDefault = false;
    res.assignSocket(proxyClientSocket);

    let gotResponse = false;

    function onfinish() {
      res.detachSocket(proxyClientSocket);
      proxyClientSocket.end();
    }
    res.once("finish", onfinish);

    proxyClientSocket.on("error", (err) => {
      log("response socket error: %s", err);
    });

    // pause the socket during authentication so no data is lost
    const parts = req.url.split(":");
    const host = parts[0];
    const port = +parts[1];

    const _log = (format: string, ...args: any[]) => log(`proxy to [%s] ${format}`, host, ...args);

    const ws = this.createWebSocket(host, port);

    ws.on("open", () => {
      gotResponse = true;
      res.removeListener("finish", onfinish);

      res.writeHead(200, "Connection established");
      res.flushHeaders();

      // relinquish control of the `socket` from the ServerResponse instance
      res.detachSocket(proxyClientSocket);

      // nullify the ServerResponse object, so that it can be cleaned
      // up before this socket proxy is completed
      res = null;

      const targetProxy = WebSocket.createWebSocketStream(ws);

      targetProxy.on("close", () => {
        _log("target closed");
      });
      targetProxy.on("error", (err) => {
        _log("target error: %s", err);
      });
      targetProxy.on("end", () => {
        _log("target end");
      });
      proxyClientSocket.pipe(targetProxy);
      targetProxy.pipe(proxyClientSocket);
    });

    ws.on("close", () => {
      _log("websocket closed");
      proxyClientSocket.destroy();
    });

    ws.on("error", (err) => {
      _log("websocket err: %s", err);
      if (gotResponse) {
        proxyClientSocket.destroy();
      } else if ("ENOTFOUND" == err?.["code"]) {
        res.writeHead(404);
        res.end();
      } else {
        res.writeHead(500);
        res.end();
      }
    });
  }
}
