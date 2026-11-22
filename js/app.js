/* =========================================================================
   Canalside Community Credit Union — website
   Student blockchain project. Fictional credit union; nothing here takes
   real deposits, real loans or real payments.
   app.js = pages and demo mode.  chain.js = live MetaMask + Sepolia.
   ========================================================================= */

/* ---------- Sepolia contract addresses ---------- */
const CONTRACTS = {
  CanalsideMemberCard: "0xa2fcFBaDd59F071fffd3F12E10e6B8e0E721FA7A",  // ERC-721 soulbound membership NFT
  CanalsideShareToken: "0x0f2E0895DE13734a4BaB2605048d2013edD7876C"   // ERC-20 member savings (CSHR, 2 decimals)
};

const SAVINGS_CAP = 100000;          // EUR per member, enforced by the Share Token contract
const DIVIDEND_ILLUSTRATIVE = 1.5;   // % a year, illustrative only

/* ---------- content ---------- */
const LOANS = [
  {id:"home",  name:"Home Loan",            apr:4.15, min:50000, max:400000, tmin:60,  tmax:360, step:5000, unit:"APRC, variable", blurb:"Buy your first home, move up or switch your mortgage to a credit union.", perks:["No fees for switching from another lender","Overpay any time without penalty","A named mortgage adviser at Inchicore"]},
  {id:"green", name:"Green Home Loan",      apr:5.9,  min:2000,  max:75000,  tmin:12,  tmax:120, step:500,  unit:"APR, fixed",     blurb:"Insulation, heat pumps, solar panels, windows and EV chargers.", perks:["Our lowest personal-lending rate","Pairs with SEAI home energy grants","Decision within two working days"]},
  {id:"car",   name:"Car & EV Loan",        apr:6.9,  min:3000,  max:60000,  tmin:12,  tmax:84,  step:500,  unit:"APR, fixed",     blurb:"New, used or electric. You own the car from day one, with no balloon payment.", perks:["Get approved before you visit the dealer","No balloon or final lump sum","Life cover included"]},
  {id:"edu",   name:"Education Loan",       apr:6.5,  min:500,   max:25000,  tmin:6,   tmax:60,  step:250,  unit:"APR, fixed",     blurb:"College fees, apprenticeships, laptops and back-to-school costs.", perks:["Pay the college directly or yourself","Repayment holidays over the summer","Top-ups each August"]},
  {id:"biz",   name:"Sole Trader Loan",     apr:8.9,  min:2000,  max:50000,  tmin:12,  tmax:84,  step:500,  unit:"APR, fixed",     blurb:"Vans, tools, stock and fit-outs for local tradespeople and small shops.", perks:["Decided locally, by people who know the area","Flexible weekly or monthly repayments","Talk to the same lender every time"]},
  {id:"pers",  name:"Personal Loan",        apr:9.9,  min:500,   max:30000,  tmin:6,   tmax:84,  step:250,  unit:"APR, fixed",     blurb:"Weddings, holidays, home repairs, or clearing dearer credit-card debt.", perks:["Fixed rate, fixed repayments","Repay weekly, fortnightly or monthly","No early repayment fees"]},
  {id:"xmas",  name:"Christmas Loan",       apr:8.5,  min:300,   max:3000,   tmin:6,   tmax:12,  step:100,  unit:"APR, fixed",     blurb:"A small, quick loan for Christmas, repaid by the summer.", perks:["Same-day decisions in November and December","From €300","Repaid within 12 months"]}
];

const BRANCHES = [
  { key:"inchicore", type:"Main branch", name:"Inchicore", address:"Emmet Road, Inchicore, Dublin 8",
    hours:[["Monday","9:30–16:30"],["Tuesday","9:30–16:30"],["Wednesday","9:30–16:30"],["Thursday","9:30–19:00"],["Friday","9:30–16:30"],["Saturday","10:00–13:00"],["Sunday","Closed"]],
    services:["Membership & ID checks","All loans","Mortgage adviser","Digital Member Card issuing","Night safe","ATM","Bureau de change"],
    getting:"Bus routes along Emmet Road stop at the door. Blackhorse Luas stop (Red Line) is a ten-minute walk. Six customer parking spaces behind the branch.",
    access:"Step-free entrance, hearing loop at every counter, and a private room for loan and mortgage meetings.",
    maps:"https://www.google.com/maps/search/Emmet+Road+Inchicore+Dublin+8" },
  { key:"crumlin", type:"Sub-office", name:"Crumlin", address:"Crumlin Village, Dublin 12",
    hours:[["Monday","Closed"],["Tuesday","10:00–16:00"],["Wednesday","Closed"],["Thursday","10:00–16:00"],["Friday","10:00–16:00"],["Saturday","10:00–13:00"],["Sunday","Closed"]],
    services:["Lodgements & withdrawals","Loan appointments","Christmas Club","Junior Savers"],
    getting:"In the village centre beside the shops, on several Dublin Bus routes. Street parking nearby.",
    access:"Ground-floor office with a step-free entrance. Loan meetings by appointment.",
    maps:"https://www.google.com/maps/search/Crumlin+Village+Dublin+12" }
];

const BOARD = [
  ["BN","Bríd Ní Mhurchú","Chair · retired primary teacher, Rialto"],
  ["TD","Tomás Doyle","Vice-chair · electrician, Drimnagh"],
  ["AB","Aisling Byrne","Secretary · solicitor, Kilmainham"],
  ["KO","Kehinde Okafor","Director · accountant, Crumlin"],
  ["MC","Maeve Carroll","Director · nurse, St James's Hospital"],
  ["PR","Pádraig Ryan","Director · youth worker, Inchicore"]
];
const MANAGEMENT = [
  ["DF","Declan Farrell","Chief Executive"],
  ["SK","Sinéad Kavanagh","Head of Lending"],
  ["FA","Femi Adeyemi","Member Services Manager"],
  ["RW","Ronan Walsh","Digital & Blockchain Lead"],
  ["LM","Laura Mooney","Mortgage Adviser"],
  ["GH","Gráinne Hughes","Risk & Compliance Officer"]
];

const HISTORY = [
  ["1958","Ireland's first community credit union opens in Dublin 8, started by volunteers who wanted families to have an alternative to moneylenders.", true],
  ["1967","Parish volunteers found Canalside in a borrowed hall beside the Grand Canal. Thirty-one people join in the first month."],
  ["1975","The first car loans. A van loan to a local plasterer is still framed in the Inchicore office."],
  ["1984","Canalside moves into its own premises on Emmet Road, still our main branch."],
  ["1997","The Credit Union Act sets the modern rules for Irish credit unions, including the common bond.", true],
  ["2002","Pounds become euro. Volunteers count every member's shares by hand over one long weekend."],
  ["2012","Canalside merges with a smaller neighbour and opens the Crumlin sub-office."],
  ["2016","Online banking and the first mortgages."],
  ["2019","A second merger takes membership past 12,000."],
  ["2026","The Digital Member Card pilot launches on the Ethereum Sepolia testnet."]
];

const NEWS = [
  { date:"2026-11-18", tag:"Digital", title:"Digital Member Card pilot opens to all members",
    teaser:"From today any member can ask for a Digital Member Card at Inchicore. It's a soulbound NFT that can't be sold, lost or forged.",
    body:["The pilot runs on the Ethereum Sepolia testnet. Your card holds only your member number and common bond: no name, address or ID number ever goes on the blockchain.","Members with a card can see their savings as Canalside Shares (CSHR) in a wallet app, send money instantly to other members, and check every lodgement, pledge and dividend on Etherscan.","Ask at the counter, or read the Digital Member Card page for how it works."] },
  { date:"2026-11-10", tag:"AGM", title:"Notice of the 2026 Annual General Meeting",
    teaser:"Tuesday 8 December at 7.30pm, Inchicore branch. Nominations for the board close on 24 November.",
    body:["The board will propose a dividend of 1.5% on shares and a 5% rebate of loan interest paid during the year.","Three director positions are up for election. Any member aged 16 or over can vote; one member, one vote.","Accounts and the full agenda are available at both branches from 24 November."] },
  { date:"2026-10-28", tag:"Loans", title:"Green Home Loan rate cut to 5.9%",
    teaser:"Our rate for insulation, heat pumps and solar panels drops by half a percentage point.",
    body:["The new fixed rate of 5.9% APR applies to new Green Home Loans from €2,000 to €75,000.","It can be combined with SEAI home energy grants. Our lending team can help you plan the order of works."] },
  { date:"2026-10-14", tag:"Branches", title:"Christmas opening hours",
    teaser:"Late opening every Thursday in December and Saturday hours extended to 4pm on 12 and 19 December.",
    body:["Both branches close at 1pm on 24 December and reopen on 29 December.","Christmas Club savings are paid out from 1 November, as usual."] },
  { date:"2026-09-30", tag:"Community", title:"Schools quiz returns in the new year",
    teaser:"Primary schools in Dublin 8 and 12 can now register teams for the credit union schools quiz.",
    body:["Heats run in February at the Inchicore branch, with the area final in March.","Registration forms are available from the Member Services desk."] }
];

const FAQS = [
  ["Who can join Canalside?","Anyone who lives or works in Dublin 8 or Dublin 12, and members of their immediate family. This shared link is called the common bond, and every Irish credit union has one."],
  ["What do I need to bring to join?","Photo ID (a passport or driving licence) and proof of address dated within the last six months. Your first lodgement can be as little as €10."],
  ["Are my savings protected?","In Ireland, savings in credit unions are covered by the Deposit Guarantee Scheme up to €100,000 per person, the same as in banks. (Canalside itself is a fictional credit union for a student project.)"],
  ["What is a dividend?","After costs and reserves, a credit union's surplus belongs to its members. The board proposes a dividend on shares and members vote on it at the AGM. Dividends are not guaranteed and change each year."],
  ["How are loans decided?","By our lending team in Inchicore, based on your ability to repay, not just a credit score. Irish credit unions may charge at most 1% a month (12.68% APR) on personal loans."],
  ["What is the Digital Member Card?","A soulbound NFT on the Ethereum blockchain: a token tied to your wallet that proves you are a member. It cannot be transferred or sold, and an officer issues it after checking your ID."],
  ["Is my personal information on the blockchain?","No. The blockchain records only your member number, your common bond category (for example \"Lives in Dublin 8\"), your wallet address and the amounts in your share account. Names, addresses and ID documents stay in our core banking system."],
  ["What are Canalside Shares (CSHR)?","A digital record of your savings, where 1 CSHR equals €1. Shares are created when you lodge money and removed when you withdraw it, and only members can hold them."],
  ["What happens if I lose my phone?","Come into a branch with your ID. An officer can move your Member Card and shares to a new wallet with the same member number."],
  ["Can I send money to someone who isn't a member?","Not with Canalside Shares. The contract only allows transfers between members. You can still withdraw to your bank account or pay by card as normal."],
  ["Do I need cryptocurrency to use the Member Card?","On the Sepolia pilot you need a little free test ETH for transaction fees, which our staff can help you get. No real money is involved in the pilot."]
];

/* ---------- helpers ---------- */
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const eur = n => "€" + Number(n).toLocaleString("en-IE", {minimumFractionDigits:2, maximumFractionDigits:2});
const eur0 = n => "€" + Math.round(n).toLocaleString("en-IE");
const today = () => new Date().toISOString().slice(0,10);
const short = a => a ? a.slice(0,6) + "…" + a.slice(-4) : "";
const scan = a => a ? `https://sepolia.etherscan.io/address/${a}` : "";
const fmtDate = d => new Date(d + "T12:00:00Z").toLocaleDateString("en-IE", {day:"numeric", month:"long", year:"numeric", timeZone:"UTC"});
const store = {
  get(k,d){try{const v=localStorage.getItem("ccu_"+k);return v?JSON.parse(v):d}catch(e){return d}},
  set(k,v){try{localStorage.setItem("ccu_"+k,JSON.stringify(v))}catch(e){}}
};
function toast(msg){document.querySelectorAll(".toast").forEach(t=>t.remove());const t=document.createElement("div");t.className="toast";t.setAttribute("role","status");t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),2800)}
function modal(html){ $("#layer").innerHTML = `<div class="modal" role="dialog" aria-modal="true"><div class="box">${html}</div></div>`; }
function closeLayer(){ $("#layer").innerHTML = ""; }

/* ---------- demo state (this browser only) ---------- */
let S = Object.assign({
  wallet:null, member:0, bond:"", joined:"", shares:0, pledged:0, dividends:0,
  neighbour:"0x8c41d2e0b7a95f3c6e1d02b4a7f9e3c5d1a2b604",
  ledger:[], loanType:"green", loanAmt:8000, loanTerm:36,
  saveStart:500, saveMonthly:100, saveYears:5
}, store.get("state", {}));
const save = () => store.set("state", S);

/* ---------- art ---------- */
function chamber(total){
  const H = 230, y0 = 54, frac = Math.min(total / SAVINGS_CAP, 1);
  const lvl = y0 + H - Math.max(frac * H, 4);
  return `<svg class="chamber" viewBox="0 0 420 330" role="img" aria-label="Lock chamber filled to ${Math.round(frac*100)} percent of the savings limit">
    <defs><linearGradient id="w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6FBFC0"/><stop offset="1" stop-color="#1F5A5C"/></linearGradient>
    <linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#A9803A"/><stop offset=".5" stop-color="#F0DDA8"/><stop offset="1" stop-color="#9C7B3A"/></linearGradient></defs>
    <rect x="40" y="${y0}" width="340" height="${H}" fill="#0E2319" stroke="rgba(201,165,92,.35)"/>
    ${[1,2,3,4].map(i=>`<line x1="40" x2="380" y1="${y0+H*i/5}" y2="${y0+H*i/5}" stroke="rgba(201,165,92,.12)"/>`).join("")}
    <rect x="40" y="${lvl}" width="340" height="${y0+H-lvl}" fill="url(#w)" opacity=".9"/>
    <path d="M40 ${lvl} q21 -6 42 0 t42 0 t42 0 t42 0 t42 0 t42 0 t42 0 t46 0" fill="#9FDCDC" opacity=".6"/>
    <rect x="30" y="${y0-10}" width="360" height="10" fill="url(#g)"/>
    <text x="210" y="${y0-22}" text-anchor="middle" font-family="Jost, sans-serif" font-size="12" letter-spacing="3" fill="#C9A55C">€100,000 SAVINGS LIMIT</text>
    <rect x="26" y="${y0}" width="14" height="${H}" fill="#12301F"/><rect x="380" y="${y0}" width="14" height="${H}" fill="#12301F"/>
    <text x="210" y="${Math.min(lvl+40, y0+H-12)}" text-anchor="middle" font-family="Bodoni Moda, Georgia, serif" font-size="30" fill="#EFE9DB">${eur0(total)}</text>
    <text x="210" y="${y0+H+34}" text-anchor="middle" font-family="Jost, sans-serif" font-size="14" fill="#A9B4A7">${(frac*100).toFixed(1)}% of the way to the top of the lock</text>
  </svg>`;
}

/* ---------- maths ---------- */
function projectSavings(start, monthly, years, divPct){
  const r = divPct/100/12, n = years*12;
  const fv = start*Math.pow(1+r,n) + (r ? monthly*((Math.pow(1+r,n)-1)/r) : monthly*n);
  const paidIn = start + monthly*n, total = Math.min(fv, SAVINGS_CAP);
  return {total, paidIn, dividend: total - paidIn, capped: fv > SAVINGS_CAP};
}
function loanQuote(amount, months, apr){
  const i = Math.pow(1 + apr/100, 1/12) - 1;
  const pmt = amount * i / (1 - Math.pow(1+i, -months));
  return {monthly: pmt, total: pmt*months, cost: pmt*months - amount};
}
const termLabel = m => m >= 24 && m % 12 === 0 ? `${m/12} years` : `${m} months`;

/* ---------- reusable pieces ---------- */
function cardHTML(c){
  if (!c || !c.member) return `<div class="mcard empty"><div><p class="mc-k" style="margin-bottom:8px">No member card yet</p><p>Connect a wallet, then an officer issues your card after an ID check.</p></div></div>`;
  return `<div class="mcard" role="img" aria-label="Digital Member Card number ${c.member}">
    <div class="mc-row"><div><div class="mc-name">Canalside</div><div class="mc-k" style="margin-top:6px">Community Credit Union</div></div><div class="mc-k" style="text-align:right">Soulbound<br>ERC-721</div></div>
    <div><div class="mc-k">Member number</div><div class="mc-no">${c.member}</div></div>
    <div class="mc-row"><div><div class="mc-k">Common bond</div><div class="mc-v">${esc(c.bond || "—")}</div></div><div style="text-align:right"><div class="mc-k">${c.joined ? "Member since" : "Wallet"}</div><div class="mc-v">${c.joined ? esc(c.joined) : short(c.wallet)}</div></div></div>
  </div>`;
}
function ledgerTable(rows, empty){
  return `<div class="tbl"><table class="ledger"><thead><tr><th>Date</th><th>Entry</th><th>Contract call</th><th class="r">Amount</th><th class="r">Balance</th></tr></thead><tbody>
    ${rows.length ? rows.map(l=>`<tr><td>${l.d}</td><td>${esc(l.what)}${l.tx?`<br><a href="https://sepolia.etherscan.io/tx/${l.tx}" target="_blank" rel="noopener">${l.tx.slice(0,12)}… ↗</a>`:""}</td><td>${esc(l.fn)}</td><td class="r ${l.amt<0?"neg":l.amt>0?"pos":""}">${l.amt?(l.amt>0?"+":"−")+eur(Math.abs(l.amt)):"–"}</td><td class="r">${l.bal!=null?eur(l.bal):"–"}</td></tr>`).join("") : `<tr><td colspan="5" class="muted">${empty}</td></tr>`}
  </tbody></table></div>`;
}

/* ---------- views ---------- */
const VIEWS = {

home(){ return `
  <section class="hero"><div class="wrap">
    <div>
      <span class="eyebrow">Dublin 8 &amp; Dublin 12 · since 1967</span>
      <h1 style="margin-top:22px">Banking that stays <em class="foil">close to home.</em></h1>
      <p class="lead">Canalside is a credit union owned by the people who save and borrow with it. No shareholders, no call centres: just neighbours, a fair rate, and one equal vote for every member.</p>
      <div class="ctas"><a class="btn btn-gold" href="#join">Become a member</a><a class="btn btn-ghost" href="#borrow">Calculate a loan</a></div>
    </div>
    <figure class="hero-card"><img src="images/Canalside_MemberCard_1001.png" alt="The Canalside Digital Member Card, number 1001, common bond Lives in Dublin 8" width="1000" height="1000"><figcaption>The Digital Member Card · soulbound NFT</figcaption></figure>
  </div></section>
  <div class="figures">
    <div><b>14,000</b><span>Members</span></div>
    <div><b>1967</b><span>Founded</span></div>
    <div><b>2</b><span>Branches</span></div>
    <div><b>€100k</b><span>Savings limit</span></div>
  </div>
  <section class="band"><div class="wrap">
    <div class="sec-head"><div><span class="eyebrow">Our services</span><h2>Save, borrow, <em class="foil">belong</em></h2></div><p class="muted">Whatever is left after costs and reserves goes back to members as a dividend, or into better services.</p></div>
    <div class="tiles">
      <div class="tile"><span class="k">Savings</span><h3>Watch the lock fill</h3><p class="muted">Regular shares, Christmas Club and Junior Savers, with a yearly dividend voted on by members.</p><a class="btn btn-ghost btn-sm go" href="#save">Savings calculator</a></div>
      <div class="tile"><span class="k">Lending</span><h3>Seven fair loans</h3><p class="muted">From a €300 Christmas loan to a home loan, decided in Inchicore by people who know the area.</p><a class="btn btn-ghost btn-sm go" href="#borrow">See rates</a></div>
      <div class="tile"><span class="k">Digital</span><h3>Your card, on-chain</h3><p class="muted">A soulbound Member Card and live savings on Ethereum, with every lodgement and dividend publicly verifiable.</p><a class="btn btn-ghost btn-sm go" href="#member-card">Discover the card</a></div>
    </div>
  </div></section>
  <section class="band alt"><div class="wrap split">
    <div style="display:grid;gap:18px"><span class="eyebrow">Latest</span><h2>From the credit union</h2>
      ${NEWS.slice(0,3).map(n=>`<a href="#news" style="text-decoration:none;color:inherit;display:grid;gap:6px;border-top:1px solid var(--line);padding-top:16px"><span class="mc-k">${fmtDate(n.date)} · ${n.tag}</span><span style="font-family:var(--f-display);font-size:1.35rem">${esc(n.title)}</span></a>`).join("")}
    </div>
    <div class="agm"><span class="eyebrow">Annual General Meeting</span><h2>Tuesday 8 December 2026</h2><p class="muted">7.30pm at the Inchicore branch. Members vote on the proposed 1.5% dividend and 5% loan interest rebate, and elect three directors.</p><a class="btn btn-ghost btn-sm" href="#about" style="justify-self:start">Agenda &amp; board</a></div>
  </div></section>`; },

save(){
  const p = projectSavings(S.saveStart, S.saveMonthly, S.saveYears, DIVIDEND_ILLUSTRATIVE);
  return `
  <div class="wrap page-head"><span class="eyebrow">Savings</span><h1>Fill the lock, <em class="foil">one lodgement at a time.</em></h1>
    <p>Your savings in a credit union are called shares. They earn a share of the surplus as a yearly dividend, and every member can save up to €100,000.</p></div>
  <section class="band" style="padding-top:36px"><div class="wrap split">
    <div class="panel framed">
      <h3>Savings calculator</h3>
      <label for="sStart">Starting lodgement <span class="val num" id="sStartOut">${eur0(S.saveStart)}</span><input type="range" id="sStart" min="0" max="20000" step="100" value="${S.saveStart}"></label>
      <label for="sMonthly">Each month <span class="val num" id="sMonthlyOut">${eur0(S.saveMonthly)}</span><input type="range" id="sMonthly" min="10" max="1500" step="10" value="${S.saveMonthly}"></label>
      <label for="sYears">For <span class="val num" id="sYearsOut">${S.saveYears} years</span><input type="range" id="sYears" min="1" max="20" step="1" value="${S.saveYears}"></label>
      <div id="saveOut">${saveOutputs(p)}</div>
      <p class="muted" style="font-size:.88rem">Illustration assumes a ${DIVIDEND_ILLUSTRATIVE}% yearly dividend. Dividends are not guaranteed: the board proposes them and members vote each year.</p>
    </div>
    <div id="chamberBox">${chamber(p.total)}</div>
  </div></section>
  <section class="band alt"><div class="wrap">
    <div class="sec-head"><div><span class="eyebrow">Accounts</span><h2>Ways to save</h2></div></div>
    <div class="tiles">
      <div class="tile"><span class="k">Everyday</span><h3>Regular Shares</h3><p class="muted">Your main savings. Lodge any amount, any time, and borrow against them.</p><ul><li>Payroll deduction available</li><li>Earns the yearly dividend</li></ul></div>
      <div class="tile"><span class="k">Seasonal</span><h3>Christmas Club</h3><p class="muted">Put a little by each week from January and get it all back on 1 November.</p><ul><li>From €5 a week</li><li>Locked until November</li></ul></div>
      <div class="tile"><span class="k">Under 16</span><h3>Junior Savers</h3><p class="muted">With a parent or guardian. A good first lesson in money.</p><ul><li>From €1</li><li>A moneybox at the first visit</li></ul></div>
    </div>
  </div></section>`; },

borrow(){
  const L = LOANS.find(l => l.id === S.loanType) || LOANS[0];
  S.loanAmt = Math.min(Math.max(S.loanAmt, L.min), L.max);
  S.loanTerm = Math.min(Math.max(S.loanTerm, L.tmin), L.tmax);
  return `
  <div class="wrap page-head"><span class="eyebrow">Lending</span><h1>Borrow from neighbours, <em class="foil">not strangers.</em></h1>
    <p>Seven loans, decided by people in Inchicore who know the area. No hidden fees, and no penalty for paying early.</p></div>
  <section class="band" style="padding-top:36px"><div class="wrap split">
    <div class="panel framed">
      <h3>Loan calculator</h3>
      <div class="seg" role="group" aria-label="Loan type">${LOANS.map(l=>`<button type="button" data-loan="${l.id}" aria-pressed="${l.id===L.id}">${l.name}</button>`).join("")}</div>
      <p class="muted">${esc(L.blurb)}</p>
      <label for="lAmt">Amount <span class="val num" id="lAmtOut">${eur0(S.loanAmt)}</span><input type="range" id="lAmt" min="${L.min}" max="${L.max}" step="${L.step}" value="${S.loanAmt}"></label>
      <label for="lTerm">Over <span class="val num" id="lTermOut">${termLabel(S.loanTerm)}</span><input type="range" id="lTerm" min="${L.tmin}" max="${L.tmax}" step="${L.tmax>120?12:6}" value="${S.loanTerm}"></label>
      <div id="loanOut">${loanOutputs(L)}</div>
      <div class="warning"><b>Warning:</b> If you do not meet the repayments on your loan, your account will go into arrears. This may affect your credit rating, which may limit your ability to access credit in the future.${L.id==="home"?" Your home is at risk if you do not keep up payments on a mortgage or any other loan secured on it.":""}</div>
    </div>
    <div style="display:grid;gap:1px;background:var(--line);border:1px solid var(--line)">
      ${LOANS.map(l=>`<div class="tile" style="padding:22px 24px"><div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:baseline"><h3>${l.name}</h3><div class="rate" style="font-size:1.9rem">${l.apr.toFixed(l.apr%1?2:1).replace(/0$/,"")}% <small>${l.unit}</small></div></div><p class="muted">${esc(l.blurb)}</p><p class="mc-k" style="color:var(--faint)">${eur0(l.min)} – ${eur0(l.max)} · ${termLabel(l.tmin)} to ${termLabel(l.tmax)}</p></div>`).join("")}
    </div>
  </div>
  <div class="wrap"><p class="muted" style="margin-top:22px;font-size:.88rem">Illustrative rates for this demonstration. Irish credit unions may charge at most 1% a month (12.68% APR) on personal lending. Home Loan figures are a guide only; a mortgage adviser will give you a full quotation.</p></div></section>`; },

join(){ return `
  <div class="wrap page-head"><span class="eyebrow">Membership</span><h1>Who can <em class="foil">come aboard?</em></h1>
    <p>Every credit union has a common bond: the link its members share. Ours is place. You can join if you live or work in Dublin 8 or Dublin 12, or if a member of your family is already with us.</p></div>
  <section class="band" style="padding-top:36px"><div class="wrap split">
    <div class="panel framed">
      <h3>Check the common bond</h3>
      <label for="jRel">I…<select id="jRel"><option value="live">live in</option><option value="work">work in</option><option value="family">have a family member who is a Canalside member</option></select></label>
      <label for="jArea" id="jAreaWrap">Area<select id="jArea"><option value="D8">Dublin 8 · Inchicore, Kilmainham, Rialto, the Liberties</option><option value="D12">Dublin 12 · Crumlin, Drimnagh, Walkinstown</option><option value="other">Somewhere else</option></select></label>
      <button class="btn btn-gold" type="button" data-check style="justify-self:start">Check eligibility</button>
      <div id="jResult" aria-live="polite"></div>
    </div>
    <div style="display:grid;gap:18px"><h3>How to join</h3>
      <ol class="steps">
        <li><div><b>Bring two documents to either branch</b><p class="muted">Photo ID (passport or driving licence) and proof of address from the last six months.</p></div></li>
        <li><div><b>Make your first lodgement</b><p class="muted">From €10. This buys your membership share and opens your savings account.</p></div></li>
        <li><div><b>Receive your Digital Member Card</b><p class="muted">If you'd like one, an officer issues a non-transferable card to your wallet. Your plastic card still works.</p></div></li>
      </ol>
    </div>
  </div></section>`; },

"member-card"(){
  const avail = S.shares - S.pledged;
  return `
  <div class="wrap page-head"><span class="eyebrow">Digital Member Card · Ethereum Sepolia</span><h1>A membership card <em class="foil">nobody can take from you.</em></h1>
    <p>Your Digital Member Card is a soulbound NFT, tied to your wallet for good. Your savings sit beside it as Canalside Shares (CSHR), where 1 CSHR equals €1. No names, addresses or ID numbers ever go on the blockchain.</p></div>
  <section class="band" style="padding-top:36px"><div class="wrap">
    <div class="sec-head"><div><span class="eyebrow">The collection</span><h2>Every card is unique to its member</h2></div><p class="muted">Card art for the first three members of the pilot. The member number and common bond are written into each NFT.</p></div>
    <div class="tiles">${[1001,1002,1003].map(n=>`<figure class="tile" style="margin:0;padding:18px"><img src="images/Canalside_MemberCard_${n}.png" alt="Member Card number ${n}" width="1000" height="1000" loading="lazy"><figcaption class="mc-k" style="margin-top:10px">Member Card #${n}</figcaption></figure>`).join("")}</div>
  </div></section>
  <section class="band alt"><div class="wrap split">
    <div style="display:grid;gap:18px">
      ${cardHTML(S.member ? {member:S.member, bond:S.bond, wallet:S.wallet} : null)}
      <div class="panel out" style="gap:0">
        <div class="out-row"><span>Savings (CSHR)</span><b>${eur(S.shares)}</b></div>
        <div class="out-row"><span>Pledged against a loan</span><b>${eur(S.pledged)}</b></div>
        <div class="out-row"><span>Available</span><b>${eur(avail)}</b></div>
      </div>
    </div>
    <div style="display:grid;gap:16px;align-content:start">
      <span class="eyebrow">Try it · demo mode</span><h3>See what the contracts do</h3>
      <p class="muted">These buttons simulate the contracts in your browser. Connect MetaMask on the GitHub Pages site to use the real ones from <a href="#dashboard">My Dashboard</a>.</p>
      <div class="actions">
        <button type="button" data-act="connect" ${S.wallet?"disabled":""}><b>${S.wallet?"Wallet connected":"Connect wallet"}</b><span>${S.wallet?short(S.wallet):"MetaMask, or a demo wallet"}</span></button>
        <button type="button" data-act="issue" ${!S.wallet||S.member?"disabled":""}><b>Officer issues card</b><span>After ID checks in branch</span></button>
        <button type="button" data-act="deposit500" ${!S.member?"disabled":""}><b>Lodge €500</b><span>Mints 500 CSHR</span></button>
        <button type="button" data-act="sendMember" ${!S.member?"disabled":""}><b>Send €20 to a member</b><span>Inside the common bond</span></button>
        <button type="button" data-act="sendStranger" ${!S.member?"disabled":""}><b>Send €20 to a non-member</b><span>See the contract refuse</span></button>
        <button type="button" data-act="pledge" ${!S.member?"disabled":""}><b>Pledge €400</b><span>Security for a loan</span></button>
        <button type="button" data-act="release" ${!S.pledged?"disabled":""}><b>Loan repaid</b><span>Release the pledge</span></button>
        <button type="button" data-act="dividend" ${!S.member||!S.shares?"disabled":""}><b>AGM dividend</b><span>${DIVIDEND_ILLUSTRATIVE}% on shares</span></button>
        <button type="button" data-act="transferCard" ${!S.member?"disabled":""}><b>Try to sell your card</b><span>Soulbound test</span></button>
      </div>
      <button type="button" class="btn btn-ghost btn-sm" data-act="reset" style="justify-self:start">Reset demo</button>
    </div>
  </div></section>
  <section class="band"><div class="wrap">
    <div class="sec-head"><div><span class="eyebrow">On the blockchain</span><h2>Our two smart contracts</h2></div><p class="muted">Before any savings move, the Share Token asks the Member Card "is this wallet a member?". That's how the common bond is enforced in code.</p></div>
    <div style="display:grid;gap:10px">
      <div class="chain-row"><span><b>Canalside Member Card (CCUM)</b> · soulbound ERC-721</span><a class="mono" style="word-break:break-all" href="${scan(CONTRACTS.CanalsideMemberCard)}" target="_blank" rel="noopener">${CONTRACTS.CanalsideMemberCard}</a></div>
      <div class="chain-row"><span><b>Canalside Share (CSHR)</b> · ERC-20, 2 decimals</span><a class="mono" style="word-break:break-all" href="${scan(CONTRACTS.CanalsideShareToken)}" target="_blank" rel="noopener">${CONTRACTS.CanalsideShareToken}</a></div>
    </div>
  </div></section>`; },

dashboard(){
  const avail = S.shares - S.pledged;
  return `
  <div class="wrap page-head"><span class="eyebrow">My Dashboard · demo mode</span><h1>Your membership <em class="foil">at a glance.</em></h1>
    <p>Connect MetaMask on the GitHub Pages version of this site and this page reads your real card, savings, pledges and dividends from the Sepolia blockchain. Here it shows the demo account from the Member Card page.</p>
    <div class="ctas"><button class="btn btn-gold" type="button" data-live-connect>Connect MetaMask</button><a class="btn btn-ghost" href="#member-card">Try the demo</a></div></div>
  <section class="band" style="padding-top:36px"><div class="wrap" style="display:grid;gap:28px">
    <div class="stats">
      <div class="stat"><div class="k">Savings</div><div class="v">${eur(S.shares)}</div><div class="s">${(S.shares/SAVINGS_CAP*100).toFixed(2)}% of the €100k limit</div><div class="meter"><i style="width:${Math.min(S.shares/SAVINGS_CAP*100,100)}%"></i></div></div>
      <div class="stat"><div class="k">Pledged</div><div class="v">${eur(S.pledged)}</div><div class="s">Security for loans</div></div>
      <div class="stat"><div class="k">Available</div><div class="v">${eur(avail)}</div><div class="s">To withdraw or send</div></div>
      <div class="stat"><div class="k">Dividends</div><div class="v">${eur(S.dividends||0)}</div><div class="s">Received</div></div>
    </div>
    <div class="split">${cardHTML(S.member ? {member:S.member, bond:S.bond, wallet:S.wallet} : null)}
      <div class="passbook"><div class="pb-head"><b>Passbook</b><span class="mono muted">${S.member?`Member ${S.member}`:"No member yet"}</span></div>${ledgerTable(S.ledger.slice().reverse(), "Entries appear here as you use the Member Card demo.")}</div></div>
  </div></section>`; },

news(){ const [lead, ...rest] = NEWS; return `
  <div class="wrap page-head"><span class="eyebrow">News</span><h1>From the <em class="foil">credit union.</em></h1><p>Notices, rates and updates for Canalside members.</p></div>
  <section class="band" style="padding-top:36px"><div class="wrap"><div class="news">
    ${[lead, ...rest].map((n,i)=>`<article class="post ${i===0?"lead":""}"><time datetime="${n.date}">${fmtDate(n.date)}</time><span class="tag">${n.tag}</span><h3>${esc(n.title)}</h3><p class="muted">${esc(n.teaser)}</p><details><summary>Read more</summary>${n.body.map(p=>`<p class="muted" style="margin-top:8px">${esc(p)}</p>`).join("")}</details></article>`).join("")}
  </div></div></section>`; },

faq(){ return `
  <div class="wrap page-head"><span class="eyebrow">Questions</span><h1>Frequently <em class="foil">asked.</em></h1><p>About membership, savings, loans and the Digital Member Card.</p></div>
  <section class="band" style="padding-top:36px"><div class="wrap" style="max-width:900px"><div class="faq">
    ${FAQS.map(([q,a])=>`<details><summary>${esc(q)}</summary><div class="a"><p>${esc(a)}</p></div></details>`).join("")}
  </div><p class="muted" style="margin-top:26px">Still unsure? <a href="#contact">Send us a message</a> or call into a <a href="#branches">branch</a>.</p></div></section>`; },

about(){ return `
  <div class="wrap page-head"><span class="eyebrow">Our story</span><h1>Built by the parish, <em class="foil">kept by its people.</em></h1>
    <p>Ireland's credit union movement began in Dublin in the late 1950s, when volunteers set out to give working families an alternative to moneylenders. Canalside followed in 1967, a little further along the canal.</p></div>
  <section class="band" style="padding-top:36px"><div class="wrap split">
    <div class="timeline">${HISTORY.map(([y,t,ctx])=>`<div class="tl"><b>${y}</b><p class="${ctx?"muted":""}">${esc(t)}</p></div>`).join("")}</div>
    <div class="agm"><span class="eyebrow">AGM 2026</span><h2>Tuesday 8 December, 7.30pm</h2><p class="muted">Inchicore branch, Emmet Road. Tea from 7pm. Every member aged 16 or over has one vote.</p>
      <ol><li>Minutes of the 2025 AGM</li><li>Chair's and CEO's reports</li><li>Accounts for the year to 30 September 2026</li><li>Proposed dividend of 1.5% on shares</li><li>Proposed 5% rebate of loan interest paid</li><li>Election of three directors (nominations close 24 November)</li><li>Report on the Digital Member Card pilot</li><li>Any other business</li></ol></div>
  </div></section>
  <section class="band alt"><div class="wrap" style="display:grid;gap:44px">
    <div><div class="sec-head"><div><span class="eyebrow">Board of directors</span><h2>Volunteers, elected by members</h2></div><p class="muted">Directors are unpaid and serve three-year terms.</p></div>
      <div class="people">${BOARD.map(([i,n,r])=>`<div class="person"><span class="mono-av">${i}</span><div><b>${n}</b><span>${r}</span></div></div>`).join("")}</div></div>
    <div><div class="sec-head"><div><span class="eyebrow">Management team</span><h2>The people behind the counter</h2></div><p class="muted">Plus sixteen member-services and lending staff across both branches.</p></div>
      <div class="people">${MANAGEMENT.map(([i,n,r])=>`<div class="person"><span class="mono-av">${i}</span><div><b>${n}</b><span>${r}</span></div></div>`).join("")}</div></div>
  </div></section>
  <section class="band"><div class="wrap"><div class="tiles">
    <div class="tile"><span class="k">Principle</span><h3>Common bond</h3><p class="muted">We lend in the area we know, to people we can meet.</p></div>
    <div class="tile"><span class="k">Principle</span><h3>One member, one vote</h3><p class="muted">Control stays equal, however much you save.</p></div>
    <div class="tile"><span class="k">Principle</span><h3>Surplus returned</h3><p class="muted">After reserves, profit goes back to members.</p></div>
  </div></div></section>`; },

branches(){
  const day = new Date().toLocaleDateString("en-IE",{weekday:"long",timeZone:"Europe/Dublin"});
  return `
  <div class="wrap page-head"><span class="eyebrow">Branches</span><h1>Two branches, <em class="foil">one towpath apart.</em></h1>
    <p>Call in to join, lodge, apply for a loan or ask a question. Christmas hours are in our <a href="#news">news</a>.</p></div>
  <section class="band" style="padding-top:36px"><div class="wrap split">
    ${BRANCHES.map(b=>`<article class="branch"><div class="b-top"><span class="eyebrow">${b.type}</span><h3 style="margin-top:10px">${b.name}</h3><p class="muted">${b.address}</p></div>
      <div class="b-body">
        <table class="hours">${b.hours.map(([d,t])=>`<tr class="${d===day?"today":""}"><td>${d}${d===day?" · today":""}</td><td>${t}</td></tr>`).join("")}</table>
        <div><p class="mc-k" style="margin-bottom:8px">Services</p><div class="svc">${b.services.map(s=>`<span class="badge">${s}</span>`).join("")}</div></div>
        <div><p class="mc-k" style="margin-bottom:6px">Getting here</p><p class="muted">${b.getting}</p></div>
        <div><p class="mc-k" style="margin-bottom:6px">Accessibility</p><p class="muted">${b.access}</p></div>
        <a class="btn btn-ghost btn-sm" href="${b.maps}" target="_blank" rel="noopener" style="justify-self:start">Open in Google Maps ↗</a>
      </div></article>`).join("")}
  </div></section>`; },

contact(){ return `
  <div class="wrap page-head"><span class="eyebrow">Contact</span><h1>Talk to <em class="foil">us.</em></h1>
    <p>We reply within one working day. For anything about your account, please call into a branch with photo ID.</p></div>
  <section class="band" style="padding-top:36px"><div class="wrap split">
    <div style="display:grid;gap:18px">
      <div class="panel"><p class="mc-k">Email</p><p class="mono" style="user-select:all;font-size:1rem">hello@canalsidecu.ie</p><button class="btn btn-ghost btn-sm" type="button" data-copy="hello@canalsidecu.ie" style="justify-self:start">Copy address</button></div>
      <div class="panel"><p class="mc-k">Stay safe</p><p class="muted">Canalside will never ask for your PIN, passwords or wallet recovery phrase by phone, text or email.</p></div>
    </div>
    <form class="panel framed" id="contactForm" novalidate>
      <label for="cName">Your name<input type="text" id="cName" autocomplete="name" required></label>
      <label for="cEmail">Email<input type="email" id="cEmail" autocomplete="email" required></label>
      <label for="cTopic">About<select id="cTopic"><option>Joining</option><option>Loans</option><option>Home Loans</option><option>Savings</option><option>Digital Member Card</option><option>AGM</option><option>Something else</option></select></label>
      <label for="cMsg">Message<textarea id="cMsg" required></textarea></label>
      <div id="cNote" aria-live="polite"></div>
      <button class="btn btn-gold" type="submit" style="justify-self:start">Send message</button>
    </form>
  </div></section>`; },

"officer-desk"(){ return `
  <div class="wrap page-head"><span class="eyebrow">Officer Desk · staff only</span><h1>Run the credit union <em class="foil">from the website.</em></h1>
    <p>Issue Member Cards, record lodgements and withdrawals, pledge shares for loans and pay the AGM dividend, all as real Sepolia transactions from the officer's MetaMask wallet.</p>
    <div class="ctas"><button class="btn btn-gold" type="button" data-live-connect>Connect officer wallet</button></div>
    <p class="muted" style="font-size:.95rem">MetaMask can't reach pages inside the Claude artifact viewer. Open the GitHub Pages version of this site.</p></div>`; }
};

/* ---------- outputs ---------- */
function saveOutputs(p){
  return `<div class="big">${eur0(p.total)}</div><div class="out">
    <div class="out-row"><span>You pay in</span><b>${eur0(p.paidIn)}</b></div>
    <div class="out-row"><span>Illustrative dividend</span><b>${eur0(Math.max(p.dividend,0))}</b></div></div>
    ${p.capped?`<p class="warning">You'd reach the €100,000 savings limit. The Share Token contract refuses any lodgement above it.</p>`:""}`;
}
function loanOutputs(L){
  const q = loanQuote(S.loanAmt, S.loanTerm, L.apr);
  return `<div class="big">${eur(q.monthly)} <span style="font-family:var(--f-body);font-size:1rem;-webkit-text-fill-color:var(--muted);color:var(--muted)">a month</span></div><div class="out">
    <div class="out-row"><span>${L.unit.startsWith("APRC")?"APRC":"APR"}</span><b>${L.apr}%</b></div>
    <div class="out-row"><span>Term</span><b>${termLabel(S.loanTerm)}</b></div>
    <div class="out-row"><span>Total repayable</span><b>${eur(q.total)}</b></div>
    <div class="out-row"><span>Total cost of credit</span><b>${eur(q.cost)}</b></div></div>`;
}

/* ---------- demo Member Card actions (simulated contract calls) ---------- */
function addLedger(what, fn, amt){ S.ledger.push({d:today(), what, fn, amt, bal:S.shares}); }
function receipt(title, calls, note){
  modal(`<span class="eyebrow">${note.ok===false?"Transaction reverted":"Transaction confirmed · demo"}</span><h2>${esc(title)}</h2>${note.text?`<p>${note.text}</p>`:""}
    <div class="receipt">${esc(calls.join("\n"))}</div><small class="muted">Simulated in this demo. On Sepolia the same call is signed in MetaMask and recorded on Etherscan.</small>
    <button class="btn btn-ghost btn-sm" type="button" data-close style="justify-self:start">Close</button>`);
}
function demoConnect(){
  const hex="0123456789abcdef"; let a="0x"; for(let i=0;i<40;i++) a+=hex[Math.floor(Math.random()*16)];
  S.wallet = a; save(); render(); toast("Demo wallet connected");
}
let connect = demoConnect;   // chain.js replaces this with MetaMask-first
function act(kind){
  const W = short(S.wallet);
  const credit = (amt, ref) => {
    if (S.shares + amt > SAVINGS_CAP) { receipt("Lodgement refused", [`CanalsideShareToken.deposit(${W}, ${Math.round(amt*100)}, "${ref}")`, `  → revert: "Savings cap of EUR 100,000 reached"`], {ok:false}); return false; }
    S.shares += amt; return true;
  };
  switch(kind){
    case "connect": connect(); return;
    case "issue":
      S.member = 1001 + Math.floor(Math.random()*400); S.bond = "Lives in Dublin 8"; S.joined = String(new Date().getFullYear());
      addLedger("Membership issued after ID check", `issueMembership(${W}, "Lives in Dublin 8", uri)`, 0);
      receipt(`Member Card #${S.member} issued`, [`CanalsideMemberCard.issueMembership(${W}, "Lives in Dublin 8", "ipfs://…/member.json")`, `  → MembershipIssued(member: ${W}, memberNumber: ${S.member})`], {text:"Your soulbound card is in your wallet. Your name and address stay in the branch system only."});
      break;
    case "deposit500": {
      const ref = "LODGE-" + (1000 + S.ledger.length);
      if(!credit(500, ref)) break;
      addLedger(`Lodgement ${ref}`, `deposit(${W}, 50000, "${ref}")`, 500);
      receipt("€500.00 lodged", [`CanalsideShareToken.deposit(${W}, 50000, "${ref}")`, `  → isMember(${W}) = true`, `  → Transfer(0x0 → ${W}, 500.00 CSHR)`], {text:"500 CSHR minted to your wallet."});
      break; }
    case "sendMember":
      if (S.shares - S.pledged < 20) { receipt("Payment refused", [`CanalsideShareToken.transfer(${short(S.neighbour)}, 2000)`, `  → revert: "Not enough unpledged shares"`], {ok:false, text:"You need at least €20 of unpledged savings."}); break; }
      S.shares -= 20; addLedger("Sent to member 1188", `transfer(${short(S.neighbour)}, 2000)`, -20);
      receipt("€20 sent to a member", [`CanalsideShareToken.transfer(${short(S.neighbour)}, 2000)`, `  → isMember(sender) = true, isMember(recipient) = true`, `  → Transfer(${W} → ${short(S.neighbour)}, 20.00 CSHR)`], {text:"Instant, member to member, inside the common bond."});
      break;
    case "sendStranger":
      receipt("Payment refused", [`CanalsideShareToken.transfer(0x5b3a…e91f, 2000)`, `  → isMember(0x5b3a…e91f) = false`, `  → revert: "Recipient is not a credit union member"`], {ok:false, text:"Only members can hold shares. The contract enforces the common bond automatically."});
      break;
    case "pledge":
      if (S.shares - S.pledged < 400) { receipt("Pledge refused", [`CanalsideShareToken.pledgeForLoan(${W}, 40000, "LOAN-77")`, `  → revert: "Not enough unpledged shares"`], {ok:false, text:"Lodge at least €400 first."}); break; }
      S.pledged += 400; addLedger("€400 pledged as loan security (LOAN-77)", `pledgeForLoan(${W}, 40000, "LOAN-77")`, 0);
      receipt("€400 pledged for LOAN-77", [`CanalsideShareToken.pledgeForLoan(${W}, 40000, "LOAN-77")`, `  → SharesPledged(${W}, 400.00)`], {text:"These shares are locked until the loan is repaid."});
      break;
    case "release":
      S.pledged = 0; addLedger("Loan LOAN-77 repaid, pledge released", `releasePledge(${W}, 40000, "LOAN-77")`, 0);
      receipt("Pledge released", [`CanalsideShareToken.releasePledge(${W}, 40000, "LOAN-77")`, `  → SharesReleased(${W}, 400.00)`], {text:"Loan repaid. Your shares are free again."});
      break;
    case "dividend": {
      const amt = Math.floor(S.shares * DIVIDEND_ILLUSTRATIVE) / 100;
      if (amt <= 0 || !credit(amt, "DIV-2026")) break;
      S.dividends = (S.dividends||0) + amt;
      addLedger(`AGM dividend ${DIVIDEND_ILLUSTRATIVE}%`, `payDividend([${W}], ${DIVIDEND_ILLUSTRATIVE*100})`, amt);
      receipt(`${eur(amt)} dividend paid`, [`CanalsideShareToken.payDividend([${W}], ${DIVIDEND_ILLUSTRATIVE*100})`, `  → DividendPaid(${W}, ${amt.toFixed(2)}, ${DIVIDEND_ILLUSTRATIVE*100} bps)`], {text:"Approved at the AGM and paid to every member in one transaction."});
      break; }
    case "transferCard":
      receipt("Transfer refused", [`CanalsideMemberCard.transferFrom(${W}, 0x5b3a…e91f, ${S.member})`, `  → revert: "Membership cards are non-transferable"`], {ok:false, text:"Membership is personal. If you lose your phone, an officer can move your card to a new wallet after an ID check."});
      break;
    case "reset":
      Object.assign(S, {wallet:null, member:0, bond:"", joined:"", shares:0, pledged:0, dividends:0, ledger:[]}); toast("Demo reset");
      break;
  }
  save(); render();
}

/* ---------- router ---------- */
function render(){
  const page = (location.hash || "#home").slice(1);
  const view = VIEWS[page] ? page : "home";
  $("#app").innerHTML = VIEWS[view]();
  document.querySelectorAll("nav.main a").forEach(a => { if (a.getAttribute("href") === "#"+view) a.setAttribute("aria-current","page"); else a.removeAttribute("aria-current"); });
  $("#nav").classList.remove("open"); $("#menuBtn").setAttribute("aria-expanded","false");
  updateHeader();
  if (view === "save") bindSave();
  if (view === "borrow") bindLoan();
  if (view === "join") bindJoin();
}
function updateHeader(){
  $("#walletBtn").classList.toggle("on", !!S.wallet);
  $("#walletLabel").textContent = S.wallet ? (S.member ? `Member ${S.member}` : short(S.wallet)) : "Connect wallet";
}
function bindSave(){
  const upd = () => {
    S.saveStart = +$("#sStart").value; S.saveMonthly = +$("#sMonthly").value; S.saveYears = +$("#sYears").value; save();
    $("#sStartOut").textContent = eur0(S.saveStart); $("#sMonthlyOut").textContent = eur0(S.saveMonthly); $("#sYearsOut").textContent = S.saveYears + (S.saveYears===1?" year":" years");
    const p = projectSavings(S.saveStart, S.saveMonthly, S.saveYears, DIVIDEND_ILLUSTRATIVE);
    $("#saveOut").innerHTML = saveOutputs(p); $("#chamberBox").innerHTML = chamber(p.total);
  };
  ["#sStart","#sMonthly","#sYears"].forEach(id => $(id).addEventListener("input", upd));
}
function bindLoan(){
  const L = () => LOANS.find(l => l.id === S.loanType) || LOANS[0];
  const upd = () => {
    S.loanAmt = +$("#lAmt").value; S.loanTerm = +$("#lTerm").value; save();
    $("#lAmtOut").textContent = eur0(S.loanAmt); $("#lTermOut").textContent = termLabel(S.loanTerm);
    $("#loanOut").innerHTML = loanOutputs(L());
  };
  ["#lAmt","#lTerm"].forEach(id => $(id).addEventListener("input", upd));
}
function bindJoin(){
  const rel = $("#jRel"); const sync = () => { $("#jAreaWrap").hidden = rel.value === "family"; };
  rel.addEventListener("change", sync); sync();
}

/* ---------- events ---------- */
document.addEventListener("click", e => {
  const t = e.target.closest("[data-loan],[data-act],[data-close],[data-check],[data-copy]");
  if (!t) return;
  if (t.dataset.loan) { const L = LOANS.find(l => l.id === t.dataset.loan); S.loanType = L.id; S.loanAmt = Math.round((L.min + L.max) / 4 / L.step) * L.step || L.min; S.loanTerm = Math.min(L.tmax, Math.max(L.tmin, L.id === "home" ? 300 : 36)); save(); render(); }
  else if (t.dataset.act) act(t.dataset.act);
  else if (t.hasAttribute("data-close")) closeLayer();
  else if (t.hasAttribute("data-check")) {
    const rel = $("#jRel").value, area = $("#jArea").value, out = $("#jResult");
    const place = area === "D8" ? "Dublin 8" : "Dublin 12";
    if (rel === "family") out.innerHTML = `<div class="result yes">You can join. Bring proof that your family member is a Canalside member, along with your own ID.</div>`;
    else if (area === "other") out.innerHTML = `<div class="result no">Our common bond covers Dublin 8 and Dublin 12 only. There's a credit union for almost every community in Ireland, so try the one where you live or work.</div>`;
    else out.innerHTML = `<div class="result yes">Welcome aboard. Because you ${rel} in ${place}, you're inside our common bond. See "How to join" for what to bring.</div>`;
  }
  else if (t.dataset.copy) { const v = t.dataset.copy; navigator.clipboard?.writeText(v).then(() => toast("Email address copied")).catch(() => toast(v)); }
});
document.addEventListener("submit", e => {
  if (e.target.id !== "contactForm") return;
  e.preventDefault();
  const name = $("#cName").value.trim(), email = $("#cEmail").value.trim(), msg = $("#cMsg").value.trim(), note = $("#cNote");
  if (!name || !/^\S+@\S+\.\S+$/.test(email) || !msg) { note.innerHTML = `<p class="note err">Add your name, a valid email address and a message, then send again.</p>`; return; }
  note.innerHTML = `<p class="note ok">Thank you, ${esc(name)}. This demo stores nothing; on the live site your message would go to hello@canalsidecu.ie.</p>`;
  e.target.reset();
});
document.addEventListener("keydown", e => { if (e.key === "Escape") closeLayer(); });
document.getElementById("walletBtn").addEventListener("click", () => S.wallet ? (location.hash = "#dashboard") : connect());
document.getElementById("menuBtn").addEventListener("click", () => { const n = $("#nav"); n.classList.toggle("open"); $("#menuBtn").setAttribute("aria-expanded", n.classList.contains("open")); });
window.addEventListener("hashchange", () => { render(); window.scrollTo(0,0); });
render();
