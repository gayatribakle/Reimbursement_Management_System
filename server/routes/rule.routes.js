const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/rule.controller');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth.middleware');

router.use(authenticateToken);
router.use(authorizeRoles('ADMIN'));

router.get('/', ctrl.getRules);
router.post('/', ctrl.createRule);
router.put('/:id', ctrl.updateRule);
router.delete('/:id', ctrl.deleteRule);
router.patch('/:id/default', ctrl.setDefault);

module.exports = router;