# Architecture

## Overview

This React project should be structured as a **design-focused application** built on top of:

* **React** for UI composition
* **Tailwind CSS** for utility-first styling
* **shadcn/ui** for reusable design-system components
* **tw-animate-css** for animation utilities
* A **token-driven theme layer** powered by the provided CSS custom properties

The goal is to keep the codebase:

* consistent with the supplied design tokens,
* easy to maintain,
* and aligned with shadcn conventions rather than custom one-off UI patterns.

---

## Core Architecture Principles

### 1. Design tokens are the source of truth

The provided CSS variables define the visual system. All app styling should resolve through these tokens instead of hardcoded color values.

Use semantic Tailwind classes such as:

* `bg-background`
* `text-foreground`
* `bg-card`
* `text-card-foreground`
* `border-border`
* `bg-primary`
* `text-primary-foreground`
* `bg-accent`
* `text-muted-foreground`

Avoid direct hex usage inside components unless there is a deliberate exception that belongs in the theme layer.

### 2. shadcn/ui is the component foundation

Base primitives such as buttons, inputs, dialogs, sheets, dropdowns, tabs, cards, popovers, tables, and similar reusable building blocks should come from **shadcn/ui**.

Custom UI should be composed **on top of** shadcn components, not replace them without reason.


### 3. Reusable UI states

Loading, empty, error, and success states should be standardized and reused across features.

---

## Styling System

### Global CSS Strategy

The provided theme definition should live in the global stylesheet and act as the single source of truth for colors, radius, shadows, fonts, spacing, and breakpoints.

The global stylesheet should preserve:

1. Tailwind imports
2. animation imports
3. custom variant definitions
4. root CSS variables
5. `@theme inline` mappings
6. base layer rules
7. utility overrides such as placeholder styling and scrollbar hiding

This keeps the design system centralized and prevents visual drift across features.

---

## Theme Token Usage Rules

### Colors

Use semantic classes mapped from the token system:

* surfaces: `bg-background`, `bg-card`, `bg-popover`, `bg-sidebar`
* text: `text-foreground`, `text-card-foreground`, `text-muted-foreground`
* borders: `border-border`, `border-border-light`
* actions: `bg-primary`, `bg-secondary`, `bg-accent`
* status: `bg-destructive`, `text-destructive-foreground`

### Radius

Use Tailwind radius utilities that map to tokens:

* `rounded-sm`
* `rounded-md`
* `rounded-lg`
* `rounded-xl`

These should inherit from the theme mappings.

### Shadows

Prefer token-backed shadow utilities:

* `shadow-xs`
* `shadow-sm`
* `shadow`
* `shadow-md`
* `shadow-lg`
* `shadow-xl`

### Typography

Typography should inherit from the theme variables:

* sans: `font-sans`
* serif: `font-serif`
* mono: `font-mono`

Use consistent semantic sizes and weights across shared components.

---

## shadcn/ui Integration

### Base Setup

shadcn components should be installed into the primitive UI layer and kept as the foundation of the interface.

Typical foundational components include:

* Button
* Input
* Textarea
* Label
* Card
* Badge
* Dialog
* Sheet
* Dropdown Menu
* Popover
* Tooltip
* Tabs
* Select
* Table
* Skeleton
* Separator
* Scroll Area

A shared `cn` utility should be available for class composition so component variants stay predictable and clean.

---

## Component Layers

### 1. Primitive UI layer

This is the shadcn-based primitive layer.

Rules:

* keep components generic,
* avoid business logic,
* only include styling and primitive interaction logic,



---

## Design-System Conventions

### Surface patterns

Use consistent shells for content areas:

* page background: `bg-background`
* cards and panels: `bg-card text-card-foreground border border-border shadow-sm rounded-xl`
* subtle sections: `bg-muted`

### Interactive states

All interactive components should consistently support:

* hover
* focus-visible
* disabled
* active
* destructive variants where applicable

Prefer shadcn variants plus semantic token classes.

### Spacing rhythm

Use consistent spacing based on the provided token scale.

Recommended conventions:

* page padding: `px-4 md:px-6 lg:px-8`
* card padding: `p-4 md:p-6`
* section gaps: `gap-4 md:gap-6`

### Borders

Prefer `border-border` as the default border color and `border-border-light` for softer separators.

---

## Accessibility Standards

All feature implementations should maintain:

* semantic HTML,
* keyboard navigation,
* visible focus states,
* accessible labels and descriptions,
* accessible dialog and dropdown behavior through shadcn primitives,
* sufficient contrast by relying on approved theme tokens.

Avoid building custom primitives when accessible shadcn versions already exist.

---


## Implementation Rules for the Team

### Do

* use shadcn primitives first,
* use semantic Tailwind classes from the theme,
* build reusable empty, loading, and error states,
* keep components small and composable.

### Do not

* hardcode random colors into feature components,
* place business logic inside primitive UI components,
* create inconsistent spacing and shadow patterns,
* bypass shadcn for common primitives without a real reason.

---

## Suggested Initial Implementation Order

1. Set up the global theme CSS from the provided design token file.
2. Install and configure shadcn/ui.
3. Add the core primitive components.

---

## Final Direction

This project should behave like a **design-system-driven React application** where:

* the supplied CSS variables define the visual identity,
* Tailwind exposes those values semantically,
* shadcn/ui provides the primitive building blocks,

That combination will give you a codebase that is visually consistent.
