
# Salesforce AI Architect 

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Salesforce](https://img.shields.io/badge/Salesforce-00A1E0?style=flat&logo=salesforce&logoColor=white)
![Powered by Gemini](https://img.shields.io/badge/Powered_by-Gemini-8E75B2?style=flat&logo=googlebard&logoColor=white)
![Architecture: FSD](https://img.shields.io/badge/Architecture-FSD-FF6B6B.svg)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

An agentic framework and prompt architecture designed to turn Gemini into a strict, enterprise-grade Senior Salesforce Architect.

Instead of relying on generic AI knowledge (which often hallucinates standard web patterns that violate Salesforce limits), this repository injects strict governor limits, bulkification rules, and Feature-Sliced Design (FSD) folder structures directly into the AI's context window.

##  Purpose
This repository acts as a set of **architectural ESLint rules for AI**. By utilizing this framework, you force the AI to:
- Write bulkified, `WITH USER_MODE` compliant Apex.
- Choose Flows over Triggers where appropriate.
- Follow strict LWC data-binding patterns.
- Adhere to an enterprise folder structure.

##  Contributing

When adding new rules, ensure they are atomic and isolated to their specific layer within the FSD structure. Treat every markdown file in this repository as a strict instruction manual for a junior developer.
