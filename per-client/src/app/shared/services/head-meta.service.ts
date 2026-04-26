import { inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';

export interface ICustomScript {
  src: string;
  isAsync: boolean;
  script: string
}

@Injectable({
  providedIn: 'root'
})
export class HeadMetaService {
  private meta = inject(Meta);
  private title =  inject(Title);
  private renderer!:Renderer2;
  private rendererFactory =  inject(RendererFactory2)

  constructor() {
    this.renderer = this.rendererFactory.createRenderer(null, null);
  }

  setHead() {
    this.title.setTitle(environment.title);
    this.meta.addTags(environment.metaTagArr);

    const scripts: ICustomScript[] = environment.scriptArr;
    scripts.forEach(script => this.loadScripts(script));

    this.addLinkTag('manifest', undefined, 'site.webmanifest');
    this.addLinkTag('shortcut icon', 'image/png', 'favicon-16x16.png', '16x16');
    this.addLinkTag('icon', 'image/png', 'favicon-32x32.png', '32x32');
    this.addLinkTag('icon', 'image/png', 'android-chrome-192x192.png', '192x192');
    this.addLinkTag('apple-touch-icon', undefined, 'apple-touch-icon-180x180.png', '180x180');
    this.addLinkTag('apple-touch-icon', undefined, 'apple-touch-icon-57x57.png', '57x57');
    this.addLinkTag('apple-touch-icon', undefined, 'apple-touch-icon-72x72.png', '72x72');

    // TODO set after defining sdn resource
    // this.addLinkTag("preconnect", undefined, [cdn-url] />)
  }

  private removeLinkTag(rel: string): void {
    const head = this.renderer.selectRootElement('head', true);
    const links = head.querySelectorAll(`link[rel="${rel}"]`);

    links.forEach((link: any) => this.renderer.removeChild(head, link));
  }

  setCanonical(event: any) {
    const rel = 'canonical'
    this.removeLinkTag(rel);
    const addLinkTagBind = this.addLinkTag.bind(this, rel, undefined);

    switch (event.constructor.name) {
      case "_MainComponent": addLinkTagBind(environment.domainName);
        break;

      case '_PerformersShowcaseComponent':
        addLinkTagBind(`${environment.domainName}/#/performers`);
        break;

      case '_PerformerRoomComponent':
        addLinkTagBind(`${environment.domainName}/#/performer${event['route'].params.value.nickName}`);
        break;
    }
  }

  private addLinkTag(rel: string, type: string | undefined, href: string, sizes?: string): void {
    const hrefPath = `/templates/${environment.designTemplate}/img/favicon/${href}`;
    const link = this.renderer.createElement('link');
    this.renderer.setAttribute(link, 'rel', rel);
    this.renderer.setAttribute(link, 'href', hrefPath);

    if (type) {
      this.renderer.setAttribute(link, 'type', type);
    }

    if (sizes) {
      this.renderer.setAttribute(link, 'sizes', sizes);
    }

    const head = this.renderer.selectRootElement('head', true);
    this.renderer.appendChild(head, link);
  }

  loadScripts({ src, isAsync, script}: ICustomScript) {
    if(!src && !script) return;

    const head = this.renderer.selectRootElement('head', true);
    const scriptTag = this.renderer.createElement('script');

    isAsync && (scriptTag.async = isAsync);
    src && (scriptTag.src = src);
    script && (scriptTag.text = script);

    this.renderer.appendChild(head, scriptTag);
  }
}
