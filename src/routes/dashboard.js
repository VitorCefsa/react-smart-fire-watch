const express = require('express');
const router = express.Router();
const { Logs } = require('../models');
const { Sequelize } = require('sequelize');

// 1. Incidentes por dia
router.get('/por-dia', async (req, res) => {
  try {
    const dados = await Logs.findAll({
      attributes: [
        'data',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'total']
      ],
      group: ['data'],
      order: [['data', 'ASC']]
    });

    res.json(dados);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao agregar por dia' });
  }
});

// 2. Incidentes por tipo
router.get('/por-tipo', async (req, res) => {
  try {
    const dados = await Logs.findAll({
      attributes: [
        'tipo_incidente',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'total']
      ],
      group: ['tipo_incidente'],
      order: [['tipo_incidente', 'ASC']]
    });

    res.json(dados);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao agregar por tipo' });
  }
});

// 3. Incidentes por local
router.get('/por-local', async (req, res) => {
  try {
    const dados = await Logs.findAll({
      attributes: [
        'local',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'total']
      ],
      group: ['local'],
      order: [['local', 'ASC']]
    });

    res.json(dados);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao agregar por local' });
  }
});

module.exports = router;
