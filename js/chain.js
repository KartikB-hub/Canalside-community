/* =========================================================================
   Canalside — live blockchain connection (MetaMask + Ethereum Sepolia)
   Loaded after ethers.umd.min.js and app.js.
   - My Dashboard: real Member Card, savings, pledges, dividends and a
     statement built from the Share Token's on-chain events.
   - Officer Desk: issueMembership, replaceWallet, closeMembership, deposit,
     withdraw, pledgeForLoan, releasePledge, payDividend, setOfficer.
   Without MetaMask (e.g. inside the Claude artifact viewer) the site stays
   in demo mode.
   ========================================================================= */

const SEPOLIA = { chainId: 11155111, hex: "0xaa36a7", rpc: "https://rpc.sepolia.org", explorer: "https://sepolia.etherscan.io" };

/* Optional: Pinata image link used when a card is issued from the Officer Desk */
const CARD_IMAGE = "";   // e.g. "https://<gateway>.mypinata.cloud/ipfs/<CID of Canalside_MemberCard_1001.png>"
const MEMBER_SCAN = 80;  // how many member numbers the register checks

const BONDS = ["Lives in Dublin 8", "Works in Dublin 8", "Lives in Dublin 12", "Works in Dublin 12", "Family of a member"];

const CARD_ABI = [
  "function owner() view returns (address)",
  "function isOfficer(address) view returns (bool)",
  "function isMember(address) view returns (bool)",
  "function memberNumberOf(address) view returns (uint256)",
  "function commonBond(uint256) view returns (string)",
  "function joinedAt(uint256) view returns (uint256)",
  "function nextMemberNumber() view returns (uint256)",
  "function activeMembers() view returns (uint256)",
  "function ownerOf(uint256) view returns (address)",
  "function issueMembership(address _member, string _commonBond, string _uri) returns (uint256)",
  "function replaceWallet(address _oldWallet, address _newWallet)",
  "function closeMembership(address _member)",
  "function setOfficer(address _officer, bool _allowed)"
];
const SHARE_ABI = [
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function pledged(address) view returns (uint256)",
  "function available(address) view returns (uint256)",
  "function creditUnion() view returns (address)",
  "function isOfficer(address) view returns (bool)",
  "function memberCard() view returns (address)",
  "function transfer(address recipient, uint256 amount) returns (bool)",
  "function deposit(address member, uint256 amountCents, string ref)",
  "function withdraw(address member, uint256 amountCents, string ref)",
  "function pledgeForLoan(address member, uint256 amountCents, string loanRef)",
  "function releasePledge(address member, uint256 amountCents, string loanRef)",
  "function payDividend(address[] members, uint256 rateBasisPoints)",
  "function setOfficer(address officer, bool allowed)",
  "event Deposited(address indexed member, uint256 amountCents, string ref)",
  "event Withdrawn(address indexed member, uint256 amountCents, string ref)",
  "event SharesPledged(address indexed member, uint256 amountCents, string loanRef)",
  "event SharesReleased(address indexed member, uint256 amountCents, string loanRef)",
  "event DividendPaid(address indexed member, uint256 amountCents, uint256 rateBasisPoints)",
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];

const chain = { live:false, provider:null, signer:null, addr:"", card:null, share:null,
  cardOwner:false, cardOfficer:false, shareCU:false, shareOfficer:false, linked:true,
  me:{ member:0, bond:"", joined:"", bal:0, pledged:0, avail:0 }, totals:{ supply:0, members:0, next:1001 },
  statement:[], dividends:0, register:null };

/* ---------- helpers ---------- */
const txUrl = h => `${SEPOLIA.explorer}/tx/${h}`;
const addrUrl = a => `${SEPOLIA.explorer}/address/${a}`;
const cents = v => BigInt(Math.round(parseFloat(String(v).replace(",", ".")) * 100));
const fromCents = c => Number(c) / 100;
const okAddr = a => { try { return ethers.isAddress(a); } catch(e) { return false; } };
const same = (a, b) => a && b && a.toLowerCase() === b.toLowerCase();
const officerAny = () => chain.cardOfficer || chain.shareOfficer || chain.cardOwner || chain.shareCU;

function explain(e){
  const raw = [e?.reason, e?.shortMessage, e?.info?.error?.message, e?.error?.message, e?.message].filter(Boolean).join(" | ");
  if (/user rejected|ACTION_REJECTED|denied/i.test(raw)) return "You rejected the request in MetaMask. Nothing was sent.";
  if (/insufficient funds/i.test(raw)) return "This wallet needs a little Sepolia ETH to pay gas. Get some from a Sepolia faucet and try again.";
  const codes = { "018001":"Only the contract owner (the wallet that deployed the Member Card) can do this.", "003001":"That address isn't valid.", "003002":"That member card doesn't exist.", "003006":"That member number is already in use." };
  for (const c in codes) if (raw.includes(c)) return codes[c];
  const m = raw.match(/reverted with reason string ['"]([^'"]+)/i) || raw.match(/execution reverted:?\s*["']?([^"'|]+)/i);
  if (m) return "The contract refused: " + m[1].trim();
  if (e?.reason) return "The contract refused: " + e.reason;
  return (e?.shortMessage || e?.message || "Something went wrong.").slice(0, 220);
}

async function sendTx(title, call, entry){
  modal(`<span class="eyebrow">Step 1 of 2</span><h2>${esc(title)}</h2><p>Confirm the transaction in MetaMask.</p><p class="muted">The pop-up shows the contract, the function and the gas fee in Sepolia ETH.</p>`);
  try {
    const tx = await call();
    modal(`<span class="eyebrow">Step 2 of 2 · pending</span><h2>${esc(title)}</h2><p>Sent to Sepolia. Waiting for a block (usually 10–30 seconds).</p><p><a class="mono" style="word-break:break-all" href="${txUrl(tx.hash)}" target="_blank" rel="noopener">${tx.hash}</a></p>`);
    const rc = await tx.wait();
    if (entry) { S.ledger.push({ d: today(), what: entry.what, fn: entry.fn, amt: entry.amt || 0, bal: null, tx: tx.hash, live: true }); save(); }
    await refresh();
    modal(`<span class="eyebrow" style="color:var(--ok)">Confirmed in block ${rc.blockNumber}</span><h2>${esc(title)}</h2>
      <a class="btn btn-gold" href="${txUrl(tx.hash)}" target="_blank" rel="noopener" style="justify-self:start">View on Sepolia Etherscan ↗</a>
      <p class="mono muted" style="word-break:break-all">${tx.hash}</p><button class="btn btn-ghost btn-sm" data-close style="justify-self:start">Close</button>`);
    render();
    return rc;
  } catch (e) {
    modal(`<span class="eyebrow" style="color:var(--err)">Not completed</span><h2>${esc(title)}</h2><p>${esc(explain(e))}</p><button class="btn btn-ghost btn-sm" data-close style="justify-self:start">Close</button>`);
    return null;
  }
}

/* ---------- connect ---------- */
async function liveConnect(){
  if (typeof ethers === "undefined") { modal(`<span class="eyebrow">Library didn't load</span><h2>Check your connection</h2><p>The ethers.js library loads from cdn.jsdelivr.net. Reload the page, or check that an ad-blocker isn't blocking it.</p><button class="btn btn-ghost btn-sm" data-close>Close</button>`); return; }
  if (!window.ethereum) {
    modal(`<span class="eyebrow">MetaMask not found</span><h2>Connect a real wallet</h2>
      <p>MetaMask can't reach this page here. That happens inside the Claude artifact viewer, or in a browser without the MetaMask extension.</p>
      <p class="muted">To use the real contracts, open the site from GitHub Pages in Chrome, Edge, Brave or Firefox with MetaMask installed.</p>
      <div class="ctas"><button class="btn btn-gold btn-sm" data-demo-wallet>Use the demo wallet</button><button class="btn btn-ghost btn-sm" data-close>Close</button></div>`);
    return;
  }
  try {
    const provider = new ethers.BrowserProvider(window.ethereum, "any");
    await provider.send("eth_requestAccounts", []);
    const net = await provider.getNetwork();
    if (Number(net.chainId) !== SEPOLIA.chainId) {
      try { await window.ethereum.request({ method:"wallet_switchEthereumChain", params:[{ chainId: SEPOLIA.hex }] }); }
      catch (sw) {
        if (sw && sw.code === 4902) await window.ethereum.request({ method:"wallet_addEthereumChain", params:[{ chainId: SEPOLIA.hex, chainName:"Sepolia", nativeCurrency:{ name:"Sepolia ETH", symbol:"ETH", decimals:18 }, rpcUrls:[SEPOLIA.rpc], blockExplorerUrls:[SEPOLIA.explorer] }] });
        else throw sw;
      }
      return liveConnect();
    }
    const [cCard, cShare] = await Promise.all([provider.getCode(CONTRACTS.CanalsideMemberCard), provider.getCode(CONTRACTS.CanalsideShareToken)]);
    if (cCard === "0x" || cShare === "0x") {
      modal(`<span class="eyebrow" style="color:var(--err)">Contract not found</span><h2>Check the contract addresses</h2><p>No contract was found on Sepolia at the ${cCard === "0x" ? "Member Card" : "Share Token"} address in <span class="mono">js/app.js</span>. Copy it again from Remix's "Deployed Contracts" panel.</p><button class="btn btn-ghost btn-sm" data-close>Close</button>`);
      return;
    }
    chain.provider = provider;
    chain.signer = await provider.getSigner();
    chain.addr = await chain.signer.getAddress();
    chain.card = new ethers.Contract(CONTRACTS.CanalsideMemberCard, CARD_ABI, chain.signer);
    chain.share = new ethers.Contract(CONTRACTS.CanalsideShareToken, SHARE_ABI, chain.signer);
    chain.live = true;
    S.wallet = chain.addr; save();
    await refresh(true);
    if (!chain._listen) {
      chain._listen = true;
      window.ethereum.on?.("accountsChanged", () => { chain.live = false; chain.register = null; liveConnect(); });
      window.ethereum.on?.("chainChanged", () => location.reload());
    }
    closeLayer(); render();
    toast(`MetaMask connected · ${officerAny() ? "credit union officer" : chain.me.member ? "member " + chain.me.member : "not yet a member"}`);
  } catch (e) {
    modal(`<span class="eyebrow" style="color:var(--err)">Not connected</span><h2>Couldn't connect MetaMask</h2><p>${esc(explain(e))}</p><button class="btn btn-ghost btn-sm" data-close>Close</button>`);
  }
}

/* ---------- read state ---------- */
async function refresh(full){
  if (!chain.live) return;
  const c = chain.card, s = chain.share, me = chain.addr;
  const [owner, cOff, cu, sOff, linkedTo, num, bal, pl, av, supply, members, next] = await Promise.all([
    c.owner(), c.isOfficer(me), s.creditUnion(), s.isOfficer(me), s.memberCard(), c.memberNumberOf(me),
    s.balanceOf(me), s.pledged(me), s.available(me), s.totalSupply(), c.activeMembers(), c.nextMemberNumber()
  ]);
  chain.cardOwner = same(owner, me); chain.cardOfficer = cOff; chain.shareCU = same(cu, me); chain.shareOfficer = sOff;
  chain.linked = same(linkedTo, CONTRACTS.CanalsideMemberCard);
  const n = Number(num);
  let bond = "", joined = "";
  if (n) {
    const [b, j] = await Promise.all([c.commonBond(n), c.joinedAt(n)]);
    bond = b; joined = new Date(Number(j) * 1000).toLocaleDateString("en-IE", { day:"numeric", month:"short", year:"numeric" });
  }
  chain.me = { member:n, bond, joined, bal: fromCents(bal), pledged: fromCents(pl), avail: fromCents(av) };
  chain.totals = { supply: fromCents(supply), members: Number(members), next: Number(next) };
  if (full !== false) { await loadStatement(); chain.register = null; }
  updateHeader();
}

async function queryAll(filters){
  const latest = await chain.provider.getBlockNumber();
  for (const span of [400000, 90000, 9000]) {
    try {
      const from = Math.max(0, latest - span);
      const res = await Promise.all(filters.map(f => chain.share.queryFilter(f, from, latest)));
      return res.flat();
    } catch (e) { /* the RPC may limit block ranges: try a smaller window */ }
  }
  return [];
}
async function loadStatement(){
  const s = chain.share, me = chain.addr, f = s.filters;
  const logs = await queryAll([f.Deposited(me), f.Withdrawn(me), f.SharesPledged(me), f.SharesReleased(me), f.DividendPaid(me), f.Transfer(me, null), f.Transfer(null, me)]);
  const rows = [];
  let div = 0;
  for (const l of logs) {
    const n = l.fragment?.name, a = l.args;
    if (n === "Transfer") {
      const zero = ethers.ZeroAddress;
      if (same(a.from, zero) || same(a.to, zero)) continue;   // mint/burn already shown as deposit/withdrawal/dividend
      const out = same(a.from, me);
      rows.push({ bn:l.blockNumber, tx:l.transactionHash, what: out ? `Sent to ${short(a.to)}` : `Received from ${short(a.from)}`, amt: (out ? -1 : 1) * fromCents(a.value), fn:"transfer" });
    } else if (n === "Deposited") rows.push({ bn:l.blockNumber, tx:l.transactionHash, what:`Lodgement ${a.ref}`, amt: fromCents(a.amountCents), fn:"deposit" });
    else if (n === "Withdrawn") rows.push({ bn:l.blockNumber, tx:l.transactionHash, what:`Withdrawal ${a.ref}`, amt: -fromCents(a.amountCents), fn:"withdraw" });
    else if (n === "SharesPledged") rows.push({ bn:l.blockNumber, tx:l.transactionHash, what:`${eur(fromCents(a.amountCents))} pledged for ${a.loanRef}`, amt: 0, fn:"pledgeForLoan" });
    else if (n === "SharesReleased") rows.push({ bn:l.blockNumber, tx:l.transactionHash, what:`${eur(fromCents(a.amountCents))} released (${a.loanRef})`, amt: 0, fn:"releasePledge" });
    else if (n === "DividendPaid") { const v = fromCents(a.amountCents); div += v; rows.push({ bn:l.blockNumber, tx:l.transactionHash, what:`Dividend at ${Number(a.rateBasisPoints)/100}%`, amt: v, fn:"payDividend" }); }
  }
  rows.sort((x, y) => x.bn - y.bn);
  const blocks = [...new Set(rows.map(r => r.bn))].slice(-40);
  const times = {};
  await Promise.all(blocks.map(async b => { try { const blk = await chain.provider.getBlock(b); times[b] = new Date(blk.timestamp * 1000).toISOString().slice(0,10); } catch(e) {} }));
  let bal = 0;
  chain.statement = rows.map(r => { bal += r.amt; return { d: times[r.bn] || `block ${r.bn}`, what: r.what, fn: r.fn, amt: r.amt, bal, tx: r.tx }; });
  chain.dividends = div;
}
async function loadRegister(){
  const c = chain.card, s = chain.share;
  const last = Math.min(chain.totals.next - 1, 1000 + MEMBER_SCAN);
  const ids = []; for (let i = 1001; i <= last; i++) ids.push(i);
  const owners = await Promise.allSettled(ids.map(id => c.ownerOf(id)));
  const live = ids.map((id, i) => owners[i].status === "fulfilled" ? { id, wallet: owners[i].value } : null).filter(Boolean);
  const extra = await Promise.all(live.map(async m => { const [b, bal, pl] = await Promise.all([c.commonBond(m.id), s.balanceOf(m.wallet), s.pledged(m.wallet)]); return { ...m, bond:b, bal: fromCents(bal), pledged: fromCents(pl) }; }));
  chain.register = extra;
}
/* Card artwork drawn as an SVG and stored inside the NFT itself, so wallets always have an image
   even without a Pinata link. Kept small to limit gas. */
function cardSvg(num, bond){
  const x = t => String(t).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#A9803A"/><stop offset=".5" stop-color="#F0DDA8"/><stop offset="1" stop-color="#9C7B3A"/></linearGradient></defs><rect width="600" height="600" fill="#08180F"/><circle cx="300" cy="300" r="260" fill="none" stroke="#C9A55C" stroke-opacity=".15" stroke-width="40" stroke-dasharray="2 6"/><text x="300" y="80" text-anchor="middle" font-family="sans-serif" font-size="15" letter-spacing="6" fill="#C9A55C">CANALSIDE COMMUNITY CREDIT UNION</text><rect x="45" y="140" width="510" height="322" rx="24" fill="#0F2D20" stroke="url(#g)" stroke-width="4"/><text x="80" y="205" font-family="serif" font-size="40" fill="url(#g)">Canalside</text><text x="520" y="200" text-anchor="end" font-family="sans-serif" font-size="12" letter-spacing="3" fill="#C9A55C">SOULBOUND · ERC-721</text><rect x="80" y="235" width="54" height="40" rx="6" fill="url(#g)"/><text x="80" y="320" font-family="sans-serif" font-size="12" letter-spacing="4" fill="#C9A55C">MEMBER NUMBER</text><text x="78" y="368" font-family="monospace" font-size="44" letter-spacing="8" fill="#EFE9DB">${x(num)}</text><text x="80" y="408" font-family="sans-serif" font-size="12" letter-spacing="4" fill="#C9A55C">COMMON BOND</text><text x="80" y="438" font-family="serif" font-style="italic" font-size="24" fill="#EFE9DB">${x(bond)}</text><text x="300" y="530" text-anchor="middle" font-family="serif" font-style="italic" font-size="22" fill="#EFE9DB">One member, one vote</text></svg>`;
  return "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));
}
function cardUri(num, bond){
  const meta = { name:`Canalside Credit Union Member Card #${num}`, description:"Non-transferable proof of membership of Canalside Community Credit Union (Sepolia pilot). No personal data is stored on-chain.",
    image: CARD_IMAGE || cardSvg(num, bond), attributes:[{trait_type:"Member number",value:String(num)},{trait_type:"Common bond",value:bond},{trait_type:"Member since",value:String(new Date().getFullYear())},{trait_type:"Transferable",value:"No"}] };
  return "data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(meta))));
}

/* ---------- live views ---------- */
function liveDashboard(){
  const m = chain.me, T = chain.totals, pct = m.bal / SAVINGS_CAP * 100;
  return `
  <div class="wrap page-head"><span class="eyebrow">My Dashboard · live on Sepolia</span><h1>${m.member ? `Welcome, member <em class="foil">${m.member}.</em>` : `You're connected, <em class="foil">not yet a member.</em>`}</h1>
    <p>${m.member ? "Everything on this page is read directly from the Canalside smart contracts on Ethereum Sepolia." : "Bring photo ID and proof of address to a branch and an officer will issue your Digital Member Card to this wallet."}</p>
    <div class="ctas"><a class="btn btn-ghost btn-sm" href="${addrUrl(chain.addr)}" target="_blank" rel="noopener">My wallet on Etherscan ↗</a>${officerAny() ? `<a class="btn btn-gold btn-sm" href="#officer-desk">Officer Desk</a>` : ""}<button class="btn btn-ghost btn-sm" type="button" data-refresh>Refresh from chain</button></div></div>
  ${chain.linked ? "" : `<div class="wrap"><p class="note err">Warning: the Share Token is linked to a different Member Card contract than the one in js/app.js. Check both addresses.</p></div>`}
  <section class="band" style="padding-top:36px"><div class="wrap" style="display:grid;gap:28px">
    <div class="stats">
      <div class="stat"><div class="k">Savings · CSHR</div><div class="v">${eur(m.bal)}</div><div class="s">${pct.toFixed(2)}% of the €100,000 limit</div><div class="meter"><i style="width:${Math.min(pct,100)}%"></i></div></div>
      <div class="stat"><div class="k">Pledged</div><div class="v">${eur(m.pledged)}</div><div class="s">Locked as loan security</div></div>
      <div class="stat"><div class="k">Available</div><div class="v">${eur(m.avail)}</div><div class="s">To withdraw or send</div></div>
      <div class="stat"><div class="k">Dividends received</div><div class="v">${eur(chain.dividends)}</div><div class="s">From DividendPaid events</div></div>
    </div>
    <div class="split">
      <div style="display:grid;gap:18px">${cardHTML(m.member ? { member:m.member, bond:m.bond, joined:m.joined, wallet:chain.addr } : null)}
        ${m.member ? `<form class="panel framed" data-form="send"><span class="eyebrow">Pay another member</span>
          <label for="pTo">Member's wallet<input type="text" id="pTo" placeholder="0x…" required></label>
          <label for="pAmt">Amount in euro<input type="number" id="pAmt" min="0.01" step="0.01" value="20" required></label>
          <button class="btn btn-gold" type="submit" style="justify-self:start">Send CSHR</button>
          <p class="muted" style="font-size:.88rem">Only Canalside members can receive shares. You can send up to ${eur(m.avail)}.</p></form>` : ""}
      </div>
      <div class="passbook"><div class="pb-head"><b>Statement from the blockchain</b><span class="mono muted">${m.member ? `Member ${m.member}` : short(chain.addr)}</span></div>
        ${ledgerTable(chain.statement.slice().reverse(), "No lodgements, pledges or dividends on-chain for this wallet yet.")}</div>
    </div>
    <div class="tiles">
      <div class="tile"><span class="k">Credit union · on-chain</span><h3>${T.members.toLocaleString("en-IE")} active Digital Members</h3><p class="muted">Read from the Member Card contract.</p></div>
      <div class="tile"><span class="k">Credit union · on-chain</span><h3>${eur(T.supply)} in Canalside Shares</h3><p class="muted">Total CSHR held by all members.</p></div>
      <div class="tile"><span class="k">Contracts</span><h3>Verified links</h3><p><a class="mono" href="${addrUrl(CONTRACTS.CanalsideMemberCard)}" target="_blank" rel="noopener">Member Card ↗</a><br><a class="mono" href="${addrUrl(CONTRACTS.CanalsideShareToken)}" target="_blank" rel="noopener">Share Token ↗</a></p></div>
    </div>
  </div></section>`;
}

function liveOfficerDesk(){
  const badge = (on, t) => `<span class="badge ${on?"on":""}">${on?"✓":"✕"} ${t}</span>`;
  const can = { issue: chain.cardOfficer, card: chain.cardOwner, money: chain.shareOfficer, div: chain.shareCU };
  const reg = chain.register;
  return `
  <div class="wrap page-head"><span class="eyebrow">Officer Desk · live on Sepolia</span><h1>Credit union <em class="foil">operations.</em></h1>
    <p>Connected as <a class="mono" href="${addrUrl(chain.addr)}" target="_blank" rel="noopener">${chain.addr}</a>. Every button sends a real transaction from this wallet, and the contracts refuse anything it isn't authorised to do.</p>
    <div style="display:flex;gap:8px;flex-wrap:wrap">${badge(chain.cardOwner,"Member Card owner")}${badge(chain.cardOfficer,"Member Card officer")}${badge(chain.shareCU,"Share Token board")}${badge(chain.shareOfficer,"Share Token officer")}</div></div>
  <section class="band" style="padding-top:36px"><div class="wrap split">
    <div style="display:grid;gap:22px">
      <form class="panel framed" data-form="issue"><span class="eyebrow">Membership</span><h3>Issue a Member Card</h3>
        <label for="iTo">Member's wallet (after ID check)<input type="text" id="iTo" placeholder="0x…" value="${chain.me.member ? "" : chain.addr}" required></label>
        <label for="iBond">Common bond<select id="iBond">${BONDS.map(b=>`<option>${b}</option>`).join("")}</select></label>
        <label for="iUri">Metadata URI (optional · your Pinata JSON link)<input type="text" id="iUri" placeholder="Leave blank to build it automatically"></label>
        <button class="btn btn-gold" type="submit" ${can.issue?"":"disabled"} style="justify-self:start">issueMembership → #${chain.totals.next}</button></form>
      <form class="panel" data-form="replace"><span class="eyebrow">Membership</span><h3>Lost phone: move a card</h3>
        <label for="rOld">Old wallet<input type="text" id="rOld" placeholder="0x…" required></label>
        <label for="rNew">New wallet<input type="text" id="rNew" placeholder="0x…" required></label>
        <button class="btn btn-ghost" type="submit" ${can.issue?"":"disabled"} style="justify-self:start">replaceWallet</button></form>
      <form class="panel" data-form="close"><span class="eyebrow">Membership</span><h3>Close a membership</h3>
        <label for="xWho">Member's wallet<input type="text" id="xWho" placeholder="0x…" required></label>
        <button class="btn btn-ghost" type="submit" ${can.issue?"":"disabled"} style="justify-self:start">closeMembership</button></form>
      <form class="panel" data-form="officer"><span class="eyebrow">Staff</span><h3>Authorise an officer wallet</h3>
        <label for="oWho">Officer wallet<input type="text" id="oWho" placeholder="0x…" required></label>
        <div class="ctas"><button class="btn btn-ghost btn-sm" type="submit" data-which="card" ${can.card?"":"disabled"}>On Member Card</button><button class="btn btn-ghost btn-sm" type="submit" data-which="share" ${can.div?"":"disabled"}>On Share Token</button></div></form>
    </div>
    <div style="display:grid;gap:22px">
      <form class="panel framed" data-form="money"><span class="eyebrow">Savings</span><h3>Lodgement or withdrawal</h3>
        <label for="mWho">Member's wallet<input type="text" id="mWho" placeholder="0x…" value="${chain.me.member ? chain.addr : ""}" required></label>
        <label for="mAmt">Amount in euro<input type="number" id="mAmt" min="0.01" step="0.01" value="500" required></label>
        <label for="mRef">Reference<input type="text" id="mRef" value="LODGE-${String(Date.now()).slice(-4)}" required></label>
        <div class="ctas"><button class="btn btn-gold btn-sm" type="submit" data-which="deposit" ${can.money?"":"disabled"}>deposit</button><button class="btn btn-ghost btn-sm" type="submit" data-which="withdraw" ${can.money?"":"disabled"}>withdraw</button></div></form>
      <form class="panel" data-form="pledge"><span class="eyebrow">Lending</span><h3>Loan security</h3>
        <label for="lWho">Member's wallet<input type="text" id="lWho" placeholder="0x…" value="${chain.me.member ? chain.addr : ""}" required></label>
        <label for="lAmt2">Amount in euro<input type="number" id="lAmt2" min="0.01" step="0.01" value="400" required></label>
        <label for="lRef">Loan reference<input type="text" id="lRef" value="LOAN-77" required></label>
        <div class="ctas"><button class="btn btn-gold btn-sm" type="submit" data-which="pledge" ${can.money?"":"disabled"}>pledgeForLoan</button><button class="btn btn-ghost btn-sm" type="submit" data-which="release" ${can.money?"":"disabled"}>releasePledge</button></div></form>
      <form class="panel" data-form="dividend"><span class="eyebrow">AGM</span><h3>Pay the dividend</h3>
        <label for="dList">Member wallets, one per line<textarea id="dList" placeholder="0x…">${reg ? reg.map(r => r.wallet).join("\n") : (chain.me.member ? chain.addr : "")}</textarea></label>
        <label for="dRate">Rate (%)<input type="number" id="dRate" min="0.01" max="10" step="0.01" value="${DIVIDEND_ILLUSTRATIVE}" required></label>
        <div class="ctas"><button class="btn btn-gold btn-sm" type="submit" ${can.div?"":"disabled"}>payDividend</button><button class="btn btn-ghost btn-sm" type="button" data-load-register>Fill with all members</button></div></form>
      <form class="panel" data-form="lookup"><span class="eyebrow">Look up</span><h3>Check a wallet</h3>
        <label for="kWho">Wallet<input type="text" id="kWho" placeholder="0x…" required></label>
        <button class="btn btn-ghost btn-sm" type="submit" style="justify-self:start">Look up</button><div id="kOut" aria-live="polite"></div></form>
    </div>
  </div></section>
  <section class="band alt"><div class="wrap">
    <div class="sec-head"><div><span class="eyebrow">Register</span><h2>Digital members on-chain</h2></div><button class="btn btn-ghost btn-sm" type="button" data-load-register>${reg ? "Reload register" : "Load register"}</button></div>
    ${reg ? `<div class="passbook"><div class="tbl"><table class="ledger"><thead><tr><th>No.</th><th>Wallet</th><th>Common bond</th><th class="r">Savings</th><th class="r">Pledged</th></tr></thead><tbody>
      ${reg.length ? reg.map(r=>`<tr><td>${r.id}</td><td><a href="${addrUrl(r.wallet)}" target="_blank" rel="noopener">${short(r.wallet)}</a></td><td>${esc(r.bond)}</td><td class="r">${eur(r.bal)}</td><td class="r">${eur(r.pledged)}</td></tr>`).join("") : `<tr><td colspan="5" class="muted">No Member Cards issued yet.</td></tr>`}
    </tbody></table></div></div>` : `<p class="muted">Reads every issued Member Card (numbers 1001 to ${chain.totals.next - 1}) with its savings and pledges.</p>`}
  </div></section>`;
}

/* ---------- wire into the site ---------- */
const demoDash = VIEWS.dashboard, demoDesk = VIEWS["officer-desk"];
VIEWS.dashboard = () => chain.live ? liveDashboard() : demoDash();
VIEWS["officer-desk"] = () => chain.live ? liveOfficerDesk() : demoDesk();
connect = () => liveConnect();
const baseHeader = updateHeader;
updateHeader = function(){
  baseHeader();
  if (chain.live) {
    document.getElementById("walletBtn").classList.add("on");
    document.getElementById("walletLabel").textContent = chain.me.member ? `Member ${chain.me.member} · ${eur(chain.me.bal)}` : `MetaMask ${short(chain.addr)}`;
  }
};

document.addEventListener("click", async e => {
  const t = e.target.closest("[data-demo-wallet],[data-live-connect],[data-refresh],[data-load-register]");
  if (!t) return;
  if (t.hasAttribute("data-demo-wallet")) { closeLayer(); demoConnect(); return; }
  if (t.hasAttribute("data-live-connect")) { if (chain.live) render(); else liveConnect(); return; }
  if (t.hasAttribute("data-refresh")) { await refresh(true); render(); toast("Refreshed from Sepolia"); return; }
  if (t.hasAttribute("data-load-register")) { if (!chain.live) return liveConnect(); t.disabled = true; t.textContent = "Loading…"; await loadRegister(); render(); return; }
});

document.addEventListener("submit", async e => {
  const f = e.target.closest("[data-form]"); if (!f) return;
  e.preventDefault();
  if (!chain.live) return liveConnect();
  const v = id => f.querySelector("#" + id).value.trim();
  const which = e.submitter?.dataset.which;
  const need = (...as) => { for (const a of as) if (!okAddr(a)) { toast("That wallet address isn't valid. It starts with 0x and is 42 characters long."); return false; } return true; };
  const amt = id => { const n = parseFloat(v(id)); if (!(n > 0)) { toast("Enter an amount above zero."); return null; } return n; };
  const c = chain.card, s = chain.share;
  switch (f.dataset.form) {
    case "send": { const to = v("pTo"), n = amt("pAmt"); if (!need(to) || n == null) return;
      if (!(await c.isMember(to))) { modal(`<span class="eyebrow" style="color:var(--err)">Not a member</span><h2>That wallet has no Member Card</h2><p>Canalside Shares can only be sent to members. The contract would refuse this transfer.</p><button class="btn btn-ghost btn-sm" data-close>Close</button>`); return; }
      return sendTx(`Send ${eur(n)} to ${short(to)}`, () => s.transfer(to, cents(n)), { what:`Sent to ${short(to)}`, fn:`transfer(${short(to)}, ${cents(n)})`, amt:-n }); }
    case "issue": { const to = v("iTo"), bond = v("iBond"); if (!need(to)) return;
      const uri = v("iUri") || cardUri(chain.totals.next, bond);
      return sendTx(`Issue Member Card #${chain.totals.next}`, () => c.issueMembership(to, bond, uri), { what:`Member Card issued to ${short(to)} (${bond})`, fn:`issueMembership(${short(to)}, "${bond}", uri)` }); }
    case "replace": { const a = v("rOld"), b = v("rNew"); if (!need(a, b)) return;
      return sendTx(`Move Member Card to ${short(b)}`, () => c.replaceWallet(a, b), { what:`Card moved ${short(a)} → ${short(b)}`, fn:`replaceWallet(${short(a)}, ${short(b)})` }); }
    case "close": { const a = v("xWho"); if (!need(a)) return;
      return sendTx(`Close membership of ${short(a)}`, () => c.closeMembership(a), { what:`Membership closed: ${short(a)}`, fn:`closeMembership(${short(a)})` }); }
    case "officer": { const a = v("oWho"); if (!need(a)) return;
      return which === "share"
        ? sendTx(`Authorise ${short(a)} on the Share Token`, () => s.setOfficer(a, true), { what:`Share Token officer added: ${short(a)}`, fn:`setOfficer(${short(a)}, true)` })
        : sendTx(`Authorise ${short(a)} on the Member Card`, () => c.setOfficer(a, true), { what:`Member Card officer added: ${short(a)}`, fn:`setOfficer(${short(a)}, true)` }); }
    case "money": { const a = v("mWho"), n = amt("mAmt"), ref = v("mRef"); if (!need(a) || n == null) return;
      return which === "withdraw"
        ? sendTx(`Withdraw ${eur(n)} for ${short(a)}`, () => s.withdraw(a, cents(n), ref), { what:`Withdrawal ${ref} (${short(a)})`, fn:`withdraw(${short(a)}, ${cents(n)}, "${ref}")`, amt: same(a, chain.addr) ? -n : 0 })
        : sendTx(`Lodge ${eur(n)} for ${short(a)}`, () => s.deposit(a, cents(n), ref), { what:`Lodgement ${ref} (${short(a)})`, fn:`deposit(${short(a)}, ${cents(n)}, "${ref}")`, amt: same(a, chain.addr) ? n : 0 }); }
    case "pledge": { const a = v("lWho"), n = amt("lAmt2"), ref = v("lRef"); if (!need(a) || n == null) return;
      return which === "release"
        ? sendTx(`Release ${eur(n)} (${ref})`, () => s.releasePledge(a, cents(n), ref), { what:`Pledge released ${ref}`, fn:`releasePledge(${short(a)}, ${cents(n)}, "${ref}")` })
        : sendTx(`Pledge ${eur(n)} for ${ref}`, () => s.pledgeForLoan(a, cents(n), ref), { what:`Shares pledged for ${ref}`, fn:`pledgeForLoan(${short(a)}, ${cents(n)}, "${ref}")` }); }
    case "dividend": { const list = v("dList").split(/[\s,]+/).filter(Boolean), rate = parseFloat(v("dRate"));
      if (!list.length || !need(...list) || !(rate > 0)) return;
      const bps = Math.round(rate * 100);
      return sendTx(`Pay ${rate}% dividend to ${list.length} member${list.length>1?"s":""}`, () => s.payDividend(list, bps), { what:`AGM dividend ${rate}% (${list.length} members)`, fn:`payDividend([${list.length}], ${bps})` }); }
    case "lookup": { const a = v("kWho"), out = f.querySelector("#kOut"); if (!need(a)) return;
      try {
        const [num, bal, pl] = await Promise.all([c.memberNumberOf(a), s.balanceOf(a), s.pledged(a)]);
        const n = Number(num), bond = n ? await c.commonBond(n) : "";
        out.innerHTML = n ? `<p class="note ok">Member ${n} · ${esc(bond)}<br>Savings ${eur(fromCents(bal))} · pledged ${eur(fromCents(pl))}</p>` : `<p class="note err">This wallet holds no Member Card.</p>`;
      } catch (err) { out.innerHTML = `<p class="note err">${esc(explain(err))}</p>`; }
      return; }
  }
});

/* reconnect silently if MetaMask already authorised this site */
(async () => {
  try { if (window.ethereum && typeof ethers !== "undefined") { const acc = await window.ethereum.request({ method:"eth_accounts" }); if (acc && acc.length) await liveConnect(); } } catch (e) {}
})();
