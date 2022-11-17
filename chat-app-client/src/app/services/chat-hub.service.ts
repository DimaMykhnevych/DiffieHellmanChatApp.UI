import { Injectable } from '@angular/core';
import { Message } from '../models/message';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { Observable, Subject } from 'rxjs';
import { AppSettings } from '../settings';

@Injectable({
  providedIn: 'root',
})
export class ChatHub {
  public message?: Message;
  messageReceived: Subject<Message>;
  private _hubConnection?: HubConnection;
  constructor() {
    this.messageReceived = new Subject<Message>();
    this.createConnection();
    this.registerOnServerEvents();

    this.startConnection();
  }

  public onMessageRecieved(): Observable<Message> {
    return this.messageReceived.asObservable();
  }
  public disconnect() {
    this._hubConnection?.stop();
  }
  public sendChatMessage(message: Message) {
    this._hubConnection?.invoke('SendMessage', message);
  }

  private createConnection() {
    this._hubConnection = new HubConnectionBuilder()
      .withUrl(AppSettings.hubHost + '/hubs/chat')
      .build();
  }

  private startConnection(): void {
    this._hubConnection
      ?.start()
      .then(() => {
        console.log('Hub connection started');
      })
      .catch(() => {
        console.log('Error while establishing connection, retrying...');
        setTimeout(this.startConnection, 5000);
      });
  }

  private registerOnServerEvents(): void {
    this._hubConnection?.on('ReceiveMessage', (data) => {
      if (data) {
        this.message = data;
        this.messageReceived.next(data);
      }
    });
  }
}
