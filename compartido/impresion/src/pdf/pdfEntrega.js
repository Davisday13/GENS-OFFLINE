export async function entregarBlob(blob, nombre) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export async function entregarDocPdf(doc, nombre) {
  return entregarBlob(doc.output('blob'), nombre);
}

export async function entregarBase64(b64, nombre, mime = 'application/octet-stream') {
  const chars = atob(b64);
  const bytes = new Uint8Array(chars.length);
  for (let i = 0; i < chars.length; i++) bytes[i] = chars.charCodeAt(i);
  return entregarBlob(new Blob([bytes], { type: mime }), nombre);
}
