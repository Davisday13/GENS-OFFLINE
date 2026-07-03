# GENS Print Agent

Agente local de impresión térmica para GENS. Permite imprimir desde el navegador a impresoras térmicas:

- **TCP/IP** (puerto 9100 RAW)
- **Bluetooth** (vía puerto COM)
- **USB serial**

## Instalación

```powershell
cd compartido/impresion/agente-impresion
npm install
npm start
```

Corre en `http://localhost:9911`.

## Verificar

Abrir: http://localhost:9911/ping

## Distribución como .exe

```powershell
npx pkg . --targets node18-win-x64 --output dist/gens-print-agent.exe
```

## Autoarranque

Pegar acceso directo en `Inicio` o usar [nssm](https://nssm.cc):
```
nssm install GensPrintAgent "C:\ruta\gens-print-agent.exe"
nssm start GensPrintAgent
```
