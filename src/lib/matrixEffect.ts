export function startMatrixEffect() {
  // 1. Inject Styles for Keyframes if not already present
  const styleId = 'matrix-effect-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .matrix-popup {
        animation: popupEnter 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        transform: scale(0.95);
        opacity: 0;
      }
      @keyframes popupEnter {
        to {
          transform: scale(1);
          opacity: 1;
        }
      }
      .typewriter {
        overflow: hidden;
        white-space: nowrap;
        margin: 0 auto;
        animation: 
          typing 3.5s steps(40, end),
          blink-caret .75s step-end infinite;
      }
      @keyframes typing {
        from { width: 0 }
        to { width: 100% }
      }
      @keyframes blink-caret {
        from, to { border-right-color: transparent }
        50% { border-right-color: #4ade80; }
      }
    `;
    document.head.appendChild(style);
  }

  // 2. Create DOM Structure
  // Idempotency check
  if (document.getElementById('matrix-easter-egg')) return;

  const container = document.createElement('div');
  container.id = 'matrix-easter-egg';
  // Note: Tailwind classes must be preserved in source so the compiler picks them up.
  // We rely on the fact that this file is included in tailwind.config 'content'.
  container.className = 'fixed inset-0 z-[100] hidden bg-black font-mono text-green-500 overflow-hidden';
  
  container.innerHTML = `
    <canvas id="matrix-canvas" class="absolute inset-0 w-full h-full opacity-50"></canvas>
    <div class="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
      <div class="bg-black/80 p-8 rounded border border-green-500/30 backdrop-blur-sm shadow-[0_0_15px_rgba(34,197,94,0.3)] matrix-popup pointer-events-auto text-center">
        <p class="text-2xl md:text-4xl font-bold tracking-widest text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.8)] mb-6 typewriter">
          Follow the white rabbit.
        </p>
        <button id="close-matrix" class="mt-4 px-6 py-2 border border-green-500 text-green-500 hover:bg-green-500 hover:text-black transition-colors uppercase text-sm tracking-wider cursor-pointer">
          [ CLOSE CONNECTION ]
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  // 3. Logic
  const canvas = document.getElementById('matrix-canvas') as HTMLCanvasElement;
  const closeBtn = document.getElementById('close-matrix');

  if (!canvas || !closeBtn) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let w = canvas.width = window.innerWidth;
  let h = canvas.height = window.innerHeight;

  // Matrix characters (Katakana + Latin)
  const chars = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const charArray = chars.split('');
  
  const fontSize = 16;
  const columns = w / fontSize;
  
  // Array of drops - one per column
  const drops: number[] = [];
  for (let i = 0; i < columns; i++) {
    drops[i] = 1;
  }

  function draw() {
    // Black BG for the canvas
    // Translucent black to show trail
    if (!ctx) return;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#0F0'; // Green text
    ctx.font = fontSize + 'px monospace';

    for (let i = 0; i < drops.length; i++) {
      const text = charArray[Math.floor(Math.random() * charArray.length)];
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);

      // Sending the drop back to the top randomly after it has crossed the screen
      // adding a randomness to the reset to make the drops scattered on the Y axis
      if (drops[i] * fontSize > h && Math.random() > 0.975) {
        drops[i] = 0;
      }

      // Incrementing Y coordinate
      drops[i]++;
    }
  }

  // Animation Loop
  let animationId: number;
  function animate() {
    draw();
    animationId = requestAnimationFrame(animate);
  }
  
  // Delay appearance logic
  setTimeout(() => {
    container.classList.remove('hidden');
    container.style.opacity = '0';
    container.style.transition = 'opacity 2s ease-in-out';
    
    // Force reflow
    void container.offsetWidth;
    
    container.style.opacity = '1';
    
    animate();
  }, 2000);

  // Handle Resize
  const resizeHandler = () => {
    if (!canvas) return;
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  };
  window.addEventListener('resize', resizeHandler);

  // Handle Close
  closeBtn.addEventListener('click', () => {
      container.style.opacity = '0';
      container.style.transition = 'opacity 0.5s ease-out';
      setTimeout(() => {
          // Remove from DOM to clean up
          if (container.parentNode) {
            container.parentNode.removeChild(container);
          }
          cancelAnimationFrame(animationId);
          window.removeEventListener('resize', resizeHandler);
          localStorage.setItem('matrix-egg-last-shown', new Date().toDateString());
      }, 500);
  });
}
