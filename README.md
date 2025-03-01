# Flower Shop

A flower e-commerce web application built with Next.js, TypeScript, Tailwind CSS, and integrated with Wix services. This project showcases a range of features such as product listing, filtering, cart functionality, user login, and a custom checkout flow.

## Features
- Next.js 15 and React 19: Leverage server-side rendering and static site generation for optimal performance.
- Tailwind CSS: Rapid UI development with utility-first CSS.
- TypeScript: Strongly typed codebase for better maintainability.
- Wix SDK Integration: Uses @wix/sdk and related Wix packages for e-commerce data and functionalities.
- State Management: Powered by Zustand to handle cart state and other global data.
- ESLint & Prettier: Enforced code consistency and style.
- File Structure:
  - /src/app: Routing, pages, and global styles.
  - /src/components: Reusable UI components (Navbar, Footer, Banner, ProductList, etc.).
  - /src/context: Context providers (e.g., Wix context).
  - /src/hooks: Custom React hooks (e.g., for cart state management, Wix client).
  - /src/lib: Additional libraries or helpers (e.g., server-side Wix client).
  - /public: Static assets (images, icons, etc.).
    
## Screenshots

**Home Page**

<img src="https://i.ibb.co/x8H98frc/main-page.png" alt="main page" width="600"/>


**Product List**

<img src="https://i.ibb.co/r2bPkZYZ/list-page.png" alt="list page" width="600"/>


**Slug**

<img src="https://i.ibb.co/gbqkN2Sw/slug-page.png" alt="slug page" width="600"/>


## Getting Started

**Prerequisites**

- Node.js (version 16 or higher recommended).
- npm or Yarn for package management.
- Wix Subscription: You must have an active Wix subscription for checkout and orders functionality to work properly.

**Installation**
1. Clone the repository or download the project:

>git clone https://github.com/Embox99/flower_shop.git

**Navigate into the project folder:**

>cd flower_shop

**Install dependencies:**

>npm install

**Or, if you prefer Yarn:**

>yarn install

## Running Locally

**Development**

**To run the development server:**

>npm run dev

This command starts a local development server at http://localhost:3000. Any changes in your source files will automatically reload the page.

### Production

**1.Build the application:**

>npm run build

**2.Start the production server:**

>npm run start

The production server should now be running at http://localhost:3000.


## Important Files
- next.config.mjs: Custom Next.js configuration (e.g., enabling certain features, setting environment variables).
- tsconfig.json: TypeScript configuration to manage strictness and compiler settings.
- tailwind.config.mjs: Tailwind CSS configuration file for theme customization.
- middleware.ts: Next.js middleware for handling requests, redirects, or custom logic.
- /src/components: Houses all UI components such as Navbar, Footer, ProductList, etc.

## Configuration & Environment Variables

**Make sure to set up a .env.local file with the necessary environment variables:**

- NEXT_PUBLIC_WIX_APP_ID=your_app_id
- NEXT_PUBLIC_WIX_CLIENT_ID=your_client_id
- FEATURED_PRODUCTS_CATEGORY_ID=your_category_id
- WIX_API_KEY=your_wix_api_key
- WIX_SECRET=your_wix_secret
...
>Note: These specific variables (NEXT_PUBLIC_WIX_APP_ID, NEXT_PUBLIC_WIX_CLIENT_ID, and FEATURED_PRODUCTS_CATEGORY_ID) must be replaced with your actual values for the checkout and orders to function properly. Also, add .env.local to your .gitignore to avoid committing sensitive data.

## Usage
- Explore the Home Page: Displays a banner, product categories, and featured products.
- Product List Page: Filter products, search, and browse available items.
- Cart Functionality: Add items to cart, modify quantities, and proceed to checkout.
- Login: Includes a basic login page if authentication is required for special features (e.g., custom user orders).
- Success Page: Shows an order confirmation or success message after checkout.

## Contributing
**Contributions, suggestions, or bug reports are welcome! Feel free to open an issue or submit a pull request.**

**Fork the repository**

1.Create a new branch with your feature or fix: git checkout -b my-new-feature

2.Commit and push your changes: git commit -m 'Add some feature'

3.Submit a pull request for review


## Contact

**For questions or collaborations, feel free to reach out via:**

[My Website](eduardvilensky.com)

Email: contact@eduardvilensky.com

Feel free to modify any sections to better suit your branding, technical preferences, or specific use cases.
