
export class MenuMusic {
  private ctx: AudioContext | null = null;
  private buffer: AudioBuffer | null = null;
  private source: AudioBufferSourceNode | null = null;
  private startTime: number = 0;
  private resumeTime: number = 0;
  private isPlaying: boolean = false;

  constructor() {}

  private initContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  public async loadMusic(file: File): Promise<string> {
    this.initContext();
    const arrayBuffer = await file.arrayBuffer();
    this.buffer = await this.ctx!.decodeAudioData(arrayBuffer);
    return file.name;
  }

  public start(loop: boolean = true) {
    if (!this.buffer || !this.ctx) return;
    
    this.stop();
    
    this.source = this.ctx.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.loop = loop;
    this.source.connect(this.ctx.destination);
    
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    
    this.startTime = this.ctx.currentTime;
    this.source.start(0);
    this.isPlaying = true;
  }

  public stop() {
    if (this.source) {
      try {
        this.source.stop();
      } catch (e) {}
      this.source.disconnect();
      this.source = null;
    }
    this.isPlaying = false;
    this.startTime = 0;
  }

  /**
   * Returns the current playback time in seconds
   */
  public getCurrentTime(): number {
    if (!this.isPlaying || !this.ctx || this.startTime === 0) return 0;
    return this.ctx.currentTime - this.startTime;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const menuMusic = new MenuMusic();
