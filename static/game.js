let gameObjects = [];
let foundObjects = new Set();
let startTime = null;
let timerInterval = null;
let canvas, ctx, gameImage;

document.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('click-canvas');
    ctx = canvas.getContext('2d');
    gameImage = document.getElementById('game-image');
    
    // Set canvas size to match image
    gameImage.onload = () => {
        resizeCanvas();
    };
    
    window.addEventListener('resize', resizeCanvas);
    
    // Start new game on load
    startNewGame();
    
    // Canvas click handler
    canvas.addEventListener('click', handleCanvasClick);
    
    // New game button
    document.getElementById('new-game-btn').addEventListener('click', startNewGame);
});

function resizeCanvas() {
    canvas.width = gameImage.offsetWidth;
    canvas.height = gameImage.offsetHeight;
    redrawFoundMarkers();
}

function startNewGame() {
    // Reset game state
    foundObjects.clear();
    gameObjects = [];
    document.getElementById('found-count').textContent = '0';
    document.getElementById('victory-message').classList.add('hidden');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Stop existing timer
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    // Start new timer
    startTime = Date.now();
    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);
    
    // Fetch new game objects
    fetch('/new_game')
        .then(response => response.json())
        .then(data => {
            gameObjects = data.objects;
            displayObjectsList();
        })
        .catch(error => console.error('Error starting new game:', error));
}

function displayObjectsList() {
    const objectList = document.getElementById('object-list');
    objectList.innerHTML = '';
    
    gameObjects.forEach(obj => {
        const li = document.createElement('li');
        li.textContent = obj.charAt(0).toUpperCase() + obj.slice(1);
        li.setAttribute('data-object', obj);
        objectList.appendChild(li);
    });
}

function handleCanvasClick(event) {
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    
    // Convert to percentage
    const xPercent = (clickX / canvas.width) * 100;
    const yPercent = (clickY / canvas.height) * 100;
    
    // Show click effect
    showClickEffect(clickX, clickY);
    
    // Check with server
    fetch(`/check_click/${Math.round(xPercent)}/${Math.round(yPercent)}`)
        .then(response => response.json())
        .then(data => {
            if (data.found && !foundObjects.has(data.object)) {
                handleObjectFound(data);
            }
        })
        .catch(error => console.error('Error checking click:', error));
}

function handleObjectFound(data) {
    foundObjects.add(data.object);
    
    // Update found count
    document.getElementById('found-count').textContent = foundObjects.size;
    
    // Mark object as found in list
    const listItem = document.querySelector(`[data-object="${data.object}"]`);
    if (listItem) {
        listItem.classList.add('found');
    }
    
    // Draw marker on canvas
    drawFoundMarker(data.x, data.y, data.radius);
    
    // Check if game is won
    if (foundObjects.size === gameObjects.length) {
        handleVictory();
    }
}

function drawFoundMarker(xPercent, yPercent, radiusPercent) {
    const x = (xPercent / 100) * canvas.width;
    const y = (yPercent / 100) * canvas.height;
    const radius = (radiusPercent / 100) * Math.min(canvas.width, canvas.height);
    
    ctx.strokeStyle = '#32CD32';
    ctx.lineWidth = 3;
    ctx.fillStyle = 'rgba(50, 205, 50, 0.2)';
    
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
}

function redrawFoundMarkers() {
    // This would need to store found object positions
    // For now, we'll just clear on resize
}

function showClickEffect(x, y) {
    const effect = document.createElement('div');
    effect.className = 'click-effect';
    effect.style.left = `${x - 10}px`;
    effect.style.top = `${y - 10}px`;
    
    canvas.parentElement.appendChild(effect);
    
    setTimeout(() => {
        effect.remove();
    }, 600);
}

function updateTimer() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    document.getElementById('time').textContent = 
        `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function handleVictory() {
    // Stop timer
    clearInterval(timerInterval);
    
    // Show victory message
    const finalTime = document.getElementById('time').textContent;
    document.getElementById('final-time').textContent = finalTime;
    document.getElementById('victory-message').classList.remove('hidden');
}