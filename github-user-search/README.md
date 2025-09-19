# GitHub User Search Application

A responsive web application that allows users to search for GitHub users and view their profiles. Built with React, Vite, and Tailwind CSS.

## Features

- Search for GitHub users by username
- View user profiles with essential information
- Responsive design that works on all devices
- Loading states and error handling
- Clean and modern UI with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/github-user-search.git
   cd github-user-search
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) to view it in your browser.

## Usage

1. Enter a GitHub username in the search bar
2. Press Enter or click the Search button
3. View the search results with user cards
4. Click on "View Profile" to visit the user's GitHub profile

## Technologies Used

- [React](https://reactjs.org/) - JavaScript library for building user interfaces
- [Vite](https://vitejs.dev/) - Next Generation Frontend Tooling
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- [GitHub API](https://docs.github.com/en/rest) - For fetching user data
- [Axios](https://axios-http.com/) - Promise based HTTP client

## Project Structure

```
src/
├── assets/           # Static assets like images
├── components/       # Reusable React components
│   ├── SearchBar.jsx # Search input component
│   └── UserCard.jsx  # User profile card component
├── services/         # API services
│   └── githubApi.js  # GitHub API service
├── App.jsx           # Main application component
└── main.jsx          # Application entry point
```

## License

This project is open source and available under the [MIT License](LICENSE).
