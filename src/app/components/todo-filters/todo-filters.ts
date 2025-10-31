import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, WritableSignal, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TodoStatusFilter } from '../../models/todo.model';
import { TodoStore } from '../../core/todo-store';

@Component({
  selector: 'app-todo-filters',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './todo-filters.html',
  styleUrl: './todo-filters.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoFilters {
  private readonly todoStore = inject(TodoStore);

  readonly filters: { label: string; value: TodoStatusFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Completed', value: 'completed' },
  ];

  readonly activeFilter = toSignal(this.todoStore.filter$, { initialValue: 'all' });

  select(filter: TodoStatusFilter): void {
    this.todoStore.setFilter(filter);
  }

}
