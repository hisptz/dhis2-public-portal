---
sidebar_position: 4
---

# Modules Configuration

This document outlines the configuration and purpose of the four types of modules available within the system. Each module type is tailored to serve different content needs and layout styles in the portal.

---

## Overview

Modules are building blocks used to organize and display content in a structured and user-friendly manner. Users can create, configure, and manage different types of modules based on their content needs. Each module type offers a different way to present information or functionality.

---

## Module Types

### 1. Visualization Module

**Purpose:**  
To present visual insights through charts, graphs, or maps.

**How it works:**

- Created using predefined dashboards or analytics visualizations.
- Can display one or more visual components.
- Suitable for showing performance indicators, trends, or summary data.

> For detailed configuration, refer to the [Visualization Module Guide](./visualization.md)

---

### 2. Static Module

**Purpose:**  
To provide fixed, informative content that does not change dynamically.

**How it works:**

- Content is manually entered during configuration.
- Supports rich text (formatted descriptions, links, etc.).

> Example Use Cases:
>
> - About the program
> - Guidelines for reporting
> - Static FAQs

> For detailed configuration, refer to the [Static Module Guide](./static.md)

---

### 3. Document Module

**Purpose:**  
To showcase downloadable document files.

**How it works:**

- Allows file uploads (currently supports **PDF**).
- Users configure display options: **Segmented** or **Dropdown**.
- Supports **grouped** or **ungrouped** documents.
    - **Ungrouped:** Direct list of documents.
    - **Grouped:** Organized under user-defined categories.

> Example Use Cases:
>
> - Manuals or policies
> - Job aids or checklists
> - Reports or publications

> For detailed configuration, refer to the [Document Module Guide](./document.md)

---

### 4. Section Module

**Purpose:**  
To organize content into thematic or functional sections of the portal.

**How it works:**  
Supports three types of sections:

#### a. Single value Section

- A page or section with manually entered rich text content.
- Great for informational or introductory pages.

#### b. Visualization Section

- Categorized collections of visualizations.
 
 
#### c. Feedback Section

- Allows capturing or displaying user feedback.
 
> Example Use Cases:
>
> - "About this section" with rich text
> - Dashboard grouping for different program areas
> - Community or partner feedback area

> For detailed configuration, refer to the [Section Module Guide](./section.md)

---

## Modules Page Interface

The **Modules Page** provides a user interface for managing all module types.

### Filter by Module Type

At the top of the page is a **filter dropdown** labeled **"Filter by type"**, which allows users to display:

- All modules
- Only Visualization Modules
- Only Static Modules
- Only Document Modules
- Only Section Modules

> This helps users focus on specific content types during configuration or review.

---

### Create a New Module

To add a new module, click the **"Create a new module"** button.

You will be prompted to select:

- **Label** – The short display name of the module
- **Type** – Choose from the 4 module types
- **ID** – Auto-generated from the label (used in URLs or keys)

The form will adapt based on the selected type to provide appropriate configuration options.

---

### Viewing Existing Modules

Below the filter  is a list of all configured modules (based on the current filter). Each list item shows:

- Module Label
- Type
- Option to **View** the module

---

## Best Practices

- Use descriptive **labels**  for clarity.
- When using IDs, avoid spaces or special characters.
- Use the filter feature to quickly find specific modules when the list grows large.
- Regularly update static and document modules to reflect the latest information.

---
