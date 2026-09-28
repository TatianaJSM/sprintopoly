import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  get,
  update,
  onValue,
  push
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";
/* =====================================================
   FIREBASE
===================================================== */
const firebaseConfig = {
  apiKey: "AIzaSyDoo5RbGkMXhMIiursEXhj7jG8tN_QkmrE",
  authDomain: "sprintopoly-74ccd.firebaseapp.com",
  databaseURL: "https://sprintopoly-74ccd-default-rtdb.firebaseio.com",
  projectId: "sprintopoly-74ccd",
  storageBucket: "sprintopoly-74ccd.firebasestorage.app",
  messagingSenderId: "235505202765",
  appId: "1:235505202765:web:f676ec5d971b020c3d4e04"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
/* =====================================================
   VARIABLES
===================================================== */
const $ = id => document.getElementById(id);
const colors = [
  "#ff4f78",
  "#3d9cff",
  "#32c66d",
  "#ff9d27",
  "#9258ee"
];
const diceFaces = [
  "⚀",
  "⚁",
  "⚂",
  "⚃",
  "⚄",
  "⚅"
];
let room = "";
let me = "";
let state = null;
let animationRunning = false;
let activeAnimationId = null;
let visualPositions = {};
let rollPending = false;
/* =====================================================
   TABLERO
===================================================== */
const spaces = [
  ["SALIDA", "🏁", "#ffd4e2"],
  ["EMPEZAR", "●", "#b8efca"],
  ["PARAR", "●", "#ffc0c0"],
  ["CONTINUAR", "●", "#ffd9a5"],
  ["KUDOS", "●", "#b9d8fb"],
  ["SORPRESA", "●", "#d8c3fa"],
  ["OTRA VEZ", "●", "#fff0a0"],
  ["EMPEZAR", "●", "#b8efca"],
  ["PARAR", "●", "#ffc0c0"],
  ["KUDOS", "●", "#b9d8fb"],
  ["CONTINUAR", "●", "#ffd9a5"],
  ["SORPRESA", "●", "#d8c3fa"],
  ["EMPEZAR", "●", "#b8efca"],
  ["OTRA VEZ", "●", "#fff0a0"],
  ["PARAR", "●", "#ffc0c0"],
  ["CONTINUAR", "●", "#ffd9a5"],
  ["KUDOS", "●", "#b9d8fb"],
  ["SORPRESA", "●", "#d8c3fa"],
  ["EMPEZAR", "●", "#b8efca"],
  ["SORPRESA", "●", "#d8c3fa"],
  ["KUDOS", "●", "#b9d8fb"],
  ["OTRA VEZ", "●", "#fff0a0"],
  ["CONTINUAR", "●", "#ffd9a5"],
  ["PARAR", "●", "#ffc0c0"]
];
/* =====================================================
   PREGUNTAS
   10 POR CATEGORÍA NORMAL
===================================================== */
const prompts = {
  EMPEZAR: [
    [
      "🌱 EMPEZAR",
      "¿Qué deberíamos comenzar a hacer como equipo en el próximo Sprint?"
    ],
    [
      "🚀 NUEVO IMPULSO",
      "¿Qué práctica nueva podría ayudarnos a trabajar mejor?"
    ],
    [
      "💡 NUEVA IDEA",
      "¿Qué podríamos probar en el próximo Sprint que todavía no hemos intentado?"
    ],
    [
      "🛠️ MEJORA",
      "¿Qué herramienta o recurso deberíamos empezar a utilizar?"
    ],
    [
      "🤝 EQUIPO",
      "¿Qué podríamos empezar a hacer para mejorar la colaboración entre nosotros?"
    ],
    [
      "📢 COMUNICACIÓN",
      "¿Qué deberíamos comenzar a comunicar con mayor claridad?"
    ],
    [
      "⏱️ ORGANIZACIÓN",
      "¿Qué hábito podríamos comenzar a aplicar para organizarnos mejor?"
    ],
    [
      "🎯 ENFOQUE",
      "¿Qué deberíamos comenzar a hacer para tener más claro qué es prioritario?"
    ],
    [
      "🧠 APRENDIZAJE",
      "¿Qué conocimiento o habilidad sería útil comenzar a desarrollar como equipo?"
    ],
    [
      "🔍 PREVENCIÓN",
      "¿Qué podríamos comenzar a revisar antes para detectar problemas con mayor anticipación?"
    ]
  ],
  PARAR: [
    [
      "🛑 PARAR",
      "¿Qué deberíamos dejar de hacer porque no está aportando al equipo?"
    ],
    [
      "⌛ PÉRDIDA DE TIEMPO",
      "¿Qué actividad nos hizo perder tiempo durante este Sprint?"
    ],
    [
      "🚧 BLOQUEO",
      "¿Qué comportamiento o proceso nos está dificultando avanzar?"
    ],
    [
      "🔁 REPETICIÓN",
      "¿Qué estamos haciendo repetidamente que podríamos simplificar?"
    ],
    [
      "📢 COMUNICACIÓN",
      "¿Qué forma de comunicarnos está generando confusión y deberíamos cambiar?"
    ],
    [
      "📚 SOBRECARGA",
      "¿Qué estamos haciendo de más sin obtener suficiente beneficio?"
    ],
    [
      "🐌 LENTITUD",
      "¿Qué parte de nuestra forma de trabajar está haciendo que avancemos más lento?"
    ],
    [
      "❌ MAL HÁBITO",
      "¿Qué hábito del equipo deberíamos intentar eliminar?"
    ],
    [
      "🎯 DISTRACCIÓN",
      "¿Qué nos está quitando atención de las tareas realmente importantes?"
    ],
    [
      "🧱 OBSTÁCULO",
      "¿Qué podríamos dejar de hacer para reducir bloqueos en el próximo Sprint?"
    ]
  ],
  CONTINUAR: [
    [
      "🔄 CONTINUAR",
      "¿Qué funcionó bien y deberíamos continuar haciendo?"
    ],
    [
      "✨ FUNCIONÓ",
      "¿Qué práctica del equipo dio buenos resultados durante este Sprint?"
    ],
    [
      "💪 FORTALEZA",
      "¿Qué estamos haciendo particularmente bien como equipo?"
    ],
    [
      "🤝 COLABORACIÓN",
      "¿Qué forma de trabajar juntos deberíamos mantener?"
    ],
    [
      "📢 COMUNICACIÓN",
      "¿Qué hicimos bien al comunicarnos durante este Sprint?"
    ],
    [
      "⚡ FLUJO",
      "¿Qué ayudó a que el trabajo avanzara con mayor facilidad?"
    ],
    [
      "🎯 ORGANIZACIÓN",
      "¿Qué hicimos bien para mantenernos organizados?"
    ],
    [
      "🛠️ HERRAMIENTAS",
      "¿Qué herramienta o método nos funcionó bien y deberíamos seguir utilizando?"
    ],
    [
      "📈 PROGRESO",
      "¿Qué cambio que hicimos anteriormente está dando buenos resultados?"
    ],
    [
      "🧩 EQUIPO",
      "¿Qué dinámica del equipo te gustaría conservar para el próximo Sprint?"
    ]
  ],
  KUDOS: [
    [
      "👏 KUDOS",
      "Reconoce algo concreto que hizo bien otra persona del equipo."
    ],
    [
      "🌟 RECONOCIMIENTO",
      "¿Quién te ayudó durante este Sprint y de qué manera?"
    ],
    [
      "💪 GRAN APORTE",
      "Menciona un aporte de otra persona que haya ayudado al equipo a avanzar."
    ],
    [
      "🤝 BUEN COMPAÑERO",
      "¿Qué acción de otra persona facilitó tu trabajo durante este Sprint?"
    ],
    [
      "🏆 MOMENTO DESTACADO",
      "Reconoce algo que hizo un compañero y que consideras que merece destacarse."
    ],
    [
      "💡 BUENA IDEA",
      "¿Qué idea de otra persona ayudó a mejorar el trabajo del equipo?"
    ],
    [
      "🦸 AL RESCATE",
      "¿Hubo alguien que ayudó a resolver un problema importante? ¿Qué hizo?"
    ],
    [
      "🎯 BUEN TRABAJO",
      "Menciona una tarea que otra persona realizó particularmente bien."
    ],
    [
      "💬 GRACIAS",
      "¿A quién del equipo le agradecerías algo de este Sprint y por qué?"
    ],
    [
      "✨ APORTE INVISIBLE",
      "Reconoce algún esfuerzo de un compañero que pudo haber pasado desapercibido."
    ]
  ]
};
/* =====================================================
   30 PREGUNTAS SORPRESA
===================================================== */
const surprises = [
  [
    "🐞 BUG INESPERADO",
    "¿Qué fue lo más inesperado que ocurrió durante este Sprint?"
  ],
  [
    "👾 JEFE FINAL",
    "¿Cuál fue el mayor obstáculo del Sprint?"
  ],
  [
    "⚡ POWER-UP",
    "¿Qué hizo que el trabajo fluyera mejor?"
  ],
  [
    "↩️ CTRL + Z",
    "Si pudieras deshacer una decisión del Sprint, ¿cuál sería?"
  ],
  [
    "🔐 NIVEL SECRETO",
    "¿Qué aprendizaje obtuvimos que no esperábamos?"
  ],
  [
    "🔥 MODO DIFÍCIL",
    "¿Qué tarea fue más complicada de lo esperado?"
  ],
  [
    "🎁 BONUS",
    "Menciona algo pequeño que salió bien y casi nadie reconoció."
  ],
  [
    "🧩 DEUDA TÉCNICA",
    "¿Qué estamos posponiendo y deberíamos atender pronto?"
  ],
  [
    "🧭 CAMBIO DE RUMBO",
    "¿Qué haríamos diferente si repitiéramos este Sprint?"
  ],
  [
    "🎲 SUERTE",
    "¿Qué momento de este Sprint te gustaría destacar?"
  ],
  [
    "⏰ CONTRARRELOJ",
    "¿En qué momento sentiste que nos faltó tiempo?"
  ],
  [
    "🗺️ CAMINO ALTERNATIVO",
    "¿Qué tarea podríamos haber realizado de una manera diferente?"
  ],
  [
    "💥 CRITICAL HIT",
    "¿Qué problema tuvo un impacto mayor del que esperábamos?"
  ],
  [
    "❤️ VIDA EXTRA",
    "¿Qué nos ayudó a recuperarnos después de un problema o atraso?"
  ],
  [
    "🕵️ MISTERIO",
    "¿Qué problema tardamos demasiado en detectar?"
  ],
  [
    "🎮 NUEVA PARTIDA",
    "Si mañana comenzáramos este Sprint nuevamente, ¿qué sería lo primero que cambiarías?"
  ],
  [
    "🏎️ SPEEDRUN",
    "¿Qué parte del Sprint logramos completar más fácilmente de lo esperado?"
  ],
  [
    "🧨 BOMBA",
    "¿Qué situación pudo convertirse en un problema grande si no se hubiera atendido?"
  ],
  [
    "🧠 XP EXTRA",
    "¿Qué aprendiste personalmente durante este Sprint?"
  ],
  [
    "🔧 REPARACIÓN",
    "¿Qué proceso del equipo necesita un pequeño ajuste?"
  ],
  [
    "📡 SIN SEÑAL",
    "¿En qué momento nos faltó comunicación?"
  ],
  [
    "🗝️ LLAVE SECRETA",
    "¿Qué fue clave para que pudiéramos completar el trabajo?"
  ],
  [
    "🌀 PORTAL",
    "¿Qué cambio inesperado modificó nuestra forma de trabajar durante el Sprint?"
  ],
  [
    "🪫 BATERÍA BAJA",
    "¿Qué actividad consumió mucho esfuerzo para el resultado que produjo?"
  ],
  [
    "💎 OBJETO RARO",
    "¿Qué descubrimiento de este Sprint deberíamos aprovechar en el futuro?"
  ],
  [
    "🛡️ ESCUDO",
    "¿Qué hicimos que evitó que apareciera un problema mayor?"
  ],
  [
    "🚨 ALERTA",
    "¿Qué señal de problema deberíamos detectar más rápido la próxima vez?"
  ],
  [
    "🧪 EXPERIMENTO",
    "¿Qué te gustaría probar de manera diferente en el próximo Sprint?"
  ],
  [
    "🎯 MISIÓN",
    "¿Qué objetivo del Sprint consideras que estuvo más claro para el equipo?"
  ],
  [
    "🧟 REVIVIÓ",
    "¿Qué problema que creíamos resuelto volvió a aparecer?"
  ]
];
/* =====================================================
   UTILIDADES
===================================================== */
function generateCode() {
  return Math.random()
    .toString(36)
    .slice(2, 7)
    .toUpperCase();
}
function sleep(ms) {
  return new Promise(
    resolve =>
      setTimeout(resolve, ms)
  );
}
function toast(text) {
  $("toast").textContent =
    text;
  $("toast").style.display =
    "block";
  setTimeout(() => {
    $("toast").style.display =
      "none";
  }, 2500);
}
function show(id) {
  [
    "home",
    "lobby",
    "game"
  ].forEach(screen => {
    $(screen)
      .classList
      .add("hidden");
  });
  $(id)
    .classList
    .remove("hidden");
}
function amIHost() {
  return (
    state &&
    state.host === me
  );
}
function sortedPlayers() {
  return Object
    .entries(
      state?.players || {}
    )
    .sort(
      (a, b) =>
        a[1].order -
        b[1].order
    );
}
function escapeHTML(value) {
  return String(
    value ?? ""
  ).replace(
    /[&<>"']/g,
    character => ({
      "&": "&",
      "<": "<",
      ">": ">",
      '"': """,
      "'": "'"
    })[character]
  );
}
/* =====================================================
   SISTEMA DE PREGUNTAS SIN REPETICIÓN
===================================================== */
/*
  Firebase guardará algo parecido a:
  usedQuestions: {
      EMPEZAR: {
          0: true,
          4: true
      },
      SORPRESA: {
          3: true
      }
  }
  Así sabemos exactamente cuáles ya aparecieron.
*/
function getQuestionPool(type) {
  if (type === "SORPRESA") {
    return surprises;
  }
  return prompts[type] || [];
}
/*
  Busca una pregunta que todavía
  NO se haya usado.
*/
function chooseUnusedQuestion(type) {
  const pool =
    getQuestionPool(type);
  if (!pool.length) {
    return null;
  }
  const used =
    state?.usedQuestions?.[type] || {};
  /*
    Creamos una lista con los índices
    que todavía están disponibles.
  */
  const available = [];
  pool.forEach(
    (question, index) => {
      if (!used[index]) {
        available.push(index);
      }
    }
  );
  /*
    Si todavía quedan preguntas nuevas,
    escogemos una al azar.
  */
  if (available.length > 0) {
    const randomPosition =
      Math.floor(
        Math.random() *
        available.length
      );
    const index =
      available[randomPosition];
    return {
      index,
      question:
        pool[index],
      recycled:
        false
    };
  }
  /*
    Si TODAS las preguntas de esa
    categoría ya se utilizaron,
    reiniciamos solamente ese mazo.
    Esto sería muy difícil que pase
    durante una retro normal, pero
    evita que el juego se quede pegado.
  */
  const index =
    Math.floor(
      Math.random() *
      pool.length
    );
  return {
    index,
    question:
      pool[index],
    recycled:
      true
  };
}
/* =====================================================
   CREAR SALA
===================================================== */
async function createRoom() {
  const name =
    $("hostName")
      .value
      .trim();
  if (!name) {
    toast(
      "Escribe tu nombre"
    );
    return;
  }
  room =
    generateCode();
  me =
    crypto.randomUUID();
  await set(
    ref(
      db,
      "rooms/" + room
    ),
    {
      host:
        me,
      status:
        "lobby",
      turn:
        0,
      players: {
        [me]: {
          name,
          color:
            colors[0],
          pos:
            0,
          order:
            0
        }
      },
      round:
        null,
      animation:
        null,
      /*
        Aquí se irán guardando
        automáticamente las preguntas
        que ya aparecieron.
      */
      usedQuestions:
        null
    }
  );
  localStorage.setItem(
    "sp_me",
    me
  );
  listen();
  show(
    "lobby"
  );
}
/* =====================================================
   UNIRSE
===================================================== */
async function joinRoom() {
  const name =
    $("joinName")
      .value
      .trim();
  const enteredCode =
    $("roomCode")
      .value
      .trim()
      .toUpperCase();
  if (
    !name ||
    !enteredCode
  ) {
    toast(
      "Completa nombre y código"
    );
    return;
  }
  const snapshot =
    await get(
      ref(
        db,
        "rooms/" +
        enteredCode
      )
    );
  if (!snapshot.exists()) {
    toast(
      "Sala no encontrada"
    );
    return;
  }
  const data =
    snapshot.val();
  const players =
    Object.values(
      data.players || {}
    );
  if (
    players.length >= 5
  ) {
    toast(
      "La sala ya está llena"
    );
    return;
  }
  if (
    data.status !== "lobby"
  ) {
    toast(
      "La partida ya comenzó"
    );
    return;
  }
  room =
    enteredCode;
  me =
    crypto.randomUUID();
  const usedOrders =
    players.map(
      player =>
        player.order
    );
  const order =
    [0, 1, 2, 3, 4]
      .find(
        number =>
          !usedOrders.includes(
            number
          )
      );
  await set(
    ref(
      db,
      `rooms/${room}/players/${me}`
    ),
    {
      name,
      color:
        colors[order],
      pos:
        0,
      order
    }
  );
  localStorage.setItem(
    "sp_me",
    me
  );
  listen();
  show(
    "lobby"
  );
}
/* =====================================================
   FIREBASE EN TIEMPO REAL
===================================================== */
function listen() {
  onValue(
    ref(
      db,
      "rooms/" + room
    ),
    snapshot => {
      if (!snapshot.exists()) {
        toast(
          "La sala ya no existe"
        );
        return;
      }
      state =
        snapshot.val();
      render();
      if (
        state.animation &&
        state.animation.id !==
        activeAnimationId
      ) {
        runSharedAnimation(
          state.animation
        );
      }
    }
  );
}
/* =====================================================
   RENDER
===================================================== */
function render() {
  if (!state) {
    return;
  }
  const players =
    sortedPlayers();
  $("lobbyCode")
    .textContent =
      room;
  $("count")
    .textContent =
      `${players.length}/5 jugadores`;
  $("lobbyPlayers")
    .innerHTML =
      players
        .map(
          ([id, player]) => `
            <div class="lobbyPlayer">
              <span
                class="token"
                style="
                  background:${player.color}
                "
              ></span>
              <b>
                ${escapeHTML(
                  player.name
                )}
              </b>
              ${
                id === state.host
                  ? " 👑"
                  : ""
              }
            </div>
          `
        )
        .join("");
  if (
    state.status === "game"
  ) {
    show(
      "game"
    );
    drawBoard();
    renderPlayers();
    if (
      !animationRunning &&
      !state.animation
    ) {
      renderRound();
    }
  }
}
/* =====================================================
   INICIAR JUEGO
===================================================== */
async function startGame() {
  if (!state) {
    toast(
      "La sala todavía está cargando"
    );
    return;
  }
  if (!amIHost()) {
    toast(
      "Solo el anfitrión puede iniciar"
    );
    return;
  }
  const players =
    sortedPlayers();
  if (
    players.length < 2
  ) {
    toast(
      "Se necesitan al menos 2 jugadores"
    );
    return;
  }
  if (
    players.length > 5
  ) {
    toast(
      "Máximo 5 jugadores"
    );
    return;
  }
  await update(
    ref(
      db,
      "rooms/" + room
    ),
    {
      status:
        "game",
      turn:
        0,
      round:
        null,
      animation:
        null,
      usedQuestions:
        null
    }
  );
}
/* =====================================================
   COORDENADAS
===================================================== */
function boardCoords() {
  const coords =
    [];
  for (
    let column = 1;
    column <= 8;
    column++
  ) {
    coords.push(
      [1, column]
    );
  }
  for (
    let row = 2;
    row <= 6;
    row++
  ) {
    coords.push(
      [row, 8]
    );
  }
  for (
    let column = 7;
    column >= 1;
    column--
  ) {
    coords.push(
      [6, column]
    );
  }
  for (
    let row = 5;
    row >= 2;
    row--
  ) {
    coords.push(
      [row, 1]
    );
  }
  return coords;
}
/* =====================================================
   DIBUJAR TABLERO
===================================================== */
function drawBoard() {
  const board =
    $("board");
  const coords =
    boardCoords();
  board
    .querySelectorAll(
      ".space,.piece"
    )
    .forEach(
      element =>
        element.remove()
    );
  spaces.forEach(
    (space, index) => {
      const element =
        document.createElement(
          "div"
        );
      element.className =
        "space";
      element.dataset.spaceIndex =
        index;
      element.style.gridRow =
        coords[index][0];
      element.style.gridColumn =
        coords[index][1];
      element.style.background =
        space[2];
      element.innerHTML = `
        <span class="dot">
          ${space[1]}
        </span>
        <span>
          ${space[0]}
        </span>
      `;
      board.appendChild(
        element
      );
    }
  );
  sortedPlayers()
    .forEach(
      ([id, player], index) => {
        const shownPosition =
          visualPositions[id] ??
          player.pos;
        const position =
          coords[
            shownPosition %
            spaces.length
          ];
        const piece =
          document.createElement(
            "div"
          );
        piece.className =
          "piece";
        piece.id =
          `piece-${id}`;
        piece.style.background =
          player.color;
        piece.style.gridRow =
          position[0];
        piece.style.gridColumn =
          position[1];
        piece.style.alignSelf =
          "end";
        piece.style.justifySelf =
          "start";
        piece.style.margin =
          `0 0 ${
            5 +
            (index % 2) * 24
          }px ${
            5 +
            Math.floor(
              index / 2
            ) * 24
          }px`;
        board.appendChild(
          piece
        );
      }
    );
}
/* =====================================================
   JUGADORES
===================================================== */
function renderPlayers() {
  const players =
    sortedPlayers();
  if (!players.length) {
    return;
  }
  const turnIndex =
    state.turn %
    players.length;
  const current =
    players[turnIndex];
  $("players")
    .innerHTML =
      players
        .map(
          ([id, player], index) => {
            const shownPosition =
              visualPositions[id] ??
              player.pos;
            return `
              <div
                class="
                  player
                  ${
                    index === turnIndex
                      ? "active"
                      : ""
                  }
                "
              >
                <span
                  class="token"
                  style="
                    background:${player.color}
                  "
                ></span>
                <div>
                  <b>
                    ${escapeHTML(
                      player.name
                    )}
                  </b>
                  <br>
                  <small>
                    Casilla
                    ${shownPosition}
                    ·
                    ${
                      spaces[
                        shownPosition
                      ][0]
                    }
                  </small>
                </div>
              </div>
            `;
          }
        )
        .join("");
  $("turnText")
    .textContent =
      current
        ? `Turno de ${current[1].name}`
        : "";
  $("rollBtn")
    .disabled =
      rollPending ||
      animationRunning ||
      !!state.animation ||
      !current ||
      current[0] !== me ||
      !!state.round;
  document
    .querySelectorAll(
      ".hostOnly"
    )
    .forEach(
      element => {
        element.style.display =
          amIHost()
            ? "block"
            : "none";
      }
    );
}
/* =====================================================
   TIRAR DADO
===================================================== */
async function roll() {
  const players =
    sortedPlayers();
  if (
    !players.length ||
    rollPending ||
    animationRunning ||
    state.animation
  ) {
    return;
  }
  const turnIndex =
    state.turn %
    players.length;
  const current =
    players[turnIndex];
  if (
    !current ||
    current[0] !== me ||
    state.round
  ) {
    return;
  }
  rollPending =
    true;
  renderPlayers();
  const number =
    1 +
    Math.floor(
      Math.random() * 6
    );
  const from =
    current[1].pos;
  const to =
    (
      from +
      number
    ) %
    spaces.length;
  const animation = {
    id:
      `${Date.now()}-${me}`,
    roller:
      me,
    from,
    to,
    roll:
      number
  };
  try {
    await set(
      ref(
        db,
        `rooms/${room}/animation`
      ),
      animation
    );
  }
  catch (error) {
    console.error(
      error
    );
    rollPending =
      false;
    renderPlayers();
    toast(
      "No se pudo tirar el dado"
    );
  }
}
/* =====================================================
   ANIMACIÓN LENTA
===================================================== */
async function runSharedAnimation(
  animation
) {
  if (
    !animation ||
    animation.id ===
    activeAnimationId
  ) {
    return;
  }
  activeAnimationId =
    animation.id;
  animationRunning =
    true;
  rollPending =
    false;
  $("promptModal")
    .classList
    .add("hidden");
  $("rollBtn").disabled =
    true;
  const players =
    sortedPlayers();
  const rollerPlayer =
    players.find(
      ([id]) =>
        id === animation.roller
    );
  const rollerName =
    rollerPlayer
      ? rollerPlayer[1].name
      : "Jugador";
  /* ================================
     1. DADO DURANTE 3 SEGUNDOS
  ================================= */
  $("diceMessage")
    .textContent =
      `${rollerName} está tirando el dado...`;
  const die =
    $("die");
  die.classList.add(
    "rolling"
  );
  for (
    let i = 0;
    i < 24;
    i++
  ) {
    die.textContent =
      diceFaces[
        Math.floor(
          Math.random() * 6
        )
      ];
    await sleep(
      125
    );
  }
  /* ================================
     2. RESULTADO
  ================================= */
  die.classList.remove(
    "rolling"
  );
  die.textContent =
    diceFaces[
      animation.roll - 1
    ];
  $("diceMessage")
    .textContent =
      `🎲 ${rollerName} sacó ${animation.roll}`;
  await sleep(
    1500
  );
  /* ================================
     3. MOVER CASILLA POR CASILLA
  ================================= */
  let currentPosition =
    animation.from;
  for (
    let step = 1;
    step <= animation.roll;
    step++
  ) {
    currentPosition =
      (
        currentPosition +
        1
      ) %
      spaces.length;
    visualPositions[
      animation.roller
    ] =
      currentPosition;
    drawBoard();
    renderPlayers();
    const piece =
      document.getElementById(
        `piece-${animation.roller}`
      );
    if (piece) {
      piece.classList.remove(
        "moving"
      );
      void piece.offsetWidth;
      piece.classList.add(
        "moving"
      );
    }
    $("diceMessage")
      .textContent =
        `🎩 ${rollerName} avanza ${step} de ${animation.roll}`;
    /*
      1 segundo por casilla.
    */
    await sleep(
      1000
    );
  }
  /* ================================
     4. CASILLA FINAL
  ================================= */
  const finalSpace =
    document.querySelector(
      `.space[data-space-index="${animation.to}"]`
    );
  if (finalSpace) {
    finalSpace.classList.add(
      "landed"
    );
  }
  $("diceMessage")
    .textContent =
      `📍 ${rollerName} cayó en ${spaces[animation.to][0]}`;
  /*
    2 segundos antes de mostrar
    la pregunta.
  */
  await sleep(
    2000
  );
  delete visualPositions[
    animation.roller
  ];
  /*
    Solamente quien tiró el dado
    crea la siguiente ronda.
  */
  if (
    animation.roller === me
  ) {
    await finishRoll(
      animation
    );
  }
  animationRunning =
    false;
  await sleep(
    200
  );
  if (state) {
    drawBoard();
    renderPlayers();
    renderRound();
  }
}
/* =====================================================
   FINALIZAR JUGADA
===================================================== */
async function finishRoll(
  animation
) {
  const type =
    spaces[
      animation.to
    ][0];
  /*
    Actualizamos la posición real.
  */
  await update(
    ref(
      db,
      `rooms/${room}/players/${animation.roller}`
    ),
    {
      pos:
        animation.to
    }
  );
  /* =================================================
     OTRA VEZ
  ================================================= */
  if (
    type ===
    "OTRA VEZ"
  ) {
    await set(
      ref(
        db,
        `rooms/${room}/animation`
      ),
      null
    );
    toast(
      "🎲 ¡Otra vez! Vuelve a tirar."
    );
    return;
  }
  /* =================================================
     SALIDA
  ================================================= */
  if (
    type ===
    "SALIDA"
  ) {
    await set(
      ref(
        db,
        `rooms/${room}/animation`
      ),
      null
    );
    await nextTurn();
    return;
  }
  /* =================================================
     BUSCAR PREGUNTA NUEVA
  ================================================= */
  const selected =
    chooseUnusedQuestion(
      type
    );
  if (!selected) {
    await set(
      ref(
        db,
        `rooms/${room}/animation`
      ),
      null
    );
    await nextTurn();
    return;
  }
  const question =
    selected.question;
  /*
    Si se agotó TODO el mazo de esa
    categoría, borramos únicamente
    las usadas de esa categoría y
    comenzamos el mazo nuevamente.
  */
  if (
    selected.recycled
  ) {
    await set(
      ref(
        db,
        `rooms/${room}/usedQuestions/${type}`
      ),
      null
    );
    toast(
      `🔄 Se completó el mazo de ${type}. Se barajó de nuevo.`
    );
  }
  /*
    MARCAMOS LA PREGUNTA COMO USADA.
    Esto evita que vuelva a aparecer.
  */
  await set(
    ref(
      db,
      `rooms/${room}/usedQuestions/${type}/${selected.index}`
    ),
    true
  );
  /*
    Creamos la ronda.
    TODOS ven exactamente la misma
    pregunta y TODOS deben responder.
  */
  await update(
    ref(
      db,
      "rooms/" + room
    ),
    {
      animation:
        null,
      round: {
        type,
        title:
          question[0],
        question:
          question[1],
        questionIndex:
          selected.index,
        answers:
          {},
        roller:
          animation.roller
      }
    }
  );
}
/* =====================================================
   MOSTRAR PREGUNTA
===================================================== */
function renderRound() {
  if (
    animationRunning ||
    state?.animation
  ) {
    $("promptModal")
      .classList
      .add("hidden");
    return;
  }
  if (
    !state?.round
  ) {
    $("promptModal")
      .classList
      .add("hidden");
    return;
  }
  const round =
    state.round;
  $("promptModal")
    .classList
    .remove("hidden");
  $("promptTitle")
    .textContent =
      round.title;
  $("promptQuestion")
    .textContent =
      round.question;
  const answers =
    round.answers || {};
  const myAnswer =
    answers[me];
  $("answer")
    .classList
    .toggle(
      "hidden",
      !!myAnswer
    );
  $("submitAnswer")
    .classList
    .toggle(
      "hidden",
      !!myAnswer
    );
  const players =
    sortedPlayers();
  const received =
    Object.keys(
      answers
    ).length;
  $("answerStatus")
    .textContent =
      `${received}/${players.length} respuestas recibidas` +
      (
        myAnswer &&
        received < players.length
          ? " · ✓ Tu respuesta fue enviada"
          : ""
      );
  const allAnswered =
    received ===
    players.length;
  $("revealed")
    .classList
    .toggle(
      "hidden",
      !allAnswered
    );
  $("continueBtn")
    .classList
    .toggle(
      "hidden",
      !(
        allAnswered &&
        amIHost()
      )
    );
  /*
    Solo revelamos cuando
    TODOS respondieron.
  */
  if (
    allAnswered
  ) {
    $("revealed")
      .innerHTML =
        players
          .map(
            ([id, player]) => `
              <div
                class="answerCard"
                style="
                  border-color:${player.color}
                "
              >
                <b>
                  ${escapeHTML(
                    player.name
                  )}
                </b>
                <br>
                ${escapeHTML(
                  answers[id] || ""
                )}
              </div>
            `
          )
          .join("");
  }
  else {
    $("revealed")
      .innerHTML =
        "";
  }
}
/* =====================================================
   ENVIAR RESPUESTA
===================================================== */
async function submitAnswer() {
  const value =
    $("answer")
      .value
      .trim();
  if (!value) {
    toast(
      "Escribe una respuesta"
    );
    return;
  }
  if (
    !state?.round
  ) {
    toast(
      "Esta pregunta ya terminó"
    );
    return;
  }
  await set(
    ref(
      db,
      `rooms/${room}/round/answers/${me}`
    ),
    value
  );
  $("answer").value =
    "";
}
/* =====================================================
   SIGUIENTE TURNO
===================================================== */
async function nextTurn() {
  const players =
    sortedPlayers();
  if (!players.length) {
    return;
  }
  const next =
    (
      state.turn +
      1
    ) %
    players.length;
  await update(
    ref(
      db,
      "rooms/" + room
    ),
    {
      turn:
        next,
      round:
        null,
      animation:
        null
    }
  );
}
/* =====================================================
   CONTINUAR
===================================================== */
async function continueRound() {
  if (
    !amIHost()
  ) {
    toast(
      "Solo el anfitrión puede continuar"
    );
    return;
  }
  const round =
    state?.round;
  if (!round) {
    return;
  }
  const players =
    sortedPlayers();
  const answers =
    round.answers || {};
  if (
    Object.keys(
      answers
    ).length !==
    players.length
  ) {
    toast(
      "Faltan respuestas del equipo"
    );
    return;
  }
  /*
    Guardamos esta ronda
    en el historial.
  */
  const historyRef =
    push(
      ref(
        db,
        `rooms/${room}/history`
      )
    );
  await set(
    historyRef,
    round
  );
  await nextTurn();
}
/* =====================================================
   REINICIAR
===================================================== */
async function resetGame() {
  if (
    !amIHost()
  ) {
    toast(
      "Solo el anfitrión puede reiniciar"
    );
    return;
  }
  if (
    !confirm(
      "¿Reiniciar posiciones, respuestas y preguntas utilizadas?"
    )
  ) {
    return;
  }
  animationRunning =
    false;
  activeAnimationId =
    null;
  visualPositions =
    {};
  rollPending =
    false;
  const updates = {
    turn:
      0,
    round:
      null,
    history:
      null,
    animation:
      null,
    /*
      IMPORTANTE:
      al reiniciar también permitimos
      que vuelvan a salir todas
      las preguntas.
    */
    usedQuestions:
      null
  };
  sortedPlayers()
    .forEach(
      ([id]) => {
        updates[
          `players/${id}/pos`
        ] = 0;
      }
    );
  await update(
    ref(
      db,
      "rooms/" + room
    ),
    updates
  );
  $("die")
    .textContent =
      "⚄";
  $("diceMessage")
    .textContent =
      "¡Tira el dado!";
}
/* =====================================================
   RESUMEN
===================================================== */
function showSummary() {
  $("summaryModal")
    .classList
    .remove("hidden");
  const history =
    state?.history || {};
  const groups = {
    EMPEZAR:
      [],
    PARAR:
      [],
    CONTINUAR:
      [],
    KUDOS:
      [],
    SORPRESA:
      []
  };
  Object
    .values(history)
    .forEach(
      round => {
        const group =
          groups[round.type] ||
          groups.SORPRESA;
        /*
          Guardamos también la pregunta,
          para que el resumen tenga
          más sentido.
        */
        group.push({
          title:
            round.title,
          question:
            round.question,
          answers:
            round.answers || {}
        });
      }
    );
  $("summaryContent")
    .innerHTML =
      Object
        .entries(groups)
        .map(
          ([type, rounds]) => `
            <div class="section">
              <h3>
                ${type}
              </h3>
              ${
                rounds.length
                  ?
                  rounds
                    .map(
                      round => `
                        <div class="answerCard">
                          <strong>
                            ${escapeHTML(
                              round.title
                            )}
                          </strong>
                          <p>
                            ${escapeHTML(
                              round.question
                            )}
                          </p>
                          ${
                            Object
                              .values(
                                round.answers
                              )
                              .map(
                                answer => `
                                  <div
                                    style="
                                      margin-top:8px;
                                      padding-top:8px;
                                      border-top:1px solid #ddd;
                                    "
                                  >
                                    ${escapeHTML(
                                      answer
                                    )}
                                  </div>
                                `
                              )
                              .join("")
                          }
                        </div>
                      `
                    )
                    .join("")
                  :
                  `
                    <p class="muted">
                      Sin respuestas todavía.
                    </p>
                  `
              }
            </div>
          `
        )
        .join("");
}
/* =====================================================
   BOTONES
===================================================== */
$("createBtn").onclick =
  createRoom;
$("joinBtn").onclick =
  joinRoom;
$("startBtn").onclick =
  startGame;
$("rollBtn").onclick =
  roll;
$("submitAnswer").onclick =
  submitAnswer;
$("continueBtn").onclick =
  continueRound;
$("resetBtn").onclick =
  resetGame;
$("summaryBtn").onclick =
  showSummary;
$("closeSummary").onclick =
  () => {
    $("summaryModal")
      .classList
      .add("hidden");
  };