# Zustand Store

A small, fast and scalable bearbones state-management solution using simplified flux principles. Has a comfy API based on hooks, isn't boilerplatey or opinionated.

Don't disregard it because it's cute. It has quite the claws, lots of time was spent dealing with common pitfalls, like the dreaded [zombie child problem](https://react-redux.js.org/api/hooks#stale-props-and-zombie-children), [react concurrency](https://github.com/bvaughn/rfcs/blob/useMutableSource/text/0000-use-mutable-source.md), and [context loss](https://github.com/facebook/react/issues/13332) between mixed renderers. It may be the one state-manager in the React space that gets all of these right.

You can try a live demo [here](https://githubbox.com/pmndrs/zustand/tree/main/examples/demo).

```bash
npm install zustand # or yarn add zustand
```

# How to use it?

## First create a store

Your store is a hook! You can put anything in it: primitives, objects, functions. State has to be updated immutably and the `set` function [merges state](./docs/guides/immutable-state-and-merging.md) to help it.

```tsx
import { createStore, StateCreator, QueryStore } from '@care/web-ui/store';

const $BEAR_STORE = '$BEAR_STORE';

interface BearState {
  bears: number;
}

interface BearActions {
  increasePopulation: () => void;
  removeAllBears: () => void;
}

type BearStore = BearState & BearActions;

const initialState: BearState = {
  bears: 0,
};

const stateCreator: StateCreator<BearStore> = (set, get, storeApi) => {
  const state = get();
  return {
    ...initialState,
    increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
    removeAllBears: () => set({ bears: 0 }),
  };
};

const [useStore, selector] = createStore<BearStore>(stateCreator, { storeName: $BEAR_STORE });

const useBearStore = () => {
  const store = useStore(selector);
  return store;
};
```

## Then bind your components, and that's it!

Use the hook anywhere, no providers are needed. Select your state and the component will re-render on changes.

```jsx
const BearCounter = () => {
  const { bears } = useBearStore();
  return <h1>{bears} around here ...</h1>;
};
const Controls = () => {
  const { increasePopulation, removeAllBears } = useBearStore();
  return (
    <>
      <button onClick={increasePopulation}>one up</button>
      <button onClick={removeAllBears}>Kill alls</button>
    </>
  );
};
```

## [Full demo](../stories/Store/CreateStore.stories.tsx)

### Why zustand over redux?

- Simple and un-opinionated
- Makes hooks the primary means of consuming state
- Doesn't wrap your app in context providers
- [Can inform components transiently (without causing render)](#transient-updates-for-often-occurring-state-changes)

### Why zustand over context?

- Less boilerplate
- Renders components only on changes
- Centralized, action-based state management

---
