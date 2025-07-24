// // src/hooks/useAbility.ts
// import { useAuth } from '../context/AuthContext';

// export function useAbility(action: string, op: 'visualizacion'|'creacion'|'edicion'|'inhabilitar'='visualizacion') {
//   const { user } = useAuth();
//   return user?.abilities?.[action]?.[op] ?? false;
// }
