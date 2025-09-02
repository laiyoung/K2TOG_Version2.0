@echo off
echo Committing authentication error handling improvements...

echo.
echo Adding all changes to git...
git add .

echo.
echo Committing changes...
git commit -m "Fix authentication error handling and prevent page refresh

- Fixed AuthContext login/register functions to return result objects instead of throwing errors
- Updated Login and Signup components to handle new return format
- Added comprehensive form submission prevention (preventDefault, stopPropagation, noValidate)
- Removed required attributes and browser validation to prevent form submission issues
- Fixed API URL issues in AuthContext profile fetching
- Added extensive debugging and error state monitoring
- Improved error message display and persistence
- Fixed page refresh issues on login/signup form submission

Key improvements:
- No more page refresh when submitting forms with errors
- Better error message handling and display
- Consistent error state management
- Enhanced debugging capabilities
- Improved user experience with proper error feedback"

echo.
echo Changes committed successfully!
echo.
pause
