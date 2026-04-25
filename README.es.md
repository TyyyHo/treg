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

Inicializa de forma interactiva:

```bash
npx @tylercore/treg init
```

Previsualiza cambios sin aplicarlos:

```bash
npx @tylercore/treg init --dry-run
```

Agrega features a un proyecto existente:

```bash
npx @tylercore/treg add
```

---

## Comandos

| Comando | Descripción                                                         |
| ------- | ------------------------------------------------------------------- |
| `init`  | Inicializa el proyecto con un flujo interactivo                     |
| `add`   | Agrega features seleccionadas a un proyecto existente               |
| `list`  | Muestra frameworks, features, formatters y test runners compatibles |

---

## Flujo interactivo de `init`

Durante `init`, `Treg` pregunta:

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

---

## Flujo interactivo de `add`

Durante `add`, `Treg` pregunta:

1. **Features** (selección múltiple)
   - lint
   - format
   - TypeScript
   - test
   - husky
   - AI rules guidance (solo cuando ya existe un archivo de AI rules)

2. **Formatter** (solo si se selecciona `format`)
   - `prettier`
   - `oxfmt`

3. **Test runner** (solo si se selecciona `test`)
   - `jest`
   - `vitest`
   - `skip`

4. **AI tools** (solo si se selecciona AI rules guidance)
   - Claude
   - Codex
   - Gemini

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

Agregar solo lint + format:

```bash
npx @tylercore/treg add
```

Luego selecciona `lint` y `format`.

Agregar format usando `oxfmt`:

```bash
npx @tylercore/treg add
```

Luego selecciona `format`, y después `oxfmt`.

Agregar test usando `vitest`:

```bash
npx @tylercore/treg add
```

Luego selecciona `test`, y después `vitest`.

---

## Opciones de CLI

### `init`

```text
--dry-run
--help
```

### `add`

Modo interactivo:

```text
add
```

Flags opcionales para automatización:

```text
--framework <node|react|next|vue|svelte|nuxt>
--features <lint,format,typescript,test,husky>
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

`Treg` puede actualizar archivos de guía de AI para las herramientas seleccionadas:

| Tool   | Archivo     |
| ------ | ----------- |
| Claude | `CLAUDE.md` |
| Codex  | `AGENTS.md` |
| Gemini | `GEMINI.md` |

Comportamiento:

- solo se actualizan las herramientas seleccionadas
- los documentos faltantes se crean automáticamente
- las actualizaciones se realizan en la raíz del repositorio
- los prompts se escriben directamente dentro de cada documento de guía de AI seleccionado

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
