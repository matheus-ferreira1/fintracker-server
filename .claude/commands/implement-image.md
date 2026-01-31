---
description: Implement a UI component or page from a design image (screenshot or Figma export)
argument-hint: [image path] [optional: target file path] [optional: framework]
---

# Implement Design from Image

Implement the UI shown in the attached image: $ARGUMENTS

## Requirements

- **Default framework**: Vue 3 with `<script setup>` and TypeScript
- **Styling**: Tailwind CSS (or project's existing styling solution)
- **Override**: User can specify React, Nuxt, or other framework

## Workflow

### 1. Analyze the Design

Examine the image and identify:
- **Layout structure**: Grid, flexbox, sections, containers
- **Components**: Buttons, inputs, cards, modals, navigation
- **Typography**: Headings, body text, labels, sizes
- **Colors**: Background, text, borders, accents
- **Spacing**: Margins, padding, gaps
- **Interactive states**: Hover, focus, active, disabled
- **Responsive hints**: Mobile/desktop indicators

### 2. Plan Component Structure

Before coding:
- Break design into reusable components
- Identify props and events needed
- Plan component hierarchy
- Note any dynamic/conditional elements

### 3. Implementation Guidelines

**Vue 3 (Default)**
- Use `<script setup>` with TypeScript
- Define props with `defineProps<T>()`
- Define emits with `defineEmits<T>()`
- Keep components pure and focused
- Extract constants outside component body

**Accessibility (WCAG 2.0)**
- Semantic HTML (`<nav>`, `<main>`, `<article>`, `<button>`)
- Proper heading hierarchy (h1 > h2 > h3)
- ARIA labels for icons and non-text elements
- Focus indicators for interactive elements
- Color contrast ratio (4.5:1 minimum for text)
- Keyboard navigation support
- Alt text for images

**Responsive Design**
- Mobile-first approach
- Use relative units (rem, %, vh/vw)
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Test touch targets (min 44x44px)

### 4. Code Structure

```vue
<script setup lang="ts">
// Types
type Props = { /* ... */ }

// Props & Emits
const props = defineProps<Props>()
const emit = defineEmits<{ /* ... */ }>()

// Composables & State
// ...

// Computed & Methods
// ...
</script>

<template>
  <!-- Semantic, accessible markup -->
</template>
```

### 5. Quality Checklist

- [ ] Matches design visually
- [ ] Semantic HTML elements
- [ ] ARIA labels where needed
- [ ] Keyboard accessible
- [ ] Focus states visible
- [ ] Responsive on mobile/tablet/desktop
- [ ] TypeScript types defined
- [ ] Props documented
- [ ] No hardcoded strings (use props/i18n)

## Output

Provide:
1. Complete component code
2. Usage example with sample props
3. Note any assumptions made about the design
4. Suggest improvements for accessibility if design lacks them
