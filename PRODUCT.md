# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Vite and TypeScript without a component framework.
The production artifact is a static site packaged as a hardened ARM64 container and deployed through pull-based GitOps.

## Users

First-time visitors who want to identify Sam Jing Wen and reach his professional links quickly.

## Product Purpose

The site is a concise personal landing page that introduces Sam and routes visitors to his professional links and current products.
Success means visitors can recognize Sam, discover his work, and reach the intended destination without searching through unrelated content.

## Capabilities and Constraints

The experience remains a focused one-screen link hub on common screens, with safe scrolling on short or zoomed viewports.
The current name, role, email address, four professional destinations, and two product destinations are confirmed as current.
The site must remain fast, responsive, keyboard accessible, and usable if the decorative canvas fails.
Particle hover and click interactions pass through foreground content without blocking links or navigation.
The particle field deliberately ignores the operating system reduced-motion preference.
GitHub Actions validates and publishes the application artifact, while production reconciliation remains pull-based and receives no cluster credentials.

## Brand Commitments

The name is "Sam Jing Wen" and the role is "Software Engineer".
The existing portrait and bilingual "Hello | 你好" greeting remain part of the identity.
The visual palette uses Tokyo Night Storm as its foundation.
The visual atmosphere remains dark, with a sparse interactive particle field.

## Evidence on Hand

The current portrait and its optimized variants are under `src/public/images/`.
The confirmed professional destinations are LinkedIn, GitHub, email, and The Woke Coder.
The confirmed product destinations are UltraCareer AI and FreeQuantCamp.
No testimonials, client claims, employment claims, or project statistics are available and none should be fabricated.

## Product Principles

- Make identity, work, and destinations immediately legible.
- Keep interaction atmospheric but subordinate to content.
- Prefer a small, durable implementation over framework complexity.
- Preserve factual content and avoid invented professional claims.
