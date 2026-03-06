// =======================
// ROOM DESIGNER GAME.JS
// =======================

// Retrieve budget from localStorage
let budget = parseInt(localStorage.getItem("gameBudget")) || 1000;
const budgetDisplay = document.getElementById('budget');
const roomCanvas = document.getElementById('roomCanvas');
const itemOptions = document.getElementById('itemOptions');
const categories = document.querySelectorAll('.category');
const changeViewBtn = document.getElementById('changeView');
const finishBtn = document.getElementById("finishRoom");
const resetBtn = document.getElementById("resetRoom");
const backBtn = document.getElementById("backToDice");
const timerDisplay = document.getElementById("timer");

// Disable finish button until timer ends
finishBtn.disabled = true;

// =======================
// TIMER (5 SECONDS)
// =======================
let timeLeft = 5;
const timer = setInterval(() => {
  timeLeft--;
  timerDisplay.innerText = `⏱ Time Left to Be Able to Submit: ${timeLeft}`;

  if (timeLeft === 5) timerDisplay.classList.add("timerWarning");

  if (timeLeft <= 0) {
    clearInterval(timer);
    timerDisplay.innerText = "✅ You can submit now!";
    finishBtn.disabled = false;
  }
}, 1000);

// =======================
// DATA STRUCTURES
// =======================

// Category names lowercase
const layerOrder = { rugs:0, table:1, couch:2, entertainment:3, lighting:4, paintings:5 };
let selectedItems = { couch:null, table:null, lighting:null, paintings:null, entertainment:null, rugs:null };
let selectedFurniture = null;
let borderTimeout;

// Track which index of each tier is displayed
let tierIndexes = { Basic:0, Standard:0, Luxury:0 };
let currentCategory = null;

// =======================
// FURNITURE DATA
// =======================

// Only showing couches as example — replicate for other categories
const furnitureData = {
  couch: {
    Basic: [
      { name:"Basic Couch 1", price:500, img:"Basic/Couch/basic_couch1.png",
        flippedImg:"Basic/Couch/basic_couch1-f.png",
        rearImg:"Basic/Couch/basic_couch1_back.png",
        rearImgF:"Basic/Couch/basic_couch1_back-f.png",
        width:300
      },
      { name:"Basic Couch 2", price:500, img:"Basic/Couch/basic_couch2.png",
        flippedImg:"Basic/Couch/basic_couch2-f.png",
        rearImg:"Basic/Couch/basic_couch2_back.png",
        rearImgF:"Basic/Couch/basic_couch2_back-f.png",
        width:250
      },
      { name:"Basic Couch 3", price:500, img:"Basic/Couch/basic_couch3.png",
        flippedImg:"Basic/Couch/basic_couch3-f.png",
        rearImg:"Basic/Couch/basic_couch3_back.png",
        rearImgF:"Basic/Couch/basic_couch3_back-f.png",
        width:250
      }
  
    ],

    Standard: [
      { name:"Standard Couch 1", price:900, img:"Standard/Couch/Standard_couch1.png",
        flippedImg:"Standard/Couch/Standard_couch1-f.png",
        rearImg:"Standard/Couch/Standard_couch1_back.png",
        rearImgF:"Standard/Couch/Standard_couch1_back-f.png",
        width:250
      },

        { name:"Standard Couch 2", price:900, img:"Standard/Couch/Standard_couch2.png",
        flippedImg:"Standard/Couch/Standard_couch2-f.png",
        rearImg:"Standard/Couch/Standard_couch2_back.png",
        rearImgF:"Standard/Couch/Standard_couch2_back-f.png",
        width:250
      },
      { name:"Standard Couch 3", price:900, img:"Standard/Couch/Standard_couch3.png",
        flippedImg:"Standard/Couch/Standard_couch3-f.png",
        rearImg:"Standard/Couch/Standard_couch3_back.png",
        rearImgF:"Standard/Couch/Standard_couch3_back-f.png",
        width:250
      },


    ],

    Luxury: [
      { name:"Luxury Couch 1", price:1600, img:"Luxury/Couch/luxury_couch1.png",
        flippedImg:"Luxury/Couch/luxury_couch1-f.png",
        rearImg: "Luxury/Couch/luxury_couch1_back.png",
        rearImgF: "Luxury/Couch/luxury_couch1_back-f.png",
        width:300
      },

      { name:"Luxury Couch 2", price:1600, img:"Luxury/Couch/luxury_couch2.png",
        flippedImg:"Luxury/Couch/luxury_couch2-f.png",
        rearImg: "Luxury/Couch/luxury_couch2_back.png",
        rearImgF: "Luxury/Couch/luxury_couch2_back-f.png",
        width:300
      },

      { name:"Luxury Couch 3", price:1600, img:"Luxury/Couch/luxury_couch3.png",
        flippedImg:"Luxury/Couch/luxury_couch3-f.png",
        rearImg: "Luxury/Couch/luxury_couch3_back.png",
        rearImgF: "Luxury/Couch/luxury_couch3_back-f.png",
        width:350
      },
    ]
  },

  table: {
    Basic: [
      { name:"Basic Table 1", price: 200, img:"Basic/Table/basic_table1.png",
        flippedImg:"Basic/Table/basic_table1-f.png",
        rearImg: "Basic/Table/basic_table1.png",
        rearImgF: "Basic/Table/basic_table1-f.png",
        width: 200
      },

      { name:"Basic Table 2", price: 200, img:"Basic/Table/basic_table2.png",
        flippedImg:"Basic/Table/basic_table2-f.png",
        rearImg: "Basic/Table/basic_table2.png",
        rearImgF: "Basic/Table/basic_table2-f.png",
        width: 150
      },

      { name:"Basic Table 3", price: 200, img:"Basic/Table/basic_table3.png",
        flippedImg:"Basic/Table/basic_table3-f.png",
        rearImg: "Basic/Table/basic_table3.png",
        rearImgF: "Basic/Table/basic_table3-f.png",
        width: 200
      }
    ],

    Standard: [
      {name:"Standard Table 1", price: 400, img:"Standard/Table/Standard_table1.png",
        flippedImg: "Standard/Table/Standard_table1-f.png",
        rearImg:"Standard/Table/Standard_table1.png",
        rearImgF:"Standard/Table/Standard_table1-f.png",
        width: 200
      },
      {name:"Standard Table 2", price: 400, img:"Standard/Table/Standard_table2.png",
        flippedImg: "Standard/Table/Standard_table2-f.png",
        rearImg:"Standard/Table/Standard_table2.png",
        rearImgF:"Standard/Table/Standard_table2-f.png",
        width: 200
      },

      {name:"Standard Table 3", price: 400, img:"Standard/Table/Standard_table3.png",
        flippedImg: "Standard/Table/Standard_table3-f.png",
        rearImg:"Standard/Table/Standard_table3.png",
        rearImgF:"Standard/Table/Standard_table3-f.png",
        width: 200
      },
    ],

    Luxury: [
      {name:"Standard Table 1", price: 750, img:"Luxury/Table/luxury_table1.png",
        flippedImg: "Luxury/Table/luxury_table1-f.png",
        rearImg:"Luxury/Table/luxury_table1.png",
        rearImgF:"Luxury/Table/luxury_table1-f.png",
        width: 200
      },

      {name:"Standard Table 2", price: 750, img:"Luxury/Table/luxury_table2.png",
        flippedImg: "Luxury/Table/luxury_table2-f.png",
        rearImg:"Luxury/Table/luxury_table2.png",
        rearImgF:"Luxury/Table/luxury_table2-f.png",
        width: 200
      },

      {name:"Standard Table 3", price: 750, img:"Luxury/Table/luxury_table3.png",
        flippedImg: "Luxury/Table/luxury_table3-f.png",
        rearImg:"Luxury/Table/luxury_table3.png",
        rearImgF:"Luxury/Table/luxury_table3-f.png",
        width: 200
      },      
    ]

  },

  entertainment: {
    Basic: [
      {name:"Basic Entertainment System 1", price:350, img: "Basic/Entertainment/basic_entertainment1.png",
      flippedImg: "Basic/Entertainment/basic_entertainment1-f.png",
      rearImg: "Basic/Entertainment/basic_entertainment1.png",
      rearImgF: "Basic/Entertainment/basic_entertainment1-f.png",
      width: 200
    },

      {name: "Basic Entertainment System 2", price:350, img: "Basic/Entertainment/basic_entertainment2.png",
      flippedImg: "Basic/Entertainment/basic_entertainment2-f.png",
      rearImg: "Basic/Entertainment/basic_entertainment2.png",
      rearImgF: "Basic/Entertainment/basic_entertainment2-f.png",
      width: 200
      },

      {name: "Basic Entertainment System 3", price:350, img: "Basic/Entertainment/basic_entertainment3.png",
      flippedImg: "Basic/Entertainment/basic_entertainment3-f.png",
      rearImg: "Basic/Entertainment/basic_entertainment3.png",
      rearImgF: "Basic/Entertainment/basic_entertainment3-f.png",
      width: 200
      }  
      
    ],

    Standard: [
      {name:"Standard Entertainment System 1", price:650, img: "Standard/Entertainment/Standard_entertainment1.png",
        flippedImg: "Standard/Entertainment/Standard_entertainment1-f.png",
        rearImg: "Standard/Entertainment/Standard_entertainment1.png",
        rearImgF: "Standard/Entertainment/Standard_entertainment1-f.png",
        width: 200
      },

      {name:"Standard Entertainment System 2", price:650, img: "Standard/Entertainment/Standard_entertainment2.png",
        flippedImg: "Standard/Entertainment/Standard_entertainment2-f.png",
        rearImg: "Standard/Entertainment/Standard_entertainment2.png",
        rearImgF: "Standard/Entertainment/Standard_entertainment2-f.png",
        width: 200
      },

      {name:"Standard Entertainment System 2", price:650, img: "Standard/Entertainment/Standard_entertainment3.png",
        flippedImg: "Standard/Entertainment/Standard_entertainment3-f.png",
        rearImg: "Standard/Entertainment/Standard_entertainment3.png",
        rearImgF: "Standard/Entertainment/Standard_entertainment3-f.png",
        width: 200

      }

    ],

    Luxury: [
      {name:"Luxury Entertainment System 1", price:1200, img:"Luxury/Entertainment/luxury_entertainment1.png",
      flippedImg:"Luxury/Entertainment/luxury_entertainment1-f.png",
      rearImg: "Luxury/Entertainment/luxury_entertainment1.png",
      rearImgF: "Luxury/Entertainment/luxury_entertainment1-f.png",
      width:200
    },
      {name:"Luxury Entertainment System 2", price:1200, img:"Luxury/Entertainment/luxury_entertainment2.png",
      flippedImg: "Luxury/Entertainment/luxury_entertainment2-f.png",
      rearImg: "Luxury/Entertainment/luxury_entertainment2.png",
      rearImgF: "Luxury/Entertainment/luxury_entertainment2-f.png",
      width:200
    },

      {name:"Luxury Entertainment System 3", price:1200, img:"Luxury/Entertainment/luxury_entertainment3.png",
      flippedImg: "Luxury/Entertainment/luxury_entertainment3-f.png",
      rearImg: "Luxury/Entertainment/luxury_entertainment3.png",
      rearImgF: "Luxury/Entertainment/luxury_entertainment3-f.png",
      width:200
    },

    ]
  },

  lighting: {
    Basic: [
      {name:"Basic Lighting 1", price:120, img:"Basic/Lighting/basic_lighting1.png",
        flippedImg: "Basic/Lighting/basic_lighting1-f.png",
        rearImg:"Basic/Lighting/basic_lighting1.png",
        rearImgF:"Basic/Lighting/basic_lighting1-f.png",
        width:200
      },
      {name:"Basic Lighting 2", price: 120, img:"Basic/Lighting/basic_lighting2.png",
        flippedImg:"Basic/Lighting/basic_lighting2.png",
        rearImg:"Basic/Lighting/basic_lighting2.png",
        rearImgF: "Basic/Lighting/basic_lighting2.png",
        width: 200
      },
        {name:"Basic Lighting 3", price: 120, img:"Basic/Lighting/basic_lighting3.png",
        flippedImg:"Basic/Lighting/basic_lighting3.png",
        rearImg:"Basic/Lighting/basic_lighting3.png",
        rearImgF: "Basic/Lighting/basic_lighting3.png",
        width: 200
      }
    ],

    Standard: [
      {name:"Standard Lighting 1", price: 250, img:"Standard/Lighting/Standard_Lighting1.png",
        flippedImg: "Standard/Lighting/Standard_Lighting1-f.png",
        rearImg: "Standard/Lighting/Standard_Lighting1.png",
        rearImgF: "Standard/Lighting/Standard_Lighting1-f.png",
        width:200
      },

      {name:"Standard Lighting 2", price: 250, img:"Standard/Lighting/Standard_Lighting2.png",
        flippedImg: "Standard/Lighting/Standard_Lighting2-f.png",
        rearImg: "Standard/Lighting/Standard_Lighting2.png",
        rearImgF: "Standard/Lighting/Standard_Lighting2-f.png",
        width:200
      },

      {name:"Standard Lighting 3", price: 250, img:"Standard/Lighting/Standard_Lighting3.png",
        flippedImg: "Standard/Lighting/Standard_Lighting3.png",
        rearImg: "Standard/Lighting/Standard_Lighting3.png",
        rearImgF: "Standard/Lighting/Standard_Lighting3.png",
        width:200
      }      

    ],

    Luxury: [
      {name:"Luxury Lighting 1", price:500, img:"Luxury/Lighting/luxury_lighting1.png",
      flippedImg: "Luxury/Lighting/luxury_lighting1-f.png",
      rearImg: "Luxury/Lighting/luxury_ighting1.png",
      rearImgF: "Luxury/Lighting/luxury_lighting1-f.png",
      width:200
      },
      {name:"Luxury Lighting 2", price:500, img:"Luxury/Lighting/luxury_lighting2.png",
      flippedImg: "Luxury/Lighting/luxury_lighting2.png",
      rearImg: "Luxury/Lighting/luxury_lighting2.png",
      rearImgF: "Luxury/Lighting/luxuryl_ighting2.png",
      width:200
      },

      {name:"Luxury Lighting 3", price:500, img:"Luxury/Lighting/luxury_lighting3.png",
      flippedImg: "Luxury/Lighting/luxury_lighting3.png",
      rearImg: "Luxury/Lighting/luxury_lighting3.png",
      rearImgF: "Luxury/Lighting/luxury_lighting3.png",
      width:200
      }
    ]
  },

  rugs: {
    Basic: [
      {name:"Basic Rug 1", price:150, img:"Basic/Carpet/basic_carpet1.png",
      flippedImg: "Basic/Carpet/basic_carpet1.png",
      rearImg: "Basic/Carpet/basic_carpet1.png",
      rearImgF: "Basic/Carpet/basic_carpet1.png",
      width:300
      },

      {name:"Basic Rug 2", price:150, img:"Basic/Carpet/basic_carpet2.png",
      flippedImg: "Basic/Carpet/basic_carpet2-f.png",
      rearImg: "Basic/Carpet/basic_carpet2.png",
      rearImgF: "Basic/Carpet/basic_carpet2-f.png",
      width:300        
      },

      {name:"Basic Rug 3", price:150, img:"Basic/Carpet/basic_carpet3.png",
      flippedImg: "Basic/Carpet/basic_carpet3-f.png",
      rearImg: "Basic/Carpet/basic_carpet3.png",
      rearImgF: "Basic/Carpet/basic_carpet3-f.png",
      width:300 

      }


    ],

    Standard: [
      {name:"Standard Rug 1", price:300, img:"Standard/Carpet/Standard_carpet1.png",
      flippedImg: "Standard/Carpet/Standard_carpet1.png",
      rearImg: "Standard/Carpet/Standard_carpet1.png",
      rearImgF: "Standard/Carpet/Standard_carpet1.png",
      width:350
      },
      {name:"Standard Rug 2", price:300, img:"Standard/Carpet/Standard_carpet2.png",
      flippedImg: "Standard/Carpet/Standard_carpet2-f.png",
      rearImg: "Standard/Carpet/Standard_carpet2.png",
      rearImgF: "Standard/Carpet/Standard_carpet2-f.png",
      width:400
      },
      {name:"Standard Rug 3", price:300, img:"Standard/Carpet/Standard_carpet3.png",
      flippedImg: "Standard/Carpet/Standard_carpet3-f.png",
      rearImg: "Standard/Carpet/Standard_carpet3.png",
      rearImgF: "Standard/Carpet/Standard_carpet3-f.png",
      width:150
      }

    ],

    Luxury: [
      {name:"Luxury Rug 1", price:600, img:"Luxury/Carpet/luxury_carpet1.png",
      flippedImg: "Luxury/Carpet/luxury_carpet1-f.png",
      rearImg:"Luxury/Carpet/luxury_carpet1.png",
      rearImgF:"Luxury/Carpet/luxury_carpet1-f.png",
      width:400
      },
      {name:"Luxury Rug 2", price:600, img:"Luxury/Carpet/luxury_carpet2.png",
      flippedImg: "Luxury/Carpet/luxury_carpet2-f.png",
      rearImg:"Luxury/Carpet/luxury_carpet2.png",
      rearImgF:"Luxury/Carpet/luxury_carpet2-f.png",
      width:400
      },
      {name:"Luxury Rug 3", price:600, img:"Luxury/Carpet/luxury_carpet3.png",
      flippedImg: "Luxury/Carpet/luxury_carpet3.png",
      rearImg:"Luxury/Carpet/luxury_carpet3.png",
      rearImgF:"Luxury/Carpet/luxury_carpet3.png",
      width:350

      }
    ]
  },

  paintings: {
    Basic: [
      {name:"Basic Painting 1", price:80, img: "Basic/Paintings/basic_painting1.png",
       flippedImg: "Basic/Paintings/basic_painting1-f.png",
       rearImg: "Basic/Paintings/basic_painting1.png",
       rearImgF: "Basic/Paintings/basic_painting1-f.png",
       width: 150
      },
      {name:"Basic Painting 2", price:80, img: "Basic/Paintings/basic_painting2.png",
       flippedImg: "Basic/Paintings/basic_painting2-f.png",
       rearImg: "Basic/Paintings/basic_painting2.png",
       rearImgF: "Basic/Paintings/basic_painting2-f.png",
       width: 150
      },
      {name:"Basic Painting 3", price:80, img: "Basic/Paintings/basic_painting3.png",
       flippedImg: "Basic/Paintings/basic_painting3-f.png",
       rearImg: "Basic/Paintings/basic_painting3.png",
       rearImgF: "Basic/Paintings/basic_painting3-f.png",
       width: 100

      }
    ],

    Standard: [
      {name:"Standard Painting 1", price: 180, img: "Standard/Paintings/Standard_painting1.png",
        flippedImg:"Standard/Paintings/Standard_paintings1-f.png",
        rearImg: "Standard/Paintings/Standard_painting1.png",
        rearImgF: "Standard/Paintings/Standard_painting1-f.png",
        width:250
      },
      {name: "Standard Painting 2", price: 180, img: "Standard/Paintings/Standard_painting2.png",
        flippedImg:"Standard/Paintings/Standard_paintings2-f.png",
        rearImg: "Standard/Paintings/Standard_painting2.png",
        rearImgF: "Standard/Paintings/Standard_painting2-f.png",
        width:100
      },
      {name: "Standard Painting 3", price: 180, img: "Standard/Paintings/Standard_painting3.png",
        flippedImg:"Standard/Paintings/Standard_paintings3-f.png",
        rearImg: "Standard/Paintings/Standard_painting3.png",
        rearImgF: "Standard/Paintings/Standard_painting3-f.png",
        width:125

      }
    ],

    Luxury: [
      {name:"Luxury Painting 1", price: 400, img: "Luxury/Paintings/luxury_painting1.png",
        flippedImg:"Luxury/Paintings/luxury_painting1-f.png",
        rearImg: "Luxury/Paintings/luxury_painting1.png",
        rearImgF: "Luxury/Paintings/luxury_painting1-f.png",
        width:250
      },
      {name:"Luxury Painting 2", price: 400, img: "Luxury/Paintings/luxury_painting2.png",
        flippedImg:"Luxury/Paintings/luxury_painting2-f.png",
        rearImg: "Luxury/Paintings/luxury_painting2.png",
        rearImgF: "Luxury/Paintings/luxury_painting2-f.png",
        width:250
      },
      {name:"Luxury Painting 3", price: 400, img: "Luxury/Paintings/luxury_painting3.png",
        flippedImg:"Luxury/Paintings/luxury_painting3-f.png",
        rearImg: "Luxury/Paintings/luxury_painting3.png",
        rearImgF: "Luxury/Paintings/luxury_painting3-f.png",
        width:200
      }      
    ]
  }
};

// =======================
// UPDATE BUDGET DISPLAY
// =======================
function updateBudgetDisplay() {
  budgetDisplay.textContent = `💰 Budget Remaining: $${budget}`;
}

// =======================
// MAKE FURNITURE DRAGGABLE
// =======================
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
    let shiftX = e.clientX - rect.left;
    let shiftY = e.clientY - rect.top;

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

// =======================
// SELECTION OUTLINE
// =======================
function showSelectionOutline(element) {
  document.querySelectorAll('#roomCanvas img').forEach(img => {
    if (img !== element) img.style.border = 'none';
  });

  element.style.border = '2px solid green';
  if (borderTimeout) clearTimeout(borderTimeout);
  borderTimeout = setTimeout(() => element.style.border = 'none', 5000);
}

// =======================
// BUY FURNITURE
// =======================
function buyItem(type, item) {
  // Refund previous
  if (selectedItems[type]) {
    budget += selectedItems[type].price;
    const prevElem = document.getElementById(selectedItems[type].name.replaceAll(" ", "_"));
    if (prevElem) prevElem.remove();
  }

  if (item.price > budget) {
    alert("Not enough budget!");
    return;
  }

  budget -= item.price;
  updateBudgetDisplay();

  // Create furniture image
  const imgElem = document.createElement('img');
  imgElem.src = item.img;
  imgElem.id = item.name.replaceAll(" ", "_"); // unique ID
  imgElem.dataset.type = type;
  imgElem.dataset.views = JSON.stringify([item.img, item.flippedImg, item.rearImg, item.rearImgF || item.img]);
  imgElem.dataset.viewIndex = 0;
  imgElem.style.width = item.width + "px";
  imgElem.style.position = 'absolute';
  imgElem.style.cursor = 'grab';
  imgElem.style.top = '100px';
  imgElem.style.left = '100px';
  imgElem.style.zIndex = layerOrder[type];
  imgElem.classList.add("furniture"); // ✅ Add this line


  makeDraggable(imgElem);

  imgElem.addEventListener('click', () => {
    selectedFurniture = imgElem;
    showSelectionOutline(imgElem);
  });

  roomCanvas.appendChild(imgElem);
  selectedItems[type] = item;
}

// =======================
// SHOW CURRENT CATEGORY ITEMS
// =======================
function showCurrentItem() {
  if (!currentCategory) return;
  itemOptions.innerHTML = "";
  const tiersToShow = ["Basic", "Standard", "Luxury"];

  tiersToShow.forEach(tier => {
    const items = furnitureData[currentCategory][tier];
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

    viewer.querySelector(".buyBtn").onclick = () => buyItem(currentCategory, item);
    viewer.querySelector(".prev").onclick = () => {
      tierIndexes[tier] = (tierIndexes[tier]-1+items.length)%items.length;
      showCurrentItem();
    };
    viewer.querySelector(".next").onclick = () => {
      tierIndexes[tier] = (tierIndexes[tier]+1)%items.length;
      showCurrentItem();
    };

    itemOptions.appendChild(viewer);
  });
}

// =======================
// CATEGORY BUTTONS
// =======================
categories.forEach(btn => {
  btn.addEventListener('click', () => {
    currentCategory = btn.dataset.type.toLowerCase();
    tierIndexes = { Basic:0, Standard:0, Luxury:0 };
    showCurrentItem();
  });
});

// =======================
// CHANGE VIEW
// =======================
changeViewBtn.addEventListener('click', () => {
  if (!selectedFurniture) return;
  let views = JSON.parse(selectedFurniture.dataset.views);
  let index = parseInt(selectedFurniture.dataset.viewIndex);
  index = (index+1)%views.length;
  selectedFurniture.src = views[index];
  selectedFurniture.dataset.viewIndex = index;
  showSelectionOutline(selectedFurniture);
});

// =======================
// FINISH ROOM
// =======================
finishBtn.addEventListener("click", () => {
  if (budget >= 0) {
    alert("✅ You stayed within budget! Drawer unlocked! Your code is 200");
  } else {
    alert("❌ Over Budget! Try Again");
  }
});

// =======================
// RESET ROOM
// =======================
resetBtn.addEventListener("click", () => {
  budget = parseInt(localStorage.getItem("gameBudget")) || 1000;
  updateBudgetDisplay();

  // Only remove furniture images
  document.querySelectorAll("#roomCanvas img.furniture").forEach(img => img.remove());

  selectedItems = { couch:null, table:null, lighting:null, paintings:null, entertainment:null, rugs:null };
  selectedFurniture = null;
  tierIndexes = { Basic:0, Standard:0, Luxury:0 };
  itemOptions.innerHTML = "";
});

// =======================
// BACK TO DICE
// =======================
backBtn.addEventListener("click", () => {
  localStorage.removeItem("gameBudget");
  window.location.href = "dice.html";
});

// =======================
// INITIALIZE
// =======================
updateBudgetDisplay();
