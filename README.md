# Canalside Community Credit Union – website

Website for **Canalside Community Credit Union**, a fictional member-owned credit union for people who live or work in Dublin 8 and Dublin 12. It was built for an NCI Blockchain Technology project.

The design is meant to feel like a private bank on the Grand Canal: deep canal green, champagne gold, banknote-style fine-line patterns and elegant serif headings.

## Pages

| Page | What it does |
|---|---|
| Home | Hero with the Digital Member Card, key figures, services, latest news, AGM |
| Save | Savings calculator with a "lock chamber" filling to the €100,000 savings limit |
| Borrow | Seven loan types with a repayment calculator and the required Irish warnings |
| Join | Common-bond eligibility checker and how to join |
| Member Card | NFT card collection, demo of the soulbound card and share token, contract links |
| My Dashboard | **Live:** your Member Card, savings, pledges, dividends, statement from on-chain events, and paying another member |
| News | Credit union notices and updates |
| FAQ | Membership, savings, loans and Member Card questions |
| About | History timeline, AGM agenda, board of directors, management team |
| Branches | Inchicore and Crumlin hours, services, getting there, accessibility |
| Contact | Contact form (demo only) |
| Officer Desk | **Live:** issue/move/close Member Cards, deposit, withdraw, pledge, release, pay dividend, authorise officers, member register |

## Smart contracts (Ethereum Sepolia)

| Contract | Address |
|---|---|
| CanalsideMemberCard (soulbound ERC-721) | [0xa2fcFBaDd59F071fffd3F12E10e6B8e0E721FA7A](https://sepolia.etherscan.io/address/0xa2fcFBaDd59F071fffd3F12E10e6B8e0E721FA7A) |
| CanalsideShareToken (ERC-20, CSHR) | [0x0f2E0895DE13734a4BaB2605048d2013edD7876C](https://sepolia.etherscan.io/address/0x0f2E0895DE13734a4BaB2605048d2013edD7876C) |

The addresses are set in `CONTRACTS` at the top of `js/app.js`. The blockchain code is in `js/chain.js` and uses ethers.js 6.13.4 from jsDelivr.

## Run it

It is plain HTML, CSS and JavaScript with no build step. Publish it with GitHub Pages (Settings → Pages → Deploy from a branch → `main` / root), then open it in a browser with MetaMask. Inside the Claude artifact viewer MetaMask can't connect, so the site runs in demo mode.

Optional: put a Pinata image link in `CARD_IMAGE` in `js/chain.js`, so cards issued from the Officer Desk show the card artwork.

## Notes

The credit union, people, rates and news are fictional and illustrative. It takes no deposits and offers no loans.
