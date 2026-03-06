// ======================= INITIAL SETUP =======================

// Get DOM elements
let budget = parseInt(localStorage.getItem("gameBudget")) || 1000; // default if not set
const budgetDisplay = document.getElementById('budget');
const roomCanvas = document.getElementById('roomCanvas');
const itemOptions = document.getElementById('itemOptions');
const categories = document.querySelectorAll('.category');
const changeViewBtn = document.getElementById('changeView');
const finishBtn = document.getElementById("finishRoom");
const timerDisplay = document.getElementById("timer");

// Initialize original budget if not already stored
if (!localStorage.getItem("originalBudget")) {
  localStorage.setItem("originalBudget", budget);
}

finishBtn.disabled = true; // cannot submit initially

// ======================= TIMER =======================
let timeLeft = 5;
const timer = setInterval(() => {
  timeLeft--;
  timerDisplay.innerText = `⏱ Time Left to Submit: ${timeLeft}`;

  if (timeLeft <= 3) timerDisplay.classList.add("timerWarning");

  if (timeLeft <= 0) {
    clearInterval(timer);
    timerDisplay.innerText = "✅ You can submit now!";
    finishBtn.disabled = false;
  }
}, 1000);

// ======================= CATEGORY & ITEM LOGIC =======================

// Current selection trackers
let currentCategory = null;
let tierIndexes = { basic: 0, standard: 0, luxury: 0 };
let selectedFurniture = null;
let borderTimeout;

// Layer order (z-index)
const layerOrder = {
  rugs: 0,
  table: 1,
  couch: 2,
  entertainment: 3,
  lighting: 4,
  paintings: 5
};

// Track selected items per type
let selectedItems = {
  couch: null,
  table: null,
  lighting: null,
  paintings: null,
  entertainment: null,
  rugs: null
};

// ======================= FURNITURE DATA =======================
// (All categories are lowercase to match layerOrder and selectedItems keys)
const furnitureData = {
  couch: {
    basic: [
      { name:"Basic Couch 1", price:500, img:"Images/Basic/Couch/basic_couch1.png",
        flippedImg:"Images/Basic/Couch/basic_couch1-f.png",
        rearImg:"Images/Basic/Couch/basic_couch1_back.png",
        rearImgF:"Images/Basic/Couch/basic_couch1_back-f.png",
        width:300
      },
      { name:"Basic Couch 2", price:500, img:"Images/Basic/Couch/basic_couch2.png",
        flippedImg:"Images/Basic/Couch/basic_couch2-f.png",
        rearImg:"Images/Basic/Couch/basic_couch2_back.png",
        rearImgF:"Images/Basic/Couch/basic_couch2_back-f.png",
        width:250
      }
    ],
    standard: [
      { name:"Standard Couch 1", price:900, img:"Images/Standard/Couch/Standard_couch1.png",
        flippedImg:"Images/Standard/Couch/Standard_couch1-f.png",
        rearImg:"Images/Standard/Couch/Standard_couch1_back.png",
        rearImgF:"Images/Standard/Couch/Standard_couch1_back-f.png",
        width:250
      }
    ],
    luxury: [
      { name:"Luxury Couch 1", price:1600, img:"Images/Luxury/Couch/luxury_couch1.png",
        flippedImg:"Images/Luxury/Couch/luxury_couch1-f.png",
        rearImg: "Images/Luxury/Couch/luxury_couch1_back.png",
        rearImgF: "Images/Luxury/Couch/luxury_couch1_back-f.png",
        width:300
      }
    ]
  },

  table: {
    basic: [
      { name:"Basic Table 1", price:200, img:"Images/Basic/Table/basic_table1.png",
        flippedImg:"Images/Basic/Table/basic_table1-f.png",
        rearImg:"Images/Basic/Table/basic_table1.png",
        rearImgF:"Images/Basic/Table/basic_table1-f.png",
        width:200
      }
    ],
    standard: [
      { name:"Standard Table 1", price:400, img:"Images/Standard/Table/Standard_table1.png",
        flippedImg:"Images/Standard/Table/Standard_table1-f.png",
        rearImg:"Images/Standard/Table/Standard_table1.png",
        rearImgF:"Images/Standard/Table/Standard_table1-f.png",
        width:200
      }
    ],
    luxury: [
      { name:"Luxury Table 1", price:750, img:"Images/Luxury/Table/luxury_table1.png",
        flippedImg:"Images/Luxury/Table/luxury_table1-f.png",
        rearImg:"Images/Luxury/Table/luxury_table1.png",
        rearImgF:"Images/Luxury/Table/luxury_table1-f.png",
        width:200
      }
    ]
  },

  // Add entertainment, lighting, rugs, paintings similarly...
};

// ======================= BUDGET DISPLAY =======================
function updateBudgetDisplay() {
  budgetDisplay.textContent = `Budget Remaining: $${budget}`;
}

// ======================= DRAGGABLE ELEMENTS =======================
function makeDraggable(element) {
  element.style.touchAction = "none";
  element.addEventListener("pointerdown", function(e) {
    selectedFurniture = element;
    showSelectionOutline(element);
    element.style.cursor = "grabbing";

    const type = element.dataset.type;
    element.style.zIndex = 1000;

    const rect = element.getBoundingClientRect();
    const canvasRect = roomCanvas.getBoundingClientRect();
    const shiftX = e.clientX - rect.left;
    const shiftY = e.clientY - rect.top;

    function moveAt(clientX, clientY) {
      element.style.left = clientX - shiftX - canvasRect.left + "px";
      element.style.top = clientY - shiftY - canvasRect.top + "px";
    }

    function onPointerMove(e) { moveAt(e.clientX, e.clientY); }
    function stopDrag() {
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", stopDrag);
      element.style.cursor = "grab";
      element.style.zIndex = layerOrder[type];
    }

    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", stopDrag);
  });
}

// ======================= SELECTION OUTLINE =======================
function showSelectionOutline(element) {
  document.querySelectorAll('#roomCanvas img').forEach(img => {
    if (img !== element) img.style.border = 'none';
  });
  element.style.border = '2px solid green';

  if (borderTimeout) clearTimeout(borderTimeout);
  borderTimeout = setTimeout(() => { element.style.border = 'none'; }, 5000);
}

// ======================= SHOW ITEMS BY CATEGORY =======================
categories.forEach(button => {
  button.addEventListener('click', () => {
    currentCategory = button.dataset.type.toLowerCase();
    tierIndexes = { basic:0, standard:0, luxury:0 };
    showCurrentItem();
  });
});

function showCurrentItem() {
  const tiers = ["basic", "standard", "luxury"];
  itemOptions.innerHTML = "";

  tiers.forEach(tier => {
    const items = furnitureData[currentCategory]?.[tier];
    if (!items) return;

    const index = tierIndexes[tier];
    const item = items[index];
    const viewer = document.createElement("div");
    viewer.className = "tierViewer";
    viewer.innerHTML = `
      <h3>${tier.toUpperCase()}</h3>
      <div class="viewerControls">
        <button class="prev">◀</button>
        <div class="itemDisplay">
          <img src="${item.img}" width="120">
          <p>${item.name}</p>
          <p>$${item.price}</p>
          <button class="buyBtn">Buy</button>
        </div>
        <button class="next">▶</button>
      </div>
    `;

    viewer.querySelector(".buyBtn").onclick = () => buyItem(currentCategory, tier, index);
    viewer.querySelector(".prev").onclick = () => {
      tierIndexes[tier] = (tierIndexes[tier] - 1 + items.length) % items.length;
      showCurrentItem();
    };
    viewer.querySelector(".next").onclick = () => {
      tierIndexes[tier] = (tierIndexes[tier] + 1) % items.length;
      showCurrentItem();
    };

    itemOptions.appendChild(viewer);
  });
}

// ======================= BUY ITEM =======================
function buyItem(type, tier, index) {
  const item = furnitureData[type][tier][index];

  // Refund previous
  if (selectedItems[type]) {
    budget += selectedItems[type].price;
    const prevElem = document.getElementById(selectedItems[type].uniqueId);
    if (prevElem) prevElem.remove();
  }

  if (item.price > budget) { alert("Not enough budget!"); return; }

  budget -= item.price;
  updateBudgetDisplay();

  // Create unique ID
  const uniqueId = `${item.name}-${Date.now()}`;
  item.uniqueId = uniqueId;

  const imgElem = document.createElement('img');
  imgElem.src = item.img;
  imgElem.id = uniqueId;
  imgElem.dataset.type = type;
  imgElem.style.width = item.width + "px";
  imgElem.dataset.views = JSON.stringify([item.img, item.flippedImg, item.rearImg, item.rearImgF || item.img]);
  imgElem.dataset.viewIndex = 0;

  // Default positions
  const anchors = {
    couch: { top: '300px', left: '100px' },
    table: { top: '250px', left: '100px' },
    lighting: { top: '200px', left: '100px' },
    entertainment: { top: '100px', left: '100px' },
    rugs: { top: '300px', left: '100px' },
    paintings: { top: '300px', left: '100px' }
  };
  imgElem.style.top = anchors[type].top;
  imgElem.style.left = anchors[type].left;
  imgElem.style.position = 'absolute';
  imgElem.style.cursor = 'grab';
  imgElem.style.zIndex = layerOrder[type];

  makeDraggable(imgElem);
  imgElem.addEventListener('click', () => { selectedFurniture = imgElem; showSelectionOutline(imgElem); });

  roomCanvas.appendChild(imgElem);
  selectedItems[type] = item;
}

// ======================= CHANGE VIEW =======================
changeViewBtn.addEventListener('click', () => {
  if (!selectedFurniture) return;
  let views = JSON.parse(selectedFurniture.dataset.views);
  let index = parseInt(selectedFurniture.dataset.viewIndex);
  index = (index + 1) % views.length;
  selectedFurniture.src = views[index];
  selectedFurniture.dataset.viewIndex = index;
  showSelectionOutline(selectedFurniture);
});

// ======================= FINISH ROOM =======================
finishBtn.addEventListener('click', () => {
  const drawer = document.getElementById("drawer");
  if (budget >= 0) {
    drawer.classList.remove("locked");
    drawer.classList.add("unlocked");
    drawer.innerText = "You stayed within budget! 🗄️ Drawer Unlocked! Code: 200";
  } else {
    alert("❌ Over Budget! Try Again");
  }
});

// ======================= RESET ROOM =======================
document.getElementById("resetRoom").addEventListener("click", resetRoom);
function resetRoom() {
  const originalBudget = parseInt(localStorage.getItem("originalBudget")) || 1000;
  budget = originalBudget;
  document.querySelectorAll("#roomCanvas img:not(#roomImage)").forEach(img => img.remove());
  selectedItems = { couch:null, table:null, lighting:null, paintings:null, entertainment:null, rugs:null };
  selectedFurniture = null;
  tierIndexes = { basic:0, standard:0, luxury:0 };
  updateBudgetDisplay();
  itemOptions.innerHTML = "";
}

// ======================= BACK TO DICE =======================
function backToDice() {
  localStorage.removeItem("gameBudget");
  resetRoom();
  window.location.href = "dice.html";
}

// Initialize display
updateBudgetDisplay();
