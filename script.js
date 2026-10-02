/* ===== Store, cart & UI ===== */
const P=[
{id:'vip',t:'ranks',name:'VIP',price:4.99,perks:['Colored chat name','2 homes','Daily kit']},
{id:'mvp',t:'ranks',name:'MVP',price:9.99,feat:1,perks:['Everything in VIP','5 homes','Fly in lobby','Priority queue']},
{id:'elite',t:'ranks',name:'Elite',price:19.99,perks:['Everything in MVP','10 homes','Custom particles','Exclusive pets']},
{id:'k5',t:'keys',name:'5 Crate Keys',price:2.99,perks:['5 mystery keys','Coins, items and cosmetics']},
{id:'k15',t:'keys',name:'15 Crate Keys',price:7.99,feat:1,perks:['15 mystery keys','1 bonus rare key']},
{id:'k40',t:'keys',name:'40 Crate Keys',price:17.99,perks:['40 mystery keys','3 bonus rare keys']}];
const cart={},$=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s),m$=n=>'$'+n.toFixed(2);
function shop(t){$('#products').innerHTML=P.filter(p=>p.t===t).map(p=>`<div class="card prod ${p.feat?'feat':''}">${p.feat?'<span class="tag">Best value</span>':''}<h3>${p.name}</h3><div class="price">${m$(p.price)}</div><ul>${p.perks.map(x=>`<li>${x}</li>`).join('')}</ul><button class="btn" data-id="${p.id}">Add to cart</button></div>`).join('')}
function render(){const ids=Object.keys(cart);$('#count').textContent=ids.reduce((a,i)=>a+cart[i],0);
$('#items').innerHTML=ids.length?ids.map(i=>{const p=P.find(x=>x.id===i);return `<div class="row"><span>${p.name} × ${cart[i]}</span><span>${m$(p.price*cart[i])}</span><button data-rm="${i}" aria-label="Remove one ${p.name}">−</button></div>`}).join(''):'<p class="empty">Your cart is empty. Add a rank or keys from the store.</p>';
$('#total').textContent=m$(ids.reduce((a,i)=>a+P.find(x=>x.id===i).price*cart[i],0))}
function drawer(o){const d=$('#drawer');d.classList.toggle('open',o);d.setAttribute('aria-hidden',!o);if(o)$('#closeCart').focus()}
document.addEventListener('click',e=>{const a=e.target.closest('[data-id]'),r=e.target.closest('[data-rm]'),t=e.target.closest('[data-tab]');
if(a){cart[a.dataset.id]=(cart[a.dataset.id]||0)+1;render();drawer(true);$('#msg').textContent=''}
if(r){const i=r.dataset.rm;if(--cart[i]<=0)delete cart[i];render()}
if(t){$$('[data-tab]').forEach(b=>b.setAttribute('aria-selected',b===t));shop(t.dataset.tab)}});
$('#openCart').onclick=()=>drawer(true);$('#closeCart').onclick=()=>drawer(false);
document.addEventListener('keydown',e=>{if(e.key==='Escape')drawer(false)});
$('#copy').onclick=async()=>{const b=$('#copy');try{await navigator.clipboard.writeText($('#ipText').textContent);b.textContent='Copied!'}catch(_){b.textContent='Select the IP'}setTimeout(()=>b.textContent='Copy IP',1800)};
$('#yr').textContent=new Date().getFullYear();shop('ranks');render();

(function(){
const root=document.documentElement;let st={accent:'cyan',mode:'dark'};
try{const v=JSON.parse(localStorage.getItem('mcpefun-theme')||'null');if(v)st=Object.assign(st,v)}catch(_){}
function apply(){
 root.dataset.theme=st.mode;
 if(st.accent==='cyan')root.removeAttribute('data-accent');else root.dataset.accent=st.accent;
 document.querySelectorAll('[data-accent]').forEach(b=>{if(b.tagName==='BUTTON')b.setAttribute('aria-pressed',b.dataset.accent===st.accent)});
 document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.mode===st.mode));
 try{localStorage.setItem('mcpefun-theme',JSON.stringify(st))}catch(_){}
}
const pop=document.getElementById('pop'),btn=document.getElementById('themeBtn');
function show(o){pop.hidden=!o;btn.setAttribute('aria-expanded',o)}
btn.addEventListener('click',e=>{e.stopPropagation();show(pop.hidden)});
pop.addEventListener('click',e=>{e.stopPropagation();const b=e.target.closest('button');if(!b)return;
 if(b.dataset.accent)st.accent=b.dataset.accent;if(b.dataset.mode)st.mode=b.dataset.mode;apply()});
document.addEventListener('click',()=>show(false));
document.addEventListener('keydown',e=>{if(e.key==='Escape')show(false)});
apply();
})();

/* ===== Live data, checkout & leaderboard ===== */
(function(){
const $=s=>document.querySelector(s),esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const j=async(u,o)=>{const r=await fetch(u,o),d=await r.json().catch(()=>({}));if(!r.ok)throw d.error||'Something went wrong. Try again.';return d};
const post=b=>({method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(b)});
const NAME=/^[A-Za-z0-9][A-Za-z0-9 ]{1,14}[A-Za-z0-9]$/,items=()=>Object.keys(cart).map(id=>({id,qty:cart[id]}));
const toast=t=>{const e=$('#toast');e.textContent=t;e.hidden=false;setTimeout(()=>e.hidden=true,9000)};
j('/api/products').then(d=>{P.length=0;P.push(...d);shop($('[data-tab][aria-selected=true]').dataset.tab);render()}).catch(()=>{});
async function status(){try{const s=await j('/api/status');$('#sdot').style.background=s.online?'#22c55e':'#ef4444';$('#stxt').textContent=s.online?'Online · '+s.players+'/'+s.max+' players':'Server offline';$('#online').textContent=s.online?s.players:'0'}catch(_){}}
status();setInterval(status,60000);
j('/api/discord').then(d=>{if(d.invite)$('#dc').href=d.invite;if(d.members)$('#dc').textContent='Discord · '+d.members+' online'}).catch(()=>{});
let by='playtime';const cols={playtime:'Hours played',kills:'Kills',wins:'Wins'};
async function lb(){$('#lbCol').textContent=cols[by];try{const d=await j('/api/leaderboard?by='+by);$('#lbBody').innerHTML=d.length?d.map((p,i)=>'<tr><td>'+(i+1)+'</td><td>'+esc(p.name)+'</td><td>'+(by==='playtime'?Math.floor(p.playtime/60):p[by])+'</td></tr>').join(''):'<tr><td colspan="3" class="empty">No stats yet. Play on the server to appear here.</td></tr>'}catch(_){}}
document.addEventListener('click',e=>{const b=e.target.closest('[data-by]');if(!b)return;by=b.dataset.by;document.querySelectorAll('[data-by]').forEach(x=>x.setAttribute('aria-selected',x===b));lb()});
lb();
j('/api/info').then(d=>{$('#staffList').innerHTML=d.staff.map(s=>'<li>'+esc(s.name)+'<span>'+esc(s.role)+'</span></li>').join('');
 $('#voteList').innerHTML=d.voteSites.map(v=>'<div class="card"><h3>'+esc(v.name)+'</h3><p style="margin-bottom:18px">Vote once every 24 hours.</p><a class="btn" href="'+esc(v.url)+'" target="_blank" rel="noopener">Vote now</a></div>').join('');
 if(d.voteReward)$('#voteReward').textContent='Reward: '+d.voteReward+'. Vote on each site once a day.'}).catch(()=>{});
let applied=null;const _r=render;
async function applyCode(silent){const code=$('#code').value.trim();if(!code||!Object.keys(cart).length){applied=null;return}
 try{const d=await j('/api/coupon',post({code,items:items()}));applied=d;$('#total').textContent=m$(d.due/100);if(!silent)$('#msg').textContent='Code applied: −'+m$(d.off/100)}catch(e){applied=null;if(!silent)$('#msg').textContent=e}}
render=function(){_r();if(applied)applyCode(true)};
$('#applyCode').onclick=()=>applyCode(false);
function check(){const a=$('#tag').value.trim(),b=$('#tag2').value.trim();let t='';
 if(a&&!NAME.test(a))t='Use 3–16 letters, numbers or spaces.';else if(b&&a!==b)t='Names don’t match. Check for typos.';
 $('#nameHint').textContent=t;return !t&&NAME.test(a)&&a===b}
$('#tag').oninput=$('#tag2').oninput=check;
$('#checkout').onclick=async()=>{const m=$('#msg'),b=$('#checkout');
 if(!Object.keys(cart).length){m.textContent='Add an item before checking out.';return}
 if(!check()){m.textContent=$('#nameHint').textContent||'Enter your in-game name twice.';return}
 if(!$('#terms').checked){m.textContent='Accept the rules and terms to continue.';return}
 b.disabled=true;m.textContent='Opening secure payment…';
 try{const d=await j('/api/checkout',post({name:$('#tag').value.trim(),items:items(),code:$('#code').value.trim()||undefined,terms:true}));location.href=d.url}
 catch(e){m.textContent=e;b.disabled=false}};
const q=new URLSearchParams(location.search);
if(q.has('paid')){toast('Payment received. Items arrive in-game within a minute. Rejoin if you don’t see them.');history.replaceState(null,'','/')}
if(q.has('cancelled')){toast('Checkout cancelled. Add items to the cart to try again.');history.replaceState(null,'','/')}
})();
