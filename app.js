import {initializeApp} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import {getDatabase,ref,set,get,update,onValue,push,remove} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";

const firebaseConfig={
 apiKey:"AIzaSyDoo5RbGkMXhMIiursEXhj7jG8tN_QkmrE",
 authDomain:"sprintopoly-74ccd.firebaseapp.com",
 databaseURL:"https://sprintopoly-74ccd-default-rtdb.firebaseio.com",
 projectId:"sprintopoly-74ccd",
 storageBucket:"sprintopoly-74ccd.firebasestorage.app",
 messagingSenderId:"235505202765",
 appId:"1:235505202765:web:f676ec5d971b020c3d4e04"
};
const db=getDatabase(initializeApp(firebaseConfig));
const $=id=>document.getElementById(id), colors=["#ff4f78","#3d9cff","#32c66d","#ff9d27","#9258ee"];
let room="",me="",isHost=false,state=null,unsub=null;
const spaces=[
["SALIDA","🏁","#ffd4e2"],["EMPEZAR","●","#b8efca"],["PARAR","●","#ffc0c0"],["CONTINUAR","●","#ffd9a5"],["KUDOS","●","#b9d8fb"],["SORPRESA","●","#d8c3fa"],["OTRA VEZ","●","#fff0a0"],["EMPEZAR","●","#b8efca"],
["PARAR","●","#ffc0c0"],["KUDOS","●","#b9d8fb"],["CONTINUAR","●","#ffd9a5"],["SORPRESA","●","#d8c3fa"],["EMPEZAR","●","#b8efca"],
["OTRA VEZ","●","#fff0a0"],["PARAR","●","#ffc0c0"],["CONTINUAR","●","#ffd9a5"],["KUDOS","●","#b9d8fb"],["SORPRESA","●","#d8c3fa"],["EMPEZAR","●","#b8efca"],["SORPRESA","●","#d8c3fa"],["KUDOS","●","#b9d8fb"],["OTRA VEZ","●","#fff0a0"],["CONTINUAR","●","#ffd9a5"],["PARAR","●","#ffc0c0"]
];
const prompts={
EMPEZAR:["EMPEZAR","¿Qué deberíamos comenzar a hacer como equipo?"],
PARAR:["PARAR","¿Qué deberíamos dejar de hacer?"],
CONTINUAR:["CONTINUAR","¿Qué funcionó bien y deberíamos continuar haciendo?"],
KUDOS:["KUDOS","Reconoce algo concreto que hizo bien otra persona del equipo."]
};
const surprises=[
["🐞 BUG INESPERADO","¿Qué fue lo más inesperado que ocurrió durante este Sprint?"],
["👾 JEFE FINAL","¿Cuál fue el mayor obstáculo del Sprint?"],
["⚡ POWER-UP","¿Qué hizo que el trabajo fluyera mejor?"],
["↩️ CTRL + Z","Si pudieras deshacer una decisión del Sprint, ¿cuál sería?"],
["🔐 NIVEL SECRETO","¿Qué aprendizaje obtuvimos que no esperábamos?"],
["🔥 MODO DIFÍCIL","¿Qué fue más complicado de lo esperado?"],
["🎁 BONUS","¿Qué salió bien y casi nadie reconoció?"],
["🧩 DEUDA TÉCNICA","¿Qué estamos posponiendo y deberíamos atender?"],
["🧭 CAMBIO DE RUMBO","¿Qué haríamos diferente si repitiéramos este Sprint?"],
["🎲 SUERTE","¿Qué momento del Sprint te gustaría destacar?"]
];
function code(){return Math.random().toString(36).slice(2,7).toUpperCase()}
function toast(t){$("toast").textContent=t;$("toast").style.display="block";setTimeout(()=>$("toast").style.display="none",2500)}
function show(id){["home","lobby","game"].forEach(x=>$(x).classList.add("hidden"));$(id).classList.remove("hidden")}
async function createRoom(){
 let name=$("hostName").value.trim(); if(!name)return toast("Escribe tu nombre");
 room=code(); me=crypto.randomUUID(); isHost=true;
 await set(ref(db,"rooms/"+room),{host:me,status:"lobby",turn:0,players:{[me]:{name,color:colors[0],pos:0,order:0}},round:null});
 localStorage.setItem("sp_me",me); listen(); show("lobby")
}
async function joinRoom(){
 let name=$("joinName").value.trim(),c=$("roomCode").value.trim().toUpperCase(); if(!name||!c)return toast("Completa nombre y código");
 let snap=await get(ref(db,"rooms/"+c)); if(!snap.exists())return toast("Sala no encontrada");
 let data=snap.val(), ps=Object.values(data.players||{}); if(ps.length>=5)return toast("La sala ya está llena");
 room=c; me=crypto.randomUUID(); isHost=false; let used=ps.map(p=>p.order),ord=[0,1,2,3,4].find(x=>!used.includes(x));
 await set(ref(db,`rooms/${room}/players/${me}`),{name,color:colors[ord],pos:0,order:ord});
 localStorage.setItem("sp_me",me); listen(); show("lobby")
}
function listen(){onValue(ref(db,"rooms/"+room),s=>{if(!s.exists())return;state=s.val();render()})}
function sortedPlayers(){return Object.entries(state?.players||{}).sort((a,b)=>a[1].order-b[1].order)}
function render(){
 $("lobbyCode").textContent=room; let ps=sortedPlayers(); $("count").textContent=`${ps.length}/5 jugadores`;
 $("lobbyPlayers").innerHTML=ps.map(([id,p])=>`<div class="lobbyPlayer"><span class="token" style="background:${p.color}"></span><b>${esc(p.name)}</b>${id===state.host?" 👑":""}</div>`).join("");
 $("startBtn").classList.toggle("hidden",!(isHost&&ps.length===5));
 if(state.status==="game"){show("game");drawBoard();renderPlayers();renderRound()}
}
function drawBoard(){
 const b=$("board"); b.querySelectorAll(".space,.piece").forEach(e=>e.remove());
 const coords=[]; for(let c=1;c<=8;c++)coords.push([1,c]); for(let r=2;r<=6;r++)coords.push([r,8]); for(let c=7;c>=1;c--)coords.push([6,c]); for(let r=5;r>=2;r--)coords.push([r,1]);
 spaces.forEach((s,i)=>{let d=document.createElement("div");d.className="space";d.style.gridRow=coords[i][0];d.style.gridColumn=coords[i][1];d.style.background=s[2];d.innerHTML=`<span class="dot">${s[1]}</span><span>${s[0]}</span>`;b.appendChild(d)});
 sortedPlayers().forEach(([id,p],j)=>{let pos=coords[p.pos%spaces.length],d=document.createElement("div");d.className="piece";d.style.background=p.color;d.style.gridRow=pos[0];d.style.gridColumn=pos[1];d.style.alignSelf="end";d.style.justifySelf="start";d.style.margin=`0 0 ${5+(j%2)*24}px ${5+Math.floor(j/2)*24}px`;b.appendChild(d)})
}
function renderPlayers(){
 let ps=sortedPlayers(), current=ps[state.turn%ps.length];
 $("players").innerHTML=ps.map(([id,p],i)=>`<div class="player ${i===state.turn?"active":""}"><span class="token" style="background:${p.color}"></span><div><b>${esc(p.name)}</b><br><small>Casilla ${p.pos} · ${spaces[p.pos][0]}</small></div></div>`).join("");
 $("turnText").textContent=current?`Turno de ${current[1].name}`:"";
 $("rollBtn").disabled=!current||current[0]!==me||!!state.round;
 document.querySelectorAll(".hostOnly").forEach(x=>x.style.display=isHost?"block":"none")
}
async function roll(){
 let ps=sortedPlayers(),cur=ps[state.turn]; if(!cur||cur[0]!==me||state.round)return;
 $("rollBtn").disabled=true; let n=1+Math.floor(Math.random()*6); $("die").textContent=["⚀","⚁","⚂","⚃","⚄","⚅"][n-1];
 let newPos=(cur[1].pos+n)%spaces.length,type=spaces[newPos][0];
 await update(ref(db,`rooms/${room}/players/${me}`),{pos:newPos});
 if(type==="OTRA VEZ"){toast(`${cur[1].name} tira otra vez`);return}
 if(type==="SALIDA"){await nextTurn();return}
 let q= type==="SORPRESA"?surprises[Math.floor(Math.random()*surprises.length)]:prompts[type];
 await set(ref(db,`rooms/${room}/round`),{type,title:q[0],question:q[1],answers:{},roller:me});
}
function renderRound(){
 if(!state.round){$("promptModal").classList.add("hidden");return}
 let r=state.round; $("promptModal").classList.remove("hidden"); $("promptTitle").textContent=r.title;$("promptQuestion").textContent=r.question;
 let answers=r.answers||{}, mine=answers[me]; $("answer").classList.toggle("hidden",!!mine);$("submitAnswer").classList.toggle("hidden",!!mine);
 $("answerStatus").textContent=`${Object.keys(answers).length}/${sortedPlayers().length} respuestas recibidas`;
 let all=Object.keys(answers).length===sortedPlayers().length;
 $("revealed").classList.toggle("hidden",!all); $("continueBtn").classList.toggle("hidden",!(all&&isHost));
 if(all)$("revealed").innerHTML=sortedPlayers().map(([id,p])=>`<div class="answerCard" style="border-color:${p.color}"><b>${esc(p.name)}</b><br>${esc(answers[id]||"")}</div>`).join("")
}
async function submitAnswer(){
 let v=$("answer").value.trim();if(!v)return toast("Escribe una respuesta");
 await set(ref(db,`rooms/${room}/round/answers/${me}`),v);$("answer").value=""
}
async function nextTurn(){let ps=sortedPlayers();await update(ref(db,"rooms/"+room),{turn:(state.turn+1)%ps.length,round:null})}
async function continueRound(){
 let r=state.round;if(!r)return;
 let key=push(ref(db,`rooms/${room}/history`)).key;
 await set(ref(db,`rooms/${room}/history/${key}`),r);await nextTurn()
}
async function start(){await update(ref(db,"rooms/"+room),{status:"game",turn:0})}
async function reset(){if(confirm("¿Reiniciar posiciones y respuestas?")){let ups={turn:0,round:null,history:null};sortedPlayers().forEach(([id])=>ups[`players/${id}/pos`]=0);await update(ref(db,"rooms/"+room),ups)}}
function summary(){
 $("summaryModal").classList.remove("hidden");let h=state.history||{}, groups={EMPEZAR:[],PARAR:[],CONTINUAR:[],KUDOS:[],SORPRESA:[]};
 Object.values(h).forEach(r=>{let g=groups[r.type]||groups.SORPRESA;Object.values(r.answers||{}).forEach(a=>g.push(a))});
 $("summaryContent").innerHTML=Object.entries(groups).map(([k,v])=>`<div class="section"><h3>${k}</h3>${v.length?v.map(x=>`<div class="answerCard">${esc(x)}</div>`).join(""):"<p class='muted'>Sin respuestas todavía.</p>"}</div>`).join("")
}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
$("createBtn").onclick=createRoom;$("joinBtn").onclick=joinRoom;$("startBtn").onclick=start;$("rollBtn").onclick=roll;$("submitAnswer").onclick=submitAnswer;$("continueBtn").onclick=continueRound;$("resetBtn").onclick=reset;$("summaryBtn").onclick=summary;$("closeSummary").onclick=()=>$("summaryModal").classList.add("hidden");
