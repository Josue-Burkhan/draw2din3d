import * as THREE from 'https://unpkg.com/three@0.155.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.155.0/examples/jsm/controls/OrbitControls.js';

let camera, scene, renderer;
let raycaster, mouse;
let drawingCanvas, drawingContext;
let texture, drawingPlane;
let controls;
let isDrawing = false;
let isSpacePressed = false;

init();
animate();

function init() {
    // Escena y cámara
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 5;

    // Renderer
    const canvas = document.getElementById('webgl');
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setClearColor(0xcccccc);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Luz
    const light = new THREE.AmbientLight(0xffffff, 1);
    scene.add(light);

    // Canvas 2D como textura
    drawingCanvas = document.createElement('canvas');
    drawingCanvas.width = 1024;
    drawingCanvas.height = 1024;
    drawingContext = drawingCanvas.getContext('2d');
    drawingContext.fillStyle = '#ffffff';
    drawingContext.fillRect(0, 0, drawingCanvas.width, drawingCanvas.height);

    // Textura y plano
    texture = new THREE.CanvasTexture(drawingCanvas);
    const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
    const geometry = new THREE.PlaneGeometry(4, 4);
    drawingPlane = new THREE.Mesh(geometry, material);
    scene.add(drawingPlane);

    // Raycaster
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Eventos
    window.addEventListener('resize', onWindowResize);
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerup', () => isDrawing = false);

    // Controles de cámara
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Teclas
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            isSpacePressed = true;
            updateCursorState();
        }
    });
    window.addEventListener('keyup', (e) => {
        if (e.code === 'Space') {
            isSpacePressed = false;
            updateCursorState();
        }
    });
}

function updateCursorState() {
    if (isSpacePressed) {
        document.body.classList.add('space-pressed');
    } else {
        document.body.classList.remove('space-pressed');
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onPointerDown(event) {
    if (!isSpacePressed) {
        isDrawing = true;
        drawAtPointer(event);
    }
}

function onPointerMove(event) {
    if (!isSpacePressed && isDrawing) {
        drawAtPointer(event);
    }
}

function drawAtPointer(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(drawingPlane);

    if (intersects.length > 0) {
        const uv = intersects[0].uv;
        const x = uv.x * drawingCanvas.width;
        const y = (1 - uv.y) * drawingCanvas.height;

        drawingContext.fillStyle = '#000000';
        drawingContext.beginPath();
        drawingContext.arc(x, y, 4, 0, Math.PI * 2);
        drawingContext.fill();

        texture.needsUpdate = true;
    }
}

function animate() {
    requestAnimationFrame(animate);
    controls.enabled = isSpacePressed;
    controls.update();
    renderer.render(scene, camera);
}
