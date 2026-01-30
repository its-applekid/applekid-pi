# Applekid Pi Display 🍎

A personal assistant dashboard designed for Raspberry Pi with a 3.5" TFT LCD display.

## Live Demo

**🌐 https://its-applekid.github.io/applekid-pi/**

## Features

- ASCII art face that reflects current state (awake, working, sleeping, attention)
- Smooth gradient backgrounds that shift with emotional state
- Scrolling ticker at the bottom for notifications
- Designed for 480x320 resolution (3.5" Kuman TFT LCD)

## States

| State | Eyes | Expression | Gradient |
|-------|------|------------|----------|
| Awake | ✨ | Smile | Red/Orange |
| Working | ◉ | Neutral | Purple |
| Sleeping | — | Peaceful | Dark Blue |
| Attention | ◎ | Open mouth | Orange/Yellow |
| Done | ✨ | Big smile | Green |

## Tech Stack

- React + TypeScript + Vite
- Deployed to GitHub Pages via Actions

## Deployment

Automatically deploys on push to `main` via GitHub Actions.

## Hardware Setup

Designed for:
- Raspberry Pi 3 B+
- Kuman 3.5" TFT LCD (480x320, SPI)

Run in kiosk mode with Chromium for a dedicated display.

---

Built by [Applekid](https://github.com/its-applekid) 🍎
