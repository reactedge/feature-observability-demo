# Feature Observability Demo

A lightweight observability widget that captures frontend activity and exports it using OpenTelemetry-compatible telemetry.

The project is based on the simple idea that UI features `have a lifecycle`: 

User Interaction
↓
Frontend Activity
↓
Telemetry Event
↓
Trace / Observability Platform

Rather than treating frontend features as black boxes, the widget makes feature behaviour observable and measurable.

## Why?

Modern applications often provide excellent infrastructure monitoring but limited visibility into what individual frontend features are doing.

This project explores how a self-contained frontend feature can:

Emit structured activity events
Produce distributed traces
Integrate with standard observability tooling
Create a foundation for future self-healing capabilities

These are valuable signals, but they tell us little about how a feature behaves.

```text
search.started
↓
search.completed
```

or

```text
search.started
↓
search.failed
```

Feature observability allows us to capture and analyse those journeys.

## Quick Start

### Prerequisites

* Node.js and npm installed
* Docker installed and running
* Port `16686` available for Jaeger UI

### Run the Demo

Clone the repository:

```bash
git clone git@github.com:reactedge/feature-observability-demo.git
cd feature-observability-demo
```

Install dependencies:

```bash
npm install
```

Start the React application:

```bash
npm run dev
```

Start Jaeger:

```bash
docker compose up -d
```

Verify the Jaeger container is running:

```bash
docker logs feature-observability-demo-jaeger-1
```

Verify the Jaeger API is available:

```bash
curl http://localhost:16686/api/services
```

Expected response before any traces are generated:

```json
{
  "data": null,
  "total": 0,
  "limit": 0,
  "offset": 0,
  "errors": null
}
```

Open Jaeger:

```text
http://localhost:16686
```

Open the React application:

```text
http://localhost:5173
```

Enter a search term and click **Search**.

The generated activity events will be exported to OpenTelemetry and appear as traces within Jaeger.

## What does this repository demonstrate?

The demo contains:

* A small React feature
* Contract-driven configuration
* Activity tracking
* OpenTelemetry instrumentation
* Jaeger integration using Docker Compose

The search feature itself is intentionally simple. The focus of the repository is not the business logic but the observability journey.

The feature emits telemetry whenever meaningful activities occur.

For example:

```text
search.started
search.completed
search.failed
```

These events become spans that can be viewed inside Jaeger.

## Architecture

```text
Widget
↓
Activity
↓
OpenTelemetry
↓
Collector
↓
Jaeger
```

The feature itself remains unaware of Jaeger or OpenTelemetry implementation details.

It simply reports activity.

## Why this matters

As frontend architectures become increasingly modular, independently deployed features should become independently observable.

Feature observability allows engineers to move beyond monitoring technical components and begin understanding feature behaviour, feature failures and feature outcomes.

Observability is the foundation.

Self-healing features are the next step.

## Security Considerations

The OpenTelemetry Collector configuration used by this repository is intentionally simplified for local development.

For example:

* OTLP HTTP ingestion is exposed on `0.0.0.0:4318`
* CORS is configured with `allowed_origins: ["*"]`
* Communication between the collector and Jaeger uses insecure TLS within the local Docker network

These settings make the demo easy to run and understand but should not be considered production-ready.

A production deployment would typically:

* Restrict telemetry ingestion to known origins
* Enable TLS between observability components
* Apply authentication and authorization controls
* Filter or redact sensitive telemetry payloads
* Introduce telemetry sampling and rate limiting
* Apply GDPR and data retention policies

The goal of this repository is to demonstrate frontend observability concepts rather than provide a hardened production observability platform.
