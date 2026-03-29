const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/user.controller');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth.middleware');

router.use(authenticateToken);

router.get('/', authorizeRoles('ADMIN', 'MANAGER'), ctrl.getUsers);
router.post('/', authorizeRoles('ADMIN'), ctrl.createUser);
router.get('/managers', authorizeRoles('ADMIN', 'MANAGER'), ctrl.getManagers);
router.get('/team-expenses', authorizeRoles('MANAGER', 'FINANCE', 'DIRECTOR', 'ADMIN'), ctrl.getTeamExpenses);
router.put('/:id', authorizeRoles('ADMIN'), ctrl.updateUser);
router.delete('/:id', authorizeRoles('ADMIN'), ctrl.deleteUser);

module.exports = router;