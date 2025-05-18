import { Component, OnInit } from '@angular/core';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';
import { FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-task-list',
  imports: [CommonModule, MatIconModule, RouterModule, MatCardModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatButtonModule],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss'
})
export class TaskListComponent {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  uniqueUsers: { id: number; name: string }[] = [];

  statusFilter = new FormControl('');
  userFilter = new FormControl('');

  constructor(private taskService: TaskService) { }

  ngOnInit(): void {
    this.loadTasks();

    this.statusFilter.valueChanges.subscribe(() => this.applyFilters());
    this.userFilter.valueChanges.subscribe(() => this.applyFilters());
  }

  loadTasks(): void {
    this.taskService.getTasks().subscribe((tasks) => {
      this.tasks = tasks;
      console.log("task: " + JSON.stringify(tasks))
      this.filteredTasks = tasks;

      const seenUserIds = new Set<number>();
      this.uniqueUsers = [];

      tasks.forEach((task) => {
        if (task.User && !seenUserIds.has(task.user_id)) {
          this.uniqueUsers.push({ id: task.user_id, name: task.User.name });
          seenUserIds.add(task.user_id);
        }
      });
    });
  }

  applyFilters(): void {
    this.filteredTasks = this.tasks.filter(task => {
      const statusMatch = !this.statusFilter.value || task.status === this.statusFilter.value;
      const selectedUserId = Number(this.userFilter.value);
      const userMatch = !this.userFilter.value || task.user_id === selectedUserId;
      return statusMatch && userMatch;
    });
  }

  deleteTask(id: number): void {
    if (confirm('¿Estás seguro de eliminar esta tarea?')) {
      this.taskService.deleteTask(id).subscribe(() => {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.applyFilters();
      });
    }
  }
}
