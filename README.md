# Killi

Front de un proyecto amateur, sin fines comerciales, para aficionados a los killis.

La landing explica el proyecto y abre cinco secciones independientes: especies, ciclos de vida, cría, cuaderno de poblaciones y foro. El menú aparece después del hero y queda fijo al llegar al borde superior. La bienvenida presenta el proyecto, una muestra regional y accesos a las secciones. El hero conserva el acercamiento del rachovii con el scroll.

El catálogo incluye 33 especies: 13 con presencia argentina, 11 de otras zonas de Latinoamérica, 7 africanas o de islas del Índico y 2 asiáticas. Tiene 21 fichas con fotografías reales y 12 fichas sin foto. Incluye búsqueda por nombre actual, sinónimo o país, filtros regionales y fuentes por ficha. Latinoamérica incluye también Argentina. Los países mostrados son registros documentados y la lista puede no ser exhaustiva.

En celular, el hero usa una composición en columna: el pez se acerca con el scroll dentro de su espacio, sin tapar ni desvanecer el texto; el menú organiza seis secciones en dos columnas y conserva una descripción para cada una.

## Ejecutar

Requiere Node.js 24. No tiene dependencias externas ni necesita instalar paquetes.

```sh
npm start
```

Abrir http://localhost:3000. Para otro puerto: `PORT=8080 npm start`.

```sh
npm test
```

## Desplegar en Railway

1. Crear un proyecto y elegir **Deploy from GitHub repo**.
2. Seleccionar `Memu007/ynerakillis`, rama `main`, con directorio raíz `/`.
3. Railway detecta el `Dockerfile` y aplica `railway.json`. No hace falta una base de datos ni un comando de instalación.
4. En el servicio, abrir **Settings → Networking → Public Networking → Generate Domain**.

El servidor escucha en `0.0.0.0` y usa el `PORT` que asigna Railway. La comprobación de arranque está en `/health`. Después de conectar el repo, los cambios en la rama elegida pueden desplegarse automáticamente.

Referencias: [configuración por archivo](https://docs.railway.com/config-as-code/reference), [healthchecks](https://docs.railway.com/deployments/healthchecks), [dominio público](https://docs.railway.com/networking/public-networking).

## Archivos

- `public/index.html`: contenido, diseño y navegación del front.
- `data/species.json`: base de especies, afirmaciones respaldadas por fuentes, fecha de revisión, sinónimos y derechos de fotografías.
- `scripts/build-catalog.mjs`: genera catálogo y créditos desde la base, sin dependencias. Después de editar los datos, ejecutar `node scripts/build-catalog.mjs` y luego `node scripts/build-language.mjs`.
- `public/assets/`: fotografías; el hash del nombre permite cachearlas sin conservar versiones viejas al actualizarlas.
- `server.mjs`: servidor HTTP de Node, sin frameworks.
- `Dockerfile` y `railway.json`: despliegue.
- `tests/server.test.mjs`: comprobaciones HTTP y de los archivos publicados.
- `tests/ui.test.mjs`: comprobaciones de navegación, estructura, filtros y contraste.
- `data/i18n.json` y `scripts/build-language.mjs`: textos bilingües integrados en el HTML. El selector ES/EN cambia la vista actual sin navegar ni recargar y recuerda el idioma en este navegador.
- `tests/language.test.mjs`: cambio de idioma y traducciones del catálogo.
- `tests/catalog.test.mjs`: integridad de fichas, fuentes y fotografías.

## Estado del proyecto

El registro es una demostración: no crea cuentas ni almacena contraseñas. Las fichas se conservan únicamente durante la visita y se pierden al recargar. El foro muestra temas de ejemplo y no publica respuestas. El despliegue hospeda este front; no incorpora todavía un backend de usuarios o publicaciones.

Las fotografías y sus licencias/créditos están detallados en **Fuentes y fotografías**, al pie de la página. Se indican los recortes, la compresión y las licencias por imagen. Las fotografías de vandenbergi y monstrosus son CC BY-NC-SA 4.0 y conservan su restricción no comercial. Dos fotografías heredadas (rachovii y bivittatum) tienen autor acreditado pero permiso de reutilización pendiente; no se presentan como imágenes libres.

Se verificaron código, rutas, filtros y la paleta de contraste. La revisión visual completa en navegador continúa pendiente.

La fecha de revisión no certifica todos los campos: `sources[].verification` y `review_notes` conservan las comprobaciones y los pendientes. Los datos de cría describen la fuente o la experiencia citada; no se heredan parámetros ni tiempos de incubación de otra especie.
