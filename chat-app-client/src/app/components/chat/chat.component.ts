import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { LocalStorageConstants } from 'src/app/constants/local-storage-constants';
import { Message } from 'src/app/models/message';
import { ChatHub } from 'src/app/services/chat-hub.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit {
  public currentUserName: string = '';
  public messages: Message[] = [];
  public txtMessage: string = '';
  public needToScroll: boolean = true;

  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;

  constructor(private _chatHub: ChatHub) {
    this.subscribeToEvents();
  }

  ngOnInit(): void {
    this.currentUserName =
      localStorage.getItem(LocalStorageConstants.userInfoStorageKey) || '';
  }

  public sendMessage(): void {
    if (this.txtMessage) {
      const message: Message = {
        content: this.txtMessage,
        sendingDate: new Date(),
        senderName: this.currentUserName,
      };

      this.needToScroll = true;
      this.messages.push(message);
      this.txtMessage = '';
      this._chatHub.sendChatMessage(message);
    }
  }

  public onMessageInput(event: Event): void {
    this.txtMessage = (event.target as HTMLInputElement).value;
  }

  public isMyMessage(senderUsername: string): boolean {
    return senderUsername === this.currentUserName;
  }

  public scrollToBottom(): void {
    try {
      if (this.needToScroll) {
        this.myScrollContainer.nativeElement.scrollTop =
          this.myScrollContainer.nativeElement.scrollHeight;
        this.needToScroll = false;
      }
    } catch (err) {}
  }

  private subscribeToEvents(): void {
    this._chatHub.messageReceived.subscribe((message: Message) => {
      this.messages.push(message);
      this.needToScroll = true;
    });
  }
}
