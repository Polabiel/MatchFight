## Summary of Changes Applied

### File: `/mnt/arquivos/Trabalho/MatchFight/apps/nextjs/src/app/fights/[id]/chat/_components/chat-view.tsx`

1. **Container & Header**:
   - Changed main container to use `p-6` (24px spacing, multiple of 8)
   - Updated header Link to use `text-body-md text-muted-foreground hover:text-foreground` (replaced `text-sm`)
   - Changed Fight Chat heading from `text-2xl font-bold` to `text-headline-md`
   - Kept spacer `w-20` (80px, multiple of 8)

2. **Messages Container**:
   - Replaced `bg-card` with `bg-background`
   - Changed `rounded-2xl` to `rounded-none`
   - Updated gap from `gap-3` (12px) to `gap-4` (16px, multiple of 8)
   - Used `border border-border` for 1px border in Deep Charcoal
   - Kept `p-4` (16px) padding

3. **Empty State**:
   - Changed emoji size from `text-4xl` to `text-headline-lg`
   - Changed "No messages yet" from `text-foreground font-semibold` to `text-headline-md text-foreground`
   - Changed description from `text-sm` to `text-body-md text-muted-foreground`
   - Kept gap `gap-2` (8px) and centered layout

4. **Message Bubbles**:
   - **Your messages (right)**: `bg-foreground text-background border border-foreground` (Charcoal background, white text, 1px Charcoal border)
   - **Opponent messages (left)**: `bg-background border-2 border-foreground text-foreground` (White background, 2px Charcoal border, Charcoal text)
   - Removed all `rounded-2xl` and replaced with `rounded-none`
   - Removed `shadow-sm` (no shadows allowed)
   - Updated text size from `text-sm` to `text-body-md` (16px)
   - Kept `px-4 py-2` (16px horizontal, 8px vertical padding)

5. **Timestamps**:
   - Changed from `text-muted-foreground mt-1 px-1 text-xs` to `text-label-sm text-muted-foreground mt-2 px-2`
   - Used `text-label-sm` (12px, 600 weight, uppercase, +0.05em letter-spacing)
   - Updated margins to `mt-2` (8px) and padding to `px-2` (8px)

6. **Input Field**:
   - Applied Combat Minimalism input specification:
     - `border border-foreground` (1px Charcoal border)
     - `bg-transparent` (transparent background)
     - `placeholder:text-muted-foreground` (muted placeholder text)
     - `focus:bg-muted focus:border-foreground` (tonal layer on focus)
     - `h-12` (48px height)
     - `px-4` (16px horizontal padding)
     - `text-body-md` (16px text size)
     - `rounded-none` (0px border-radius)

7. **Send Button**:
   - Applied Combat Minimalism primary action (Blood Red CTA):
     - `bg-primary text-primary-foreground` (Blood Red background, white text)
     - `border-2 border-primary` (2px Blood Red border)
     - `hover:bg-foreground hover:border-foreground` (invert on hover)
     - `h-12` (48px height)
     - `px-6` (24px horizontal padding)
     - `text-label-bold` (14px, 700 weight, uppercase, +0.05em letter-spacing)
     - `rounded-none` (0px border-radius)
   - Button text ("Sending..." / "Send") will be uppercased via CSS

### File: `/mnt/arquivos/Trabalho/MatchFight/apps/nextjs/src/app/fights/[id]/chat/page.tsx`
- No changes required (contains only routing and data fetching logic)

All changes adhere to Combat Minimalism principles:
- Zero border-radius everywhere (`rounded-none`)
- Zero shadows (depth via borders and tonal layers)
- Blood Red (`#DC2626`) used only in the critical CTA (Send button)
- Type scale strictly followed (Nunito Sans via semantic classes)
- All spacing multiples of 8px
- Dark mode compatible (uses semantic tokens that invert correctly)
- No arbitrary values or hardcoded colors/sizes