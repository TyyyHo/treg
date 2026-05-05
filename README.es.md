<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0F172A,30:1D4ED8,70:7C3AED,100:22C55E&height=260&section=header&text=Treg&fontSize=72&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=Inject%20an%20immune%20system%20into%20your%20codebase&descSize=20&descAlignY=58" width="100%" />

# @tylercore/treg (Español)

[![npm version](https://img.shields.io/npm/v/%40tylercore%2Ftreg?style=flat-square)](https://www.npmjs.com/package/%40tylercore%2Ftreg)
[![License](https://img.shields.io/npm/l/%40tylercore%2Ftreg?style=flat-square)](https://www.npmjs.com/package/%40tylercore%2Ftreg)
[![npm downloads](https://img.shields.io/npm/dm/%40tylercore%2Ftreg?style=flat-square)](https://www.npmjs.com/package/%40tylercore%2Ftreg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)
![CLI](https://img.shields.io/badge/CLI-Interactive-111827?style=flat-square&logo=gnubash&logoColor=white)

[English](./README.md) | [繁體中文](./README.zh-hant.md) | [简体中文](./README.zh-hans.md) | [Español](./README.es.md) | [日本語](./README.ja.md)

</div>

---

## Resumen

## ¿Qué es Treg?

Treg es una herramienta CLI que configura calidad de código, toolchain y estándares de proyecto para aplicaciones modernas.

Inyecta un **sistema inmunológico de ingeniería** en tu proyecto.

Cuando desarrolladores y AI colaboran con iteraciones rápidas, los repositorios tienden a desviarse: aparecen herramientas inconsistentes, reglas duplicadas y flujos frágiles.  
Treg actúa como una célula T reguladora: restaura el equilibrio, reduce el caos innecesario y mantiene tu repositorio **limpio, mantenible y extensible**.

En lugar de generar lógica de aplicación, Treg se enfoca en la base de ingeniería: configura herramientas como ESLint, Prettier y TypeScript para proteger el proyecto contra la entropía a largo plazo.

> **Regula el flujo de trabajo antes de que el flujo de trabajo te regule a ti.**

---

## Por qué Treg

Los proyectos modernos pueden avanzar muy rápido, sobre todo con desarrollo asistido por AI.  
Pero la velocidad sin límites suele causar daños invisibles:

- deriva de estilo
- toolchain inconsistente
- mala higiene de commits
- pruebas faltantes
- reglas de uso de AI poco claras

`Treg` resuelve esto aplicando una base consistente a un repositorio existente con un único flujo de inicialización.

---

## Qué configura Treg

`Treg` puede configurar:

- **TypeScript**
- **Linting** con ESLint
- **Formateo** con Prettier u Oxfmt
- **Testing** con Jest o Vitest
- **Git hooks** con Husky
- **Guías de reglas de AI** para herramientas compatibles

Esto mantiene el proyecto estable sin forzar decisiones de arquitectura de producto.

---

## Inicio rápido

Inicializa con valores detectados automáticamente:

```bash
npx @tylercore/treg init
```

Previsualiza cambios sin aplicarlos:

```bash
npx @tylercore/treg init --dry-run
```

Personaliza la configuración de forma interactiva:

```bash
npx @tylercore/treg setup
```

Agrega una feature o un preset de paquete a un proyecto existente:

```bash
npx @tylercore/treg add typescript
npx @tylercore/treg add zustand
```

---

## Comandos

| Comando | Descripción                                                         |
| ------- | ------------------------------------------------------------------- |
| `init`  | Detecta el proyecto y aplica la base de infraestructura por defecto |
| `setup` | Personaliza la base de infraestructura con un flujo interactivo     |
| `add`   | Agrega una feature o preset de paquete y sincroniza AI rules        |
| `list`  | Muestra frameworks, features, formatters y test runners compatibles |

---

## Flujo de `init`

Durante `init`, `Treg` detecta el package manager y el framework (orden: `nuxt -> next -> react -> vue -> svelte -> node`) y aplica las features por defecto: lint, format, TypeScript, test, husky y AI rules guidance.

La única pregunta es si se instalan los Packages por defecto del framework detectado. `Yes` instala el conjunto de paquetes por defecto y escribe sus guías de AI rules; `No` omite la instalación de paquetes.

---

## Flujo interactivo de `setup`

Durante `setup`, `Treg` pregunta:

1. **Package manager**  
   `pnpm | npm | yarn | bun`

2. **Features** (selección múltiple, marcadas por defecto)
   - lint
   - format
   - TypeScript
   - test
   - husky
   - AI rules guidance

3. **Test runner** (solo si se selecciona `test`)
   - `jest`
   - `vitest`
   - `skip`

4. **Formatter** (solo si se selecciona `format`)
   - `prettier`
   - `oxfmt`

5. **AI tools** (solo si se selecciona AI rules guidance)
   - Claude
   - Codex
   - Gemini

6. **Instalación de paquetes**
   - `Yes`
   - `No`

7. **Packages** (solo si se selecciona instalar paquetes)
   - Opciones compartidas por todos los frameworks, como Zod y date-fns
   - Opciones por framework, como Tailwind CSS, Zustand o Pinia, TanStack Query, TanStack Router y paquetes i18n
   - Puedes dejar esta selección vacía y continuar

Cuando se usa pnpm, Treg comprueba si el `node_modules` existente está enlazado a un store diferente del que quiere usar la versión activa de pnpm. Si detecta una diferencia de store, Treg se detiene y muestra una indicación para reconstruirlo, sin borrar archivos automáticamente. Reconstruye `node_modules` manualmente con `rm -rf node_modules` y `pnpm install`, y luego vuelve a ejecutar Treg.

---

## Flujo de `add`

`add` instala un solo target por ejecución:

```bash
npx @tylercore/treg add typescript
npx @tylercore/treg add zustand
```

Feature targets compatibles: `lint`, `format`, `typescript`, `test`, `husky`.

Los targets de paquete usan la lista de presets del framework detectado. Por ejemplo, `add zustand` instala el preset de Zustand en proyectos React o Next.js. A diferencia de usar el package manager directamente, `add` también sincroniza la guía de AI rules relacionada.

---

## Uso común

Inicializar proyecto:

```bash
npx @tylercore/treg init
```

Solo previsualizar el plan de `init`:

```bash
npx @tylercore/treg init --dry-run
```

Personalizar configuración:

```bash
npx @tylercore/treg setup
```

Agregar format usando `oxfmt`:

```bash
npx @tylercore/treg add format --formatter oxfmt
```

Agregar test usando `vitest`:

```bash
npx @tylercore/treg add test --test-runner vitest
```

Agregar Zustand y sincronizar AI rules:

```bash
npx @tylercore/treg add zustand
```

---

## Opciones de CLI

### `init`

```text
--dry-run
--help
```

### `setup`

```text
--dry-run
--help
```

### `add`

```text
add <lint|format|typescript|test|husky|package-preset>
--framework <node|react|next|vue|svelte|nuxt>
--dir <path>
--formatter <prettier|oxfmt>
--test-runner <jest|vitest>
--force
--dry-run
--skip-husky-install
--help
```

---

## Valores por defecto

### Detección de framework

Orden de detección:

```text
nuxt -> next -> react -> vue -> svelte -> node
```

### Test runner

- `vue` / `nuxt`: `vitest`
- otros: `jest`

### Formatter

- `prettier`

---

## Comportamiento de AI Rules

`Treg` revisa los archivos de guía de AI en la raíz del repositorio:

| Tool   | Archivo     |
| ------ | ----------- |
| Claude | `CLAUDE.md` |
| Codex  | `AGENTS.md` |
| Gemini | `GEMINI.md` |

Comportamiento:

- si `CLAUDE.md` o `GEMINI.md` contiene `@AGENTS.md`, solo `AGENTS.md` recibe la guía de Treg
- si ya existe algún archivo de guía de AI y ninguno delega a `@AGENTS.md`, solo se actualizan los archivos existentes
- si no existe ninguno de los tres archivos, Treg crea los tres, escribe la guía en `AGENTS.md` y escribe `@AGENTS.md` en `CLAUDE.md` y `GEMINI.md`
- los prompts se escriben directamente en el documento de guía de AI objetivo

---

## Filosofía

`Treg` mantiene un alcance intencionalmente acotado.

**No** intenta ser un generador completo de proyectos.  
**No** reemplaza el criterio del equipo.  
**No** impone arquitectura de producto.

Existe para establecer una capa inmunológica de ingeniería que evite que la iteración rápida degrade el repositorio con el tiempo.

---

<div align="center">
  <sub>Creado para regular iteraciones caóticas y proteger la salud del repositorio a largo plazo.</sub>
  <br />
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:22C55E,40:06B6D4,75:3B82F6,100:7C3AED&height=120&section=footer" width="100%" />
</div>
