# Yatta API Endpoints (public, sin API key)

Base usada por el proyecto:
- https://gi.yatta.moe/api/v2

Idiomas observados:
- `en`
- `es`

Nota: este documento solo incluye endpoints publicos consultables sin API key.

## Endpoints confirmados

## 1) Personajes (listado)
- URL: `GET /{lang}/avatar`
- Ejemplo: `https://gi.yatta.moe/api/v2/en/avatar`
- Estado: 200
- Uso actual en el proyecto: si, en `src/data/characters.ts`

Campos top-level relevantes dentro de `data`:
- `props` (diccionario de stats)
- `types` (diccionario de tipos, p.ej. arma)
- `items` (mapa de personajes)

Campos utiles por personaje en `items[id]`:
- `id`
- `rank`
- `name`
- `element`
- `weaponType`
- `region`
- `specialProp`
- `bodyType`
- `icon`
- `birthday`
- `release`
- `route`

## 2) Personaje (detalle)
- URL: `GET /{lang}/avatar/{id}`
- Ejemplo: `https://gi.yatta.moe/api/v2/en/avatar/10000002`
- Estado: 200

Campos top-level relevantes dentro de `data`:
- `id`, `rank`, `name`, `element`, `weaponType`, `region`, `specialProp`, `icon`, `birthday`, `route`
- `fetter` (historia/perfil)
- `upgrade` (costes de ascension)
- `other`
- `ascension`
- `items` (materiales/referencias embebidas por id)
- `talent` (normal/skill/burst con niveles y costes)
- `constellation` (C1..C6)
- `dictionary`

Estructura observada para `talent['0']`:
- `type`
- `name`
- `description`
- `descriptionBuff`
- `icon`
- `promote`
- `cooldown`
- `cost`
- `linkedConstellations`

Estructura observada para `constellation['0']`:
- `id`
- `name`
- `description`
- `descriptionBuff`
- `extraData`
- `icon`

## 3) Armas (listado)
- URL: `GET /{lang}/weapon`
- Ejemplo: `https://gi.yatta.moe/api/v2/en/weapon`
- Estado: 200

## 4) Arma (detalle)
- URL: `GET /{lang}/weapon/{id}`
- Ejemplo: `https://gi.yatta.moe/api/v2/en/weapon/11509`
- Estado: 200

Campos observados en detalle de arma (`data`):
- `id`, `rank`, `type`, `name`, `description`, `specialProp`, `icon`, `route`
- `affix`
- `upgrade`
- `ascension`
- `items`

## 5) Materiales (listado + detalle)
- URL listado: `GET /{lang}/material`
- Ejemplo: `https://gi.yatta.moe/api/v2/en/material`
- Estado: 200

- URL detalle: `GET /{lang}/material/{id}`
- Ejemplo: `https://gi.yatta.moe/api/v2/en/material/104301`
- Estado: 200

Campos observados en detalle de material (`data`):
- `name`
- `description`
- `type`
- `recipe`
- `storyId`
- `mapMark`
- `source`
- `additions`
- `icon`
- `rank`
- `route`

## 6) Artefactos (listado)
- URL: `GET /{lang}/reliquary`
- Ejemplo: `https://gi.yatta.moe/api/v2/en/reliquary`
- Estado: 200

## 7) Comida (listado)
- URL: `GET /{lang}/food`
- Ejemplo: `https://gi.yatta.moe/api/v2/en/food`
- Estado: 200

## 8) Enemigos (listado)
- URL: `GET /{lang}/monster`
- Ejemplo: `https://gi.yatta.moe/api/v2/en/monster`
- Estado: 200

## Endpoint probado y NO valido
- `GET /{lang}/item/{id}` -> 404
- Ejemplo: `https://gi.yatta.moe/api/v2/en/item/104301`

Parece que para materiales hay que usar `material`, no `item`.

## Que podemos construir en la vista de personaje con esto

Con `avatar/{id}` ya puedes montar una pagina de personaje bastante completa:

1. Header del personaje
- Nombre, rareza, elemento, arma, region, cumpleanos, icon.

2. Lore / perfil
- Bloque con `fetter`.

3. Talentos
- Tabs (Ataque normal, Skill, Burst) usando `talent`.
- Mostrar descripcion por nivel y cooldown/coste cuando existan.

4. Constelaciones
- Lista C1..C6 con nombre, descripcion e icono desde `constellation`.

5. Materiales de ascension/talento
- Tomar ids desde `upgrade`/`ascension`/`talent.cost`.
- Resolver cada id con el mapa `items` embebido del detalle o con `material/{id}` para metadata extra (`source`, `recipe`, etc).

6. Sugerencias de arma (futuro)
- Cruzar `weaponType` del personaje con `weapon` para mostrar armas compatibles y destacadas.

## Recomendacion tecnica para tu proyecto

1. Seguir usando `avatar` para listado (como ahora).
2. En la pagina dinamica de personaje, hacer fetch de `avatar/{id}` en vez de solo reutilizar datos del listado.
3. Mantener fallback por si falla el detalle.
4. Cachear respuestas por build para no repetir peticiones.

## Notas de validacion
- Se evito visitar sitios que pidieran API keys.
- Solo se consultaron endpoints publicos de `gi.yatta.moe`.
- En PowerShell hubo prompts interactivos de seguridad con `Invoke-WebRequest`; aun asi se confirmaron estados y estructura via respuestas JSON directas.