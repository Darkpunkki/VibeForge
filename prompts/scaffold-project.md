---
name: scaffold-project
description: Design project architecture and create folder structure based on validated epics. Runs after epic validation, before feature extraction. Outputs PROJECT_ARCHITECTURE.md and optionally creates the actual folder structure.
argument-hint: "<IDEA_ID>   (example: IDEA-0001-my-app)"
disable-model-invocation: true
---

# Scaffold Project — Architecture Design

## Purpose

Bridge the gap between "what to build" (epics) and "how to build it" (features/tasks) by designing the project architecture and folder structure.

## When to Run

**After:** `validate-epics` completes successfully
**Before:** `extract-features` begins

This ensures features and tasks can reference specific files/modules in the designed architecture.

---

## Invocation

```
/vf:scaffold-project (MCP) <IDEA_ID>
```

Where `<IDEA_ID>` is the idea folder name (e.g., `IDEA-0001-my-app`).

---

## Inputs Required

Read these files from `docs/forge/ideas/<IDEA_ID>/`:

1. **latest/idea_normalized.md** — Core requirements and constraints
2. **latest/concept_summary.md** — Semantic anchor and key themes
3. **latest/epics_backlog.md** (preferred) or **latest/epics.md** (fallback) — Validated epic structure
4. **Optional:** Any `inputs/*_config.md` files for architecture preferences

---

## Output Artifacts

### 1. PROJECT_ARCHITECTURE.md

Write to:
- `docs/forge/ideas/<IDEA_ID>/latest/PROJECT_ARCHITECTURE.md`
- `docs/forge/ideas/<IDEA_ID>/runs/<RUN_ID>/PROJECT_ARCHITECTURE.md`

This document should include:

#### Quick Reference (First Section - 50-100 lines)

A concise overview for downstream prompts to use without loading the full 1000-line document.

Include:

**1. Folder Structure (Collapsed)**
```
project-root/
├── src/
│   ├── core/          # EPIC-001: Shared infrastructure
│   ├── modes/         # Mode-specific implementations
│   └── cli/           # EPIC-004: CLI
├── tests/
└── config/
```

**2. Epic → Code Mapping Table**
```
| Epic ID | Epic Name | Location | Key Files |
|---------|-----------|----------|-----------|
| EPIC-001 | Core Infrastructure | src/core/ | base_*.py, models.py |
| EPIC-002 | Job Search Mode | src/modes/job_search/ | processor.py, ranker.py |
```

**3. Key Abstractions**
```
- BaseCollector (src/core/base_collector.py) - Abstract collector interface
- BaseProcessor (src/core/base_processor.py) - LLM processing base
- BaseRanker (src/core/base_ranker.py) - Ranking logic base
```

**End Quick Reference with:**
```markdown
---

## Full Architecture Details

The sections below provide complete implementation guidance...
```

---

#### Section A: Technology Stack Summary
- Language/runtime
- Key frameworks/libraries
- Database/storage
- External services/APIs

#### Section B: Architectural Patterns
- Overall architecture style (e.g., layered, hexagonal, modular)
- Key design patterns to use
- Abstraction strategy

#### Section C: Epic-to-Code Mapping
For each epic, specify:
- Which folder(s) it maps to
- Key modules/classes it will contain
- Interfaces/abstractions needed

Example:
```
EPIC-001: Core Infrastructure
  Maps to: src/core/
  Key modules:
    - src/core/base_collector.py (BaseCollector abstract class)
    - src/core/base_processor.py (BaseProcessor abstract class)
    - src/core/database.py (DB connection utilities)
    - src/core/models.py (SQLAlchemy models)
```

#### Section D: Folder Structure
Complete folder tree with annotations.

Example:
```
project-root/
├── src/                          # Main source code
│   ├── core/                     # EPIC-001: Shared infrastructure
│   │   ├── __init__.py
│   │   ├── base_collector.py    # Abstract collector interface
│   │   ├── base_processor.py    # LLM processing base
│   │   └── models.py             # Database models
│   ├── modes/                    # Mode-specific implementations
│   │   ├── job_search/           # EPIC-002: Job Search Mode
│   │   │   ├── collectors/
│   │   │   ├── processor.py
│   │   │   └── ranker.py
│   │   └── business_intel/       # EPIC-003: Business Intel Mode
│   ├── cli/                      # EPIC-004: CLI interface
│   └── config/                   # Configuration system
├── tests/                        # Test suite
├── config/                       # User-editable configs
├── data/                         # Local data storage
├── .env.example                  # Environment template
├── requirements.txt              # Python dependencies
└── README.md                     # Project documentation
```

#### Section E: Initial Skeleton Files
List files that should be created immediately as scaffolding:

- Config files (`.env.example`, `requirements.txt`, `pyproject.toml`)
- Package markers (`__init__.py` files)
- Base abstract classes (even if empty/stubbed)
- Entry point scripts

#### Section F: Setup Instructions
Steps to initialize the project:
```bash
# 1. Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env
# Edit .env with your API keys

# 4. Initialize database (if applicable)
python -m src.core.database init

# 5. Run sanity check
python -m src.cli.app --help
```

---

## Process

### Step 1: Load Context

Read the required input files:
- `latest/idea_normalized.md`
- `latest/concept_summary.md`
- `latest/epics_backlog.md` (preferred) or `latest/epics.md` (fallback)

If neither epics file exists, STOP and report:
```
Error: Cannot scaffold project without epics.
Please run /vf:extract-epics first.
Expected: latest/epics_backlog.md or latest/epics.md
```

Extract from the files:
- Technology choices (language, frameworks)
- Epic structure and descriptions
- Architectural hints from the idea/concept

### Step 2: Design Architecture

Based on the epics and tech stack:

1. **Choose architectural pattern:**
   - Monolithic vs. modular?
   - Layered (presentation, business, data)?
   - Domain-driven with clear boundaries?

2. **Map epics to folders:**
   - Each major epic should have a clear home in the structure
   - Shared/core code in a common area
   - Mode/feature-specific code in dedicated modules

3. **Identify key abstractions:**
   - What base classes or interfaces are needed?
   - Where do they live?
   - How do mode-specific implementations extend them?

4. **Plan configuration strategy:**
   - YAML files, JSON, environment variables?
   - Where do configs live?
   - How are they loaded?

### Step 3: Create Folder Structure Document

Write the `PROJECT_ARCHITECTURE.md` with all sections filled out.

### Step 4: Generate RUN_ID

Create a run ID:
```
<ISO-8601-timestamp>_scaffold-<short-hash>
```

Example: `2026-02-12T10-30-15Z_scaffold-a3f9`

### Step 5: Write to latest/ and runs/

- `latest/PROJECT_ARCHITECTURE.md` (overwrite if exists)
- `runs/<RUN_ID>/PROJECT_ARCHITECTURE.md` (immutable history)

### Step 6: Update Manifest

Update `manifest.md` with:

```yaml
## Architecture

- architecture_status: "Designed"
- last_updated: <YYYY-MM-DD>
- last_run_id: <RUN_ID>
- outputs:
  - latest/PROJECT_ARCHITECTURE.md
  - runs/<RUN_ID>/PROJECT_ARCHITECTURE.md
```

### Step 7: Append to Run Log

```md
### <ISO-8601 timestamp> — scaffold-project

- Idea-ID: <IDEA_ID>
- Run-ID: <RUN_ID>
- Inputs:
  - latest/idea_normalized.md
  - latest/concept_summary.md
  - latest/epics_backlog.md (or epics.md fallback)
- Outputs:
  - latest/PROJECT_ARCHITECTURE.md
  - runs/<RUN_ID>/PROJECT_ARCHITECTURE.md
- Status: SUCCESS | SUCCESS_WITH_WARNINGS | FAILED
- Notes:
  - Designed <architecture-pattern> architecture
  - Mapped <N> epics to code structure
  - Identified <N> key abstractions
  - Created folder structure with <N> top-level directories
  - Specified <N> initial skeleton files
```

---

## Optional: Physical Folder Creation

After generating `PROJECT_ARCHITECTURE.md`, you may optionally:

### Ask the user:
> "Should I create the actual folder structure and skeleton files in the target project directory?"
>
> Options:
> - A) Yes, create folders + skeleton files
> - B) No, just the architecture document for now

If the user chooses A:

1. Create all folders specified in Section D
2. Generate skeleton files listed in Section E:
   - Create empty `__init__.py` files
   - Generate `.env.example` with placeholder values
   - Create `requirements.txt` with base dependencies
   - Generate abstract base classes with docstrings but `pass` implementations
3. Report what was created

---

## Validation

Before marking as SUCCESS, verify:

1. ✅ All epics from `epics.md` are mapped to code locations
2. ✅ Folder structure follows language/framework conventions
3. ✅ Key abstractions are identified and located
4. ✅ Setup instructions are complete and actionable
5. ✅ No obvious architectural anti-patterns

If any validation fails, mark status as `SUCCESS_WITH_WARNINGS` and note the issues.

---

## Example Flow

```
User runs: /vf:scaffold-project (MCP) IDEA-0001-opportunity-finder

Agent:
1. Reads idea, concept, epics
2. Sees epics: Core Infrastructure, Job Search Mode, Business Intel Mode, CLI & Scheduling
3. Identifies tech: Python, SQLAlchemy, async HTTP, Typer CLI
4. Designs modular architecture with src/core + src/modes pattern
5. Maps EPIC-001 → src/core/, EPIC-002 → src/modes/job_search/, etc.
6. Creates PROJECT_ARCHITECTURE.md with complete folder tree
7. Asks user: "Create physical folders?" → User says yes
8. Creates all folders + __init__.py files + .env.example + requirements.txt
9. Updates manifest and run log
10. Reports: "✅ Project architecture designed and scaffolded"
```

---

## Notes

- This prompt creates a **design document** first, **optionally** creates physical structure
- Running this multiple times (e.g., after epic changes) will overwrite `latest/PROJECT_ARCHITECTURE.md` but preserve history in `runs/`
- Features and tasks should reference this architecture when describing "where" code goes
- If the project structure already exists (user created it manually), this prompt will document it and suggest improvements

---

## Integration with Pipeline

**Recommended flow:**

1. `imagine` → create idea
2. `normalize-idea` → normalize structure
3. `summarize` → create concept summary
4. `extract-epics` → generate epics
5. `validate-epics` → verify epic quality
6. **`scaffold-project`** ← NEW STEP HERE
7. `extract-features` → features can now reference architecture
8. `build-tasks` → tasks know exactly where to work
9. `make-wps` → work packages target specific files/modules
10. `execute-wp` → start coding in the designed structure

---

## Success Criteria

This prompt succeeds when:
- `PROJECT_ARCHITECTURE.md` clearly maps all epics to code structure
- A developer can understand the project layout from reading it
- Features/tasks can reference specific files/folders
- Initial setup is documented and executable
- (Optional) Physical folder structure matches the design
