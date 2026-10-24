# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Delegated: framework-agnostic design tokens (CSS custom properties + JSON) and vanilla CSS components with plain HTML markup, so any future project (static page, Astro, React, a Worker) can consume them without framework lock-in. A single Cloudflare Worker serves the documentation site from static assets and exposes a remote MCP endpoint (Streamable HTTP) from the same deploy. Chosen because the user wants one system across very different surfaces and Cloudflare is the fixed deploy target.

## Users

One person: the owner (Magnus), building things for their own use. Secondary consumer: AI coding agents working on the owner's behalf, which read the system over MCP so generated work stays consistent.

## Product Purpose

A personal design system that everything the owner makes for their own use is based on: personal site / portfolio, small tools and apps, dashboards and data views, docs and writing, and slides. Success means a new project starts from this system and looks unmistakably like the owner's work without redesigning from scratch.

## Positioning

Not a general-purpose UI kit. It encodes one person's taste and is built to be machine-readable: tokens, components with usage guidance, and design principles are all served over MCP so agents can apply them directly.

## Operating Context

- Consumed by hand (copy CSS/markup, link the stylesheet from the Worker) and by agents via MCP.
- MCP scope: read tokens, read components with usage guidance, read design principles. No write or scaffold tools for now.
- Deployed on Cloudflare Workers (static assets + MCP route).

## Capabilities and Constraints

- Must cover five surface families: site/portfolio (Experience/Persuade), tools and apps (Operate), dashboards (Operate), docs and writing (Read), slides.
- English is the primary content language.
- Undecided: custom domain, versioning/publishing of the CSS as a package.

## Brand Commitments

References the owner explicitly likes: https://kronborg.dk/ and https://www.atalanta.tech/. These are taste references, not brands to imitate.

## Evidence on Hand

No existing assets, logos, or content. Do not fabricate projects, clients, or testimonials in examples; use clearly placeholder content.

## Product Principles

1. One system, many surfaces: every token and component must hold up in a dashboard and in a portfolio.
2. Machine-readable first: anything a human reads in the docs, an agent can fetch over MCP in a structured form.
3. No lock-in: plain CSS and HTML are the source of truth.
4. Personal over generic: decisions should feel authored, not defaulted.
