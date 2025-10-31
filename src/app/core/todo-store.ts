import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';
import { Todo, TodoStatusFilter } from '../models/todo.model';
import { SoundService } from './sound.service';

type TodoPayload = Pick<Todo, 'title' | 'description' | 'dueDate'>;

interface TodoStats {
  total: number;
  active: number;
  completed: number;
}

@Injectable({
  providedIn: 'root',
})
export class TodoStore {
  private readonly storageKey = 'todo-app.todos.v1';
  private readonly canUseStorage = typeof window !== 'undefined' && !!window.localStorage;

  private readonly todosSubject = new BehaviorSubject<Todo[]>(this.loadTodos());
  private readonly filterSubject = new BehaviorSubject<TodoStatusFilter>('all');

  readonly todos$ = this.todosSubject.asObservable();
  readonly filter$ = this.filterSubject.asObservable();

  readonly filteredTodos$ = combineLatest([this.todos$, this.filter$]).pipe(
    map(([todos, filter]) => {
      let filteredTodos = todos;
      
      if (filter === 'active') {
        filteredTodos = todos.filter((todo) => !todo.completed);
      } else if (filter === 'completed') {
        filteredTodos = todos.filter((todo) => todo.completed);
      }

      // Sort by creation date descending (newest first)
      return filteredTodos.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    })
  );

  readonly stats$: Observable<TodoStats> = this.todos$.pipe(
    map((todos) => {
      const completed = todos.filter((todo) => todo.completed).length;
      const active = todos.length - completed;
      return { total: todos.length, completed, active } satisfies TodoStats;
    })
  );

  constructor(
    private readonly toast: ToastrService,
    private readonly soundService: SoundService
  ) {}

  addTodo(payload: TodoPayload): void {
    const now = new Date().toISOString();
    const trimmedDescription = payload.description?.trim();
    const todo: Todo = {
      id: this.createId(),
      title: payload.title.trim(),
      description: trimmedDescription || undefined,
      dueDate: payload.dueDate || undefined,
      completed: false,
      createdAt: now,
      updatedAt: now, // Intentionally the same as createdAt for new todos
    };

    if (!todo.title) {
      this.toast.error('Please provide a title for the task.');
      return;
    }

    this.commit([...this.todosSubject.value, todo]);
    this.toast.success('Task added to your list.');
    this.soundService.playAddItemSound();
  }

  updateTodo(id: string, payload: Partial<TodoPayload>): void {
    const changes = this.prepareChanges(payload);
    if (!changes) {
      return;
    }

    let updated = false;
    const next = this.todosSubject.value.map((todo) => {
      if (todo.id !== id) {
        return todo;
      }

      updated = true;
      return {
        ...todo,
        ...changes,
        updatedAt: new Date().toISOString(),
      } satisfies Todo;
    });

    if (!updated) {
      this.toast.error('Task could not be found.');
      return;
    }

    this.commit(next);
    this.toast.info('Task updated.');
  }

  toggleTodo(id: string): void {
    let toggled = false;
    let nowCompleted = false;

    const next = this.todosSubject.value.map((todo) => {
      if (todo.id !== id) {
        return todo;
      }

      toggled = true;
      nowCompleted = !todo.completed;
      return {
        ...todo,
        completed: nowCompleted,
        updatedAt: new Date().toISOString(),
      } satisfies Todo;
    });

    if (!toggled) {
      this.toast.error('Task could not be found.');
      return;
    }

    this.commit(next);
    this.toast.success(nowCompleted ? 'Task completed. Nice work!' : 'Task reopened. Keep going!');
    
    if (nowCompleted) {
      this.soundService.playCompleteSound();
    }
  }

  removeTodo(id: string): void {
    const remaining = this.todosSubject.value.filter((todo) => todo.id !== id);

    if (remaining.length === this.todosSubject.value.length) {
      this.toast.error('Task could not be found.');
      return;
    }

    this.commit(remaining);
    this.toast.warning('Task removed.');
    // Play a subtle completion sound for the deletion
    this.soundService.playDeleteSound();
  }

  clearCompleted(): void {
    const remaining = this.todosSubject.value.filter((todo) => !todo.completed);
    if (remaining.length === this.todosSubject.value.length) {
      this.toast.info('No completed tasks to clear.');
      return;
    }
    this.commit(remaining);
    this.toast.info('Completed tasks cleared.');
  }

  setFilter(filter: TodoStatusFilter): void {
    this.filterSubject.next(filter);
  }

  selectTodo(id: string): Observable<Todo | undefined> {
    return this.todos$.pipe(map((todos) => todos.find((todo) => todo.id === id)));
  }

  private commit(next: Todo[]): void {
    this.todosSubject.next(next);
    if (this.canUseStorage) {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(next));
      } catch (error) {
        console.error('Unable to persist todos to localStorage', error);
      }
    }
  }

  private loadTodos(): Todo[] {
    if (!this.canUseStorage) {
      return [];
    }

    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw) as Todo[];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn('Failed to parse todos from storage', error);
      return [];
    }
  }

  private createId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    return Math.random().toString(36).slice(2, 11);
  }

  private prepareChanges(payload: Partial<TodoPayload>): Partial<Todo> | null {
    const changes: Partial<Todo> = {};

    if (payload.title !== undefined) {
      const title = payload.title.trim();
      if (!title) {
        this.toast.error('Task title cannot be empty.');
        return null;
      }
      changes.title = title;
    }

    if (payload.description !== undefined) {
      changes.description = payload.description.trim() || undefined;
    }

    if (payload.dueDate !== undefined) {
      changes.dueDate = payload.dueDate || undefined;
    }

    return Object.keys(changes).length > 0 ? changes : null;
  }
}
