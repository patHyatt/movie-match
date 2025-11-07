# Movie-Match TODO List

## Critical Bugs to Fix

### 1. Fix Map Key Bug in analysis.ts:22
- **File**: `src/analysis.ts:22`
- **Issue**: Map key is hardcoded as `'title'` instead of using the variable `title`
- **Current Code**: `map.set('title', count);`
- **Expected**: `map.set(title, count);`
- **Impact**: All movie counts are overwriting a single map entry instead of storing separately
- **Priority**: HIGH - Breaks core functionality

### 2. Complete heapDown() Implementation in heap.ts
- **File**: `src/heap.ts:34-37`
- **Issue**: The `heapDown()` method is incomplete with an empty while loop
- **Current Code**: `while()` with no condition or body
- **Impact**: The heap `pop()` operation will fail, making top movie selection impossible
- **Priority**: HIGH - Breaks core functionality

### 3. Fix Logic Error in heap.pop() Method
- **File**: `src/heap.ts:27-29`
- **Issue**: Incorrect pop logic - removes last element before trying to swap it
- **Current Code**:
  ```typescript
  const top = this.heap.pop();
  this.heap[0] = this.heap[this.heap.length - 1];
  ```
- **Expected**: Should save the root, replace root with last element, then pop
- **Impact**: Heap corruption and incorrect top movie results
- **Priority**: HIGH - Breaks core functionality

---

## Additional Improvements (Optional)

### 4. Add Error Handling
- **File**: `src/analysis.ts:8`
- **Issue**: TODO comment indicates missing error handling for database operations
- **Priority**: MEDIUM

### 5. Remove Type Assertions
- **File**: `src/heap.ts:31`
- **Issue**: TODO comment to remove non-null assertion operator
- **Priority**: LOW - Code quality improvement
