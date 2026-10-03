export type Post = { slug: string; title: string; excerpt: string; img: string; date: string; minutes: number; tag: string; body: (string | { h: string })[] }

export const POSTS: Post[] = [
  {
    slug: 'why-escrow-first', tag: 'Product', date: '3 October 2026', minutes: 3, img: 'blog-escrow',
    title: 'Why the budget is locked before the offer goes live',
    excerpt: 'Affiliate marketing asks affiliates to work first and trust later. Escrow reverses the order.',
    body: [
      'In a typical affiliate programme the affiliate spends money and time first. They buy traffic, write content and build creative. Payment comes later, on the network’s schedule, and only if the advertiser is still willing and able to pay.',
      { h: 'The risk sits with the wrong side' },
      'The advertiser knows whether the budget exists. The affiliate does not. A commission rate on a page is a promise, and a promise costs nothing to make.',
      'Nativness changes the order. An advertiser funds the commission budget before the offer is visible to anyone. The offer page then shows the balance that is still locked, not a rate and a hope.',
      { h: 'What that changes for affiliates' },
      'You can read how many payouts an offer can still fund before you spend anything. If the balance is nearly gone, you can see that too and decide not to invest in creative.',
    ],
  },
  {
    slug: 'reading-an-escrow-balance', tag: 'For affiliates', date: '3 October 2026', minutes: 2, img: 'blog-balance',
    title: 'How to read an escrow balance before you promote',
    excerpt: 'Three numbers tell you whether an offer can pay: what is left, what one conversion costs, and how many payouts remain.',
    body: [
      'Every offer on Nativness shows the same three figures. Together they answer one question: can this offer still pay me?',
      { h: 'Remaining, not deposited' },
      'The headline figure is what is still locked. Money already paid to other affiliates is not counted. An offer that deposited a large budget months ago may have very little left.',
      { h: 'Payouts it can still fund' },
      'Divide the remaining balance by the commission per conversion. That is the number of conversions the offer can pay for today. A high commission with a small balance funds only a handful.',
      { h: 'Nearly spent and empty' },
      'When a balance drops to a tenth of its deposit, the meter turns orange. When it cannot cover one more conversion, the offer stops handing out links. Top-ups are at the advertiser’s discretion, so check before each campaign, not only the first.',
    ],
  },
  {
    slug: 'writing-conversion-terms', tag: 'For advertisers', date: '3 October 2026', minutes: 2, img: 'blog-terms',
    title: 'Writing conversion terms affiliates can trust',
    excerpt: 'A funded budget only helps if both sides agree on what releases it. Say exactly what counts.',
    body: [
      'Escrow settles whether the money exists. Your terms settle when it moves. Vague terms put the doubt straight back.',
      { h: 'Name the event' },
      'State the single event that counts. “A paid plan still active on day 30” is a term. “A quality signup” is not.',
      { h: 'Name what is rejected' },
      'If trials that lapse, duplicate accounts or incentivised traffic do not count, write that down. Rejected conversions do not draw down escrow, and affiliates should know that before they send traffic.',
      { h: 'Keep the balance honest' },
      'If you do not plan to top up, say so. Affiliates will see the balance fall either way. Telling them first is what earns the next campaign.',
    ],
  },
]

export type Doc = { title: string; updated: string; intro: string; sections: { h: string; p: string[] }[] }

const DRAFT = 'Draft. It has not been reviewed by a lawyer and the bracketed details must be completed before launch.'

export const TERMS: Doc = {
  title: 'Terms of Use', updated: '3 October 2026', intro: DRAFT,
  sections: [
    { h: '1. Who we are', p: ['Nativness is operated by [legal entity name], [registered address]. These terms apply to the Nativness website and web application.', 'By using Nativness you agree to these terms. If you do not agree, do not use it.'] },
    { h: '2. Current status', p: ['Nativness does not currently hold, move or pay real funds. Escrow balances, conversions and payouts shown in the app are records kept in the app, not on-chain transactions, and have no monetary value.'] },
    { h: '3. Your wallet', p: ['You sign in by connecting a crypto wallet, such as Phantom or MetaMask. Your wallet address is your account. We never ask for and never receive your private key or seed phrase.', 'You are responsible for the security of your wallet and for all activity carried out with it.'] },
    { h: '4. Advertisers', p: ['When you list an offer you must describe it accurately and state clearly what counts as a conversion. You must have the right to promote the product or service and must comply with the laws that apply to it, including advertising, gambling and consumer protection rules.', 'The commission budget you lock is committed to confirmed conversions under the terms you published.'] },
    { h: '5. Affiliates', p: ['You must promote offers honestly and within each offer’s terms. Incentivised, automated or fraudulent traffic is prohibited unless an offer expressly allows it.', 'A payout is due only for a conversion that is confirmed under the offer’s published terms and only while the offer’s escrow balance can cover it.'] },
    { h: '6. Prohibited use', p: ['You may not use Nativness to break the law, to mislead other users, to interfere with the service, or to list or promote illegal goods or services.'] },
    { h: '7. No advice', p: ['Nothing on Nativness is financial, legal or tax advice. You are responsible for your own tax and regulatory obligations.'] },
    { h: '8. Disclaimers and liability', p: ['Nativness is provided as is, without warranties of any kind. To the extent the law allows, we are not liable for indirect or consequential loss arising from your use of it.'] },
    { h: '9. Changes and ending use', p: ['We may change or withdraw the service at any time. We may update these terms and will change the date above when we do.'] },
    { h: '10. Governing law and contact', p: ['These terms are governed by the laws of [jurisdiction]. Questions can be sent to [contact email].'] },
  ],
}

export const PRIVACY: Doc = {
  title: 'Privacy Policy', updated: '3 October 2026', intro: DRAFT,
  sections: [
    { h: '1. Who is responsible', p: ['[Legal entity name], [registered address], is responsible for personal data handled through Nativness. Contact: [contact email].'] },
    { h: '2. What we handle', p: ['Your public wallet address, when you connect a wallet. We never receive your private key or seed phrase.', 'Offers you create, tracking links you take and simulated conversions and payouts.'] },
    { h: '3. Where it is stored', p: ['This information is kept in your own browser. The wallet you last connected is remembered in local storage. It is not sent to a Nativness server, and it is not shared across devices. Clearing your browser’s site data deletes it.'] },
    { h: '4. What we do not collect', p: ['We do not ask for your name, email address, payment card or identity documents. We set no advertising or analytics cookies.'] },
    { h: '5. Third parties', p: ['Fonts are loaded from Google Fonts, so your browser makes a request to Google when a page loads. Your wallet extension is provided by its own developer under its own privacy policy.', 'Blockchains are public. Any transaction a wallet makes on one is public and permanent. Nativness itself asks your wallet to make none.'] },
    { h: '6. Your rights', p: ['Depending on where you live, you may have the right to access, correct, delete or object to the use of your personal data. Because this data stays in your browser, you can delete it yourself at any time. For anything else, write to [contact email].'] },
    { h: '7. Changes', p: ['A later release will add a database and a server. This policy will be rewritten before that happens, and the date above will change.'] },
  ],
}
