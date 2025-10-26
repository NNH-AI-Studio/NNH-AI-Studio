# Keyboard Accessibility - Code Examples

## 📝 **Quick Implementation Examples**

### **Example 1: Adding Skip Link to Layout**

```tsx
import Layout from './components/layout/Layout';
import SkipLink from './components/shared/SkipLink';

function App() {
  return (
    <>
      <SkipLink />
      <Layout>
        <main id="main-content">
          {/* Your page content */}
        </main>
      </Layout>
    </>
  );
}
```

---

### **Example 2: Using AccessibleButton**

```tsx
import AccessibleButton from './components/shared/AccessibleButton';
import { Save, Trash2 } from 'lucide-react';

function MyForm() {
  const handleSave = async () => {
    // Save logic
  };

  return (
    <div>
      <AccessibleButton
        onClick={handleSave}
        variant="primary"
        size="lg"
        icon={<Save />}
        ariaLabel="Save form data"
      >
        Save Changes
      </AccessibleButton>

      <AccessibleButton
        onClick={handleDelete}
        variant="danger"
        size="md"
        icon={<Trash2 />}
        ariaLabel="Delete item permanently"
      >
        Delete
      </AccessibleButton>
    </div>
  );
}
```

---

### **Example 3: Accessible Modal with Focus Trap**

```tsx
import { useState } from 'react';
import AccessibleModal from './components/modals/AccessibleModal';
import AccessibleButton from './components/shared/AccessibleButton';

function EditProfile() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <AccessibleButton
        onClick={() => setIsOpen(true)}
        ariaLabel="Open edit profile dialog"
      >
        Edit Profile
      </AccessibleButton>

      <AccessibleModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Edit Your Profile"
      >
        <form>
          <label htmlFor="name" className="block text-white mb-2">
            Name
          </label>
          <input
            id="name"
            type="text"
            className="w-full px-4 py-2 bg-black border border-neon-orange rounded-lg text-white focus-ring"
            autoFocus
          />

          <div className="flex gap-3 mt-6">
            <AccessibleButton
              type="submit"
              variant="primary"
              fullWidth
            >
              Save Changes
            </AccessibleButton>
            <AccessibleButton
              type="button"
              variant="outline"
              fullWidth
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </AccessibleButton>
          </div>
        </form>
      </AccessibleModal>
    </>
  );
}
```

---

### **Example 4: Dropdown with Keyboard Navigation**

```tsx
import { useState } from 'react';
import AccessibleDropdown from './components/shared/AccessibleDropdown';
import { Building2, MapPin, Globe } from 'lucide-react';

function LocationSelector() {
  const [selectedLocation, setSelectedLocation] = useState('');

  const locations = [
    { value: 'nyc', label: 'New York', icon: <Building2 className="w-4 h-4" /> },
    { value: 'la', label: 'Los Angeles', icon: <MapPin className="w-4 h-4" /> },
    { value: 'london', label: 'London', icon: <Globe className="w-4 h-4" /> },
  ];

  return (
    <AccessibleDropdown
      options={locations}
      value={selectedLocation}
      onChange={setSelectedLocation}
      label="Select Location"
      placeholder="Choose a location"
    />
  );
}
```

---

### **Example 5: Keyboard Navigation in List**

```tsx
import { useState } from 'react';
import { useKeyboardNav } from './hooks/useKeyboardNav';

function ItemList({ items }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useKeyboardNav({
    onArrowDown: () => {
      setSelectedIndex((prev) => Math.min(prev + 1, items.length - 1));
    },
    onArrowUp: () => {
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    },
    onEnter: () => {
      console.log('Selected:', items[selectedIndex]);
    },
  });

  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li
          key={item.id}
          tabIndex={0}
          className={`
            p-4 rounded-lg border transition-colors
            ${index === selectedIndex
              ? 'border-neon-orange bg-nnh-orange/10'
              : 'border-gray-700 bg-gray-800'
            }
            focus-ring
          `}
          onClick={() => setSelectedIndex(index)}
        >
          {item.name}
        </li>
      ))}
    </ul>
  );
}
```

---

### **Example 6: Custom Focus Trap**

```tsx
import { useRef } from 'react';
import { useFocusTrap } from './hooks/useFocusTrap';

function CustomDialog({ isOpen, onClose }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useFocusTrap(isOpen, dialogRef, {
    initialFocus: firstInputRef,
    onEscape: onClose,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div
        ref={dialogRef}
        className="bg-gray-900 border border-neon-orange rounded-lg p-6 max-w-md w-full"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <h2 id="dialog-title" className="text-xl font-bold text-white mb-4">
          Custom Dialog
        </h2>

        <input
          ref={firstInputRef}
          type="text"
          placeholder="First input (auto-focused)"
          className="w-full px-4 py-2 bg-black border border-neon-orange rounded-lg text-white focus-ring mb-4"
        />

        <input
          type="text"
          placeholder="Second input"
          className="w-full px-4 py-2 bg-black border border-neon-orange rounded-lg text-white focus-ring mb-4"
        />

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-nnh-orange/10 text-white rounded-lg focus-ring"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-neon-orange text-black rounded-lg focus-ring"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

### **Example 7: Accessible Form with Labels**

```tsx
function AccessibleForm() {
  return (
    <form className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-white mb-2 font-medium">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          required
          aria-required="true"
          aria-describedby="email-help"
          className="w-full px-4 py-3 bg-black border border-neon-orange rounded-lg text-white focus-ring"
        />
        <p id="email-help" className="text-sm text-gray-400 mt-1">
          We'll never share your email with anyone else.
        </p>
      </div>

      <div>
        <label htmlFor="password" className="block text-white mb-2 font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          aria-required="true"
          aria-describedby="password-requirements"
          className="w-full px-4 py-3 bg-black border border-neon-orange rounded-lg text-white focus-ring"
        />
        <p id="password-requirements" className="text-sm text-gray-400 mt-1">
          Must be at least 8 characters with uppercase, lowercase, and numbers.
        </p>
      </div>

      <AccessibleButton
        type="submit"
        variant="primary"
        fullWidth
        ariaLabel="Submit form"
      >
        Submit
      </AccessibleButton>
    </form>
  );
}
```

---

### **Example 8: Icon Button with Accessible Label**

```tsx
import { X, Edit, Trash2, Settings } from 'lucide-react';

function IconButtons() {
  return (
    <div className="flex gap-2">
      <button
        onClick={handleClose}
        aria-label="Close dialog"
        className="p-2 rounded-lg bg-nnh-orange/10 text-white hover:bg-nnh-orange/20 focus-ring"
      >
        <X className="w-5 h-5" />
      </button>

      <button
        onClick={handleEdit}
        aria-label="Edit item"
        className="p-2 rounded-lg bg-nnh-orange/10 text-white hover:bg-nnh-orange/20 focus-ring"
      >
        <Edit className="w-5 h-5" />
      </button>

      <button
        onClick={handleDelete}
        aria-label="Delete item permanently"
        className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 focus-ring"
      >
        <Trash2 className="w-5 h-5" />
      </button>

      <button
        onClick={handleSettings}
        aria-label="Open settings"
        className="p-2 rounded-lg bg-nnh-orange/10 text-white hover:bg-nnh-orange/20 focus-ring"
      >
        <Settings className="w-5 h-5" />
      </button>
    </div>
  );
}
```

---

### **Example 9: Tab Navigation Panel**

```tsx
import { useState } from 'react';

function TabPanel() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = ['Overview', 'Reviews', 'Posts', 'Analytics'];

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      setActiveTab((prev) => (prev + 1) % tabs.length);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setActiveTab((prev) => (prev - 1 + tabs.length) % tabs.length);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActiveTab(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActiveTab(tabs.length - 1);
    }
  };

  return (
    <div>
      <div role="tablist" className="flex gap-2 border-b border-gray-700">
        {tabs.map((tab, index) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === index}
            aria-controls={`panel-${index}`}
            id={`tab-${index}`}
            tabIndex={activeTab === index ? 0 : -1}
            onClick={() => setActiveTab(index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`
              px-6 py-3 font-medium transition-colors focus-ring
              ${activeTab === index
                ? 'text-neon-orange border-b-2 border-neon-orange'
                : 'text-gray-400 hover:text-white'
              }
            `}
          >
            {tab}
          </button>
        ))}
      </div>

      {tabs.map((tab, index) => (
        <div
          key={tab}
          role="tabpanel"
          id={`panel-${index}`}
          aria-labelledby={`tab-${index}`}
          hidden={activeTab !== index}
          className="p-6"
        >
          <h2 className="text-xl font-bold text-white mb-4">{tab} Content</h2>
          <p className="text-gray-300">Content for {tab} tab.</p>
        </div>
      ))}
    </div>
  );
}
```

---

### **Example 10: Toast with Keyboard Dismiss**

```tsx
import { useEffect } from 'react';
import { X } from 'lucide-react';

function AccessibleToast({ message, onClose }) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed bottom-4 right-4 bg-gray-900 border border-neon-orange rounded-lg p-4 shadow-lg z-50"
    >
      <div className="flex items-start gap-3">
        <p className="text-white flex-1">{message}</p>
        <button
          onClick={onClose}
          aria-label="Close notification"
          className="p-1 rounded hover:bg-nnh-orange/20 focus-ring"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}
```

---

## 🎯 **Common Patterns Summary**

### Always Include:
1. ✅ `aria-label` for icon-only buttons
2. ✅ `focus-ring` class for visible focus
3. ✅ Semantic HTML (`button`, `a`, `form`)
4. ✅ Keyboard event handlers (Enter, Escape, Arrows)
5. ✅ `tabIndex={0}` for custom interactive elements
6. ✅ `role` and ARIA attributes for custom widgets

### Never Do:
1. ❌ Remove focus outlines without replacement
2. ❌ Use `div` as clickable element without keyboard support
3. ❌ Trap focus without providing escape (except modals)
4. ❌ Forget labels on form inputs
5. ❌ Use positive `tabIndex` values (messes with natural order)

---

## 📚 **Additional Resources**

- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM: Keyboard Accessibility](https://webaim.org/techniques/keyboard/)
- [MDN: Keyboard-navigable JavaScript widgets](https://developer.mozilla.org/en-US/docs/Web/Accessibility/Keyboard-navigable_JavaScript_widgets)
