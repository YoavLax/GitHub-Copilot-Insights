# Contributing to GitHub Copilot Insights

Thank you for your interest in contributing to GitHub Copilot Insights! We welcome contributions from the community.

## How to Contribute

### Reporting Issues

- **Search existing issues** before creating a new one to avoid duplicates
- **Use a clear title** that describes the issue
- **Provide detailed information**:
  - Steps to reproduce the issue
  - Expected behavior vs actual behavior
  - Screenshots or error messages if applicable
  - Your environment (browser, OS, Node.js version)

### Suggesting Enhancements

- Open an issue with the label `enhancement`
- Clearly describe the feature and its benefits
- Provide examples or mockups if possible

### Pull Requests

1. **Fork the repository** and create your branch from `main`:
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Make your changes**:
   - Write clean, readable code
   - Follow the existing code style
   - Add comments for complex logic
   - Update documentation if needed

3. **Test your changes**:
   ```bash
   npm install
   npm run dev
   ```
   - Verify the app runs without errors
   - Test with actual GitHub Copilot metrics data
   - Check responsiveness on different screen sizes

4. **Commit your changes**:
   ```bash
   git commit -m "Add amazing feature"
   ```
   - Use clear, descriptive commit messages
   - Reference issue numbers when applicable

5. **Push to your fork**:
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**:
   - Provide a clear description of the changes
   - Link related issues
   - Include screenshots for UI changes
   - Wait for review and address feedback

## Code Style Guidelines

### JavaScript/React
- Use functional components with hooks
- Prefer `const` over `let`, avoid `var`
- Use meaningful variable and function names
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks or utilities

### CSS/Tailwind
- Use Tailwind utility classes consistently
- Follow the existing glassmorphism design patterns
- Maintain the dark theme aesthetic
- Ensure responsive design (mobile, tablet, desktop)

### File Organization
- Place React components in `src/components/`
- Place utility functions in `src/utils/`
- Keep components focused (one component per file)
- Use descriptive file names matching component names

## Development Setup

1. **Prerequisites**:
   - Node.js 18 or higher
   - npm or yarn

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

## Testing

- Test with real GitHub Copilot metrics data (NDJSON format)
- Verify all charts render correctly
- Test search, filter, and sort functionality
- Check browser console for errors
- Test file upload and data persistence

## Areas for Contribution

We especially welcome contributions in these areas:

- **New chart types**: Additional visualizations for metrics
- **Performance optimizations**: Handling large datasets efficiently
- **Accessibility**: Improving keyboard navigation and screen reader support
- **Documentation**: Examples, tutorials, deployment guides
- **Bug fixes**: Resolving reported issues
- **Testing**: Unit tests, integration tests
- **Internationalization**: Multi-language support

## Questions?

Feel free to open an issue for questions or discussions about:
- Implementation details
- Architecture decisions
- Feature proposals
- Contribution process

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help others learn and grow

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for making GitHub Copilot Insights better! 🚀
