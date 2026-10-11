# Encore ♻️

**One event's leftovers. Another event's essentials.**

Encore is a campus event-material reuse platform that helps student societies share surplus supplies from college events. Instead of discarding reusable decorations, cardboard props, and display boards, societies can list materials for others to discover.

## The Problem

College events can leave behind useful materials that are discarded, while other societies may need similar supplies for upcoming events.

## Our Solution

Encore provides a shared platform where societies can:

* Browse available event materials.
* View details such as category, quantity, and condition.
* Add surplus materials for other societies to discover.
* Explore opportunities to reuse existing campus resources.

## Tech Stack

* Frontend: HTML, CSS, JavaScript
* Backend: AWS SAM and AWS Lambda
* Data storage: DynamoDB Local for the current local prototype
* Development: VS Code and Node.js

## Running the Project

### Frontend

Open `index.html` using VS Code Live Server.

### Backend

The current prototype uses a local development setup. Run Docker with DynamoDB Local, then start the backend from `encore-backend` using AWS SAM CLI.

The local proxy in `proxy.mjs` connects the frontend to the local API. The development services must be running for listing operations to work.

## Current Status

Encore is a working prototype. Listing creation and retrieval are connected to the local backend and database. The application has not been deployed to AWS cloud infrastructure.

## Future Scope

* Reservation persistence and request tracking.
* Society accounts and authentication.
* Deployment for access across campus.
* Usage and reuse-impact analytics.
