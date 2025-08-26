import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { previewRegistry } from "./previewRegistry";

const ModalCtx = createContext(null);

export const ModalProvider = ({ children }) => {
  const [modal, setModal] = useState(null); // { type, props }

  const open  = useCallback((type, props = {}) => setModal({ type, props }), []);
  const close = useCallback(() => setModal(null), []);

  const value = useMemo(() => ({ open, close }), [open, close]);

  const Comp = modal ? previewRegistry[modal.type] : null;

  return (
    <ModalCtx.Provider value={value}>
      {children}
      {Comp
        ? createPortal(<Comp {...modal.props} onClose={close} />, document.body)
        : null}
    </ModalCtx.Provider>
  );
};

export const useModal = () => {
  const ctx = useContext(ModalCtx);
  if (!ctx) throw new Error("useModal debe usarse dentro de <ModalProvider>");
  return ctx;
};
