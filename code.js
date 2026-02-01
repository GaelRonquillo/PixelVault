const express = require('express');
const router = express.Router();
const db = require('../database/db');

// GET - Obtener todas las reseñas
router.get('/', (req, res) => {
    try {
        const reviews = db.prepare('SELECT * FROM reviews ORDER BY created_at DESC').all();
        res.json({
            success: true,
            data: reviews,
            total: reviews.length
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al obtener reseñas',
            details: error.message 
        });
    }
});

// GET - Obtener una reseña por ID
router.get('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const review = db.prepare('SELECT * FROM reviews WHERE id = ?').get(id);
        
        if (!review) {
            return res.status(404).json({ 
                success: false, 
                error: 'Reseña no encontrada' 
            });
        }
        
        res.json({
            success: true,
            data: review
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al obtener la reseña',
            details: error.message 
        });
    }
});

// POST - Crear nueva reseña
router.post('/', (req, res) => {
    try {
        const { nombre, descripcion } = req.body;
        
        // Validación
        if (!nombre || nombre.trim().length < 3) {
            return res.status(400).json({ 
                success: false, 
                error: 'El nombre debe tener al menos 3 caracteres' 
            });
        }
        
        const fechaCreacion = new Date().toLocaleString('es-MX');
        
        const stmt = db.prepare(`
            INSERT INTO reviews (nombre, descripcion, completada, fecha_creacion)
            VALUES (?, ?, 0, ?)
        `);
        
        const result = stmt.run(nombre.trim(), descripcion?.trim() || '', fechaCreacion);
        
        const newReview = db.prepare('SELECT * FROM reviews WHERE id = ?').get(result.lastInsertRowid);
        
        res.status(201).json({
            success: true,
            message: '✅ Reseña creada exitosamente',
            data: newReview
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al crear la reseña',
            details: error.message 
        });
    }
});

// PUT - Actualizar reseña
router.put('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, completada } = req.body;
        
        // Verificar que existe
        const exists = db.prepare('SELECT id FROM reviews WHERE id = ?').get(id);
        if (!exists) {
            return res.status(404).json({ 
                success: false, 
                error: 'Reseña no encontrada' 
            });
        }
        
        // Validación
        if (nombre && nombre.trim().length < 3) {
            return res.status(400).json({ 
                success: false, 
                error: 'El nombre debe tener al menos 3 caracteres' 
            });
        }
        
        const stmt = db.prepare(`
            UPDATE reviews 
            SET nombre = COALESCE(?, nombre),
                descripcion = COALESCE(?, descripcion),
                completada = COALESCE(?, completada)
            WHERE id = ?
        `);
        
        stmt.run(
            nombre?.trim() || null,
            descripcion?.trim() || null,
            completada !== undefined ? (completada ? 1 : 0) : null,
            id
        );
        
        const updatedReview = db.prepare('SELECT * FROM reviews WHERE id = ?').get(id);
        
        res.json({
            success: true,
            message: '✅ Reseña actualizada exitosamente',
            data: updatedReview
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al actualizar la reseña',
            details: error.message 
        });
    }
});

// DELETE - Eliminar reseña
router.delete('/:id', (req, res) => {
    try {
        const { id } = req.params;
        
        // Verificar que existe
        const exists = db.prepare('SELECT id FROM reviews WHERE id = ?').get(id);
        if (!exists) {
            return res.status(404).json({ 
                success: false, 
                error: 'Reseña no encontrada' 
            });
        }
        
        const stmt = db.prepare('DELETE FROM reviews WHERE id = ?');
        stmt.run(id);
        
        res.json({
            success: true,
            message: '🗑️ Reseña eliminada exitosamente'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al eliminar la reseña',
            details: error.message 
        });
    }
});

// GET - Obtener estadísticas
router.get('/stats/summary', (req, res) => {
    try {
        const stats = db.prepare(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN completada = 1 THEN 1 ELSE 0 END) as completadas,
                SUM(CASE WHEN completada = 0 THEN 1 ELSE 0 END) as pendientes
            FROM reviews
        `).get();
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Error al obtener estadísticas',
            details: error.message 
        });
    }
});

module.exports = router;