# History Page Pagination Implementation

## Summary
Successfully implemented pagination for the history page with dynamic `start_from` parameter and page controls based on `history_size` from the API.

## Changes Made

### 1. Type Updates (`src/types/index.ts`)
- Added `history_size?: number` field to `HistoryResponse` interface
- This field tracks the total number of history items returned by the API

### 2. Hook Updates (`src/hooks/useHistory.ts`)
- Added pagination state:
  - `currentPage`: Current page index (0-based)
  - `historySize`: Total number of history items from API
  - `ITEMS_PER_PAGE`: Constant set to 10
- Modified `fetchRideHistory` call:
  - `start_from` is now dynamic: `currentPage * 10` (e.g., 0, 10, 20, 30...)
  - Updates `historySize` from API response
- Added `totalPages` calculation: `Math.ceil(historySize / ITEMS_PER_PAGE)`
- Added `handlePageChange` function to update page and scroll to top
- Updated `useEffect` dependency to refetch when `currentPage` changes

### 3. New Component (`src/components/history/Pagination.tsx`)
- Created a reusable pagination component with:
  - Previous/Next navigation buttons
  - Dynamic page number buttons
  - Ellipsis (...) for large page counts
  - Active page highlighting with primary color
  - Disabled state for first/last pages
  - Responsive design with hover effects

### 4. Page Content Updates (`src/components/history/HistoryPageContent.tsx`)
- Added `Pagination` component import
- Destructured pagination props from `useHistory` hook:
  - `currentPage`
  - `totalPages`
  - `handlePageChange`
- Rendered `Pagination` component at the end of the history content

## How It Works

1. **Initial Load**: Fetches first 10 items (`start_from: 0`)
2. **API Response**: Returns `history_size` (total count) along with data
3. **Page Calculation**: Calculates total pages: `totalPages = ceil(history_size / 10)`
4. **Page Navigation**: 
   - User clicks page button
   - `handlePageChange` updates `currentPage`
   - Hook refetches with new `start_from` value (page * 10)
   - Page scrolls to top smoothly
5. **Button States**: 
   - Previous disabled on page 0
   - Next disabled on last page
   - Page numbers enabled/disabled based on `totalPages`

## Example Scenarios

- **history_size = 25**: Shows 3 pages (0-9, 10-19, 20-24)
- **history_size = 100**: Shows 10 pages with ellipsis for middle pages
- **history_size = 5**: No pagination shown (only 1 page)

## UI Features

- Clean, modern design matching the app's aesthetic
- Smooth page transitions with scroll-to-top
- Clear visual feedback for active page
- Accessible with proper ARIA labels
- Responsive layout for mobile devices
