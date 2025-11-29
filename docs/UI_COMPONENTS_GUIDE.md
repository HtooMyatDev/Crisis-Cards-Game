# UI Components Usage Guide

## Toast Notifications

### Basic Usage
```tsx
import { useToast } from '@/components/ui/Toast';

function MyComponent() {
    const { showToast } = useToast();

    const handleSuccess = () => {
        showToast('success', 'Game joined successfully!');
    };

    const handleError = () => {
        showToast('error', 'Failed to connect to server', 5000);
    };

    return (
        <button onClick={handleSuccess}>Show Toast</button>
    );
}
```

### Toast Types
- `success` - Green background, checkmark icon
- `error` - Red background, X icon
- `warning` - Yellow background, warning icon
- `info` - Blue background, info icon

## Page Transitions

### Wrap Your Page Content
```tsx
import PageTransition from '@/components/ui/PageTransition';

export default function MyPage() {
    return (
        <PageTransition>
            <div>Your page content here</div>
        </PageTransition>
    );
}
```

### Staggered List Animations
```tsx
import { StaggerContainer, StaggerItem } from '@/components/ui/PageTransition';

function PlayerList({ players }) {
    return (
        <StaggerContainer>
            {players.map(player => (
                <StaggerItem key={player.id}>
                    <div>{player.name}</div>
                </StaggerItem>
            ))}
        </StaggerContainer>
    );
}
```

## Animated Buttons

```tsx
import AnimatedButton from '@/components/ui/AnimatedButton';

function MyForm() {
    return (
        <div>
            <AnimatedButton variant="primary" onClick={handleSubmit}>
                Submit
            </AnimatedButton>

            <AnimatedButton variant="danger" onClick={handleDelete}>
                Delete
            </AnimatedButton>
        </div>
    );
}
```

### Button Variants
- `primary` - Blue background
- `secondary` - Gray background
- `danger` - Red background
- `success` - Green background

## Confetti Effects

```tsx
import ConfettiEffect, { CelebrationBanner } from '@/components/ui/ConfettiEffect';

function GameResults({ winner }) {
    return (
        <>
            <ConfettiEffect trigger={winner !== null} variant="win" />
            <CelebrationBanner
                message={`${winner} WINS!`}
                show={winner !== null}
            />
        </>
    );
}
```

## Loading Spinner

```tsx
import LoadingSpinner from '@/components/ui/LoadingSpinner';

function MyPage() {
    const [loading, setLoading] = useState(true);

    if (loading) {
        return <LoadingSpinner size="lg" message="Loading game..." />;
    }

    return <div>Content</div>;
}
```

### Spinner Sizes
- `sm` - 32px
- `md` - 48px (default)
- `lg` - 64px

## Mobile Responsiveness

### Responsive Padding Pattern
```tsx
// Mobile: p-2, Tablet: p-4, Desktop: p-6
<div className="p-2 sm:p-4 md:p-6">
    Content
</div>
```

### Responsive Grid
```tsx
// 1 column on mobile, 2 on tablet, 3 on desktop
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {items.map(item => <Card key={item.id} {...item} />)}
</div>
```

### Touch-Friendly Buttons
```tsx
// Minimum 44px height for mobile touch targets
<button className="min-h-[44px] px-4 py-3">
    Tap Me
</button>
```
