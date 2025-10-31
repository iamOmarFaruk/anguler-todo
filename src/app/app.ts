import { CommonModule } from '@angular/common';
import { Component, WritableSignal, signal } from '@angular/core';
import { TodoForm } from './components/todo-form/todo-form';
import { TodoList } from './components/todo-list/todo-list';
import { TodoFilters } from './components/todo-filters/todo-filters';
import { Todo } from './models/todo.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, TodoForm, TodoList, TodoFilters],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly editingTodo: WritableSignal<Todo | null> = signal(null);

  protected onEditRequest(todo: Todo): void {
    this.editingTodo.set(todo);
  }

  protected resetEditing(): void {
    this.editingTodo.set(null);
  }
}
