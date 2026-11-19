import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://hzwgpjtlvvjdryoiwbcf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_64zz7c3qQsFv3eUiKmiPvg_QiaLwEt6';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const base=['The Arborec','The Barony of Letnev','The Clan of Saar','The Embers of Muaat','The Emirates of Hacan','The Federation of Sol','The Ghosts of Creuss','The L1Z1X Mindnet','The Mentak Coalition','The Naalu Collective','The Nekro Virus',"Sardakk N’orr",'The Universities of Jol-Nar','The Winnu','The Xxcha Kingdom','The Yin Brotherhood','The Yssaril Tribes'];
const pok=['The Argent Flight','The Empyrean','The Mahact Gene-Sorcerers','The Naaz-Rokha Alliance','The Nomad','The Titans of Ul',"The Vuil’Raith Cabal"];


const thunder = [
  'The Crimson Rebellion',
  'The Deepwrought Scholarate',
  'The Firmament / The Obsidian',
  'Last Bastion',
  'The Ral Nel Consortium',
  'The Council Keleres'
];



const $=id=>document.getElementById(id);let assigned=null;const stored=JSON.parse(localStorage.getItem('ti-demo')||'{}');
for(const key of ['name','game','date','time'])if(stored[key])$(key).value=stored[key];if(typeof stored.pok==='boolean')$('pok').checked=stored.pok;
function go(screen){for(const s of ['home','create','join','matches','pick','notifications'])$(s).classList.toggle('hidden',s!==screen);document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t.dataset.go===(['create','join'].includes(screen)?'home':screen)));const headings={home:['GAME ROOM',stored.game||'Alpha Quadrant','La tua galassia. Le tue scelte segrete.'],create:['NUOVA PARTITA','Crea una partita','Organizza la tua prossima conquista.'],join:['INVITO','Entra in partita','Unisciti al tuo gruppo.'],matches:['PARTITE','Le tue partite','Prepara la prossima conquista galattica.'],pick:['FAZIONI','Un universo di possibilità','Scegli la tua fazione e due riserve.'],notifications:['NOTIFICHE','Rimani aggiornato','Messaggi dalla tua galassia.']}[screen];$('hero-label').textContent=headings[0];$('hero-title').textContent=headings[1];$('hero-sub').textContent=headings[2];window.scrollTo(0,0)}
document.querySelectorAll('[data-go]').forEach(el=>el.addEventListener('click',()=>go(el.dataset.go)));
function options(){
const available = $('pok').checked
  ? [...base, ...pok, ...thunder]
  : base;
;for(let i=0;i<3;i++){const el=$('pick'+i),old=el.value||stored.picks?.[i]||'';el.replaceChildren(new Option('Scegli una fazione',''),...available.map(f=>new Option(f,f)));el.value=available.includes(old)?old:'';}$('catalogue-count').textContent=available.length+' fazioni disponibili'}
options();$('pok').addEventListener('change',options);
function update(){const d=JSON.parse(localStorage.getItem('ti-demo')||'{}');$('progress-number').textContent=d.picks?'1/1':'0/1';$('progress-desc').textContent=d.picks?'Le tue preferenze sono state confermate.':'Conferma le tue tre fazioni per prepararti alla partita.';$('match-date').textContent=d.date?`Partita: ${d.date} · ${d.time||'19:00'}`:'Nessuna data impostata';$('my-faction').textContent=d.picks?.[0]||'Ancora segreta';$('faction-state').textContent=d.picks?'Preferenza principale salvata su questo dispositivo.':'Non hai ancora confermato le tue preferenze.';$('match-name').textContent=d.game||'Alpha Quadrant';$('match-info').textContent=d.date?`${d.date} · ${d.time||'19:00'} · ${d.pok?'Base + Prophecy of Kings':'Solo base'}`:'Partita dimostrativa';
$('invite-code').textContent = d.invite_code || 'Nessun codice disponibile';
}



function restoreOnlineGame() {
  const saved = JSON.parse(
    localStorage.getItem('ti-demo') || '{}'
  );

  if (!saved.game_id || !saved.invite_code) {
    return;
  }

  $('invite-code').textContent = saved.invite_code;
  $('match-name').textContent =
    saved.game || 'Partita online';

  $('match-info').textContent =
    `${saved.date || ''} · ${saved.time || ''} · Partita online`;
}

restoreOnlineGame();





$('create-btn').onclick = async () => {
  const button = $('create-btn');
  const message = $('create-msg');

  const playerName = $('name').value.trim();
  const gameTitle = $('game').value.trim();
  const date = $('date').value;
  const time = $('time').value;

  if (!playerName || !gameTitle || !date || !time) {
    message.textContent = 'Compila tutti i campi.';
    return;
  }

  const scheduledAt = new Date(`${date}T${time}`);

  if (
    Number.isNaN(scheduledAt.getTime()) ||
    scheduledAt.getTime() <= Date.now() + 24 * 60 * 60 * 1000
  ) {
    message.textContent =
      'La partita deve iniziare tra più di 24 ore.';
    return;
  }

  button.disabled = true;
  message.textContent = 'Creazione partita in corso...';

  try {
    let { data: { user }, error: authError } =
      await supabase.auth.getUser();

    if (!user) {
      const result = await supabase.auth.signInAnonymously();
      authError = result.error;
      user = result.data.user;
    }

    if (authError || !user) {
      throw authError || new Error('Accesso non riuscito.');
    }

    const { data, error } = await supabase.rpc(
      'create_game',
      {
        p_title: gameTitle,
        p_scheduled_at: scheduledAt.toISOString(),
        p_player_name: playerName
      }
    );

    if (error) throw error;

    const created = Array.isArray(data) ? data[0] : data;

    if (!created?.game_id || !created?.invite_code) {
      throw new Error('Supabase non ha restituito il codice invito.');
    }

    const gameData = {
      name: playerName,
      game: gameTitle,
      date,
      time,
      pok: $('pok').checked,
      game_id: created.game_id,
      invite_code: created.invite_code,
      picks: null
    };

    localStorage.setItem('ti-demo', JSON.stringify(gameData));
    Object.assign(stored, gameData);

    $('invite-code').textContent = created.invite_code;
    $('match-info').textContent =
      `${date} · ${time} · Partita online`;
    $('match-name').textContent = gameTitle;

    update();
    go('matches');

    message.textContent = '';
  } catch (error) {
    message.textContent = 'Errore: ' + error.message;
  } finally {
    button.disabled = false;
  }
};



$('join-btn').onclick=()=>{$('join-msg').textContent='Il codice sarà utilizzabile quando attiveremo il multiplayer online. Per ora puoi provare la partita demo.'};


$('copy-code').onclick = async () => {
  const button = $('copy-code');
  const code = $('invite-code').textContent.trim();

  if (!code || code === 'TI4827') {
    button.textContent = 'Codice non disponibile';
    return;
  }

  try {
    await navigator.clipboard.writeText(code);
    button.textContent = 'Copiato!';
  } catch (error) {
    button.textContent = 'Copia manualmente';
  }
};


$('save').onclick=()=>{const picks=[0,1,2].map(i=>$('pick'+i).value);if(!picks.every(Boolean)||new Set(picks).size!==3){$('message').textContent='Seleziona tre fazioni differenti.';return}const d={...JSON.parse(localStorage.getItem('ti-demo')||'{}'),name:$('name').value.trim()||'Tu',game:$('game').value,pok:$('pok').checked,picks};localStorage.setItem('ti-demo',JSON.stringify(d));Object.assign(stored,d);$('message').textContent='Preferenze salvate su questo dispositivo.';assigned=null;$('result').textContent='';$('reveal').disabled=true;$('revealResult').replaceChildren();update();go('home')};
$('resolve').onclick=()=>{const d=JSON.parse(localStorage.getItem('ti-demo')||'{}');if(!d.picks){$('result').textContent='Conferma prima le tue tre fazioni.';return}const people=[{name:'Marco',picks:['The Federation of Sol','The Emirates of Hacan','The Naalu Collective']},{name:'Anna',picks:['The Emirates of Hacan','The Universities of Jol-Nar','The Arborec']},{name:'Luca',picks:['The Naalu Collective','The Clan of Saar','The Ghosts of Creuss']},{name:d.name,picks:d.picks}];const used=new Set();for(const p of people){p.final=null;p.rank=-1}for(let rank=0;rank<3;rank++)for(const p of people){const f=p.picks[rank];if(!p.final&&f&&!used.has(f)){p.final=f;p.rank=rank;used.add(f)}}assigned=people;const me=people.at(-1);$('result').textContent=me.final?`Assegnazione privata: ${me.final} (${me.rank===0?'principale':me.rank===1?'prima riserva':'seconda riserva'}).`:'Tutte le tue preferenze sono occupate: devi scegliere nuovamente.';$('reveal').disabled=people.some(p=>!p.final);$('revealResult').replaceChildren()};
$('reveal').onclick=()=>{if(!assigned)return;const box=$('revealResult');box.replaceChildren();for(const p of assigned){const item=document.createElement('div');item.className='item';item.textContent=`${p.name} — ${p.final}`;box.append(item)}};
update();go('home');if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
