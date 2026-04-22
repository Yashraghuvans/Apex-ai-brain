# Demo Script: Building with Apex AI Brain (sfai)

This script outlines a 3-5 minute demo showing how to use `sfai` to build a production-grade Salesforce feature from scratch using Feature-Sliced Design (FSD).

## Scenario
**Requirement:** Create a "VIP Management" feature. 
- A Service layer to handle VIP logic.
- A Selector layer for queried data.
- An LWC to display VIP status on the Account record page.

---

## Part 1: Setup & Initialization
**Goal:** Show how `sfai` understands your project.

1. **Open Terminal** in your Salesforce DX project.
2. **Command:** `sfai`
3. **Action:** Run `/init`
   - *Voiceover:* "First, we start SFAI and run `/init`. This scans our project's metadata so the AI agents understand our existing schema and code patterns."
4. **Visual:** Wait for the success message showing the count of classes and LWCs.

---

## Part 2: Generating the Backend (Apex)
**Goal:** Show FSD-compliant Apex generation.

1. **Action:** Generate the Selector layer first.
   - **Command:** `/soql generate --object Account --filters "IsVIP__c=true"`
   - *Voiceover:* "We'll start by generating an optimized SOQL query for VIP accounts. SFAI ensures it's selective and secure."
2. **Action:** Generate the Service Layer.
   - **Command:** `/apex generate --object Account --type service`
   - *Voiceover:* "Now, let's build our Service layer. SFAI doesn't just write code; it follows our FSD rules, ensuring logic is bulkified and separated from the database layer."
3. **Action:** Generate the Trigger routing.
   - **Command:** `/trigger generate --object Account`
   - *Voiceover:* "Finally, we create a trigger. Notice how SFAI enforces the 'logic-less trigger' rule, creating a Handler that routes strictly to our Service."

---

## Part 3: Generating the UI (LWC)
**Goal:** Show SLDS-compliant UI generation.

1. **Action:** Generate a VIP Dashboard component.
   - **Command:** `/lwc generate --name vipBadge --type detail`
   - *Voiceover:* "On the frontend, we need an LWC to display VIP status. We use the `/lwc` command to scaffold the JS, HTML, and CSS using standard SLDS patterns and reactive wire adapters."
2. **Visual:** Show the terminal output confirming 4 files created (js, html, css, xml).

---

## Part 4: Automated Testing
**Goal:** Show the "Quality First" approach.

1. **Action:** Generate a test class for the new Service.
   - **Command:** `/test generate --class AccountService`
   - *Voiceover:* "No feature is complete without tests. SFAI generates a comprehensive test suite using @TestSetup and the Arrange-Act-Assert pattern, targeting 75%+ coverage automatically."

---

## Part 5: Validation & Wrap Up
**Goal:** Show the "Architectural Guardrails".

1. **Action:** Validate one of the new files.
   - **Command:** `/validate --file force-app/main/default/classes/AccountService.cls`
   - *Voiceover:* "Finally, we run `/validate`. This is our architectural ESLint. It double-checks that the agents didn't miss any governor limits or security checks."
2. **Action:** Exit.
   - **Command:** `/exit`

---

## Tips for a Great Video:
- **Use a Screen Split:** Show the Terminal on the left and VS Code on the right so viewers can see the files appearing in real-time.
- **Highlight the "Brain":** Mention that the AI is being forced to follow the rules in your `rules/` folder.
- **Speed:** The generation takes a few seconds—use these gaps to explain *why* FSD is important for enterprise Salesforce projects.
