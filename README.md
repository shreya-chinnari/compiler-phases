# Code Insights Analyzer

A Next.js application designed to analyze Java and C++ source code, providing insights into lexical structure, intermediate code representations, and simplified machine code generation using AI.

## Key Features

*   **Interactive Code Editor:** Uses Monaco Editor for a familiar coding experience with syntax highlighting for Java and C++.
*   **Language Selection:** Easily switch between analyzing Java and C++ code.
*   **Sample Code:** Load predefined sample code snippets for both Java and C++ to quickly test the features.
*   **Lexical Analysis:**
    *   **Token Stream:** Displays the sequence of tokens extracted from the code (keywords, identifiers, literals, operators, punctuation).
    *   **Symbol Table:** Builds and displays a symbol table containing identifiers, their inferred types (basic), scope, and line numbers.
    *   **Lexeme Statistics:** Shows the count and frequency of different token types found in the code.
    *   **Three-Address Code (TAC):** Generates basic Three-Address Code instructions for simple assignments and arithmetic operations.
*   **AI-Powered Intermediate Code Generation:**
    *   Leverages Google's Gemini model via Genkit.
    *   Generates three common Intermediate Code (IC) representations:
        *   **Quadruples:** `(operator, arg1, arg2, result)`
        *   **Triples:** `(index: operator, arg1, arg2)`
        *   **Indirect Triples:** Instruction list pointing to a separate Triples Table.
*   **AI-Powered Machine Code Generation:**
    *   Utilizes Google's Gemini model via Genkit.
    *   Generates simplified, human-readable assembly-like machine code instructions (e.g., `LOAD`, `STORE`, `ADD`, `JMP`).
*   **Tabbed Results View:** Presents all analysis outputs (Tokens, Symbol Table, Stats, TAC, IC, Machine Code) in a clear, organized, and scrollable tabbed interface.
*   **Modern UI:**
    *   Built with Next.js App Router and React Server Components.
    *   Styled using ShadCN UI components and Tailwind CSS.
    *   Features a vibrant, colorful light theme with gradients.
    *   Includes a Dark Mode toggle.
    *   Responsive design for usability across different screen sizes.
    *   User feedback provided through loading indicators and toasts.

## Technologies Used

*   **Framework:** Next.js (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS, ShadCN UI
*   **Code Editor:** Monaco Editor (@monaco-editor/react)
*   **AI Integration:** Genkit AI, Google AI (Gemini)
*   **UI Components:** Radix UI (via ShadCN)
*   **State Management:** React Hooks (useState, useCallback, useEffect)
*   **Linting/Formatting:** ESLint, Prettier (implicitly via Next.js setup)

## Getting Started

### Prerequisites

*   Node.js (v18 or later recommended)
*   npm or yarn
*   Google AI API Key (for Intermediate and Machine Code Generation)

### Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd code-insights-analyzer
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up Environment Variables:**
    *   Create a `.env` file in the root of the project.
    *   Obtain an API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
    *   Add your API key to the `.env` file:
        ```env
        GOOGLE_GENAI_API_KEY=YOUR_API_KEY_HERE
        ```
    *   **Important:** Keep your API key secret and do not commit the `.env` file to version control.

4.  **Run the Development Servers:**
    *   You need to run both the Next.js development server and the Genkit development server concurrently.
    *   **Terminal 1 (Next.js App):**
        ```bash
        npm run dev
        ```
        This will typically start the application on `http://localhost:9002`.
    *   **Terminal 2 (Genkit AI Flows):**
        ```bash
        npm run genkit:watch
        ```
        This starts the Genkit development server, which handles the AI requests. It usually runs on `http://localhost:4000`.

## Usage

1.  Open the application in your browser (usually `http://localhost:9002`).
2.  Select the desired programming language (Java or C++) from the dropdown.
3.  Enter your code into the editor or click the "Sample" button to load example code.
4.  Click the **"Analyze"** button to perform lexical analysis (Tokens, Symbol Table, Stats, TAC).
5.  Click the **"Generate IC"** button to use the AI model to generate Intermediate Code (Quadruples, Triples, Indirect Triples). This requires a valid `GOOGLE_GENAI_API_KEY`.
6.  Click the **"Generate MC"** button to use the AI model to generate simplified Machine Code. This also requires a valid `GOOGLE_GENAI_API_KEY`.
7.  View the results in the corresponding tabs in the right-hand panel.
8.  Use the **Reset** button (trash icon) to clear the editor and results.
9.  Toggle between Light and Dark modes using the theme switcher in the header.
