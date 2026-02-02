# CLAUDE.md - Project Guide for AI Assistants

## Project Overview

**Demo Pokemon** is a full-stack Pokemon collection manager web application. It provides CRUD operations for managing Pokemon entries with a card/table view UI, detail panels, search/filter/sort capabilities, and responsive mobile-first design.

**Live deployment**: GitHub Pages (frontend-only, uses static JSON fallback when backend is unavailable).

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Backend | Java + Spring Boot | Java 21, Spring Boot 3.4.1 |
| Database | H2 (file-based) | Embedded |
| Frontend | Angular + TypeScript | Angular 19, TypeScript 5.6 |
| Build | Maven (multi-module monorepo) | Maven 3.x |
| CSS | Pure CSS (no framework) | Mobile-first responsive |
| CI/CD | GitHub Actions | Deploy to GitHub Pages |
| Code Generation | Lombok | `@Data`, `@NoArgsConstructor`, `@AllArgsConstructor` |

## Repository Structure

```
demo-pokemon/
├── pom.xml                          # Root Maven POM (modules: frontend, backend)
├── CLAUDE.md                        # This file
├── Prompts.md                       # Original development prompts/specs
├── .gitignore                       # Excludes /backend/target/
├── .github/workflows/
│   └── deploy-gh-pages.yml          # GitHub Pages deployment workflow
├── data/
│   ├── pokemondb.mv.db              # H2 database file
│   └── pokemondb.trace.db           # H2 trace file
├── backend/
│   ├── pom.xml                      # Spring Boot dependencies
│   └── src/main/
│       ├── java/com/demo/backend/
│       │   ├── BackendApplication.java          # Spring Boot entry point
│       │   ├── config/
│       │   │   └── WebConfig.java               # SPA routing fallback
│       │   ├── controller/
│       │   │   ├── GreetingController.java      # GET /api/greeting
│       │   │   └── PokemonController.java       # CRUD /api/pokemons
│       │   ├── dto/
│       │   │   ├── Pokemon.java                 # JPA Entity
│       │   │   └── GreetingResponse.java        # Greeting DTO
│       │   ├── service/
│       │   │   └── PokemonRepository.java       # Business logic service
│       │   └── repository/
│       │       └── PokemonJpaRepository.java    # Spring Data JPA interface
│       └── resources/
│           ├── application.properties           # Spring Boot config
│           ├── data.sql                         # Initial seed data (12 Pokemon)
│           └── static/                          # Built Angular output (copied by Maven)
└── frontend/
    ├── pom.xml                      # Maven wrapper for frontend build
    ├── package.json                 # Node dependencies
    ├── angular.json                 # Angular CLI configuration
    ├── tsconfig.json                # TypeScript base config (strict mode)
    ├── tsconfig.app.json            # App-specific TS config
    └── src/
        ├── index.html               # Angular bootstrap HTML
        ├── main.ts                  # Angular bootstrap entry point
        ├── styles.css               # Global styles (purple gradient background)
        ├── app/
        │   ├── app.module.ts        # Angular module (BrowserModule, HttpClientModule, FormsModule)
        │   ├── app.component.ts     # Main component (~414 lines, all app logic)
        │   ├── app.component.html   # Template (~434 lines, cards/table/detail/modals)
        │   ├── app.component.css    # Styles (~1450 lines, mobile-first responsive)
        │   └── services/
        │       └── greeting.service.ts  # HTTP service (API calls + static fallback)
        └── public/
            └── data/
                └── pokemons.json    # Static fallback data for GitHub Pages
```

## Build & Run Commands

### Full Build (Maven monorepo)

```bash
# From project root - builds both frontend and backend
mvn clean install

# Build backend only
cd backend && mvn clean package

# Build frontend only
cd frontend && npm ci && npx ng build
```

### Run Backend (Spring Boot)

```bash
cd backend && mvn spring-boot:run
# or
java -jar backend/target/backend-1.0.0.jar
```

Server starts on **http://localhost:8080**. H2 console available at **http://localhost:8080/h2-console**.

### Run Frontend (Angular dev server)

```bash
cd frontend && npm start
# or
cd frontend && npx ng serve
```

Dev server starts on **http://localhost:4200** with proxy to backend.

### Production Build (Frontend for GitHub Pages)

```bash
cd frontend && npx ng build --configuration production --base-href /demo-pokemon/
```

Output goes to `frontend/dist/frontend/browser/`.

### Tests

```bash
# Frontend tests (Karma + Jasmine) - infrastructure exists but no test files written
cd frontend && npm test

# Backend tests (JUnit 5 + Mockito) - dependency present but no test files written
cd backend && mvn test
```

**Note**: No tests are currently implemented. Test infrastructure (dependencies, scripts) is in place.

## API Endpoints

All endpoints have CORS enabled (`@CrossOrigin(origins = "*")`).

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/greeting` | Returns random name + timestamp |
| GET | `/api/pokemons` | List all Pokemon |
| POST | `/api/pokemons` | Create a new Pokemon |
| PUT | `/api/pokemons/{id}` | Update a Pokemon |
| DELETE | `/api/pokemons/{id}` | Delete a Pokemon |

### Pokemon Entity Schema

```json
{
  "id": 1,
  "name": "string (unique, required)",
  "explanation": "string (max 500 chars, optional)",
  "strength": "integer (0-100, required)",
  "picture": "string (URL, optional)",
  "powers": ["string", "..."],
  "tips": ["string", "..."]
}
```

## Architecture & Patterns

### Backend (Layered MVC)

- **Controller** → **Service** → **JPA Repository** → **H2 Database**
- `WebConfig` provides SPA routing: all unmatched routes fallback to `index.html`
- Database is recreated on every startup (`ddl-auto=create`) and seeded from `data.sql`
- Lombok generates boilerplate (getters, setters, constructors)
- `@ElementCollection(fetch = FetchType.EAGER)` for `powers` and `tips` lists

### Frontend (Single Component Angular App)

- All UI logic lives in `AppComponent` (no child components)
- `GreetingService` handles all HTTP calls with RxJS Observables
- Static JSON fallback via `catchError` when backend API is unreachable
- Two-way binding with `[(ngModel)]` via `FormsModule`
- No state management library (component state only)
- No routing (single-page with view toggling via `viewMode` property)

### Key Frontend Features

- **Card view**: Grid layout with color-coded strength borders
- **Table view**: Multi-column sorting, real-time search/filter, column resize (drag handles), column reorder (drag-and-drop), column visibility toggle
- **Detail panel**: Full Pokemon info display with edit/delete actions
- **Create/Edit modals**: Form with dynamic arrays for powers and tips
- **Strength color system**: 6-tier scale mapping 0-100 to colors (green → red)

## Styling Conventions

- **Mobile-first** responsive design using pure CSS (no framework)
- **Breakpoints**: 480px, 768px, 1024px, 1400px
- **Color palette**: Purple gradient primary (`#667eea` → `#764ba2`), green success (`#4CAF50`), red danger (`#f44336`)
- **Strength colors**: 6-tier system — Below Average (green), Average (light green), Above Average (yellow), Strong (amber), Very Strong (deep orange), Legendary (red)
- **Touch targets**: 44px minimum height for interactive elements
- **Input font size**: 16px minimum (prevents iOS auto-zoom)
- **Animations**: Hover lift effects, spin loader, fade/slide-up for panels

## Database Configuration

- **Engine**: H2 file-based at `./data/pokemondb`
- **Credentials**: Username `sa`, no password
- **DDL**: `spring.jpa.hibernate.ddl-auto=create` (schema recreated on startup)
- **Seed data**: `data.sql` inserts 12 Pokemon with powers and tips
- **Console**: Available at `/h2-console` when running locally

## CI/CD (GitHub Pages)

The `.github/workflows/deploy-gh-pages.yml` workflow:
1. Triggers on push to `main` or manual dispatch
2. Builds Angular in production mode with `/demo-pokemon/` base href
3. Creates `.nojekyll` and copies `index.html` → `404.html` (SPA routing)
4. Deploys to GitHub Pages

When deployed statically, CRUD operations (create/update/delete) won't work since there's no backend. The app falls back to `pokemons.json` for read-only data.

## Development Guidelines

### When modifying the backend:
- Follow the existing layered pattern: Controller → Service → Repository
- Add new endpoints in the appropriate controller with `@CrossOrigin`
- New entities need `@Entity`, `@Data`, and appropriate JPA annotations
- Add seed data to `data.sql` if introducing new entities
- The backend serves the built Angular app from `resources/static/`

### When modifying the frontend:
- All logic currently lives in `AppComponent` — follow existing patterns there
- HTTP calls go through `GreetingService` (or create a new service)
- Use `FormsModule` with `[(ngModel)]` for form bindings
- Follow mobile-first CSS approach: base styles for mobile, then `@media (min-width: ...)` for larger screens
- Update `pokemons.json` if the Pokemon data schema changes (GitHub Pages fallback)
- The Angular app uses `NgModule` pattern (not standalone components)

### When adding new features:
- Consider both the card view and table view implications
- Ensure responsive behavior across all breakpoints
- Follow the existing strength color-coding conventions
- Backend changes require rebuilding and restarting Spring Boot
- Frontend dev server (`ng serve`) supports hot reload

### Code style:
- Backend: Standard Java/Spring conventions, Lombok for boilerplate
- Frontend: Angular conventions, TypeScript strict mode enabled
- CSS: BEM-like class naming, mobile-first media queries
- No linter or formatter is configured — follow existing code style
