import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Output, inject } from '@angular/core';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { take } from 'rxjs';
import { ConfirmToastService } from '../../core/confirm-toast.service';
import { TodoStore } from '../../core/todo-store';
import { Todo } from '../../models/todo.model';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './todo-list.html',
  styleUrl: './todo-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ 
            opacity: 0, 
            transform: 'translateY(-30px) scale(0.9)',
            height: '0px',
            overflow: 'hidden',
            marginBottom: '0px',
            borderColor: 'transparent'
          }),
          stagger(150, [
            animate('500ms cubic-bezier(0.16, 1, 0.3, 1)', 
              style({ 
                opacity: 1, 
                transform: 'translateY(0) scale(1)',
                height: '*',
                marginBottom: '*',
                borderColor: '*'
              })
            )
          ])
        ], { optional: true }),
        query(':leave', [
          animate('400ms cubic-bezier(0.33, 1, 0.68, 1)', 
            style({ 
              opacity: 0, 
              transform: 'translateX(-50px) scale(0.9)',
              height: '0px',
              marginBottom: '0px'
            })
          )
        ], { optional: true })
      ])
    ]),
    trigger('itemHighlight', [
      transition(':enter', [
        style({ backgroundColor: 'rgba(59, 130, 246, 0.1)' }),
        animate('2000ms ease-out', style({ backgroundColor: '*' }))
      ])
    ])
  ]
})
export class TodoList {
  private readonly todoStore = inject(TodoStore);
  private readonly confirmToast = inject(ConfirmToastService);

  readonly todos$ = this.todoStore.filteredTodos$;
  readonly stats$ = this.todoStore.stats$;

  @Output() edit = new EventEmitter<Todo>();

  trackById(_: number, todo: Todo): string {
    return todo.id;
  }

  toggle(todo: Todo): void {
    this.todoStore.toggleTodo(todo.id);
  }

  remove(todo: Todo): void {
    this.confirmToast
      .confirmDeletion(todo.title)
      .pipe(take(1))
      .subscribe((confirmed) => {
        if (confirmed) {
          this.todoStore.removeTodo(todo.id);
        }
      });
  }

  requestEdit(todo: Todo): void {
    this.edit.emit(todo);
  }

  clearCompleted(): void {
    this.todoStore.clearCompleted();
  }

}
