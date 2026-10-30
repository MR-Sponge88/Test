'use strict';
const storageKey = 'juniper-demo-v1';
const initial = () => ({
  balances: { checking: 328450, savings: 1240000 },
  transactions: [
    { id:'seed-1', name:'Northstar Studio', category:'Salary', date:'2026-10-30T09:00:00Z', account:'checking', amount:320000, icon:'N' },
    { id:'seed-2', name:'Little & Local', category:'Food & drink', date:'2026-10-29T12:30:00Z', account:'checking', amount:-845, icon:'L' },
    { id:'seed-3', name:'Savings contribution', category:'Transfer', date:'2026-10-28T10:00:00Z', account:'savings', amount:25000, icon:'→' },
    { id:'seed-4', name:'Savings contribution', category:'Transfer', date:'2026-10-28T10:00:00Z', account:'checking', amount:-25000, icon:'→' },
    { id:'seed-5', name:'Green Basket', category:'Groceries', date:'2026-10-27T16:00:00Z', account:'checking', amount:-6230, icon:'G' },
    { id:'seed-6', name:'City Transport', category:'Travel', date:'2026-10-26T08:00:00Z', account:'checking', amount:-480, icon:'C' }
  ]
});
const $ = id => document.getElementById(id);
const names = {checking:'Everyday', savings:'Savings'};
const money = cents => new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP'}).format(cents/100);
const validAmount = n => Number.isSafeInteger(n) && n >= 0;
function validState(s) {
  return s && s.balances && Object.keys(names).every(k=>validAmount(s.balances[k])) && s.transactions instanceof Array && s.transactions.length <= 10000 && s.transactions.every(t=> t && typeof t.name==='string' && typeof t.category==='string' && typeof t.icon==='string' && Object.hasOwn(names,t.account) && Number.isSafeInteger(t.amount) && !Number.isNaN(Date.parse(t.date)));
}
let state=initial(), storageAvailable=true, pending=null;
try { const saved=localStorage.getItem(storageKey); if(saved){const parsed=JSON.parse(saved);if(validState(parsed))state=parsed;} } catch { storageAvailable=false; }
function persist(){try{localStorage.setItem(storageKey,JSON.stringify(state));}catch{storageAvailable=false;}}
function status(message,error=false){$('form-status').textContent=message;$('form-status').className=error?'error':'success';}
function render(){
 const total=state.balances.checking+state.balances.savings;
 $('total-balance').textContent=money(total);
 $('checking-balance').textContent=money(state.balances.checking);
 $('savings-balance').textContent=money(state.balances.savings);
 $('savings-share').textContent=(total?Math.round(state.balances.savings/total*100):0)+'%';
 $('from').options[0].textContent=`Everyday · ${money(state.balances.checking)}`;
 $('from').options[1].textContent=`Savings · ${money(state.balances.savings)}`;
 const search=$('search').value.trim().toLowerCase(),filter=$('account-filter').value;
 const rows=state.transactions.filter(t=>(filter==='all'||t.account===filter)&&`${t.name} ${t.category}`.toLowerCase().includes(search));
 $('transaction-count').textContent=`${rows.length} entries`;
 const fragment=document.createDocumentFragment();
 for(const t of rows){
  const tr=document.createElement('tr');
  const label=document.createElement('td');
  const wrap=document.createElement('div');wrap.className='transaction-name';
  const icon=document.createElement('span');icon.className='transaction-icon';icon.textContent=t.icon;
  const text=document.createElement('div');text.textContent=t.name;const sub=document.createElement('small');sub.textContent=t.category;text.append(sub);wrap.append(icon,text);label.append(wrap);tr.append(label);
  for(const value of [new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'short',timeZone:'Europe/London'}).format(new Date(t.date)),names[t.account]]){const td=document.createElement('td');td.textContent=value;tr.append(td);}
  const amount=document.createElement('td');amount.className='amount'+(t.amount>0?' credit':'');amount.textContent=(t.amount>0?'+':'−')+money(Math.abs(t.amount));tr.append(amount);fragment.append(tr);
 }
 $('transactions').replaceChildren(fragment);$('empty').hidden=rows.length!==0;
}
$('today').textContent=new Intl.DateTimeFormat('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:'Europe/London'}).format(new Date()).toUpperCase();
$('search').addEventListener('input',render);$('account-filter').addEventListener('change',render);
$('from').addEventListener('change',()=>{$('to').value=$('from').value==='checking'?'savings':'checking';});
function validate(from,to,cents){
 if(!Object.hasOwn(names,from)||!Object.hasOwn(names,to)||from===to)return 'Choose two different accounts.';
 if(!validAmount(cents)||cents<1)return 'Enter a valid amount of at least £0.01, with no more than two decimal places.';
 if(cents>state.balances[from])return 'There are not enough demo funds in this account.';
 if(!Number.isSafeInteger(state.balances[to]+cents))return 'This amount exceeds the demo account limit.';
 return '';
}
$('transfer-form').addEventListener('submit',e=>{
 e.preventDefault();const raw=$('amount').value.trim();
 if(!/^\d+(\.\d{1,2})?$/.test(raw)){status('Enter a positive amount with no more than two decimal places.',true);return;}
 const from=$('from').value,to=$('to').value,cents=Math.round(Number(raw)*100);const error=validate(from,to,cents);
 if(error){status(error,true);return;}
 pending={from,to,cents};$('confirmation-details').textContent=`Move ${money(cents)} from ${names[from]} to ${names[to]}?`;
 $('confirmation').returnValue='';$('confirmation').showModal();
});
$('confirmation').addEventListener('close',()=>{
 const transfer=pending;pending=null;if($('confirmation').returnValue!=='confirm'||!transfer)return;
 const {from,to,cents}=transfer;const error=validate(from,to,cents);if(error){status(error,true);return;}
 state.balances[from]-=cents;state.balances[to]+=cents;
 const date=new Date().toISOString(),id=crypto.randomUUID();
 state.transactions.unshift({id:id+'-out',name:`Transfer to ${names[to]}`,category:'Internal transfer',date,account:from,amount:-cents,icon:'→'},{id:id+'-in',name:`Transfer from ${names[from]}`,category:'Internal transfer',date,account:to,amount:cents,icon:'←'});
 persist();render();$('amount').value='';status(`${money(cents)} transferred to ${names[to]}.${storageAvailable?'':' Browser storage is unavailable; changes last for this session only.'}`);
});
$('reset').addEventListener('click',()=>{if(!window.confirm('Reset all demo balances and transactions?'))return;state=initial();persist();$('search').value='';$('account-filter').value='all';$('transfer-form').reset();render();status('Demo balances and transactions reset.');});
render();
if(!storageAvailable)status('Browser storage is unavailable; changes last for this session only.');
