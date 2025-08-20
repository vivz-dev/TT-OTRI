// src/services/storage/archivosOrchestrator.js
import { buildCreateArchivoDto } from "./archivosApi";
import { fileToBase64 } from "./toBase64";

/** ───────────────────────── helpers sesión/JWT ───────────────────────── **/
const truncate = (s, max) => (typeof s === "string" ? s.slice(0, max) : s);

const safeAtobUrl = (str) => {
  try {
    const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "="
    );
    return atob(padded);
  } catch {
    return "";
  }
};

const getJwtPayload = () => {
  try {
    const raw =
      (typeof localStorage !== "undefined" &&
        (localStorage.getItem("app_jwt") || localStorage.getItem("token"))) ||
      "";
    if (!raw.includes(".")) return null;
    const [, payloadB64] = raw.split(".");
    const json = safeAtobUrl(payloadB64);
    return JSON.parse(json);
  } catch {
    return null;
  }
};

const getSessionFullName = () => {
  const p = getJwtPayload() || {};
  const nombres = p.Nombres || p.nombres || p.given_name || "";
  const apellidos = p.Apellidos || p.apellidos || p.family_name || "";
  const full = `${String(nombres).trim()} ${String(apellidos).trim()}`.trim();
  return (full || p.name || "Desconocido").trim();
};

const getSessionIdentification = () => {
  const p = getJwtPayload() || {};
  return (
    p.Identificacion ||
    p.identificacion ||
    p.document ||
    p.documento ||
    p.cedula ||
    ""
  );
};

/** ───────────────────────── orquestador principal ───────────────────────── **/
/**
 * - titulo       -> nombre del archivo (name)
 * - nombresAutor -> nombres + apellidos del usuario logueado (JWT)
 * - idTEntidad   -> id de la entidad (obligatorio)
 * - tipoEntidad  -> código de 1..2 chars: R, T, PI, CO, D, TT, F, SP
 * - Loggea el response CRUDO de DSpace y usa data.urlDspace para el backend.
 */
export async function uploadAndSaveArchivo({
  file,
  meta = {},
  uploadToDspace,
  createArchivo,
}) {
  if (!file) throw new Error("Se requiere el archivo.");

  const idTEntidad = meta.idTEntidad ?? meta.entityId;
  if (!idTEntidad) {
    console.warn("[ORQ-ARCHIVOS] Falta idTEntidad (id de la entidad). Abortando.");
    throw new Error("Falta idTEntidad (id de la entidad).");
  }

  // 🆕 tipoEntidad viene en meta.tipoEntidad (R, T, PI, CO, D, TT, F, SP)
  const tipoEntidad = meta.tipoEntidad ?? meta.TipoEntidad ?? null;

  const { base64, mime, name, size, ext } = await fileToBase64(file);

  // Reglas solicitadas:
  const titulo = meta.titulo ?? name;
  const nombresAutor = meta.nombresAutor ?? getSessionFullName();
  const identificacion = meta.identificacion ?? getSessionIdentification();
  const idColeccion = meta.idColeccion ?? 155;

  // 1) Subir a DSpace
  const dspacePayload = {
    userDspace: "usuario03@espol.edu.ec",
    passwordDspace: "usuario03",
    archivoBase64: base64,
    titulo,
    identificacion: identificacion || "",
    nombresAutor,
    nombreArchivo: name,
    idColeccion,
  };

  console.groupCollapsed("[ORQ-ARCHIVOS] Subida a DSpace");
  console.log("fileInfo:", { name, size, mime, ext, base64Len: base64?.length ?? 0 });
  console.log(
    "dspacePayload (JSON, archivoBase64 omitido):",
    JSON.stringify(
      { ...dspacePayload, archivoBase64: `<omitted: ${base64?.length ?? 0} bytes>` },
      null,
      2
    )
  );
  console.groupEnd();

  const dspaceRes = await uploadToDspace(dspacePayload);
  if (dspaceRes?.error) {
    console.error("[ORQ-ARCHIVOS] Error DSpace:", dspaceRes.error);
    throw new Error(dspaceRes.error?.data || "Error al subir a DSpace");
  }

  // 🔎 LOG: respuesta CRUDA tal cual viene del WS
  console.groupCollapsed("[ORQ-ARCHIVOS] DSpace raw response");
  console.log(dspaceRes);                 // objeto crudo RTKQ
  console.log("raw.data:", dspaceRes?.data); // JSON body del WS
  console.groupEnd();

  // ✅ Parseo explícito del esquema
  const raw = dspaceRes?.data ?? {};
  const statusOk = raw?.status?.isSuccessfully === true;
  const messages = Array.isArray(raw?.status?.messages) ? raw.status.messages : [];
  const dsData = raw?.data ?? {};

  const idItem = dsData?.idItem ?? null;
  const urlDspace = typeof dsData?.urlDspace === "string" ? dsData.urlDspace : "";
  const urlDescargaServicio =
    typeof dsData?.urlDescargaServicio === "string" ? dsData.urlDescargaServicio : "";

  if (!statusOk) {
    const msg = messages.join(" | ") || "DSpace respondió status.isSuccessfully = false.";
    console.error("[ORQ-ARCHIVOS] DSpace NOT OK:", { status: raw?.status, data: dsData });
    throw new Error(msg);
  }

  console.log("[ORQ-ARCHIVOS] DSpace OK:", { idItem, urlDspace, urlDescargaServicio });

  // 2) Guardar en tu backend (usando urlDspace) + incluir TipoEntidad
  const createDto = buildCreateArchivoDto({
    nombre: truncate(name, 100),                     // DDL: VARGRAPHIC 100
    formato: truncate((mime || ext || "pdf"), 10),   // DDL: VARGRAPHIC 10
    tamano: size,
    url: truncate(urlDspace || "", 200),             // DDL: VARGRAPHIC 200
    idTEntidad,
    tipoEntidad: truncate(tipoEntidad ?? "", 2),     // DDL: VARCHAR 2
  });

  console.groupCollapsed("[ORQ-ARCHIVOS] Backend payload (JSON)");
  console.log(JSON.stringify(createDto, null, 2));
  console.groupEnd();

  const createRes = await createArchivo(createDto);
  if (createRes?.error) {
    console.error("[ORQ-ARCHIVOS] Error backend /archivos:", createRes.error);
    throw new Error(createRes.error?.data || "Error al registrar archivo en backend");
  }

  console.log("[ORQ-ARCHIVOS] Backend OK:", createRes.data);

  return { idItem, urlDspace, urlDescargaServicio, archivo: createRes.data };
}
