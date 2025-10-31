import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, WritableSignal, inject, signal } from '@angular/core';
import { ReactiveFormsModule, Validators, FormBuilder } from '@angular/forms';
import { Todo } from '../../models/todo.model';
import { TodoStore } from '../../core/todo-store';

@Component({
  selector: 'app-todo-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './todo-form.html',
  styleUrl: './todo-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoForm {
  private readonly editingTodo: WritableSignal<Todo | null> = signal(null);
  private readonly fb = inject(FormBuilder);
  private readonly todoStore = inject(TodoStore);

  readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(120)]],
    description: [''],
    dueDate: [''],
  });

  @Input()
  set todo(value: Todo | null) {
    this.editingTodo.set(value);
    if (value) {
      this.form.reset({
        title: value.title,
        description: value.description ?? '',
        dueDate: value.dueDate ?? '',
      });
    } else {
      this.form.reset({ title: '', description: '', dueDate: '' });
    }
  }

  @Output() cancelEdit = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  get isEditing(): boolean {
    return !!this.editingTodo();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { title, description, dueDate } = this.form.value;
    const trimmedTitle = title?.trim();

    if (!trimmedTitle) {
      return;
    }

    if (this.isEditing && this.editingTodo()) {
      this.todoStore.updateTodo(this.editingTodo()!.id, {
        title: trimmedTitle,
        description: description?.trim(),
        dueDate: dueDate || undefined,
      });
      this.saved.emit();
      return;
    }

    this.todoStore.addTodo({
      title: trimmedTitle,
      description: description?.trim(),
      dueDate: dueDate || undefined,
    });
    this.form.reset({ title: '', description: '', dueDate: '' });
    this.saved.emit();
  }

  cancel(): void {
    this.form.reset({ title: '', description: '', dueDate: '' });
    this.editingTodo.set(null);
    this.cancelEdit.emit();
  }

  showError(controlName: 'title'): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

}
