# Angular Todo App - বাংলা টিউটোরিয়াল 🇧🇩

একটি আধুনিক Angular 20+ দিয়ে তৈরি সুন্দর Todo অ্যাপ্লিকেশন। JavaScript/React developers দের জন্য Angular শেখার সহজ গাইড।

## 🚀 দ্রুত শুরু

```bash
# ডিপেন্ডেন্সি ইনস্টল করুন
npm install

# ডেভেলপমেন্ট সার্ভার চালু করুন
npm start

# ব্রাউজারে যান: http://localhost:4200
```

## 📁 প্রজেক্ট স্ট্রাকচার (React/JS Developers এর জন্য)

```
src/
├── app/
│   ├── app.ts              # Main App Component (React এর App.js এর মতো)
│   ├── app.html            # App Component এর Template
│   ├── app.scss            # App এর Styling
│   │
│   ├── models/
│   │   └── todo.model.ts   # TypeScript Interface (Todo এর shape define করে)
│   │
│   ├── core/
│   │   ├── todo-store.ts   # State Management (Redux Store এর মতো)
│   │   ├── sound.service.ts    # Sound effects service
│   │   └── confirm-toast.service.ts # Confirmation dialogs
│   │
│   └── components/
│       ├── todo-form/      # Todo Create/Edit Component
│       ├── todo-list/      # Todo List Display Component
│       └── todo-filters/   # Filter Buttons Component
```

## 🧠 Angular vs React - মূল পার্থক্য

| React Concept | Angular Equivalent | ব্যাখ্যা |
|---------------|-------------------|---------|
| `useState()` | `signal()` | Reactive state management |
| `useEffect()` | Lifecycle hooks | Side effects handling |
| Props | `@Input()` | Parent to child data |
| Callbacks | `@Output()` | Child to parent events |
| Context/Redux | Services + DI | Global state management |
| JSX | Templates (.html) | UI markup |

## 📝 কোড বিশ্লেষণ - প্রতিটি ফাইলের কাজ

### 1. 📋 Todo Model (`models/todo.model.ts`)

```typescript
// TypeScript interface - JavaScript object এর shape define করে
export interface Todo {
  id: string;           // Unique identifier
  title: string;        // Todo এর title
  description?: string; // Optional description
  createdAt: string;    // Creation timestamp
  updatedAt: string;    // Last update timestamp
  completed: boolean;   // Completion status
  dueDate?: string;     // Optional due date
}

// Filter types - React এ enum ব্যবহার করার মতো
export type TodoStatusFilter = 'all' | 'active' | 'completed';
```

**কী করে:** Todo object এর structure define করে। TypeScript এর মাধ্যমে type safety ensure করে।

---

### 2. 🏪 Todo Store (`core/todo-store.ts`)

```typescript
@Injectable({ providedIn: 'root' })
export class TodoStore {
  // React এর useState এর মতো, কিন্তু Observable pattern
  private todosSubject = new BehaviorSubject<Todo[]>([]);
  private filterSubject = new BehaviorSubject<TodoStatusFilter>('all');
  
  // Public observables - components subscribe করতে পারে
  readonly todos$ = this.todosSubject.asObservable();
  readonly filteredTodos$ = combineLatest([this.todos$, this.filter$])
    .pipe(map(([todos, filter]) => {
      // Filter logic - React এর useMemo এর মতো
      return todos.filter(todo => /* filtering logic */);
    }));
}
```

**কী করে:** 
- Redux store এর মতো global state management
- localStorage এ data persist করে
- RxJS Observable pattern ব্যবহার করে reactive programming
- CRUD operations handle করে (Create, Read, Update, Delete)

**মূল Functions:**
- `addTodo()` - নতুন todo create
- `updateTodo()` - existing todo edit
- `toggleTodo()` - complete/incomplete toggle
- `removeTodo()` - todo delete
- `setFilter()` - filter change

---

### 3. 🎯 Main App Component (`app.ts`)

```typescript
@Component({
  selector: 'app-root',        // HTML tag name
  standalone: true,            // Modern Angular - no module needed
  imports: [TodoForm, TodoList, TodoFilters], // Child components
  templateUrl: './app.html',   // Template file
  styleUrl: './app.scss'       // Styling file
})
export class App {
  // React এর useState(null) এর মতো
  protected readonly editingTodo = signal<Todo | null>(null);
  
  // Event handlers - React এর callback functions এর মতো
  protected onEditRequest(todo: Todo): void {
    this.editingTodo.set(todo); // State update
  }
}
```

**Template (`app.html`):**
```html
<div class="container">
  <!-- Todo Form Component -->
  <app-todo-form 
    [todo]="editingTodo()"           <!-- React props এর মতো -->
    (cancelEdit)="resetEditing()"    <!-- React callback এর মতো -->
    (saved)="resetEditing()">
  </app-todo-form>
  
  <!-- Todo List Component -->
  <app-todo-list 
    (edit)="onEditRequest($event)">  <!-- Event binding -->
  </app-todo-list>
  
  <!-- Filters Component -->
  <app-todo-filters></app-todo-filters>
</div>
```

**কী করে:** Main layout manage করে, child components এর মধ্যে communication handle করে।

---

### 4. 📝 Todo Form Component (`components/todo-form/`)

```typescript
export class TodoForm {
  // Dependency Injection - React এর useContext এর মতো
  private readonly todoStore = inject(TodoStore);
  private readonly fb = inject(FormBuilder);
  
  // React Hook Form এর মতো form handling
  readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(120)]],
    description: [''],
    dueDate: ['']
  });
  
  // React props এর মতো
  @Input() set todo(value: Todo | null) { /* setter logic */ }
  
  // React callback props এর মতো
  @Output() cancelEdit = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();
}
```

**Template (`todo-form.html`):**
```html
<form [formGroup]="form" (ngSubmit)="submit()" class="todo-form">
  <!-- React এর controlled input এর মতো -->
  <input 
    formControlName="title" 
    placeholder="Todo title..."
    [class.error]="showError('title')">
  
  <textarea formControlName="description"></textarea>
  <input type="date" formControlName="dueDate">
  
  <div class="form-actions">
    <button type="submit" [disabled]="form.invalid">
      {{ isEditing ? 'Update' : 'Add' }} Todo
    </button>
    <button type="button" (click)="cancel()" *ngIf="isEditing">
      Cancel
    </button>
  </div>
</form>
```

**কী করে:** Todo create/edit form handle করে। React Hook Form এর মতো validation ও form state management।

---

### 5. 📜 Todo List Component (`components/todo-list/`)

```typescript
export class TodoList {
  private readonly todoStore = inject(TodoStore);
  
  // Observable subscription - React এর useEffect + useState combination
  readonly todos$ = this.todoStore.filteredTodos$;
  readonly stats$ = this.todoStore.stats$;
  
  // React এর useCallback এর মতো
  trackById(_: number, todo: Todo): string {
    return todo.id; // Performance optimization
  }
}
```

**Template (`todo-list.html`):**
```html
<div class="todo-list">
  <!-- React এর map() function এর মতো -->
  <div *ngFor="let todo of (todos$ | async); trackBy: trackById" 
       class="todo-item" [class.completed]="todo.completed">
    
    <!-- Checkbox -->
    <input type="checkbox" 
           [checked]="todo.completed" 
           (change)="toggle(todo)">
    
    <!-- Todo content -->
    <div class="todo-content">
      <h3>{{ todo.title }}</h3>
      <p *ngIf="todo.description">{{ todo.description }}</p>
      <small>{{ todo.createdAt | date:'short' }}</small>
    </div>
    
    <!-- Actions -->
    <div class="todo-actions">
      <button (click)="requestEdit(todo)">Edit</button>
      <button (click)="remove(todo)" class="danger">Delete</button>
    </div>
  </div>
</div>
```

**কী করে:** Todo list display করে, individual todo operations handle করে।

---

### 6. 🔍 Todo Filters Component (`components/todo-filters/`)

```typescript
export class TodoFilters {
  private readonly todoStore = inject(TodoStore);
  
  // Static data - React এর constant array এর মতো
  readonly filters = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Completed', value: 'completed' }
  ];
  
  // Observable to Signal conversion
  readonly activeFilter = toSignal(this.todoStore.filter$, { 
    initialValue: 'all' 
  });
}
```

**Template (`todo-filters.html`):**
```html
<div class="filters">
  <button *ngFor="let filter of filters"
          [class.active]="activeFilter() === filter.value"
          (click)="select(filter.value)">
    {{ filter.label }}
  </button>
</div>
```

**কী করে:** Filter buttons provide করে, active filter state manage করে।

---

## 🎨 Styling System

### Global Styles (`styles.scss`)
```scss
// Tailwind CSS imports + custom variables
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

// Custom CSS variables
:root {
  --primary-color: #3b82f6;
  --success-color: #10b981;
  --danger-color: #ef4444;
}
```

### Component Styles
প্রতিটি component এর নিজস্ব `.scss` file আছে। Angular এ styling scoped by default (CSS Modules এর মতো)।

---

## 🔄 Data Flow (React developers এর জন্য)

```
┌─────────────────────────────────────────────────────────┐
│                    TodoStore (Global State)            │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │
│  │   todos$    │    │  filter$    │    │   stats$    │ │
│  └─────────────┘    └─────────────┘    └─────────────┘ │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                     App Component                       │
│              (Container Component)                      │
└─────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   TodoForm      │ │   TodoList      │ │  TodoFilters    │
│ (Create/Edit)   │ │  (Display)      │ │   (Filter)      │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

## 🧪 Key Angular Concepts (React থেকে Migration)

### 1. **Signals vs useState**
```typescript
// React
const [count, setCount] = useState(0);
setCount(count + 1);

// Angular Signals
const count = signal(0);
count.set(count() + 1);
```

### 2. **Observables vs useEffect**
```typescript
// React
useEffect(() => {
  const subscription = dataSource.subscribe(data => setData(data));
  return () => subscription.unsubscribe();
}, []);

// Angular
readonly data$ = this.dataService.getData();
// Template এ: {{ data$ | async }}
```

### 3. **Dependency Injection vs Props/Context**
```typescript
// React Context
const store = useContext(StoreContext);

// Angular DI
private readonly store = inject(StoreService);
```

---

## 🛠️ Development Commands

```bash
# Development server
npm start                    # ng serve

# Build for production
npm run build               # ng build

# Run tests
npm test                    # ng test

# Code generation
ng generate component my-component
ng generate service my-service
```

---

## 📚 Learn More

- [Angular Official Docs](https://angular.dev)
- [RxJS Documentation](https://rxjs.dev)
- [Angular Signals Guide](https://angular.dev/guide/signals)
- [Angular vs React Comparison](https://angular.dev/guide/migration/from-react)

---

## 🤝 Contributing

React/JavaScript developers welcome! Angular এর declarative approach আপনার familiar patterns এর সাথে মিলে যাবে।

### Quick Start for React Developers:
1. Components = React Components
2. Services = Custom Hooks + Context
3. Templates = JSX (কিন্তু separate file)
4. Observables = useState + useEffect combo

---

## 📄 License

MIT License - Feel free to use this project for learning Angular!

---

*এই প্রজেক্টটি Angular 20+ এর modern features showcase করে। React developers রা easily transition করতে পারবেন।*
