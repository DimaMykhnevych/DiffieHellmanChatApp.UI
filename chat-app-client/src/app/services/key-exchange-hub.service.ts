import { Injectable } from '@angular/core';
import {
  HubConnection,
  HubConnectionBuilder,
  IHttpConnectionOptions,
} from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { AppSettings } from '../settings';
import { TokenService } from './token.service';
import { KeyExchange } from '../models/key-exchange';
import { KeyExchangeResponse } from '../models/key-exchange-response';

@Injectable({
  providedIn: 'root',
})
export class KeyExchangeHub {
  public key?: KeyExchangeResponse;
  keyReceived: Subject<KeyExchangeResponse>;
  keyExchangedFinished: Subject<any>;
  private _hubConnection?: HubConnection;

  constructor(private _tokenService: TokenService) {
    this.keyReceived = new Subject<KeyExchangeResponse>();
    this.keyExchangedFinished = new Subject();
  }

  public connect(): void {
    this.createConnection();
    this.registerOnServerEvents();

    this.startConnection();
  }
  public disconnect() {
    this._hubConnection?.stop();
  }
  public sendPublicKey(keyExchange: KeyExchange) {
    this._hubConnection?.invoke('SendPublicKey', keyExchange);
  }

  private createConnection() {
    const options: IHttpConnectionOptions = {
      accessTokenFactory: () => {
        return this._tokenService.token;
      },
    };
    this._hubConnection = new HubConnectionBuilder()
      .withUrl(AppSettings.hubHost + '/hubs/key-exchange', options)
      .build();
  }

  private startConnection(): void {
    this._hubConnection
      ?.start()
      .then(() => {
        console.log('Key excahnge hub connection started');
      })
      .catch(() => {
        console.log('Error while establishing connection, retrying...');
        setTimeout(this.startConnection, 5000);
      });
  }

  private registerOnServerEvents(): void {
    this._hubConnection?.on('ReceivePublicKey', (data: KeyExchangeResponse) => {
      if (data) {
        this.key = data;
        this.keyReceived.next(data);
      }
    });

    this._hubConnection?.on('KeyExchangeFinished', () => {
      this.keyExchangedFinished.next();
    });
  }
}
