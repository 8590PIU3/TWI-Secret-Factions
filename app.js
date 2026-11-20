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
function go(screen){for(const s of ['home','create','join','matches','pick','notifications'])$(s).classList.toggle('hidden',s!==screen);document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t.dataset.go===(['create','join'].includes(screen)?'home':screen)));const headings={home:['GAME ROOM',stored.game||'Alpha Quadrant','La tua galassia. Le tue scelte segrete.'],create:['NUOVA PARTITA','Crea una partita','Organizza la tua prossima conquista.'],join:['INVITO','Entra in partita','Unisciti al tuo gruppo.'],matches:['PARTITE','Le tue partite','Prepara la prossima conquista galattica.'],pick:['FAZIONI','Un universo di possibilità','Scegli la tua fazione e due riserve.'],notifications:['NOTIFICHE','Rimani aggiornato','Messaggi dalla tua galassia.']}[screen];$('hero-label').textContent=headings[0];$('hero-title').textContent=headings[1];$('hero-sub').textContent=headings[2];window.scrollTo(0,0);
                    

if (screen === 'matches') {
  loadGameStatus();
  loadPlayerCount();
  loadRevealedFaction();
  loadOrganizerGameHealth();
  loadMyConfirmationStatus();
}

if (screen === 'pick') {
  loadMyConfirmationStatus();
}

if (screen === 'home') {
  loadMyRevealedFaction();
}

if (screen === 'notifications') {
  loadGameNotifications();
}

}
document.querySelectorAll('[data-go]').forEach(el=>el.addEventListener('click',()=>go(el.dataset.go)));
function options(){
const available = $('pok').checked
  ? [...base, ...pok, ...thunder]
  : base;
;for(let i=0;i<3;i++){const el=$('pick'+i),old=el.value||stored.picks?.[i]||'';el.replaceChildren(new Option('Scegli una fazione',''),...available.map(f=>new Option(f,f)));el.value=available.includes(old)?old:'';}$('catalogue-count').textContent=available.length+' fazioni disponibili'}
options();$('pok').addEventListener('change',options);
function update(){const d=JSON.parse(localStorage.getItem('ti-demo')||'{}');$('progress-number').textContent=d.picks?'1/1':'0/1';$('progress-desc').textContent=d.picks?'Le tue preferenze sono state confermate.':'Conferma le tue tre fazioni per prepararti alla partita.';$('match-date').textContent=d.date?`Partita: ${d.date} · ${d.time||'19:00'}`:'Nessuna data impostata';
$('my-faction').textContent = 'Ancora segreta';
$('faction-state').textContent=d.picks?'Preferenza principale salvata su questo dispositivo.':'Non hai ancora confermato le tue preferenze.';$('match-name').textContent=d.game||'Alpha Quadrant';$('match-info').textContent=d.date?`${d.date} · ${d.time||'19:00'} · 
${d.pok?'Base + Prophecy of Kings + Thunder\'s Edge':'Solo base + Thunder\'s Edge'}
`:'Partita dimostrativa';
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




$('join-btn').onclick = async () => {
  const button = $('join-btn');
  const message = $('join-msg');

  const playerName = $('join-name').value.trim();
  const inviteCode = $('join-code').value.trim().toUpperCase();

  if (!playerName || !inviteCode) {
    message.textContent = 'Inserisci il tuo nome e il codice invito.';
    return;
  }

  button.disabled = true;
  message.textContent = 'Ingresso nella partita in corso...';

  try {
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError) throw sessionError;

    if (!sessionData.session) {
      const { error: signInError } =
        await supabase.auth.signInAnonymously();

      if (signInError) throw signInError;
    }

    const { data, error } = await supabase.rpc(
      'join_game',
      {
        p_invite_code: inviteCode,
        p_player_name: playerName
      }
    );

    if (error) throw error;

    const joined = Array.isArray(data) ? data[0] : data;

    if (!joined?.game_id) {
      throw new Error('Impossibile recuperare la partita.');
    }

    const scheduledAt = new Date(joined.scheduled_at);

    const gameData = {
      name: playerName,
      game: joined.game_title,
      game_id: joined.game_id,
      
player_id: joined.player_id,

      invite_code: inviteCode,
      date: [
        scheduledAt.getFullYear(),
        String(scheduledAt.getMonth() + 1).padStart(2, '0'),
        String(scheduledAt.getDate()).padStart(2, '0')
      ].join('-'),
      time: [
        String(scheduledAt.getHours()).padStart(2, '0'),
        String(scheduledAt.getMinutes()).padStart(2, '0')
      ].join(':'),
      pok: true,
      picks: null
    };

    localStorage.setItem('ti-demo', JSON.stringify(gameData));
    Object.assign(stored, gameData);

    update();
    restoreOnlineGame();
    go('matches');

    message.textContent = '';
  } catch (error) {
    message.textContent = 'Errore: ' + error.message;
  } finally {
    button.disabled = false;
  }
};



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



$('save').onclick = async () => {
  const button = $('save');
  const message = $('message');

  const picks = [0, 1, 2].map(i => $('pick' + i).value);

  if (!picks.every(Boolean) || new Set(picks).size !== 3) {
    message.textContent = 'Seleziona tre fazioni differenti.';
    return;
  }

  const gameData = JSON.parse(
    localStorage.getItem('ti-demo') || '{}'
  );

  if (!gameData.game_id) {
    message.textContent =
      'Devi prima creare una partita o entrare con un codice invito.';
    return;
  }

  if (confirmedGameId === gameData.game_id) {
    message.textContent = 'Preferenze già confermate: non modificabili.';
    return;
  }

  button.disabled = true;
  message.textContent = 'Salvataggio delle preferenze in corso...';

  try {
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError) throw sessionError;

    if (!sessionData.session) {
      throw new Error(
        'Sessione scaduta. Rientra nella partita prima di confermare.'
      );
    }

    const factionIds = {
      'The Arborec': 'arborec',
      'The Barony of Letnev': 'letnev',
      'The Clan of Saar': 'saar',
      'The Embers of Muaat': 'muaat',
      'The Emirates of Hacan': 'hacan',
      'The Federation of Sol': 'sol',
      'The Ghosts of Creuss': 'ghosts',
      'The L1Z1X Mindnet': 'l1z1x',
      'The Mentak Coalition': 'mentak',
      'The Naalu Collective': 'naalu',
      'The Nekro Virus': 'nekro',
      'Sardakk N’orr': 'sardakk',
      'The Universities of Jol-Nar': 'jolnar',
      'The Winnu': 'winnu',
      'The Xxcha Kingdom': 'xxcha',
      'The Yin Brotherhood': 'yin',
      'The Yssaril Tribes': 'yssaril',
      'The Argent Flight': 'argent',
      'The Empyrean': 'empyrean',
      'The Mahact Gene-Sorcerers': 'mahact',
      'The Naaz-Rokha Alliance': 'naazrokha',
      'The Nomad': 'nomad',
      'The Titans of Ul': 'titans',
      'The Vuil’Raith Cabal': 'vuilraith',
      'The Crimson Rebellion': 'crimson',
      'The Deepwrought Scholarate': 'deepwrought',
      'The Firmament / The Obsidian': 'firmament',
      'Last Bastion': 'lastbastion',
      'The Ral Nel Consortium': 'ralnel',
      'The Council Keleres': 'keleres'
    };

    const ids = picks.map(name => factionIds[name]);

    if (ids.some(id => !id)) {
      throw new Error('Una delle fazioni non è riconosciuta.');
    }

    const { error } = await supabase.rpc(
      'confirm_factions',
      {
        p_game_id: gameData.game_id,
        p_primary: ids[0],
        p_backup_1: ids[1],
        p_backup_2: ids[2]
      }
    );

    if (error) throw error;

    const updated = { ...gameData, picks };

    localStorage.setItem('ti-demo', JSON.stringify(updated));
    Object.assign(stored, updated);

    message.textContent = 'Preferenze confermate online!';
    confirmedGameId = gameData.game_id;
    renderConfirmationState(true);
    update();

  } catch (error) {
    message.textContent = 'Errore: ' + error.message;
  } finally {
    button.disabled = false;
  }
};


let confirmedGameId = null;

function renderConfirmationState(confirmed) {
  const button = $('match-pick-button');
  const saveButton = $('save');
  if (button) {
    button.textContent = confirmed ? 'Preferenze già confermate' : 'Seleziona le tue fazioni';
    button.disabled = confirmed;
  }
  if (saveButton) saveButton.disabled = confirmed;
  for (let i = 0; i < 3; i++) {
    const select = $('pick' + i);
    if (select) select.disabled = confirmed;
  }
  if (confirmed) {
    $('message').textContent = 'Preferenze già confermate online: non modificabili.';
  }
}

async function loadMyConfirmationStatus() {
  const gameData = JSON.parse(localStorage.getItem('ti-demo') || '{}');
  confirmedGameId = null;
  renderConfirmationState(false);
  if (!gameData.game_id) return;

  const button = $('match-pick-button');
  const saveButton = $('save');
  if (button) button.disabled = true;
  if (saveButton) saveButton.disabled = true;
  try {
    const { data, error } = await supabase.rpc('get_my_faction_confirmation', {
      p_game_id: gameData.game_id
    });
    if (error) throw error;
    const current = JSON.parse(localStorage.getItem('ti-demo') || '{}');
    if (current.game_id !== gameData.game_id) return;
    confirmedGameId = data ? gameData.game_id : null;
    renderConfirmationState(Boolean(data));
  } catch (error) {
    console.error('Errore verifica preferenze:', error);
    const current = JSON.parse(localStorage.getItem('ti-demo') || '{}');
    if (current.game_id !== gameData.game_id) return;
    if (button) button.textContent = 'Verifica preferenze non disponibile';
    $('message').textContent = 'Impossibile verificare le preferenze. Riprova più tardi.';
  }
}

async function loadGameStatus() {
  const statusElement = $('game-status');

  if (!statusElement) return;

  const gameData = JSON.parse(
    localStorage.getItem('ti-demo') || '{}'
  );

  if (!gameData.game_id) {
    statusElement.textContent = 'Nessuna partita online selezionata';
    return;
  }

  statusElement.textContent = 'Caricamento...';

  try {
    const { data, error } = await supabase
      .from('games')
      .select('status')
      .eq('id', gameData.game_id)
      .single();

    if (error) throw error;

    const labels = {
      open: 'Aperta — preferenze in raccolta',
      locked: 'Chiusa — assegnazione effettuata',
      revealed: 'Rivelata — fazioni pubblicate'
    };

    statusElement.textContent =
      labels[data.status] || 'Stato sconosciuto';

  } catch (error) {
    console.error('Errore caricamento partita:', error);
    statusElement.textContent = 'Stato non disponibile';
  }
}


async function loadPlayerCount() {
  const countElement = $('player-count');

  if (!countElement) return;

  const gameData = JSON.parse(
    localStorage.getItem('ti-demo') || '{}'
  );

  if (!gameData.game_id) {
    countElement.textContent = 'Nessuna partita selezionata';
    return;
  }

  countElement.textContent = 'Caricamento...';

  try {
    const { data, error } = await supabase.rpc(
      'get_game_player_count',
      { p_game_id: gameData.game_id }
    );

    if (error) throw error;

    countElement.textContent = String(data);

  } catch (error) {
    console.error('Errore conteggio giocatori:', error);
    countElement.textContent = 'Non disponibile';
  }
}



async function loadMyRevealedFaction() {
  const factionElement = $('my-faction');
  const stateElement = $('faction-state');
  if (!factionElement || !stateElement) return;

  const gameData = JSON.parse(localStorage.getItem('ti-demo') || '{}');
  if (!gameData.game_id) return;

  try {
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('status')
      .eq('id', gameData.game_id)
      .single();

    if (gameError) throw gameError;
    if (game.status !== 'revealed') return;

    const { data: factionId, error: factionError } = await supabase.rpc(
      'get_my_revealed_faction',
      { p_game_id: gameData.game_id }
    );
    if (factionError) throw factionError;

    // Do not display an unassigned faction as a confirmed assignment.
    if (!factionId) {
      factionElement.textContent = 'Non assegnata';
      stateElement.textContent = 'Nessuna fazione assegnata disponibile.';
      return;
    }

    const { data: faction, error: nameError } = await supabase
      .from('factions')
      .select('name')
      .eq('id', factionId)
      .single();
    if (nameError) throw nameError;

    // Ignore a delayed response if the selected game changed.
    const current = JSON.parse(localStorage.getItem('ti-demo') || '{}');
    if (current.game_id !== gameData.game_id) return;

    factionElement.textContent = faction.name;
    stateElement.textContent = 'La tua fazione è stata rivelata ufficialmente.';
  } catch (error) {
    console.error('Errore caricamento fazione personale:', error);
    const current = JSON.parse(localStorage.getItem('ti-demo') || '{}');
    if (current.game_id !== gameData.game_id) return;
    factionElement.textContent = 'Non disponibile';
    stateElement.textContent = 'Impossibile verificare la fazione rivelata.';
  }
}

async function loadRevealedFaction() {
  const resultElement = $('revealResult');
  if (!resultElement) return;

  const gameData = JSON.parse(
    localStorage.getItem('ti-demo') || '{}'
  );

  if (!gameData.game_id) {
    resultElement.textContent = '';
    return;
  }

  resultElement.textContent = '';

  try {
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('status')
      .eq('id', gameData.game_id)
      .single();

    if (gameError) throw gameError;

    if (game.status !== 'revealed') {
      return;
    }

    
const { data: revealed, error: revealError } =
  await supabase.rpc('get_revealed_factions', {
    p_game_id: gameData.game_id
  });

if (revealError) throw revealError;


resultElement.replaceChildren();

if (!revealed || revealed.length === 0) {
  resultElement.textContent =
    'Nessuna assegnazione disponibile.';
  return;
}

const { data: factions, error: factionsError } =
  await supabase
    .from('factions')
    .select('id, name');

if (factionsError) throw factionsError;

const factionNames = new Map(
  (factions || []).map(faction => [
    faction.id,
    faction.name
  ])
);

const heading = document.createElement('h3');
heading.textContent = 'Fazioni rivelate';
resultElement.appendChild(heading);

const list = document.createElement('ul');

for (const player of revealed) {
  const item = document.createElement('li');

  const playerName = player.player_name || 'Giocatore';
  const factionId = player.faction_id;

  item.textContent = factionId
    ? `${playerName}: ${factionNames.get(factionId) || factionId}`
    : `${playerName}: fazione non assegnata`;

  list.appendChild(item);
}

resultElement.appendChild(list);



  } catch (error) {
    console.error('Errore verifica rivelazione:', error);
    resultElement.textContent =
      'Impossibile verificare la rivelazione.';
  }
}


async function loadOrganizerGameHealth() {
  const card = $('organizer-health-card');
  const status = $('organizer-health-status');
  if (!card || !status) return;

  // Never retain an organizer panel when switching games.
  card.classList.add('hidden');
  const selected = JSON.parse(localStorage.getItem('ti-demo') || '{}');
  if (!selected.game_id) return;

  try {
    const { data, error } = await supabase.rpc(
      'get_organizer_game_health',
      { p_game_id: selected.game_id }
    );
    if (error) {
      // Expected for participants who are not organizers.
      if (error.message?.includes('Accesso riservato')) return;
      throw error;
    }

    const current = JSON.parse(localStorage.getItem('ti-demo') || '{}');
    if (current.game_id !== selected.game_id) return;

    $('organizer-players').textContent = String(data.players);
    $('organizer-confirmed').textContent = String(data.confirmed);
    $('organizer-assigned').textContent = String(data.assigned_count);
    // Use the authoritative scheduled_at from Supabase, not local demo fields.
    const scheduledAt = new Date(data.scheduled_at);
    const italianDate = value => new Intl.DateTimeFormat('it-IT', {
      timeZone: 'Europe/Rome',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(value);
    if (!Number.isNaN(scheduledAt.getTime())) {
      $('organizer-assignment-date').textContent =
        italianDate(new Date(scheduledAt.getTime() - 24 * 60 * 60 * 1000));
      $('organizer-reveal-date').textContent =
        italianDate(new Date(scheduledAt.getTime() - 12 * 60 * 60 * 1000));
    } else {
      $('organizer-assignment-date').textContent = 'Non disponibile';
      $('organizer-reveal-date').textContent = 'Non disponibile';
    }


    if (data.assignment_overdue) {
      status.textContent = 'Attenzione: assegnazione in ritardo';
    } else if (data.reveal_overdue) {
      status.textContent = 'Attenzione: rivelazione in ritardo';
    } else if (data.status === 'revealed') {
      status.textContent = 'Rivelazione completata';
    } else if (data.status === 'locked') {
      status.textContent = 'Assegnazione completata, in attesa della rivelazione';
    } else {
      status.textContent = 'Regolare, in attesa dell’assegnazione';
    }
    card.classList.remove('hidden');
  } catch (error) {
    console.error('Errore stato organizzatore:', error);
    const current = JSON.parse(localStorage.getItem('ti-demo') || '{}');
    if (current.game_id !== selected.game_id) return;
    status.textContent = 'Stato tecnico non disponibile';
    card.classList.remove('hidden');
  }
}

$('organizer-health-refresh')?.addEventListener('click', loadOrganizerGameHealth);


function formatRomeDate(date) {
  return new Intl.DateTimeFormat('it-IT', {
    timeZone: 'Europe/Rome',
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(date);
}

async function loadGameNotifications() {
  const feed = $('notifications-feed');
  const gameLabel = $('notifications-game');
  if (!feed || !gameLabel) return;
  const selected = JSON.parse(localStorage.getItem('ti-demo') || '{}');
  feed.replaceChildren();
  if (!selected.game_id) {
    gameLabel.textContent = 'Nessuna partita online selezionata';
    feed.textContent = 'Crea una partita o entra con un codice invito per vedere gli aggiornamenti.';
    return;
  }
  gameLabel.textContent = 'Caricamento partita...';
  feed.textContent = 'Verifica aggiornamenti in corso...';

  const stillSelected = () =>
    JSON.parse(localStorage.getItem('ti-demo') || '{}').game_id === selected.game_id;

  const addItem = (heading, detail) => {
    const item = document.createElement('div');
    item.className = 'item';
    const strong = document.createElement('strong');
    strong.textContent = heading;
    const description = document.createElement('p');
    description.className = 'note';
    description.textContent = detail;
    item.append(strong, description);
    feed.appendChild(item);
  };

  try {
    const [gameResponse, confirmationResponse] = await Promise.all([
      supabase.from('games').select('title,status,scheduled_at')
        .eq('id', selected.game_id).single(),
      supabase.rpc('get_my_faction_confirmation', { p_game_id: selected.game_id })
    ]);
    if (gameResponse.error) throw gameResponse.error;
    if (confirmationResponse.error) throw confirmationResponse.error;
    if (!stillSelected()) return;

    const game = gameResponse.data;
    const start = new Date(game.scheduled_at);
    if (Number.isNaN(start.getTime())) throw new Error('Data della partita non valida');
    gameLabel.textContent = game.title || 'Partita online';
    feed.replaceChildren();

    addItem(
      confirmationResponse.data ? 'Preferenze confermate' : 'Preferenze da confermare',
      confirmationResponse.data
        ? 'Le tue tre preferenze sono salvate online e non possono più essere modificate.'
        : 'Non risultano ancora tre preferenze confermate per il tuo account.'
    );
    addItem(
      game.status === 'open' ? 'Assegnazione programmata' : 'Fase di assegnazione',
      game.status === 'open'
        ? 'Prevista il ' + formatRomeDate(new Date(start.getTime() - 86400000)) + '.'
        : 'La fase di raccolta delle preferenze è terminata.'
    );
    addItem(
      game.status === 'revealed' ? 'Rivelazione completata' : 'Rivelazione programmata',
      game.status === 'revealed'
        ? 'Le fazioni sono state rivelate. Consulta la scheda Partite.'
        : 'Prevista il ' + formatRomeDate(new Date(start.getTime() - 43200000)) + '. Fino ad allora le fazioni restano segrete.'
    );

    // The health endpoint only authorizes the organizer; never show its
    // technical alerts to other participants.
    const healthResponse = await supabase.rpc('get_organizer_game_health', {
      p_game_id: selected.game_id
    });
    if (!stillSelected()) return;
    if (!healthResponse.error && healthResponse.data) {
      const health = healthResponse.data;
      if (health.assignment_overdue || health.reveal_overdue) {
        addItem(
          'Attenzione: ritardo automatico',
          health.assignment_overdue
            ? 'L’assegnazione non risulta completata entro il termine previsto.'
            : 'La rivelazione non risulta completata entro il termine previsto.'
        );
      } else {
        addItem('Controllo organizzatore', 'Nessun ritardo automatico rilevato.');
      }
    }
  } catch (error) {
    console.error('Errore notifiche partita:', error);
    if (!stillSelected()) return;
    gameLabel.textContent = 'Aggiornamenti non disponibili';
    feed.textContent = 'Impossibile verificare gli aggiornamenti online. Riprova.';
  }
}

$('notifications-refresh')?.addEventListener('click', loadGameNotifications);


update();go('home');loadGameStatus();
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('./sw.js', {
        updateViaCache: 'none'
      });
      const banner = $('app-update-banner');
      const updateButton = $('app-update-button');
      let waitingWorker = null;
      let refreshing = false;

      const showUpdate = () => {
        if (!navigator.serviceWorker.controller || !registration.waiting) return;
        waitingWorker = registration.waiting;
        banner?.classList.remove('hidden');
      };

      updateButton?.addEventListener('click', () => {
        if (!waitingWorker) return;
        updateButton.disabled = true;
        updateButton.textContent = 'Aggiornamento...';
        waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      });

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });

      registration.addEventListener('updatefound', () => {
        const installing = registration.installing;
        installing?.addEventListener('statechange', () => {
          if (installing.state === 'installed') showUpdate();
        });
      });
      showUpdate();

      // Recheck when the user returns to the app, and periodically while open.
      const checkForUpdate = () => registration.update().catch(error =>
        console.warn('Controllo aggiornamenti non riuscito:', error)
      );
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) checkForUpdate();
      });
      window.addEventListener('focus', checkForUpdate);
      window.setInterval(checkForUpdate, 60 * 60 * 1000);
      checkForUpdate();
    } catch (error) {
      console.warn('Service worker non disponibile:', error);
    }
  });
}
