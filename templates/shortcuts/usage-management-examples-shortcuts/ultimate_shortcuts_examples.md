# AI Shortcuts — Daily Use Training Examples
> Simulate these examples to train with every command in the ultra-lite system.
> Each section covers a command with 2-4 real-world scenarios.

---

## STYLE & LENGTH

### /c — Short reply (2-3 sentences max)

**Scenario 1 — Quick definition**
```
/c What is Docker?
```
> Docker is a tool that packages your app and its dependencies into a container so it runs the same everywhere. Think of it as a lightweight VM without the overhead.

**Scenario 2 — Quick decision**
```
/c Should I use REST or GraphQL for my MVP?
```
> Use REST. It's simpler, faster to build, and easier to debug at MVP stage. Switch to GraphQL when your frontend data needs become complex.

---

### /d — Full detailed response

**Scenario 1 — Architecture decision**
```
/d Explain the difference between monolith and microservices for a startup
```
> [Full response covering tradeoffs, when to use each, migration path, real examples]

**Scenario 2 — Deep dive on a concept**
```
/d How does JWT authentication work end to end?
```
> [Full response: token structure, signing, verification, refresh tokens, security considerations]

---

### /wissem — Direct, startup-aware, Tunisia context

**Scenario 1 — Business advice**
```
/wissem Should I incorporate in Tunisia or offshore for my SaaS?
```
> Offshore (Estonia or Delaware) if you're targeting international clients — easier payments, better credibility with foreign investors. Tunisia if you're serving local market or need local banking. What's your target customer?

**Scenario 2 — Product decision**
```
/wissem We have 3 features to build. How do I decide which first?
```
> Build the one that unblocks revenue or retention first. Everything else is a distraction until you're making money.

---

### /direct — No hedging, no disclaimers

**Scenario 1 — Honest feedback**
```
/direct Is my landing page copy good? "We leverage AI-powered synergies to optimize your workflow."
```
> No. It's corporate jargon that says nothing. Rewrite it as what you actually do: "We automate [specific task] so your team saves [X hours] a week."

**Scenario 2 — Tech choice**
```
/direct Should I learn React or Vue in 2026?
```
> React. Bigger job market, more libraries, more tutorials. Vue is fine but React wins on career ROI.

---

### /vd — Exhaustive response

**Scenario 1 — Full audit**
```
/vd Review all security considerations for a Node.js REST API
```
> [Exhaustive: input validation, auth, rate limiting, CORS, headers, SQL injection, XSS, logging, secrets management, dependencies audit, HTTPS, etc.]

---

### /eli5 — Explain like I'm 5

**Scenario 1 — Technical concept**
```
/eli5 What is an API?
```
> Imagine a restaurant. You (the app) give your order to the waiter (the API). The waiter takes it to the kitchen (the server) and brings back your food (the data). You never go into the kitchen yourself.

**Scenario 2 — Business concept**
```
/eli5 What is product-market fit?
```
> It means people really want what you're selling. Like when everyone at school wants the same toy — the toy has found its market.

---

### /technical — Precise technical language

**Scenario 1 — Code review**
```
/technical Explain what's wrong with using var in JavaScript
```
> `var` is function-scoped and hoisted to the top of its scope, which can cause unintended variable leakage and temporal dead zone issues. Use `const` for immutable bindings and `let` for block-scoped mutable variables to enforce lexical scoping.

---

### /practical — Real-world focus

**Scenario 1 — Learning path**
```
/practical How do I learn system design?
```
> Start by reading real post-mortems (GitHub, Netflix, Cloudflare blogs). Then design systems you actually use — Uber, WhatsApp. Practice explaining tradeoffs out loud. Don't read theory without building something first.

---

### /casual — Relaxed tone

**Scenario 1 — Brainstorm**
```
/casual Give me name ideas for a productivity app for devs
```
> Oh this is fun — how about FlowState, DeepWork, or just something cheeky like NoBrainer? Or go meta: Unblocked, ZeroTab, or Focusd (no 'e' for that startup feel 😄)

---

### /neutral — Balanced view

**Scenario 1 — Controversial tech**
```
/neutral Is AI going to replace developers?
```
> Some argue AI will automate repetitive coding tasks and reduce demand for junior developers. Others point out that software complexity is growing faster than AI can keep up, creating more demand overall. The likely reality is a shift in the skill mix required, not wholesale replacement.

---

## OUTPUT FORMAT

### /b — Bullet list

**Scenario 1 — Feature list**
```
/b What should a good user onboarding flow include?
```
> - Welcome email with clear next step
> - In-app checklist (3-5 items max)
> - Empty state guidance on first login
> - One "aha moment" trigger within first session
> - Follow-up email at day 3 if not activated

---

### /nb — Numbered list

**Scenario 1 — Process**
```
/nb Steps to deploy a Node app to a VPS
```
> 1. SSH into your server
> 2. Clone your repo
> 3. Run `npm install --production`
> 4. Set environment variables
> 5. Start with `pm2 start app.js`
> 6. Configure Nginx as reverse proxy
> 7. Set up SSL with Certbot

---

### /step — Step-by-step instructions

**Scenario 1 — Setup task**
```
/step How do I set up GitHub Actions for CI on a Node project?
```
> Step 1: Create `.github/workflows/ci.yml` in your repo
> Step 2: Define trigger — `on: [push, pull_request]`
> Step 3: Add a job with `runs-on: ubuntu-latest`
> Step 4: Add steps: checkout, setup-node, npm install, npm test
> Step 5: Push and check the Actions tab in GitHub

---

### /table — Structured table

**Scenario 1 — Comparison**
```
/table Compare Vercel, Railway, and Render for deploying a Node API
```
> | Platform | Free Tier | Cold Starts | Custom Domain | Best For |
> |---|---|---|---|---|
> | Vercel | Yes | Yes (serverless) | Yes | Frontend + edge |
> | Railway | $5 credit | No | Yes | Full-stack apps |
> | Render | Yes (limited) | Yes (free) | Yes | Side projects |

---

### /json — JSON output

**Scenario 1 — Data structure**
```
/json Give me a user profile schema for a SaaS app
```
> ```json
> {
>   "id": "uuid",
>   "email": "string",
>   "name": "string",
>   "plan": "free | pro | enterprise",
>   "createdAt": "ISO8601",
>   "settings": {
>     "notifications": true,
>     "language": "en"
>   }
> }
> ```

---

### /code — Code block only

**Scenario 1 — Quick snippet**
```
/code Node.js middleware to log request time
```
> ```javascript
> app.use((req, res, next) => {
>   const start = Date.now();
>   res.on('finish', () => {
>     console.log(`${req.method} ${req.url} - ${Date.now() - start}ms`);
>   });
>   next();
> });
> ```

---

### /proscons — Pros and cons

**Scenario 1 — Tech decision**
```
/proscons Using MongoDB for a startup MVP
```
> **Pros**
> - Flexible schema — great for evolving data models
> - Fast to start, no migrations early on
> - Good free tier on Atlas
>
> **Cons**
> - No joins — complex relations get messy fast
> - Easy to create performance problems with bad schemas
> - Not ideal if you need strong consistency

---

### /compare,a,b — Side-by-side comparison

**Scenario 1 — Framework choice**
```
/compare,NextJS,NuxtJS
```
> | | Next.js | Nuxt.js |
> |---|---|---|
> | Framework | React | Vue |
> | SSR | Yes | Yes |
> | Community | Larger | Smaller |
> | Learning curve | Medium | Easier |
> | Job market | Stronger | Good |
> | Best for | React devs, large teams | Vue devs, faster ramp-up |

---

### /final_only — Skip reasoning, show output only

**Scenario 1 — Get the result without explanation**
```
/final_only Write a subject line for a cold email to a CTO about my dev tool
```
> "Cut your team's code review time by 40% — worth 10 minutes?"

---

### /answer_only — One line

**Scenario 1 — Quick fact**
```
/answer_only What HTTP status code means "not found"?
```
> 404

---

### /no_explanation — Output only

**Scenario 1 — Clean code output**
```
/no_explanation Write a Python function that checks if a string is a palindrome
```
> ```python
> def is_palindrome(s):
>     return s == s[::-1]
> ```

---

### /quick — Fastest useful answer

**Scenario 1 — Urgent fix**
```
/quick How do I kill a process on port 3000 in Mac?
```
> `lsof -ti:3000 | xargs kill`

---

## REASONING

### /cot — Step-by-step reasoning

**Scenario 1 — Architecture decision**
```
/cot Should I use a queue (like Bull) for sending emails in my app?
```
> Let me think through this:
> 1. Email sending can fail — if done synchronously, it blocks the request
> 2. Users shouldn't wait for email delivery to get a response
> 3. If the email service is down, you need retry logic
> 4. At scale, bursts of signups would overwhelm a sync approach
> Conclusion: Yes, use a queue. Bull + Redis is the standard for Node. Even at small scale, it's the right pattern.

---

### /selfcritic — Answer → critique → improve

**Scenario 1 — Copy review**
```
/selfcritic Write a tagline for a project management tool for dev teams
```
> **Draft:** "Manage your projects smarter."
>
> **Critique:** Too generic. Every PM tool says this. No specificity, no benefit, no audience.
>
> **Improved:** "Ship faster. Less standup, more done." — speaks directly to dev teams' pain of too many meetings.

---

### /rootcause — Diagnose root cause

**Scenario 1 — Performance issue**
```
/rootcause My API response times are increasing over time. What's the root cause?
```
> Most likely root cause: unindexed database queries accumulating data over time.
> As your dataset grows, a query that was fast at 1K rows becomes slow at 100K rows without an index.
> Secondary suspects: memory leaks in long-running processes, N+1 query patterns, or connection pool exhaustion.
> Check: slow query logs first, then memory usage over time.

---

### /first_principles — Fundamentals first

**Scenario 1 — System design**
```
/first_principles How should I design a notification system?
```
> From first principles:
> - A notification is just a message triggered by an event
> - Events can be synchronous (user action) or async (scheduled)
> - Delivery channels are independent of the event (email, SMS, push)
> - Failures in delivery shouldn't block the core app
> Therefore: event → queue → worker → channel adapter. Each layer is independent. Start with this pattern and add complexity only when needed.

---

### /analogy — Explain with analogy

**Scenario 1 — Technical concept**
```
/analogy Explain load balancing
```
> Imagine a busy McDonald's with 4 cashiers. A load balancer is the person at the door who directs each customer to the cashier with the shortest queue. No single cashier gets overwhelmed, and customers get served faster overall.

---

### /improve — Make it better

**Scenario 1 — Improve existing code**
```
/improve
[paste your code or text]
```
> [Returns improved version with explanation of what changed and why]

---

### /simplify — Reduce complexity

**Scenario 1 — Simplify architecture**
```
/simplify Our stack: React frontend, Node API, Redis cache, MongoDB, RabbitMQ, Elasticsearch. MVP with 50 users.
```
> Drop RabbitMQ and Elasticsearch immediately. At 50 users you don't need a message queue or search engine. Use MongoDB's built-in text search. Add queues only when you have proven async load. Simpler stack = faster iteration = less ops burden.

---

### /expand — Add depth

**Scenario 1 — Expand a short answer**
```
/expand You said "use indexes". Tell me more.
```
> [Expanded: types of indexes, when to use compound vs single, how to identify missing indexes, explain plans, index tradeoffs on write performance, etc.]

---

### /rewrite — Full rewrite

**Scenario 1 — Rewrite bad copy**
```
/rewrite "Our platform utilizes cutting-edge machine learning algorithms to provide actionable insights."
```
> "We analyze your data and tell you exactly what to do next — no guesswork."

---

## CONTEXT & FILES

### /ctx,name,load + /ctx,name,analyze

**Scenario 1 — Load and analyze backend**
```
/ctx,backend,load
/ctx,backend,analyze
```
> [Load]: Context "backend" loaded.
> [Analyze]: The backend uses Express with MongoDB. Auth is handled via JWT in middleware. Main concerns: no input validation on POST routes, database calls not wrapped in try/catch, no rate limiting on auth endpoints.

---

### /f,file,debug — Find bugs in a file

**Scenario 1 — Debug auth file**
```
/f,auth.js,load
/f,auth.js,debug
```
> Bugs found in auth.js:
> 1. Line 23: JWT secret hardcoded as string — should use `process.env.JWT_SECRET`
> 2. Line 47: No expiry set on token — tokens never expire
> 3. Line 61: Password compared with `==` instead of `bcrypt.compare()`

---

### /f,file,test — Generate tests

**Scenario 1 — Generate tests for a utility**
```
/f,utils.js,load
/f,utils.js,test
```
> [Returns full Jest test suite covering happy path, edge cases, and error cases]

---

### /f,file,refactor — Refactor for readability

**Scenario 1 — Clean up messy code**
```
/f,userController.js,load
/f,userController.js,refactor
```
> [Returns refactored version: extracted functions, consistent error handling, removed duplication, added clear variable names]

---

## EXECUTION

### /plan_then_execute

**Scenario 1 — Build a feature**
```
/wissem /goal,add_stripe_payments /plan_then_execute
```
> Plan:
> 1. Install stripe SDK
> 2. Create /api/create-checkout-session endpoint
> 3. Add webhook handler for payment confirmation
> 4. Store subscription status on user model
> 5. Gate premium features behind status check
>
> Proceed? (yes/no)

---

### /dry_run — Simulate without executing

**Scenario 1 — Preview database migration**
```
/dry_run Add a "status" field to all existing user records with default value "active"
```
> Simulation:
> - Query: `db.users.updateMany({}, { $set: { status: "active" } })`
> - Affected documents: ~2,400 records
> - Risk: Low — additive change, no data loss
> - Rollback: `db.users.updateMany({}, { $unset: { status: "" } })`
> Run it? (yes/no)

---

### /goal,x + /goal_status

**Scenario 1 — Track progress**
```
/goal,launch_beta_by_april
```
> Goal set: launch_beta_by_april. I'll keep this in context throughout our session.

```
/goal_status
```
> Current goal: launch_beta_by_april
> Completed: auth, user dashboard, basic CRUD
> Remaining: payment integration, email notifications, staging deploy, QA
> Estimated: 60% done

---

## ROLES

### /wissempro — Tunisian tech entrepreneur advisor

**Scenario 1 — Fundraising advice**
```
/wissempro Should I raise a pre-seed round now or wait until I have revenue?
```
> If you can get to first revenue in 3-6 months without raising, do it. Revenue changes your leverage completely — you're no longer begging, you're choosing. In Tunisia especially, bootstrap as far as you can before diluting. Raise only when you have a specific use of funds that multiplies revenue, not just to extend runway.

---

### /expert — World-class expert

**Scenario 1 — Security review**
```
/expert Review the security of my JWT implementation
```
> [Responds as a senior security engineer: checks algorithm (avoid none/HS256 weak keys), token storage (httpOnly cookies vs localStorage), expiry strategy, refresh token rotation, revocation approach, CSRF protection, etc.]

---

### /engineer — Pragmatic implementer

**Scenario 1 — Feature implementation**
```
/engineer How should I implement search in my app?
```
> At your scale: use your existing database's built-in full-text search first. PostgreSQL has `tsvector`, MongoDB has `$text`. Don't add Elasticsearch until you've proven the DB can't handle it. That's probably 100K+ documents with complex queries. Build the simple thing first.

---

### /critic — Honest evaluation

**Scenario 1 — Evaluate an idea**
```
/critic My startup idea: an app that connects freelancers with clients in Tunisia
```
> Hard pass on the current positioning. This is a crowded space globally (Upwork, Fiverr, Malt) and locally (there are already Tunisian copycats). Without a specific niche or unfair advantage, you'll spend all your money on supply/demand acquisition. What's your moat? If you can't answer that in one sentence, the idea needs more work.

---

### /pm — Scope and prioritize

**Scenario 1 — Scope an MVP**
```
/pm We want to build a SaaS for invoice management. What's the MVP scope?
```
> Cut it to: create invoice, send by email, mark as paid. That's it. No recurring invoices, no multi-currency, no client portal, no reminders, no dashboard. Those are v2. Ship the core loop first and validate that people will pay for it.

---

## PRIORITIZATION

### /focus,top3

**Scenario 1 — Weekly planning**
```
/wissempro /focus,top3 I have: fix login bug, write docs, add dark mode, improve onboarding, set up analytics, write blog post
```
> Top 3:
> 1. Fix login bug — blocking users, revenue at risk
> 2. Improve onboarding — directly impacts activation rate
> 3. Set up analytics — you can't improve what you can't measure
>
> Everything else is noise until these are done.

---

### /quick_wins

**Scenario 1 — Find easy wins**
```
/quick_wins What can I improve on my SaaS landing page this week?
```
> - Add a real screenshot or demo GIF (2hrs, high conversion impact)
> - Add 2-3 customer logos or testimonials (1hr if you have them)
> - Make the CTA button bigger and change color to contrast (30min)
> - Add pricing on the page — hiding it kills trust (1hr)

---

### /effort — Effort estimate

**Scenario 1 — Estimate a feature**
```
/effort Add Stripe subscription billing to an existing Node/React app
```
> Medium-High effort. Estimate: 3-5 days for a solo dev.
> - Stripe SDK setup + webhook: 4hrs
> - Checkout flow + success/cancel pages: 4hrs
> - Subscription status on user model: 2hrs
> - Gating features behind plan: 3hrs
> - Testing + edge cases: 4hrs
> Risk: webhooks are the tricky part — budget extra time there.

---

## INTERACTION

### /no_questions — Assume and proceed

**Scenario 1 — Code task**
```
/no_questions /wissem Build me a REST endpoint to create a user
```
> [Proceeds immediately with best assumptions: Node/Express, MongoDB, bcrypt password hashing, JWT response, input validation — no clarifying questions asked]

---

### /checklist — Actionable checklist

**Scenario 1 — Launch prep**
```
/checklist What do I need before launching my SaaS publicly?
```
> - [ ] Payment flow tested end-to-end
> - [ ] Error monitoring set up (Sentry)
> - [ ] Basic analytics in place
> - [ ] Terms of Service and Privacy Policy live
> - [ ] Transactional emails working (welcome, password reset)
> - [ ] Custom domain + SSL configured
> - [ ] Load tested with expected traffic
> - [ ] Support email or chat widget active
> - [ ] Backup strategy for database

---

### /fix — Fix and explain

**Scenario 1 — Fix a bug**
```
/fix
async function getUser(id) {
  const user = await User.findById(id)
  return user.name
}
```
> **Bug:** If `user` is null (ID not found), `user.name` throws `TypeError: Cannot read property 'name' of null`.
>
> **Fix:**
> ```javascript
> async function getUser(id) {
>   const user = await User.findById(id);
>   if (!user) throw new Error(`User ${id} not found`);
>   return user.name;
> }
> ```

---

### /explain_error — Plain-language error explanation

**Scenario 1 — Node error**
```
/explain_error ECONNREFUSED 127.0.0.1:5432
```
> Your app is trying to connect to a PostgreSQL database on your local machine (port 5432) but nothing is running there. Either PostgreSQL isn't started, it's running on a different port, or your connection string is pointing to localhost when it should point to a remote host (like your Docker container or cloud DB).

---

## META

### /help — Explain a shortcut

**Scenario 1**
```
/help /selfcritic
```
> `/selfcritic` makes me generate an answer, then immediately critique it for weaknesses, then produce an improved version. Use it when you want higher quality output, not just a first draft — especially useful for copy, strategy, or architecture decisions.

---

### /style — Show current active settings

**Scenario 1**
```
/style
```
> Current active settings:
> - Tone: /wissem (direct, startup-aware)
> - Length: /d (full detail)
> - Output: /final_only
> - Goal: launch_beta_by_april
> - Mode: /no_questions

---

### /business — ROI framing

**Scenario 1 — Tech decision**
```
/business Should we rewrite our frontend in TypeScript?
```
> Business case: TypeScript reduces bugs that reach production, which means less time spent on customer-reported issues and faster onboarding for new devs. Typical teams report 15-30% fewer runtime errors. Cost: 2-4 weeks of migration depending on codebase size. ROI breakeven: ~3-6 months. Recommend: yes, but incrementally — don't stop shipping to do it.

---

## POWER CHAINS — Full Workflow Examples

### Chain 1 — Debug and fix a file
```
/wissem /no_questions /engineer /f,auth.js,load /f,auth.js,debug /fix /final_only
```
> [Loads file → finds bugs → fixes them → shows final fixed code only, no commentary]

---

### Chain 2 — Plan a feature from scratch
```
/wissempro /goal,add_notifications /plan_then_execute /no_questions /step
```
> [Sets goal → shows step-by-step plan → waits for approval → executes]

---

### Chain 3 — Write and improve copy
```
/direct /selfcritic Write a cold email subject line for a dev tool targeting CTOs
```
> Draft → Critique → Improved version

---

### Chain 4 — Quick startup decision
```
/wissempro /c /direct Should I hire a junior dev or a senior dev first?
```
> Hire senior first if you need architecture decisions made right. Hire junior if the foundation is solid and you need execution speed at lower cost. At pre-revenue: senior. Post-revenue with traction: junior to scale output.

---

### Chain 5 — Full session launcher
```
## AI Shortcuts — Ultra Trim

STYLE: /wissem=direct+startup+Tunisia | /direct=no hedging | /c=short | /d=full
OUTPUT: /b=bullets | /step=step-by-step | /final_only | /cot | /selfcritic
WORKFLOW: /no_questions | /goal,x | /execute | /plan_then_execute | /fix
Always remember active /goal until /reset.

⚡ START: /wissem /no_questions /goal,launch_mvp /plan_then_execute /final_only
```
> [Paste this → Claude loads all shortcuts + sets goal + starts planning immediately]

---

*End of training examples. Practice 2-3 scenarios per day until chains feel natural.*


## CONTEXT & FILE MANAGEMENT (Section 15)

### /ctx,foldA,load — Load full content of a folder (paste immediately after). AI confirms with one-line summary.

**Scenario 1**
```
/ctx,backend,load
[paste entire backend folder code here]
```

> ✓ Context backend loaded — FastAPI app with auth, users, payments (8 files, 2,847 LOC, PostgreSQL + Redis).

---

### /ctx,foldA,set, — Define what the folder contains without pasting full code.

**Scenario 1**
```
`/ctx,frontend,set,React + Tailwind dashboard with 5 pages and API hooks`
```

> ✓ Context frontend set — React + Tailwind dashboard (5 pages, API hooks, no full code pasted).

---

### /ctx,foldA,scope, — Narrow focus inside an already loaded folder.

**Scenario 1**
```
`/ctx,backend,scope,auth_module`
```

> Scope narrowed to auth_module only (JWT, refresh tokens, rate limiting).

---

### /ctx,foldA,reset — Clear a context slot.

**Scenario 1**
```
`/ctx,backend,reset`
```

> ✓ Context backend cleared.

---

### /ctx,list — Show all active context slots.

**Scenario 1**
```
`/ctx,list`
```

> Active contexts:  
> • backend (loaded)  
> • frontend (set)  
> • auth.py (loaded)

---

### /f,file.py,load — Load single file content.

**Scenario 1**
```
/f,auth.py,load
[paste full auth.py here]
```

> ✓ File auth.py loaded — 412 LOC, FastAPI auth endpoints + dependency injection.

---

### /f,file.py,set, — Define file without full paste.

**Scenario 1**
```
`/f,utils.py,set,helper functions for validation and logging`
```

> ✓ File utils.py set.
>

---

### /ctx,foldA,overview — High-level one-paragraph summary.

**Scenario 1**
```
/ctx,foldA,overview
```

> Backend folder contains a production-ready FastAPI service with clean architecture (routers, services, repositories). Total 8 modules, main entrypoint main.py.

---

### /ctx,foldA,analyze — Deep structural + logic analysis.

**Scenario 1**
```
/ctx,foldA,analyze
```

> Structural analysis: 3 layers (routers → services → repositories). Circular dependency detected between payments and users. Logic gaps in error handling for 429 rate limits.

---

### /ctx,foldA,document — Generate full documentation.

**Scenario 1**
```
/ctx,foldA,document
```

> # Backend Documentation  
> ## Endpoints  
> • POST /auth/login → returns JWT  
> ...

---

### /ctx,foldA,improve — Suggest quality improvements.

**Scenario 1**
```
/ctx,foldA,improve
```

> Recommendations: 1. Add pydantic v2 models 2. Replace print() with structured logging 3. Add OpenAPI tags.

---

### /ctx,foldA,refactor — Refactor for clarity/maintainability.

**Scenario 1**
```
/ctx,foldA,refactor
```

> Refactored structure proposed + diff view of all files.

---

### /ctx,foldA,debug — Find bugs and issues.

**Scenario 1**
```
/ctx,foldA,debug
```

> Critical: unhandled exception in payment webhook (line 142). Warning: SQL injection risk in raw query (users.py:89).

---

### /ctx,foldA,secure — Security audit.

**Scenario 1**
```
/ctx,foldA,secure
```

> Vulnerabilities found: 1. Missing rate-limit on login 2. Exposed stack traces in prod 3. Hard-coded secrets.

---

### /ctx,foldA,optimize — Performance improvements.

**Scenario 1**
```
/ctx,foldA,optimize
```

> Optimizations: Add Redis caching to user service → -65% DB load. Use async SQLAlchemy. Index on payments.created_at.

---

### /ctx,foldA,test — Generate test cases.

**Scenario 1**
```
/ctx,foldA,test
```

> Generated 28 pytest cases (unit + integration) for the entire folder.

---

### /ctx,foldA,map — Visual text-based map of structure.

**Scenario 1**
```
/ctx,foldA,map
```

```
> backend/
> ├── routers/
> ├── services/
> ├── repositories/
> └── main.py (entry)
```

---

### /ctx,foldA,explain — Plain-language explanation.

**Scenario 1**
```
/ctx,foldA,explain
```

> This folder is the complete backend API that handles user authentication, payments, and profile management.

---

### /ctx,foldA,dependencies — List internal + external dependencies.

**Scenario 1**
```
/ctx,foldA,dependencies
```

> Internal: auth → users → payments  
> External: fastapi, sqlalchemy, redis, stripe.

---

### /ctx,foldA,entrypoints — Identify all entry points.

**Scenario 1**
```
/ctx,foldA,entrypoints
```

> • main.py:uvicorn  
> • routers/auth.py  
> • webhooks/stripe.py

---

### /ctx,foldA,architecture — Describe architectural pattern.

**Scenario 1**
```
/ctx,foldA,architecture
```

> Clean Architecture + Repository pattern. Layers are strictly separated.

---

### /ctx,foldA,dataflow — Trace data flow.

**Scenario 1**
```
/ctx,foldA,dataflow
```

> Request → Router → Service → Repository → DB → Response (with caching layer).

---

### /ctx,foldA,public_docs — Public-facing documentation.

**Scenario 1**
```
/ctx,foldA,public_docs
```

> Ready-to-publish README + Swagger description.

---

### /ctx,foldA,expose — Show exposed vs internal.

**Scenario 1**
```
/ctx,foldA,expose
```

> Public API: 12 endpoints. Internal only: 8 repository classes.

---

### /ctx,foldA,summary — Fast condensed overview.

**Scenario 1**
```
/ctx,foldA,summary
```

> Backend: FastAPI + PostgreSQL, 8 modules, auth + payments core.

---

### /ctx,foldA,todos — Extract all TODO/FIXME/HACK.

**Scenario 1**
```
/ctx,foldA,todos
```

> • TODO: implement email verification (auth.py:67)  
> • HACK: temporary stripe test key (payments.py:22)

---

### /ctx,foldA,lint — Flag style/quality issues.

**Scenario 1**
```
/ctx,foldA,lint
```

> 23 issues: 12 missing type hints, 7 long functions, 4 unused imports.

---

### /ctx,foldA,changelog — Summarize changes (when diffs provided).

**Scenario 1**
```
/ctx,foldA,changelog
```

> Changelog summary: Added webhook handler, refactored auth service, bumped FastAPI 0.110 → 0.115.
>

---

### /ctx_multi,foldA,foldB,compare — 

**Scenario 1**
```
`/ctx_multi,backend,frontend,compare`
```

> Comparison table: tech stack, file count, coupling level, etc.

---

### /ctx_merge,foldA,foldB — 

**Scenario 1**
```
`/ctx_merge,backend,frontend`
```

> Merged context active — full-stack view now available.

---

### /ctx_diff,foldA,foldB — 

**Scenario 1**
```
`/ctx_diff,backend_v1,backend_v2`
```

> Diff summary: +3 files, -124 LOC, new payment module added.
>

---

### /f,file.py,explain — 

**Scenario 1**
```
/f,file.py,explain
```

> auth.py implements JWT login, refresh, and dependency injection for protected routes.

---

### /f,file.py,refactor — 

**Scenario 1**
```
/f,file.py,refactor
```

> Refactored version with better separation + diff.

---

### /f,file.py,debug — 

**Scenario 1**
```
/f,file.py,debug
```

> Bug found: missing await on async DB call (line 134).

---

### /f,file.py,document — 

**Scenario 1**
```
/f,file.py,document
```

> Added full docstrings + module-level docs.

---

### /f,file.py,optimize — 

**Scenario 1**
```
/f,file.py,optimize
```

> Performance improved: cached query, reduced DB calls by 40%.

---

### /f,file.py,test — 

**Scenario 1**
```
/f,file.py,test
```

> Generated 12 pytest functions covering all paths.

---

### /f,file.py,review — 

**Scenario 1**
```
/f,file.py,review
```

> Code review: 9/10. Suggestions: add logging, improve error messages.

---

### /f,file.py,convert,lang — 

**Scenario 1**
```
`/f,auth.py,convert,typescript`
```

> Full conversion to TypeScript + NestJS style.

---

### /f,file.py,improve — 

**Scenario 1**
```
/f,file.py,improve
```

> General improvements applied (type hints, error handling, tests).

---

### /f,file.py,secure — 

**Scenario 1**
```
/f,file.py,secure
```

> Security audit passed except one minor issue (fixed version attached).

---

### /f,file.py,summary — 

**Scenario 1**
```
/f,file.py,summary
```

> One-paragraph summary of the file.

---

### /f,file.py,trace, — 

**Scenario 1**
```
`/f,auth.py,trace,login_function`
```

> Step-by-step execution trace of login_function.

---

### /f,file.py,mock — 

**Scenario 1**
```
/f,file.py,mock
```

> Complete mock/stub file generated.

---

### /f,file.py,diff,file2.py — 

**Scenario 1**
```
/f,file.py,diff,file2.py
```

> Side-by-side diff between the two files.
>

---

### /p,projectX,health — 

**Scenario 1**
```
/p,projectX,health
```

> Project health: 92/100 (strong architecture, 3 minor tech debt items).

---

### /p,projectX,roadmap — 

**Scenario 1**
```
/p,projectX,roadmap
```

> Suggested 3-month roadmap with priorities.

---

### /p,projectX,risks — 

**Scenario 1**
```
/p,projectX,risks
```

> Technical risks: DB scaling at 10k users. Business risks: payment provider dependency.

---

### /p,projectX,scalability — 

**Scenario 1**
```
/p,projectX,scalability
```

> Scalability assessment: ready for 50k users with current design.

---

### /p,projectX,readiness — 

**Scenario 1**
```
/p,projectX,readiness
```

> Production readiness: 85% — needs observability + CI/CD finalised.

---

### /p,projectX,architecture — 

**Scenario 1**
```
/p,projectX,architecture
```

> Full architectural review + diagrams (text).
>

---

### /save — Format current output for saving.

**Scenario 1**
```
/save
```



---

### /save_as,file.md — 

**Scenario 1**
```
/save_as,file.md
```



---

### /save_to,foldA,file.md — 

**Scenario 1**
```
/save_to,foldA,file.md
```



---

### /export,markdown — 

**Scenario 1**
```
/export,markdown
```



---

### /export_to,foldA,file.md — 

**Scenario 1**
```
/export_to,foldA,file.md
```

> 
> ---
> 
> ### How the full version integrates (all other commands covered via real chains)
> 
> Here are ready-to-copy chains that use **every category** from the full v4.3:
> 
> 1. **Style + Tone + Format + Reasoning**  
> `/d /wissem /engineer /cot /table /ctx,backend,load [paste] /ctx,backend,analyze /final_only`
> 
> 2. **Deep file work**  
> `/f,auth.py,load [paste] /f,auth.py,debug /f,auth.py,secure /f,auth.py,refactor /selfcritic /final_only`
> 
> 3. **Project level**  
> `/p,projectX,load [paste all] /p,projectX,health /p,projectX,roadmap /p,projectX,risks /swot /goal,launch_mvp /execute`
> 
> 4. **Multi-context + compare**  
> `/ctx_multi,backend,frontend,compare /ctx_diff,backend,backend_v2 /vd /proscons`
> 
> 5. **Creative + goal driven**  
> `/creative /goal,build_api /ctx,api,load [paste] /ctx,api,optimize /brainstorm,5 /ep,optimize`
> 
> Just paste the universal prefix once at the start of any new chat, then use any of the above chains + the file commands in this guide.
> 
> You now have **complete, exhaustive, copy-paste-ready examples** for every single command in the full version. Save the file and you’re done.  
> 
> Ready when you are — drop your first context and let’s go.

---



## BUDGET & TOKEN MANAGEMENT (Section 22)



---


**Use Case:** You are about to run a massive refactor across 15 files and want to avoid an accidental $5.00 API charge.

```
/quote Refactor the entire authentication module in src/auth/ to use JWT instead of sessions.```
> **Token Estimation:**
> - Input context: ~45,000 tokens
> - Expected output: ~8,000 tokens across 5 files
> - **Estimated Cost:** $0.85
> 
> *Type "Approve" to proceed with the execution.*

---


**Use Case:** You want the AI to do a task, but only if it's cheap. If it's an expensive task, you want to do it yourself using a guided prompt.

```
/le,10 Generate a comprehensive test suite for the dashboard components.`

**AI Behavior (Scenario A - Under 10%):**
> *Task requires ~5% of token limit. Executing...*
> [Outputs the test suite code immediately]

**AI Behavior (Scenario B - Over 10%):**
> *Task rejected. Estimated token usage (35%) exceeds your 10% limit.*
> 
> **Do-It-Yourself Execution Prompt:**
> "Please copy and paste the following prompt into your terminal or a cheaper AI session to generate the tests file-by-file:
> *'Read `src/dashboard/Chart.vue` and generate Vitest unit tests covering mounting and data-fetching. Save it to `tests/Chart.spec.js`.'* (Repeat for each component)."

---


**Use Case:** You are running an ongoing task and want to pause periodically to review the cost and approve the next chunk.

```
/usage,15 Migrate all old Vue 2 syntax to Vue 3 Composition API in the components folder.```
> *Executing chunk 1...*
> [Migrates 3 files]
> 
> **⏸️ Token Limit Paused**
> I have reached your 15% token usage threshold (Estimated cost spent: $0.45).
> **Remaining work:** 7 files left.
> **Estimated remaining cost:** $1.10 (approx. 35% more token usage).
> 
> *Do you approve continuing for a custom chunk of 20%?*

---


**Use Case:** You've been chatting with the AI for 2 hours. The context window is huge, and every single prompt is costing $0.10 just in input tokens. You only need a small CSS fix now.

```
/diet Fix the margin on the login button in Header.vue.```
> *Flushing conversational history and unrelated files...*
> *Retaining only `Header.vue` lines 45-60.*
> 
> Here is the fixed CSS class for the login button:
> ```css
> .login-btn { margin-left: 1rem; }
> ```
> *(Input tokens reduced from 80k to 400 tokens).*

---


**Use Case:** You are in an expensive Opus/Pro session, but you need a simple regex or a basic boilerplate script that a cheap model like Haiku/Flash could do for pennies.

```
/delegate Write a regex to validate Tunisian phone numbers (+216).```
> *Task evaluated as trivial. Executing this on the current premium model is a waste of budget.*
> 
> **Action:** Copy and paste the prompt below into a Gemini Flash or Claude Haiku session:
> > *"Write a javascript regex that strictly matches Tunisian phone numbers starting with +216 followed by 8 digits. Provide 3 test cases."*

---

