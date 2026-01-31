---
name: vue
description: Vue/Nuxt best practices for modern, performant applications.
---

# Vue/Nuxt Standards

## Vue 3 Composition API

- Use `<script setup>` syntax for cleaner, more concise components
- Prefer Composition API over Options API for new code
- Use `ref` for primitives and `reactive` for objects
- Leverage `computed` for derived state and `watch`/`watchEffect` for side effects

## Component Design

- Keep components pure and focused on a single responsibility
- Use `defineProps` and `defineEmits` with TypeScript generics
- Prefer props over provide/inject for direct parent-child communication
- Don't declare constants or functions inside component bodies

## Nuxt 3 Best Practices

- Use auto-imports for composables, components, and utils
- Prefer `useFetch` and `useAsyncData` over fetching in lifecycle hooks
- Use Nuxt server routes (`server/api/`) for API endpoints
- Leverage Nuxt modules ecosystem for common functionality

## State Management

- Use Pinia for global state management
- Prefer composables for shared logic between components
- Use `useState` for SSR-safe shared state in Nuxt
- Keep state close to where it's used when possible

## Loading & Error States

- Use `<Suspense>` with async components
- Handle `status`, `error`, and `data` from `useFetch`/`useAsyncData`
- Use `<NuxtErrorBoundary>` for error boundaries
- Prefer declarative loading states over manual `isLoading` flags

## Reactivity Patterns

- Use `toRef`/`toRefs` when destructuring reactive objects
- Avoid losing reactivity by destructuring without helpers
- Use `watchEffect` for automatic dependency tracking
- Prefer `shallowRef` for large objects that don't need deep reactivity

## Nuxt UI Patterns

- Use Nuxt UI components for consistent design
- Leverage built-in form validation with Zod or Yup schemas
- Use `useColorMode` composable for dark/light theme switching
- Prefer Nuxt UI's component props over custom Tailwind styling

## Testing

- Use Vitest for unit and component testing
- Use `@vue/test-utils` for mounting and testing components
- Test composables in isolation with `@vue/test-utils`
- Use `@nuxt/test-utils` for Nuxt-specific testing (pages, server routes)
- Mock `useFetch`/`useAsyncData` responses in component tests
- Test behavior, not implementation details

## Avoid

- Options API in new code
- Direct DOM manipulation (use refs and template bindings)
- `this` keyword in Composition API
- Magic strings for route names and cache keys
- Data fetching in `onMounted` when `useFetch`/`useAsyncData` works
- Mixing Composition and Options API in the same component
- Testing internal component state directly
