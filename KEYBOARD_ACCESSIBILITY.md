# Keyboard Accessibility Guide

This document outlines the keyboard navigation features and accessibility improvements implemented in the NNH Local application.

## 🎯 **Key Features**

### 1. **Focus Management**
- All interactive elements are keyboard accessible
- Clear visual focus indicators using orange outline
- Focus trap in modals to prevent focus escape
- Auto-focus on first interactive element when modals open

### 2. **Keyboard Shortcuts**

#### Global Navigation
- `Tab` - Move forward through interactive elements
- `Shift + Tab` - Move backward through interactive elements
- `Enter` - Activate buttons and links
- `Space` - Activate buttons
- `Escape` - Close modals, dropdowns, and dialogs

#### Modal Dialogs
- `Escape` - Close modal
- `Tab` - Cycle through modal elements (trapped focus)
- Focus returns to trigger element on close

#### Dropdown Menus
- `Enter` or `Space` - Open/close dropdown
- `Arrow Down` - Move to next option
- `Arrow Up` - Move to previous option
- `Home` - Jump to first option
- `End` - Jump to last option
- `Escape` - Close dropdown
- `Tab` - Close dropdown and move to next element

### 3. **Skip Links**
- Press `Tab` on page load to reveal "Skip to main content" link
- Allows keyboard users to bypass navigation and jump directly to main content

---

## 🛠️ **Components**

### **1. useFocusTrap Hook**

Traps focus within a container (e.g., modals).

```typescript
import { useFocusTrap } from '../hooks/useFocusTrap';

function MyModal({ isOpen, onClose }) {
  const modalRef = useRef<HTMLDivElement>(null);

  useFocusTrap(isOpen, modalRef, {
    onEscape: onClose,
  });

  return (
    <div ref={modalRef}>
      {/* Modal content */}
    </div>
  );
}
```

### **2. useKeyboardNav Hook**

Handles keyboard events for custom interactions.

```typescript
import { useKeyboardNav } from '../hooks/useKeyboardNav';

function MyComponent() {
  useKeyboardNav({
    onEnter: () => console.log('Enter pressed'),
    onEscape: () => console.log('Escape pressed'),
    onArrowDown: () => console.log('Arrow down pressed'),
    enabled: true,
  });

  return <div>Content</div>;
}
```

### **3. AccessibleButton Component**

Button with built-in keyboard support and ARIA attributes.

```typescript
import AccessibleButton from '../components/shared/AccessibleButton';

<AccessibleButton
  onClick={handleClick}
  variant="primary"
  size="md"
  ariaLabel="Save changes"
  ariaDescribedBy="save-help-text"
>
  Save
</AccessibleButton>
```

**Props:**
- `ariaLabel` - Accessible label for screen readers
- `ariaDescribedBy` - ID of element describing the button
- `disabled` - Disables button and prevents interaction
- All standard button props

### **4. AccessibleModal Component**

Modal with focus trap and keyboard support.

```typescript
import AccessibleModal from '../components/modals/AccessibleModal';

<AccessibleModal
  isOpen={isOpen}
  onClose={handleClose}
  title="Edit Profile"
>
  {/* Modal content */}
</AccessibleModal>
```

**Features:**
- Auto-focus on close button
- Focus trap prevents tabbing outside
- `Escape` key closes modal
- Body scroll lock when open
- ARIA attributes for screen readers

### **5. AccessibleDropdown Component**

Dropdown with full keyboard navigation.

```typescript
import AccessibleDropdown from '../components/shared/AccessibleDropdown';

<AccessibleDropdown
  options={[
    { value: '1', label: 'Option 1', icon: <Icon /> },
    { value: '2', label: 'Option 2' },
  ]}
  value={selectedValue}
  onChange={setSelectedValue}
  label="Select an option"
/>
```

**Keyboard Support:**
- `Enter/Space` - Open/close and select
- `Arrow Up/Down` - Navigate options
- `Home/End` - Jump to first/last option
- `Escape` - Close dropdown

### **6. SkipLink Component**

Skip to main content link for keyboard users.

```typescript
import SkipLink from '../components/shared/SkipLink';

function App() {
  return (
    <>
      <SkipLink />
      <Header />
      <main id="main-content">
        {/* Content */}
      </main>
    </>
  );
}
```

---

## 🎨 **CSS Classes**

### Focus Styles

```css
/* Apply default focus ring */
.focus-ring {
  @apply focus:outline-none focus:ring-2 focus:ring-neon-orange focus:ring-offset-2 focus:ring-offset-black;
}

/* Inset focus ring (for inputs) */
.focus-ring-inset {
  @apply focus:outline-none focus:ring-2 focus:ring-inset focus:ring-neon-orange;
}
```

### Screen Reader Only

```css
/* Hide visually but keep accessible */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Show on focus */
.focus:not-sr-only:focus {
  position: static;
  width: auto;
  height: auto;
  /* ... */
}
```

---

## ✅ **Best Practices**

### 1. **Always Provide Focus Indicators**
```tsx
<button className="focus-ring">Click me</button>
```

### 2. **Use Semantic HTML**
```tsx
<button type="button">Button</button>
<a href="/page">Link</a>
```

### 3. **Add ARIA Labels**
```tsx
<button aria-label="Close dialog">
  <X />
</button>
```

### 4. **Manage Focus in Modals**
```tsx
useFocusTrap(isOpen, modalRef, { onEscape: onClose });
```

### 5. **Test with Keyboard Only**
- Navigate entire app using only `Tab`, `Enter`, `Space`, `Escape`
- Ensure all functionality is accessible
- Check focus indicators are visible

---

## 🧪 **Testing Checklist**

- [ ] All interactive elements reachable via `Tab`
- [ ] Focus order follows logical flow
- [ ] Focus indicators clearly visible
- [ ] Modals trap focus correctly
- [ ] `Escape` closes modals/dialogs
- [ ] Dropdowns navigable with arrow keys
- [ ] Skip link appears on first `Tab`
- [ ] No keyboard traps (except modals)
- [ ] Form inputs have labels
- [ ] Buttons have accessible names

---

## 📚 **Resources**

- [WCAG 2.1 Keyboard Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/keyboard)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Keyboard Accessibility](https://webaim.org/techniques/keyboard/)

---

## 🔄 **Migration Guide**

### Updating Existing Components

#### Before:
```tsx
<button
  onClick={handleClick}
  className="bg-orange-500 text-white px-4 py-2"
>
  Click me
</button>
```

#### After:
```tsx
<AccessibleButton
  onClick={handleClick}
  variant="primary"
  ariaLabel="Perform action"
>
  Click me
</AccessibleButton>
```

#### Before (Modal):
```tsx
<Modal isOpen={isOpen} onClose={onClose} title="Edit">
  {/* content */}
</Modal>
```

#### After (Modal):
```tsx
<AccessibleModal isOpen={isOpen} onClose={onClose} title="Edit">
  {/* content */}
</AccessibleModal>
```

---

## 🎓 **Training Tips**

### For Developers
1. Test all new features with keyboard only
2. Use browser DevTools to inspect focus order
3. Add ARIA labels to icon-only buttons
4. Never remove focus outlines without replacement

### For QA
1. Test keyboard navigation on every page
2. Verify skip link functionality
3. Check modal focus management
4. Ensure dropdowns work with keyboard
5. Test with screen readers (NVDA, JAWS, VoiceOver)

---

## 📞 **Support**

For questions or issues with keyboard accessibility:
- Open an issue on GitHub
- Contact the accessibility team
- Refer to WCAG 2.1 AA standards
