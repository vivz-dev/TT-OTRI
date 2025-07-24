// 2. Backend (Node/Express + Auth)
// Autenticación

// Emite un JWT en /login con:

// json
// Copiar
// Editar
// {
//   "sub": "<user_id>",
//   "roles": ["gestor_otri"]          // múltiple si aplica
// }
// Firma con tu secret / JWK.


// 2. Cargar permisos en cache

// ts
// Copiar
// Editar
// // services/permissions.ts
// import db from '../db';

// export async function getRoleAbilities(roleNames: string[]) {
//   // SELECT ... FROM permisos JOIN roles JOIN acciones WHERE roles.nombre IN (...)
//   const rows = await db
//     .select('a.nombre AS action', 'p.visualizacion', 'p.creacion',
//             'p.edicion', 'p.inhabilitar')
//     .from('permisos as p')
//     .join('roles as r', 'r.rol_id', 'p.rol_id')
//     .join('acciones as a', 'a.accion_id', 'p.accion_id')
//     .whereIn('r.nombre', roleNames);

//   /* Devuelve un map { action: { ver: true, crear: false, ... } } */
//   const perms: Record<string, any> = {};
//   rows.forEach(row => { perms[row.action] = row; });
//   return perms;
// }

// Middleware de autorización

// ts
// Copiar
// Editar
// // middlewares/authorize.ts
// import { getRoleAbilities } from '../services/permissions';

// export const authorize =
//   (action: string, operation: keyof AbilityRow) =>
//   async (req, res, next) => {
//     const { roles } = req.user;                 // JWT → Passport, etc.
//     const abilities = await getRoleAbilities(roles);
//     if (abilities[action]?.[operation]) return next();
//     return res.status(403).json({ error: 'Forbidden' });
//   };
// Uso en rutas

// ts
// Copiar
// Editar
// router.get('/pagos',
//   authorize('pagos', 'visualizacion'),
//   pagosController.list);

// router.post('/pagos',
//   authorize('pagos', 'creacion'),
//   pagosController.create);
// Ventaja: Solo cambias la tabla permisos; nada de código.

