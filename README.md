<h1>🌿 Leafy AI – Plant Disease Detection & Analysis</h1>

Leafy AI is a modern web application built with Next.js and AI-powered workflows to analyze plant leaves, detect diseases, and suggest treatments. It helps farmers, researchers, and students quickly identify plant health issues using images and intelligent recommendations.

<h3>🚀 Features</h3>
<br>📸 Leaf Image Analysis – Upload images and detect plant diseases
<br>🧠 AI-Powered Insights – Uses intelligent flows for diagnosis
<br>🩺 Disease Summary – Get detailed explanations of detected diseases
<br>💊 Treatment Suggestions – Recommended remedies and solutions
<br>💬 Question Answering – Ask plant-related queries
<br>📱 Responsive UI – Works across desktop and mobile devices


<h3>🛠️ Tech Stack</h3>
<br>Frontend: Next.js, React, TypeScript
<br>Styling: Tailwind CSS
<br>AI Integration: Genkit / Custom AI flows
<br>UI Components: Custom + reusable component library

<h3>🧠 AI Workflows</h3>
<br>answer-question-flow.ts → Handles user queries
<br>generate-disease-summary.ts → Creates disease descriptions
<br>suggest-treatments-for-disease.ts → Provides treatment options
<br>analyze-image-flow.ts → Core image analysis logic

<h3>🏗️ Project Structure</h3>


```bash
.
├── src/
│   ├── app/                # App routing and pages (Next.js)
│   │   ├── analysis/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── actions.ts
│   │   ├── types.ts
│   │   └── globals.css
│   │
│   ├── components/         # UI and client components
│   │   ├── ui/
│   │   ├── leafy-ai-client.tsx
│   │   └── leaf-analysis-client.tsx
│   │
│   ├── ai/                 # AI logic and workflows
│   │   ├── flows/
│   │   ├── genkit.ts
│   │   └── dev.ts
│   │
│   ├── lib/                # Utility functions
│   │   └── utils.ts
│   │
│   └── hooks/              # Custom React hooks
│       ├── use-mobile.tsx
│       └── use-toast.ts
│
├── docs/
│   └── blueprint.md
├── public/
├── package.json
├── tailwind.config.ts
├── next.config.ts
└── README.md
```

