# CHANGELOG

## [0.1.0-alpha.4] - Today (Friday), 31st May 2024

### Decisions Made
- **Directory Structure**
  - **Seraphim** will have two main directories:
    - **`home`**
      - This directory will be the working directory for the Neo handler. It will contain all files and modules related to the Neo handler's and Garnet Handler's operation and functionality (old handler with the main command and event files).
      
    - **`src`**
      - This directory will be the working directory for the Sapphire handler. It will house all components and code specific to @sapphire/framework's processes and workflows.

These changes aim to organize our project structure more effectively, promoting better modularity and separation of concerns between the two handlers.

## [0.1.0-alpha.3] - Thursday, 30th May 2024

### Updates
- **Imports for Commands and Events**
  - Refactored import statements to improve module resolution and ensure that all commands and events are correctly imported and utilized within the project.

## [0.1.0-alpha.2] - Wednesday, 29th May 2024

### New File Added
- **`EventHandler.ts`**
  - This file is responsible for handling all event-related logic, ensuring that events are processed efficiently and effectively.

### Updates
- **`ApplyOptions`**
  - Updated to include new parameters and options that provide greater flexibility and control over event handling and command execution.

## [0.1.0-alpha.1] - Tuesday, 28th May 2024

### New Development Process
- Implemented the **Garnet Handler**, inspired by the Sapphire handler. This new handler aims to streamline and improve our existing process by incorporating best practices and patterns from the Sapphire handler.

### New Files Added
- **`Core.ts`**
  - This file serves as the core module for our project, containing essential logic and functionalities.
  
- **`global.ts`**
  - This file includes a shared exported constant `global`, which will be used across different modules for consistent global state management.
