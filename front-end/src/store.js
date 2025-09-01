import { configureStore } from "@reduxjs/toolkit";

/** Existentes (tuyos) */
import { resolutionsApi } from "./services/resolutionsApi";
import { transfersApi } from "./services/transfersApi";
import { technologiesApi } from "./services/technologiesApi";
import { tiposProteccionApi } from "./services/tiposProteccionApi";
import { cotitularApi } from "./services/cotitularApi";
import { benefInstitucionesApi } from "./services/benefInstitucionesApi";
import { resolucionOrchestratorApi } from "./services/resolucionOrchestratorApi";
import { archivosApi } from "./services/storage/archivosApi";
import { distribBenefInstitucionesApi } from "./services/distribBenefInstitucionesApi";

/** Nuevos (ya existentes en tu proyecto) */
import { acuerdosDistribAutoresApi } from "./services/acuerdosDistribAutoresApi";
import { proteccionesApi } from "./services/proteccionesApi";
import { cotitularidadInstApi } from "./services/cotitularidadInstApi";
import { cotitularidadTecnoApi } from "./services/cotitularidadTecnoApi";
import { technologyOrchestratorApi } from "./services/technologyOrchestratorApi";
import { tipoTransferenciaApi } from "./services/tipoTransferenciaApi";
import { cotitularidadOrchestratorApi } from "./services/cotitularidadOrchestratorApi";
import { distribucionesApi } from "./services/distribucionesApi";
import { pagosOrchestratorApi } from "./services/pagosOrchestratorApi";
import { pagosFacturasApi } from "./services/pagosFacturasApi";
import { distribucionPagoOrchestratorApi } from "./services/distribucionPagoOrchestratorApi";
import { autoresApi } from "./services/autoresApi";
import { registroPagoApi } from "./services/registroPagoApi";

/** NUEVOS: Cesiones, Sublicenciamientos, Regalias */
import { cesionesApi } from "./services/cesionesApi";
import { sublicenciamientosApi } from "./services/sublicenciamientosApi";
import { regaliasApi } from "./services/regaliasApi";

/** NUEVO: Unidades */
import { unidadesApi } from "./services/unidadesApi";
import { tipoTransferenciaTecnoApi } from "./services/tipoTransferenciaTecnoApi";
import {technologyDetailsApi} from "./services/technologyDetailsApi"


export const store = configureStore({
  reducer: {
    // ---- Existentes
    [technologiesApi.reducerPath]: technologiesApi.reducer,
    [resolutionsApi.reducerPath]: resolutionsApi.reducer,
    [distribucionesApi.reducerPath]: distribucionesApi.reducer,
    [transfersApi.reducerPath]: transfersApi.reducer,
    [tiposProteccionApi.reducerPath]: tiposProteccionApi.reducer,
    [cotitularApi.reducerPath]: cotitularApi.reducer,
    [benefInstitucionesApi.reducerPath]: benefInstitucionesApi.reducer,
    [archivosApi.reducerPath]: archivosApi.reducer,
    [distribBenefInstitucionesApi.reducerPath]: distribBenefInstitucionesApi.reducer,
    [resolucionOrchestratorApi.reducerPath]: resolucionOrchestratorApi.reducer,

    // ---- Nuevos ya existentes
    [acuerdosDistribAutoresApi.reducerPath]: acuerdosDistribAutoresApi.reducer,
    [proteccionesApi.reducerPath]: proteccionesApi.reducer,
    [cotitularidadInstApi.reducerPath]: cotitularidadInstApi.reducer,
    [cotitularidadTecnoApi.reducerPath]: cotitularidadTecnoApi.reducer,
    [technologyOrchestratorApi.reducerPath]: technologyOrchestratorApi.reducer,
    
    [cotitularidadOrchestratorApi.reducerPath]: cotitularidadOrchestratorApi.reducer,
    [pagosOrchestratorApi.reducerPath]: pagosOrchestratorApi.reducer,
    [pagosFacturasApi.reducerPath]: pagosFacturasApi.reducer,
    [distribucionPagoOrchestratorApi.reducerPath]: distribucionPagoOrchestratorApi.reducer,
    [autoresApi.reducerPath]: autoresApi.reducer,
    [registroPagoApi.reducerPath]: registroPagoApi.reducer,

    // ---- NUEVOS
    [cesionesApi.reducerPath]: cesionesApi.reducer,
    [sublicenciamientosApi.reducerPath]: sublicenciamientosApi.reducer,
    [regaliasApi.reducerPath]: regaliasApi.reducer,

    // ---- NUEVO: Unidades
    [unidadesApi.reducerPath]: unidadesApi.reducer,
    [tipoTransferenciaApi.reducerPath]: tipoTransferenciaApi.reducer,
    [tipoTransferenciaTecnoApi.reducerPath]: tipoTransferenciaTecnoApi.reducer,
    [technologyDetailsApi.reducerPath]: technologyDetailsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      // ---- Existentes
      .concat(technologiesApi.middleware)
      .concat(resolutionsApi.middleware)
      .concat(distribucionesApi.middleware)
      .concat(transfersApi.middleware)
      .concat(tiposProteccionApi.middleware)
      .concat(cotitularApi.middleware)
      .concat(benefInstitucionesApi.middleware)
      .concat(archivosApi.middleware)
      .concat(distribBenefInstitucionesApi.middleware)
      .concat(resolucionOrchestratorApi.middleware)

      // ---- Nuevos ya existentes
      .concat(acuerdosDistribAutoresApi.middleware)
      .concat(proteccionesApi.middleware)
      .concat(cotitularidadInstApi.middleware)
      .concat(cotitularidadTecnoApi.middleware)
      .concat(technologyOrchestratorApi.middleware)
      
      .concat(cotitularidadOrchestratorApi.middleware)
      .concat(pagosOrchestratorApi.middleware)
      .concat(pagosFacturasApi.middleware)
      .concat(distribucionPagoOrchestratorApi.middleware)
      .concat(autoresApi.middleware)
      .concat(registroPagoApi.middleware)

      // ---- NUEVOS
      .concat(cesionesApi.middleware)
      .concat(sublicenciamientosApi.middleware)
      .concat(regaliasApi.middleware)

      // ---- NUEVO: Unidades
      .concat(unidadesApi.middleware)
      .concat(tipoTransferenciaApi.middleware)
      .concat(tipoTransferenciaTecnoApi.middleware)
      .concat(technologyDetailsApi.middleware)
});
