const canvas = document.getElementById("scratch");
const ctx = canvas.getContext("2d");
let scratching = false;
let scratchedPixels = 0;
let revealed = false;

const bg = document.getElementById('reveal-bg');
bg.src = "listky.png"; // To, co je VESPOD (podle tvého zadání)

const overlayImg = new Image();
overlayImg.src = "heart.png"; // To, co STÍRÁŠ

overlayImg.onload = () => {
    initCanvas();
};

function initCanvas() {
    const dpr = window.devicePixelRatio || 2;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);

    const imgRatio = overlayImg.width / overlayImg.height;
    const canvasRatio = window.innerWidth / window.innerHeight;
    let drawWidth, drawHeight, offsetX, offsetY;

    if (imgRatio > canvasRatio) {
        drawHeight = window.innerHeight;
        drawWidth = window.innerHeight * imgRatio;
        offsetX = (window.innerWidth - drawWidth) / 2;
        offsetY = 0;
    } else {
        drawWidth = window.innerWidth;
        drawHeight = window.innerWidth / imgRatio;
        offsetX = 0;
        offsetY = (window.innerHeight - drawHeight) / 2;
    }

    ctx.drawImage(overlayImg, offsetX, offsetY, drawWidth, drawHeight);

    const instruction = document.getElementById('instruction');
    if (instruction) instruction.style.opacity = '1';
}

function getCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
}

function scratch(e) {
    if (!scratching || revealed) return;
    if (e.cancelable) e.preventDefault();

    const { x, y } = getCoords(e);
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight * 0.33;
    const radiusX = 140;
    const radiusY = 110;

    const isInBubble = (Math.pow(x - centerX, 2) / Math.pow(radiusX, 2)) +
        (Math.pow(y - centerY, 2) / Math.pow(radiusY, 2)) <= 1;

    if (isInBubble) {
        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        ctx.arc(x, y, 45, 0, Math.PI * 2);
        ctx.fill();

        scratchedPixels++;
        // Pro testování – uvidíš v Console v Edge
        console.log("Stíráš: ", scratchedPixels);

        if (scratchedPixels > 30) { // Snížil jsem na 30, ať nemusíš stírat věčnost
            revealed = true;
            revealEverything();
        }
    }
}

function revealEverything() {
    // 1. Spustíme konfety hned - ty mohou létat přes stírání
    createConfetti();

    // 2. Skryjeme instrukci "Setři mě"
    const inst = document.getElementById('instruction');
    if (inst) inst.style.opacity = "0";

    // 3. Začneme plynule schovávat stírací plochu (canvas)
    canvas.style.transition = "opacity 0.8s ease-in-out"; // Rychlejší zmizení
    canvas.style.opacity = "0";

    // 4. TEXT se objeví, až když je canvas skoro neviditelný (po 600ms)
    setTimeout(() => {
        const witness = document.getElementById('witness-text');
        if (witness) witness.classList.add('show');
    }, 600);

    // 5. TLAČÍTKA se objeví až po textu (po 1.8 sekundě)
    setTimeout(() => {
        const btnContainer = document.getElementById('button-container');
        if (btnContainer) btnContainer.classList.add('show');
    }, 2000);

    // Úplné odstranění canvasu z cesty, aby se dalo klikat na tlačítka
    setTimeout(() => {
        canvas.style.display = "none";
    }, 800);
}

function createConfetti() {
    const confContainer = document.getElementById("confetti-container");
    const colors = ["#FFFFFF", "#E0F7FA", "#B3E5FC", "#C0C0C0", "#C0C0C0"];

    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement("div");
        confetti.className = "confetti";

        // Nastavení barvy a velikosti
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        const size = Math.random() * 10 + 5 + "px";
        confetti.style.width = size;
        confetti.style.height = size;

        // Výchozí pozice ve středu
        confetti.style.left = "50vw";
        confetti.style.top = "50vh";

        confContainer.appendChild(confetti);

        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 500 + 200;
        const destX = Math.cos(angle) * velocity;
        const destY = Math.sin(angle) * velocity;

        confetti.animate([
            { transform: `translate(-50%, -50%) scale(0)`, opacity: 1 },
            { transform: `translate(calc(-50% + ${destX}px), calc(-50% + ${destY}px)) scale(1)`, opacity: 0 }
        ], {
            duration: Math.random() * 5000 + 2000,
            easing: "ease-out",
            fill: "forwards"
        }).onfinish = () => confetti.remove();
    }
}

// Funkce pro ANO
function answerYes() {
    const witnessText = document.getElementById("witness-text");
    if (witnessText) {
        witnessText.innerHTML = "I knew it<br>motherfucker";
    }
    document.getElementById("button-container").classList.remove("show");
    createConfetti();
}

// Logika pro utíkající NE
const noBtn = document.getElementById("noBtn");

if (noBtn) {
    const moveNoButton = () => {
        // Zvětšil jsem čísla, aby to byl pořádný skok
        const x = Math.random() * 300 - 150;
        const y = Math.random() * 200 - 100;

        // Přidáme i mírnou rotaci, aby to vypadalo, že se odrazilo
        const rot = Math.random() * 20 - 10;

        noBtn.style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg)`;
    };

    // Utíká před myší
    noBtn.addEventListener("mouseover", moveNoButton);

    // Utíká před prstem na mobilu
    noBtn.addEventListener("touchstart", (e) => {
        e.preventDefault(); // Toto zastaví tu hlášku a kliknutí!
        moveNoButton();
    });
}

canvas.addEventListener("mousedown", (e) => {
    scratching = true; scratch(e); document.getElementById('instruction').style.opacity = "0";
    scratch(e); });
canvas.addEventListener("touchstart", (e) => {
    scratching = true; scratch(e); document.getElementById('instruction').style.opacity = "0";
    scratch(e); });
window.addEventListener("mousemove", scratch);
window.addEventListener("touchmove", scratch, { passive: false });
window.addEventListener("mouseup", () => scratching = false);
window.addEventListener("touchend", () => scratching = false);
window.addEventListener("resize", initCanvas);