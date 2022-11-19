import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  DiffieHellman,
  DiffieHellmanPrivateKey,
} from 'src/app/algorithms/diffie-hellman';
import { DiffieHellmanConstants } from 'src/app/constants/diffie-hellman-constnats';
import { KeyExchangeResponse } from 'src/app/models/key-exchange-response';
import { Message } from 'src/app/models/message';
import { AuthService } from 'src/app/services/auth.service';
import { ChatHub } from 'src/app/services/chat-hub.service';
import { CurrentUserService } from 'src/app/services/current-user.service';
import { KeyExchangeHub } from 'src/app/services/key-exchange-hub.service';
import * as bigInt from 'big-integer';
import { AES } from 'src/app/algorithms/aes';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, OnDestroy {
  private diffieHellman: DiffieHellman;
  public currentUserName: string = '';
  public messages: Message[] = [];
  public txtMessage: string = '';
  public needToScroll: boolean = true;
  public chattingEnabled: boolean = true;

  private $destroy = new Subject();

  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;

  constructor(
    private _chatHub: ChatHub,
    private _keyExchangeHub: KeyExchangeHub,
    private _currentUserService: CurrentUserService,
    private _authService: AuthService,
    private router: Router,
    private _snackBar: MatSnackBar
  ) {
    this.diffieHellman = new DiffieHellman();
    this.subscribeToEvents();
  }

  ngOnInit(): void {
    this._chatHub.connect();
    this._keyExchangeHub.connect();
    this.currentUserName = this._currentUserService.userInfo.username;
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  public sendMessage(): void {
    if (this.txtMessage) {
      const message: Message = {
        content: AES.encrypt(this.txtMessage),
        sendingDate: new Date(),
        senderName: this.currentUserName,
      };

      this.needToScroll = true;
      this.messages.push({
        content: this.txtMessage,
        sendingDate: new Date(),
        senderName: this.currentUserName,
      });
      this.txtMessage = '';
      this._chatHub.sendChatMessage(message);
    }
  }

  public onKeyExchange(): void {
    const diffieHellmanPublicKey = this.diffieHellman.generatePublicKey(
      DiffieHellmanConstants.g
    );
    this._keyExchangeHub.sendPublicKey({
      senderId: this._currentUserService.userInfo.id,
      publicKey: diffieHellmanPublicKey.toString(),
    });
  }

  public logout() {
    this._authService.unauthorize();
    this._chatHub.disconnect();
    this._keyExchangeHub.disconnect();
    DiffieHellman.privateKey = undefined;
    DiffieHellmanPrivateKey.key = '';
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
    this._chatHub.messageReceived
      .pipe(takeUntil(this.$destroy))
      .subscribe((message: Message) => {
        if (message.senderName) {
          message.content = AES.decrypt(message.content);
        }
        this.messages.push(message);
        this.needToScroll = true;
      });

    this._keyExchangeHub.keyReceived
      .pipe(takeUntil(this.$destroy))
      .subscribe((key: KeyExchangeResponse) => {
        this.onKeyReceived(key);
      });

    this._keyExchangeHub.keyExchangedFinished
      .pipe(takeUntil(this.$destroy))
      .subscribe(() => {
        this.onKeyExchangedFinished();
      });
  }

  private onKeyReceived(key: KeyExchangeResponse): void {
    const publicKey = bigInt(key.publicKey);
    const newPublicKey = this.diffieHellman.generatePublicKey(publicKey);
    if (!key.isLastExchange) {
      this._keyExchangeHub.sendPublicKey({
        senderId: this._currentUserService.userInfo.id,
        publicKey: newPublicKey.toString(),
      });
    } else {
      DiffieHellmanPrivateKey.key = newPublicKey.toString();
      const nextRoundPublicKey = this.diffieHellman.generatePublicKey(
        DiffieHellmanConstants.g
      );
      this._keyExchangeHub.sendPublicKey({
        senderId: this._currentUserService.userInfo.id,
        publicKey: nextRoundPublicKey.toString(),
      });
    }
  }

  private onKeyExchangedFinished(): void {
    this._snackBar.open('Key exchange finished', 'Close', {
      horizontalPosition: 'end',
      verticalPosition: 'top',
      duration: 2000,
    });
    this.chattingEnabled = false;
  }
}
