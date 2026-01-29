# The Bold East Africa - Frontend Application

A modern React-based news and intelligence platform built with TypeScript, Tailwind CSS, and Vite.

## 🏗️ Architecture

### Project Structure

```
src/
├── components/
│   ├── common/           # Reusable UI components
│   │   ├── LoadingSpinner.tsx
│   │   └── EmptyState.tsx
│   ├── dashboard/        # Dashboard-specific components
│   │   ├── DashboardView.tsx
│   │   ├── DashboardOverview.tsx
│   │   ├── DashboardArticles.tsx
│   │   ├── DashboardCategories.tsx
│   │   └── DashboardUsers.tsx
│   ├── hooks/            # Custom React hooks
│   │   ├── useDashboardData.ts
│   │   └── usePagination.ts
│   ├── layout/           # Layout components
│   │   └── PageLayout.tsx
│   ├── views/            # Page-level components
│   │   ├── SubscribeView.tsx
│   │   ├── CheckoutView.tsx
│   │   ├── ArticleDetailView.tsx
│   │   └── AuthorProfileView.tsx
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── LoginView.tsx
│   ├── ScrollToTop.tsx
│   └── StickyAdWrapper.tsx
├── services/             # API and external service integrations
│   ├── api.ts
│   └── analytics.ts
├── utils/                # Utility functions and constants
│   └── constants.ts
├── types.ts              # TypeScript type definitions
├── constants.tsx         # Legacy constants (to be migrated)
├── App.tsx               # Main application component
└── index.tsx             # Application entry point
```

### Component Organization Principles

1. **Separation of Concerns**: Components are organized by functionality (views, dashboard, common, layout)
2. **Reusability**: Common components are extracted into `components/common/`
3. **Custom Hooks**: Business logic is abstracted into custom hooks in `components/hooks/`
4. **Layout Components**: Page structure is handled by layout components in `components/layout/`
5. **Single Responsibility**: Each component has a single, well-defined purpose

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## 📋 Features

### Public Features
- **Home Page**: Latest articles and featured content
- **Category Pages**: Articles filtered by category
- **Article Details**: Full article view with related content
- **Author Profiles**: Author information and article listings
- **Subscription**: Premium subscription plans
- **Authentication**: User login and registration

### Dashboard Features (Admin)
- **Overview**: Executive dashboard with KPIs and analytics
- **Articles Management**: CRUD operations for articles
- **Categories Management**: Category organization
- **Users Management**: User administration
- **Analytics**: Performance metrics and insights

## 🛠️ Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: React Hooks
- **API Integration**: Axios (via services layer)
- **Analytics**: Custom analytics service
- **Icons**: Heroicons (via SVG)

## 📁 Key Components

### App.tsx
Main application component handling routing and global layout.

### Dashboard Components
- `DashboardView`: Main dashboard container with tab navigation
- `DashboardOverview`: Executive overview with KPIs and charts
- `DashboardArticles`: Article management interface
- `DashboardCategories`: Category management grid
- `DashboardUsers`: User management table

### View Components
- `HomeView`: Landing page with article listings
- `CategoryView`: Category-specific article listings
- `ArticleDetailView`: Individual article display
- `AuthorProfileView`: Author profile and articles
- `SubscribeView`: Subscription plan selection
- `CheckoutView`: Payment processing

### Common Components
- `LoadingSpinner`: Loading state indicator
- `EmptyState`: Empty data state display
- `Pagination`: Data pagination controls

### Custom Hooks
- `useDashboardData`: Dashboard data fetching and state management
- `usePagination`: Pagination logic and controls

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_ANALYTICS_ID=your-analytics-id
```

### Constants

Application constants are defined in `utils/constants.ts`:
- Pagination settings
- Default data structures
- Dashboard configuration
- Theme colors

## 📊 Data Flow

1. **API Layer** (`services/api.ts`): Handles all backend communication
2. **Custom Hooks** (`components/hooks/`): Manage data fetching and state
3. **Components**: Consume data via hooks and render UI
4. **Analytics** (`services/analytics.ts`): Track user interactions

## 🎨 Styling Guidelines

- **Design System**: Consistent color palette and typography
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Component Styling**: Utility-first CSS with Tailwind classes
- **Dark Mode**: Not implemented (future enhancement)

## 🔒 Security

- Client-side authentication with localStorage
- API requests include authentication headers
- Input validation on forms
- XSS protection via React's built-in sanitization

## 🚀 Deployment

### Build Process

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

### Environment Setup

- **Development**: Local development with hot reload
- **Staging**: Testing environment with production-like settings
- **Production**: Optimized build with minification

## 🤝 Contributing

1. Follow the established component organization principles
2. Use TypeScript for all new components
3. Add JSDoc comments for component documentation
4. Test components across different screen sizes
5. Follow the existing naming conventions

## 📝 License

This project is proprietary software owned by Belfortech.

## 📞 Support

For support or questions, contact the development team at info@belfortech.dev.
