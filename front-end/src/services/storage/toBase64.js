export const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result || '';
        const [meta, payload] = String(result).split(',');
        const mimeMatch = /^data:(.*?);base64$/i.exec(meta || '');
        const mime = mimeMatch?.[1] || file.type || '';
        const name = file.name || 'archivo';
        const size = file.size ?? null;
        const ext = (name.includes('.') ? name.split('.').pop() : '') || '';

        if (!payload) {
          return reject(new Error('No se pudo obtener el payload base64 del archivo.'));
        }
        resolve({ base64: payload, mime, name, size, ext });
      };
      reader.onerror = (err) => reject(err || new Error('Error al leer el archivo.'));
    } catch (e) {
      reject(e);
    }
  });
