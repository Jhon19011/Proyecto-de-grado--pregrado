# Memoria tecnica del proyecto

Fecha de auditoria: 2026-04-27

Este archivo resume el contexto aprendido sobre el sistema y las directrices que debo seguir cuando desarrolle sobre este codigo. Debe leerse antes de tocar backend o frontend.

## Vision general

El proyecto es un sistema de inventarios de sustancias quimicas para laboratorios/sedes. Esta dividido en:

- `Backend`: API Node.js con Express 5, MySQL, JWT, bcrypt, multer, nodemailer y ExcelJS.
- `Proyecto-inventarios`: frontend Angular 19 standalone, Bootstrap 5, HttpClient con interceptor JWT.

La app maneja usuarios, autenticacion, sedes, roles, sustancias, sustancias controladas, unidades, inventarios principales/secundarios, asignacion de sustancias a inventarios, movimientos de entrada/salida, traslados, alertas y reportes Excel.

## Estructura backend

Entrada principal:

- `Backend/src/index.js`: levanta Express en el puerto configurado.
- `Backend/src/app.js`: configura middleware, CORS, JSON, archivos estaticos de `/uploads`, rutas publicas y rutas privadas.
- `Backend/src/config.js`: lee `.env`, pero aun contiene valores por defecto sensibles.
- `Backend/src/DB/mysql.js`: conexion global MySQL con helpers `query`, `insertarDB`, `actualizarDB`, `eliminarDB`, etc.

Rutas publicas reales:

- `/api/auth/login`
- `/api/usuarios/recuperar`
- `/api/usuarios/restablecer`

Ojo: `app.js` monta todo `/api/usuarios` antes de `app.use(verificarToken)`, pero las rutas sensibles de usuarios vuelven a aplicar `verificarToken` y `verificarRol` internamente. No asumir que todo lo montado antes del middleware global es publico; revisar cada ruta.

Rutas privadas principales:

- `/api/sustancias`
- `/api/inventarios`
- `/api/inventario_sustancias`
- `/api/movimientos`
- `/api/unidades`
- `/api/alertas`
- `/api/reportes`

## Modelo mental de negocio

- Un usuario tiene `rol` numerico en BD, que se mapea a texto en el JWT: `1 -> Administrador`, `4 -> Auxiliar`.
- El JWT contiene `id`, `nombres`, `apellidos`, `rol` y `sedeU`.
- La sede del usuario (`req.user.sedeU`) filtra sustancias, inventarios, alertas y autorizaciones.
- Las sustancias se crean por sede (`sede_s`) y pueden tener unidad, PDFs, marca, CAS, clase ONU, categoria IARC, presentacion y bandera `esControlada`.
- Las sustancias controladas usan `autorizacion_sustancia` por sede.
- Los inventarios viven en tabla `tablas`, tienen `sedeT`, `principal` y `estado`.
- Solo puede existir un inventario principal activo por sede.
- Eliminar inventario es soft delete (`estado = 0`) y solo se permite si no contiene sustancias activas.
- La relacion inventario-sustancia vive en `inventario_sustancia`.
- Cada asignacion tiene `cantidad`, `cantidadremanente`, `gastototal`, `ubicaciondealmacenamiento`, `cedula_principal`, `estado_uso`, `lote`, `fechadevencimiento`, `observaciones` y `estado`.
- Al asignar una sustancia, `cantidadremanente = cantidad`, `gastototal = 0` y `cedula_principal` se actualiza con el id generado.
- Los movimientos locales actualizan remanente, cantidad y gasto total. `estado_uso` se calcula como `Nuevo`, `En uso` o `Agotado`.
- Los traslados entre inventarios usan transaccion: descuentan del origen, crean nueva asignacion en destino, preservan `cedula_principal`, registran salida y entrada.
- Las alertas se generan al listar inventario: agotado, vencido y proximo a vencer en 30 dias.
- Reportes Excel usan la plantilla `Backend/plantillas/SUSTANCIAS_QUIMICAS.xlsx`.

## Estructura frontend

Angular 19 con componentes standalone:

- `app.routes.ts`: rutas de login, registro, recuperar/restablecer, inicio, usuarios, perfil, sustancias, controladas, inventarios y detalle de inventario.
- `app.config.ts`: router y HttpClient con `TokenInterceptor`.
- `auth.guard.ts`: solo valida existencia de token en localStorage.
- `interceptors/token.interceptor.ts`: agrega `Authorization: Bearer <token>`.

Servicios:

- `login-service.service.ts`: login, localStorage, logout.
- `usuario.service.ts`: CRUD y busqueda de usuarios.
- `sustancias.service.ts`: CRUD sustancias, controladas y autorizacion.
- `inventarios.service.ts`: CRUD inventarios.
- `inventario-sustancia.service.ts`: listar paginado, asignar, editar, eliminar y trasladar.
- `movimientos.service.ts`: movimientos e historial.
- `alertas.service.ts`: listar y marcar alertas.
- `unidades.service.ts`: listar, crear y eliminar unidades.
- `reportes.service.ts`: exportar Excel.
- `recuperar-pass.service.ts`: recuperacion de contrasena.

Componentes de mayor carga logica:

- `inventario-detalle.component.ts`: asignacion, filtros, paginado, movimientos, traslados, historial y exportacion.
- `sustancias.component.ts`: CRUD de sustancias, FormData, PDFs y unidades.
- `inventarios.component.ts`: inventarios principal/secundarios.
- `controladas.component.ts`: sustancias controladas y autorizaciones.
- `usuarios.component.ts` y `registro.component.ts`: usuarios.
- `inicio.component.ts`: navegacion principal, alertas y logout.

## Contratos API importantes

Hay dos estilos de respuesta mezclados:

- Envueltas con `respuesta.success`: `{ error: false, status, body }`.
- JSON directo: por ejemplo login, algunos movimientos, alertas y paginado de inventario.

En frontend se suele usar `res.body || res`. Mantener compatibilidad mientras no se haga una refactorizacion coordinada.

Para crear/editar sustancias se usa `FormData` con estos campos principales:

- `numero`, `codigo`, `nombreComercial`, `marca`, `lote`, `CAS`, `clasedepeligrosegunonu`, `categoriaIARC`, `estado`, `fechadevencimiento`, `presentacion`, `unidad`, `PDF`, `esControlada`.
- Archivos: `pdf_seguridad`, `pdf_tecnico`.
- Borrado de PDFs: `eliminar_pdf_seguridad = true`, `eliminar_pdf_tecnico = true`.

Para listar inventario sustancia:

- Endpoint: `GET /api/inventario_sustancias/:tabla`
- Query: `page`, `limit`, `sustancia`, `codigo`, `ubicacion`, `cedula`, `estado_uso`, `unidad`, `lote`, `fecha_vencimiento`, `esControlada`.
- Respuesta directa esperada: `{ data, total, totalPages, page, limit, totalRemanente }`.

## Hallazgos de auditoria

Criticos o altos:

- Hay secretos hardcodeados: JWT usa `'secreto'` y recuperacion usa `'secreto_reset'`; `config.js` tiene password MySQL por defecto. Mover a `.env` antes de produccion.
- `Backend/src/config.js` no debe conservar credenciales reales como fallback.
- Muchos endpoints construyen SQL dinamico con nombres de campos desde `data` (`actualizarUsuario`, `actualizarSustancia`, `actualizarInventario`, helpers genericos). Aunque los valores van parametrizados, los nombres de columnas deben pasar por allowlist cuando vengan del cliente.
- Falta validacion numerica estricta en cantidades, ids, fechas y booleanos. Evitar cantidades negativas, `NaN`, cero cuando no corresponda y fechas invalidas.
- El control de acceso depende mucho del frontend y de roles puntuales. Cualquier nueva ruta sensible debe aplicar `verificarToken` y, si corresponde, `verificarRol`.
- Los secretos de correo y JWT deben estar en variables de entorno; nunca en codigo.

Medios:

- Hay URLs `http://localhost:4000/api` hardcodeadas en muchos servicios. Usar `environment.apiUrl` de forma consistente.
- Hay muchos `console.log` con datos internos, tokens, filtros o usuario. En produccion deben eliminarse o reemplazarse por logging controlado.
- `localStorage` guarda token y datos del usuario. Es simple, pero expone mas superficie ante XSS. Minimizar datos guardados y no confiar en ellos para permisos.
- El backend mezcla respuestas envueltas y directas. Antes de cambiar eso, coordinar todos los servicios/componentes afectados.
- La ruta `POST /api/movimientos` tiene una rama probablemente incorrecta: si `data.destino_id`, llama `controlador.trasladarSustancia(data.user)` en vez de pasar `(data, req.user)`. El flujo real parece usar `/api/movimientos/trasladar`.
- En reportes, `exportarInventario` consulta `SELECT * FROM inventario_sustancia`, pero llena columnas con nombres como `nombre_comercial`, `cas`, `clase_onu`, que no coinciden con los nombres usados en los joins de otros modulos. Puede exportar vacios si no se ajusta el SELECT.
- `mysql.js` intenta reconectar si `err.code === 'Conexion perdida'`, pero MySQL normalmente usa codigos tipo `PROTOCOL_CONNECTION_LOST`.
- `sustancias/rutas.js` tiene `GET /:id` y `DELETE /:id` sin `verificarToken` local. Actualmente quedan protegidas porque el router completo se monta despues de `app.use(verificarToken)`, pero esta dependencia debe recordarse.
- El proyecto contiene `node_modules` dentro del repo de trabajo; no editar dependencias generadas.

Bajos o deuda tecnica:

- Hay mojibake en muchos textos (`ConfiguraciÃ³n`, `contraseÃ±a`, etc.). Probable problema historico de encoding. Corregir gradualmente cuidando UTF-8.
- Hay uso amplio de `any` en Angular. Para cambios grandes, introducir interfaces (`Usuario`, `Sustancia`, `Inventario`, `InventarioSustancia`, `Movimiento`, `Alerta`).
- Se usan `alert` y `confirm` nativos. Mantener si el cambio es pequeno, pero para UX seria mejor un servicio/modal de notificaciones.
- `src/styles.css` contiene `background-image: url ('./img/fondo.jpg');` con espacio invalido entre `url` y `(`.
- `app.component.ts` conserva `apiUrl = 'http://localhost:4000/api/rol'` y `roles` sin uso visible.

## Directrices para desarrollar

Backend:

- Mantener el patron modular: cada dominio con `rutas.js` y `controlador.js`.
- Usar `db.query(sql, params)` con parametros para valores. Nunca interpolar valores del usuario en SQL.
- Si se construye SQL dinamico con nombres de columnas, usar allowlist explicita.
- Respetar `req.user.sedeU` para aislar datos por sede.
- Respetar roles: Administrador para gestion de usuarios, inventarios y autorizaciones; Auxiliar solo donde ya este permitido.
- No romper soft deletes: inventarios y asignaciones usan `estado`.
- En movimientos y traslados, conservar consistencia de `cantidad`, `cantidadremanente`, `gastototal`, `estado_uso` y `cedula_principal`.
- Para operaciones multi-query que modifican stock, usar transacciones como en `trasladarSustancia`.
- Si se agregan archivos, validar mimetype, extension y ruta; no confiar en `originalname`.
- Centralizar secretos en `.env`: `JWT_SECRET`, `JWT_RESET_SECRET`, `MYSQL_*`, `EMAIL_PASS`, `FRONT_URL`.
- Al crear errores de negocio, preferir `error('mensaje', codigo)` para que el middleware respete el status.

Frontend:

- Preferir `environment.apiUrl` en todos los servicios.
- Mantener el interceptor JWT; no agregar manualmente el header salvo caso excepcional.
- Conservar el patron `res.body || res` hasta unificar el contrato backend.
- Para formularios de sustancias, mantener `FormData`; no fijar manualmente `Content-Type`.
- Antes de tocar `InventarioDetalleComponent`, revisar efectos en asignacion, filtros, paginado, movimientos, traslado e historial.
- Evitar confiar en `localStorage.rol` para seguridad real; usarlo solo para UI.
- En mejoras grandes, crear interfaces TypeScript y reducir `any` poco a poco.
- Si se toca Bootstrap/modal manual, limpiar backdrops y estado del body como ya hace el detalle de inventario.

Base de datos y nombres:

- Tablas relevantes: `usuario`, `rol`, `sede`, `sustancia`, `unidades`, `tablas`, `inventario_sustancia`, `movimientos_sustancia`, `alertas`, `autorizacion_sustancia`.
- No cambiar nombres de columnas sin actualizar backend y frontend juntos.
- Hay nombres en espanol y algunos sin tilde: mantener compatibilidad con BD.

Validacion minima recomendada en nuevos cambios:

- IDs: enteros positivos.
- Cantidades: numeros finitos mayores a cero donde aplique.
- Fechas: ISO `YYYY-MM-DD` desde frontend y validacion en backend.
- Strings: trim, longitud maxima razonable y campos obligatorios claros.
- Booleanos desde formularios: normalizar `0/1`, `true/false` y strings si llegan por `FormData`.

## Comandos utiles

Backend:

```powershell
cd Backend
npm run dev
node -c src\app.js
node -c src\modulos\inventario_sustancias\controlador.js
```

Frontend:

```powershell
cd Proyecto-inventarios
npm start
npm run build
```

Resultado de verificacion en esta auditoria:

- `node -c Backend/src/app.js`: OK.
- `node -c Backend/src/modulos/inventario_sustancias/controlador.js`: OK.
- `npm run build` en Angular: OK fuera del sandbox. Advertencias: bundle inicial 778.31 kB excede presupuesto de 500 kB; Angular reporta 9 reglas de Bootstrap omitidas por selector.

## Prioridades sugeridas

1. Mover secretos a `.env` y eliminar fallbacks sensibles.
2. Unificar `environment.apiUrl` en servicios Angular.
3. Corregir rama defectuosa de `POST /api/movimientos` o eliminarla si no se usa.
4. Revisar exportacion Excel con un SELECT que haga join a `sustancia`, `unidades` y `tablas`.
5. Agregar allowlists para updates dinamicos.
6. Reducir logs con datos sensibles.
7. Normalizar respuestas API o documentar formalmente cuales endpoints devuelven directo.
8. Corregir mojibake/encoding de textos visibles.
