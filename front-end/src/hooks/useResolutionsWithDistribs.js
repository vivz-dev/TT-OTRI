import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useMemo } from 'react';
import { resolutionsApi, useGetResolutionsQuery } from '../services/resolutionsApi';

export const useResolutionsWithDistribs = () => {
  const dispatch = useDispatch();

  const {
    data: resolutions = [],
    isLoading: resLoading,
    isFetching: resFetching,
    error: resError,
  } = useGetResolutionsQuery();

  // Disparar fetch por cada resolución (una vez)
  useEffect(() => {
    if (!resolutions.length) return;
    const subs = resolutions.map((r) => {
      const id = r.id ?? r.Id ?? r.idResolucion ?? r.IdResolucion;
      if (id == null) return null;
      return dispatch(
        resolutionsApi.endpoints.getDistributionsByResolution.initiate(id)
      );
    });
    return () => subs.forEach((s) => s?.unsubscribe?.());
  }, [dispatch, resolutions]);

  // 1) Selecciona SOLO el slice de RTKQ (esto es estable y no crea objetos nuevos)
  const apiSlice = useSelector((s) => s[resolutionsApi.reducerPath]);

  // 2) Deriva el Map en un useMemo (¡fuera de useSelector!)
  const distribsByResolution = useMemo(() => {
    const fakeRoot = { [resolutionsApi.reducerPath]: apiSlice };
    const map = new Map();

    for (const r of resolutions) {
      const id = r.id ?? r.Id ?? r.idResolucion ?? r.IdResolucion;
      if (id == null) continue;

      const sel = resolutionsApi.endpoints.getDistributionsByResolution.select(id);
      const { data, isFetching, isLoading, error } = sel(fakeRoot) || {};

      map.set(id, {
        data: data || [],
        isLoading: !!isLoading,
        isFetching: !!isFetching,
        error: error || null,
      });
    }

    return map;
  }, [apiSlice, resolutions]);

  // 3) Enriquecido final
  const enriched = useMemo(() => {
    return resolutions.map((r) => {
      const id = r.id ?? r.Id ?? r.idResolucion ?? r.IdResolucion;
      const entry = distribsByResolution.get(id) || {};
      return {
        resolucion: r,
        distribuciones: entry.data || [],
        distLoading: !!entry.isLoading,
        distFetching: !!entry.isFetching,
        distError: entry.error || null,
      };
    });
  }, [resolutions, distribsByResolution]);

  const anyDistLoading = enriched.some((x) => x.distLoading);
  const anyDistFetching = enriched.some((x) => x.distFetching);
  const errors = [resError, ...enriched.map((x) => x.distError).filter(Boolean)].filter(Boolean);

  return {
    data: enriched,
    isLoading: resLoading || anyDistLoading,
    isFetching: resFetching || anyDistFetching,
    error: errors.length ? errors : null,
  };
};
