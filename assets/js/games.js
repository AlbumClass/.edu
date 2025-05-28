document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos ---
    const catalog       = document.getElementById('catalog');
    const numericSect   = document.getElementById('game-numeric');
    const backCatalog   = document.getElementById('back-to-catalog');
    const numericGame   = document.getElementById('numeric-game');
    const startS        = document.getElementById('start-single');
    const startM        = document.getElementById('start-multi');
    const diffSel       = document.getElementById('difficulty');
    const boardEl       = document.getElementById('game-board');
    const targetEl      = document.getElementById('target');
    const timerEl       = document.getElementById('timer');
    const timerBar      = document.getElementById('timer-bar');
    const scoreEls      = {1:document.getElementById('score1'),2:document.getElementById('score2')};
    const playersWrapper= document.getElementById('players-container');
    const opBtns        = document.querySelectorAll('.op-btn');
    const clearBtn      = document.getElementById('clear-selection');
    const calcBtn       = document.getElementById('calculate');
    const newBtn        = document.getElementById('new-round');
    const calcDisp      = document.getElementById('calculation-display');
    const resMsg        = document.getElementById('result-message');
    const playBtns      = document.querySelectorAll('.game-card__btn');
  
    // --- Estado ---
    let mode='single', current=1, scores={1:0,2:0}, tiles=[], target=0;
    let selected={tiles:[],op:null}, timer, timeLeft;
  
    // --- Helpers ---
    const fmtTime = s => {
      const m=String(Math.floor(s/60)).padStart(2,'0'),
            sec=String(s%60).padStart(2,'0');
      return `${m}:${sec}`;
    };
    const shuffle = arr => arr.sort(()=>Math.random()-0.5);
  
    // --- Navegación catálogo ↔ juego ---
    playBtns.forEach(btn=>{
      btn.onclick = () => {
        catalog.classList.add('hidden');
        numericSect.classList.remove('hidden');
      };
    });
    backCatalog.onclick = () => {
      numericSect.classList.add('hidden');
      catalog.classList.remove('hidden');
      resetGame();
    };
  
    // --- Flow ---
    function resetGame(){
      clearInterval(timer);
      numericGame.classList.add('hidden');
    }
    function startGame(m){
      mode=m; current=1; scores={1:0,2:0};
      scoreEls[1].textContent='0'; scoreEls[2].textContent='0';
      playersWrapper.classList.toggle('hidden', m==='single');
      document.getElementById('player1').classList.add('current');
      document.getElementById('player2').classList.remove('current');
  
      numericGame.classList.remove('hidden');
      newRound();
    }
  
    function newRound(){
      // reset selección & mensajes
      selected={tiles:[],op:null};
      document.querySelectorAll('.tile').forEach(t=>t.remove());
      calcDisp.textContent='';
      resMsg.textContent='';
  
      // config
      const d=diffSel.value;
      let count, maxN;
      if(d==='easy'){count=6; maxN=10; timeLeft=90;}
      else if(d==='medium'){count=8; maxN=20; timeLeft=60;}
      else {count=10; maxN=30; timeLeft=45;}
  
      // genera fichas
      tiles = Array.from({length:count}, ()=>Math.ceil(Math.random()*maxN));
      // objetivo = suma de DOS fichas garantizando solución
      const [a,b] = shuffle(tiles).slice(0,2);
      target = a + b;
      targetEl.textContent = target;
  
      // render fichas
      tiles.forEach((n,i)=>{
        const t = document.createElement('div');
        t.className = 'tile'; t.textContent = n;
        t.dataset.i = i;
        t.onclick = () => selectTile(i);
        boardEl.appendChild(t);
      });
  
      // timer
      updateTimerBar();
      clearInterval(timer);
      timer = setInterval(()=>{
        timeLeft--;
        updateTimerBar();
        if(timeLeft<=0){
          clearInterval(timer);
          resMsg.textContent = '⏰ Se acabó el tiempo';
          if(mode==='multi') switchPlayer();
        }
      },1000);
    }
  
    function updateTimerBar(){
      timerEl.textContent = fmtTime(timeLeft);
      const max = diffSel.value==='easy'?90: diffSel.value==='medium'?60:45;
      timerBar.style.width = `${(timeLeft/max)*100}%`;
    }
  
    // selección
    function selectTile(i){
      const el = document.querySelector(`.tile[data-i="${i}"]`);
      if(el.classList.contains('used') || selected.tiles.length>=2) return;
      if(selected.tiles.includes(i)) return;
      el.classList.add('selected');
      selected.tiles.push(i);
      updateCalcDisplay();
    }
  
    opBtns.forEach(b=>{
      b.onclick = () => {
        opBtns.forEach(x=>x.classList.remove('selected'));
        b.classList.add('selected');
        selected.op = b.dataset.op;
        updateCalcDisplay();
      };
    });
  
    function updateCalcDisplay(){
      const [i,j] = selected.tiles;
      let txt = '';
      if(i!=null) txt += tiles[i];
      if(selected.op) txt += ` ${selected.op} `;
      if(j!=null) txt += tiles[j];
      calcDisp.textContent = txt;
    }
  
    // cálculo
    calcBtn.onclick = () => {
      if(selected.tiles.length!==2 || !selected.op){
        resMsg.textContent = '❗ Selecciona 2 fichas y 1 operación';
        return;
      }
      const [i,j] = selected.tiles, [x,y] = [tiles[i],tiles[j]];
      let res;
      switch(selected.op){
        case '+': res = x+y; break;
        case '-': res = x-y; break;
        case '×': res = x*y; break;
        case '÷':
          if(y===0||x%y!==0){
            resMsg.textContent='❗ División inválida'; return;
          }
          res = x/y; break;
      }
  
      // marca usados
      [i,j].forEach(idx=>{
        const tile = document.querySelector(`.tile[data-i="${idx}"]`);
        tile.classList.add('used');
        tile.classList.remove('selected');
      });
  
      // añade resultado como nueva ficha
      tiles.push(res);
      const ni = tiles.length-1;
      const newTile = document.createElement('div');
      newTile.className='tile'; newTile.textContent=res; newTile.dataset.i=ni;
      newTile.onclick = () => selectTile(ni);
      boardEl.appendChild(newTile);
  
      // victoria
      if(res === target){
        clearInterval(timer);
        resMsg.textContent = '🎉 ¡Objetivo alcanzado!';
        const pts = Math.floor(timeLeft/5)+1;
        scores[current] += pts;
        scoreEls[current].textContent = scores[current];
        if(mode==='multi'){
          setTimeout(switchPlayer, 1500);
        }
      }
  
      // reset selección
      selected={tiles:[],op:null};
      opBtns.forEach(x=>x.classList.remove('selected'));
      calcDisp.textContent = '';
    };
  
    clearBtn.onclick   = () => { selected={tiles:[],op:null}; opBtns.forEach(x=>x.classList.remove('selected')); calcDisp.textContent=''; resMsg.textContent=''; };
    newBtn.onclick     = () => newRound();
    startS.onclick     = () => startGame('single');
    startM.onclick     = () => startGame('multi');
  
    function switchPlayer(){
      current = current===1?2:1;
      document.getElementById('player1').classList.toggle('current', current===1);
      document.getElementById('player2').classList.toggle('current', current===2);
      newRound();
    }
  });
  