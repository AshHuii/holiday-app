'use strict';

const { Router } = require('express');
const ctrl = require('../controllers/spcdeController');

const router = Router();

// GET /api/spcde/holidays?year=2025&month=05
router.get('/holidays',     ctrl.getHolidays);

// GET /api/spcde/restdays?year=2025&month=05
router.get('/restdays',     ctrl.getRestdays);

// GET /api/spcde/anniversaries?year=2025&month=05
router.get('/anniversaries',ctrl.getAnniversaries);

// GET /api/spcde/24divisions?year=2025&month=03
router.get('/24divisions',  ctrl.get24Divisions);

// GET /api/spcde/sundrydays?year=2025&month=01
router.get('/sundrydays',   ctrl.getSundryDays);

module.exports = router;