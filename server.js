const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./database/db');
const reviewsRouter = require('./routes/reviews');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir archivos estáticos (tu frontend)
app.use(express.static(path.join(__dirname, 'public')));

// Rutas de la API
app.use('/api/reviews', reviewsRouter);

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta de prueba
app.get('/api/test', (req, res) => {
    res.json({ 
        message: '🎮 PixelVault API funcionando correctamente!',
        timestamp: new Date().toISOString()
    });
});

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`
    ╔════════════════════════════════════════╗
    ║     🎮 PIXELVAULT SERVER ACTIVO 🎮    ║
    ╠════════════════════════════════════════╣
    ║  Servidor: http://localhost:${PORT}      ║
    ║  API: http://localhost:${PORT}/api       ║
    ╚════════════════════════════════════════╝
    `);
});

module.exports = app;
