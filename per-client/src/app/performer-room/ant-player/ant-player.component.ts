import { Component, effect, ElementRef, input, OnDestroy, ViewChild } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-ant-player',
  imports: [],
  templateUrl: './ant-player.component.html',
  styleUrl: './ant-player.component.scss'
})
export class AntPlayerComponent implements OnDestroy {
  status = input.required<string>();
  streamId = input.required<string|null>();

  @ViewChild('videoContainer', { static: true }) videoContainer!: ElementRef;
  @ViewChild('placeholder', { static: true }) placeholder!: ElementRef;

  private embeddedPlayer!: any;
  private playOrder = ['webrtc', 'll-hls', 'hls'];
  WebPlayer!: any;

  constructor() {
    effect(async () => {
      if(this.streamId()) {
        this.embeddedPlayer = await this.initializePlayer();
        await this.embeddedPlayer.initialize();
        await this.embeddedPlayer.play()
      }
    });
  }

  async initializePlayer() {
    const module = await import('@antmedia/web_player');
    const WebPlayer = module.WebPlayer;

    return new WebPlayer({
      streamId: this.streamId(),
      httpBaseURL: environment.playerUrl,
      videoHTMLContent: '<video id="video-player" class="video-js vjs-default-skin vjs-big-play-centered" controls playsinline style="position:absolute; top:0; left:0; width:100%; height:100%;"></video>',
      playOrder: this.playOrder,
      debug: false,
      errorDisplay: false
    }, this.videoContainer.nativeElement, this.placeholder.nativeElement);
  }

  ngOnDestroy() {
    this.embeddedPlayer && this.embeddedPlayer.destroy()
  }
}
