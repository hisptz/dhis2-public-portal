---
sidebar_position: 3
---
# Appearance Settings

The Appearance Settings section allows you to customize the look and feel of your DHIS2 Public Portal. These settings control visual elements such as colors, logos, header, and footer.

## Accessing Appearance Settings

1. Log in to the Manager App
2. Navigate to the "Appearance" section in the sidebar menu

## Available Configuration Options

### Colors

#### Primary Color

The main color used throughout your portal for buttons, links, and other UI elements.

- **Field**: Primary Color
- **Type**: Color picker
- **Default**: #2C6693 (DHIS2 blue)

#### Background Color

The background color of your portal.

- **Field**: Background Color
- **Type**: Color picker
- **Default**: #F3F5F7 (light gray)

#### Chart Colors

The colors used for charts and visualizations in your portal.

- **Field**: Chart Colors
- **Type**: Multiple color pickers
- **Default**: A set of 8 colors that work well together

### Header Configuration

#### Header Style

Configure the appearance of the header section.

- **Leading Logo**:
  - Show/hide the logo at the beginning of the header
  - Configure width and height (default: 60x60 pixels)

- **Trailing Logo**:
  - Show/hide a secondary logo at the end of the header
  - Configure width and height (default: 60x60 pixels)

- **Container Height**:
  - Set the height of the header (default: 138 pixels)

- **Background**:
  - Use colored background (default: enabled)
  - Use primary color as background (default: enabled)

#### Header Title

Configure the main title displayed in the header.

- **Text**: The text to display as the main title (default: "DHIS2 FlexiPortal")
- **Alignment**: Left, center, or right alignment (default: left)
- **Text Size**: Size in pixels (default: 30px)
- **Text Color**: Color of the title text (default: white)

#### Header Subtitle

Configure the subtitle displayed in the header.

- **Text**: The text to display as the subtitle (default: "A customizable public portal for a DHIS2 implementation")
- **Text Size**: Size in pixels (default: 14px)
- **Text Color**: Color of the subtitle text (default: white)

### Footer Configuration

#### Copyright Text

The copyright text displayed in the footer.

- **Field**: Copyright
- **Type**: Text
- **Default**: "All rights reserved. @ [current year]"

#### Show Title

Option to show or hide the title in the footer.

- **Field**: Show Title
- **Type**: Toggle
- **Default**: Enabled

#### Footer Items

Configure the items displayed in the footer, such as address information and useful links.

- **Types**:
  - **Static Content**: Display static HTML content
  - **Links**: Display a list of links

- **Example Items**:
  - Address (static content)
  - Useful Links (links to external resources)

## How to Configure

1. **Logo**: Enter the URL of your logo or upload a file
2. **Colors**:
   - Select a primary color that matches your organization's branding
   - Choose a suitable background color
   - Configure chart colors if needed
3. **Header**:
   - Configure the header style (logos, height, background)
   - Set the header title and subtitle text and styling
4. **Footer**:
   - Enter your copyright text
   - Configure whether to show the title
   - Add and configure footer items (address, links, etc.)
5. Save your changes by clicking the "Save" button

## Best Practices

- Use colors that match your organization's branding
- Ensure text colors have sufficient contrast with background colors for readability
- Use appropriately sized logos that don't overwhelm the header
- Keep the footer clean and organized with only essential information
- Test how your appearance settings look on different screen sizes
