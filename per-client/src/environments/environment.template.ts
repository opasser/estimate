export const environment = {
  baseUrl: 'http://localhost:4200',
  production: false,
  designTemplate: 'eonly',
  domainName: 'http://localhost:4400',
  iframeLoginUrl: 'https://bunnysystems.com/iframe/login/5',
  iframeRegisterUrl: 'https://bunnysystems.com/iframe/register/5',
  webRtcUrl: 'wss://cam.eroticonly.com:5443',
  playerUrl: 'https://cam.eroticonly.com:5443/WebRTCAppEE',
  cdnUrl: '',
  signupUrl: 'https://bunnysystems.com/join?s=5',
  title: 'EroticOnly: 4K &amp; HD Porno Videos, Sex Clips |  Exclusive XXX Membership',
  tokensKey: "1234567890abcdef1234567890abcdef",
  tokensTopUp: "https://bunnysystems.com/top-up?s=5",
  metaTagArr: [
    {
      name: 'description',
      content:  "▷ Welcome to the EroticOnly - Top mature porn &amp; XXX movies ▶ Get full access to all EroticOnly XXX network with one click.  Porn movies in the best quality on the Internet",

    },
    {
      name: 'keywords',
      content: "premium adult videos, high quality porn, exclusive adult content, HD porn videos, best adult site subscription, ad-free porn site, premium adult movie site, exclusive porn membership, top rated adult content site, safe porn subscription, erotic only, eroticonly.com, erotic only porn, erotic porn, erotic porn, erotikonlyporn, erotic only xxx, xxx erotic only, only erotic, erotic porn movies, erotic only 4k porn",

    },
    {
      name: 'google-site-verification',
      content: 'avrxbX4GQaogfwXwn0Z1Xdp1m_xbsx7G3Hwf2g0kU0s',
    }
  ],
  scriptArr: [
    {
      src: 'https://www.googletagmanager.com/gtag/js?id=G-0GBH2LMN19',
      isAsync: true,
      script: ''
    },
    {
      src: '',
      isAsync: false,
      script: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-0GBH2LMN19');
        `
    }
  ],
  langList: ['en', 'de', 'es', 'pt'] // at least one language must be
};
