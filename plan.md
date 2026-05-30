# Plan: Automatic Data Saving & User Management

The goal is to ensure all user data is automatically saved to Supabase, display the exact number of registered users on all dashboards, and provide the admin with a view of all registered users.

## 1. Persistence & User Count
- **Update `useGameState.ts`**:
    - Remove the artificial artificial `+ 15400` baseline from the user count to show the "exact" number as requested.
    - Keep the auto-save logic that upserts profile data to Supabase.

## 2. Admin Panel Enhancements
- **Update `AdminPanel.tsx`**:
    - Add a "Users List" tab.
    - Fetch all profiles from Supabase and display them in a list.
    - Display key metrics like balance and level for each user.

## 3. Dashboard Display
- **Check `Dashboard.tsx`**:
    - Ensure it uses the real `totalUsers` count from state.

## 4. Verification
- Validate the build.
