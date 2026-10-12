# Killi

Front de un proyecto amateur, sin fines comerciales, para aficionados a los killis.

La landing explica el proyecto y abre cinco secciones independientes: especies, ciclos de vida, cría, cuaderno de poblaciones y foro. El menú aparece después del hero y queda fijo al llegar al borde superior. La bienvenida presenta el proyecto, una muestra regional y accesos a las secciones. El hero conserva el acercamiento del rachovii con el scroll.

El catálogo incluye 14 especies: 7 con presencia argentina, 3 de otras zonas de Latinoamérica y 4 africanas. Tiene 12 fichas con fotografías reales y 2 fichas documentadas sin foto. Las especies están agrupadas por procedencia, con búsqueda por nombre actual, sinónimo o país, filtros y fuentes enlazadas. El filtro Latinoamérica incluye también las especies argentinas.

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
- `public/assets/`: fotografías; el hash del nombre permite cachearlas sin conservar versiones viejas al actualizarlas.
- `server.mjs`: servidor HTTP de Node, sin frameworks.
- `Dockerfile` y `railway.json`: despliegue.
- `tests/server.test.mjs`: comprobaciones HTTP y de los archivos publicados.
- `tests/ui.test.mjs`: comprobaciones de navegación, estructura, filtros y contraste.

## Estado del proyecto

El registro es una demostración: no crea cuentas ni almacena contraseñas. Las fichas se conservan únicamente durante la visita y se pierden al recargar. El foro muestra temas de ejemplo y no publica respuestas. El despliegue hospeda este front; no incorpora todavía un backend de usuarios o publicaciones.

Las fotografías y sus licencias/créditos están detallados en **Fuentes y fotografías**, al pie de la página. Esos créditos se mantienen en esta versión.

Se verificaron código, rutas, filtros y la paleta de contraste. La revisión visual completa en navegador continúa pendiente.
