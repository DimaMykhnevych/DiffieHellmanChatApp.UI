import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageConstants } from 'src/app/constants/local-storage-constants';
import { Message } from 'src/app/models/message';
import { AuthService } from 'src/app/services/auth.service';
import { ChatHub } from 'src/app/services/chat-hub.service';
import { CurrentUserService } from 'src/app/services/current-user.service';

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

  constructor(
    private _chatHub: ChatHub,
    private _currentUserService: CurrentUserService,
    private _authService: AuthService,
    private router: Router
  ) {
    this.subscribeToEvents();
  }

  ngOnInit(): void {
    this._chatHub.connect();
    this.currentUserName = this._currentUserService.userInfo.username;
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

  public logout() {
    this._authService.unauthorize();
    this._chatHub.disconnect();
    this.router.navigate(['/login']);
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
