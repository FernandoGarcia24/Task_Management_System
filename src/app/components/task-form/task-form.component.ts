import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { Task } from '../../models/task.model';
import { User } from '../../models/user.model';
import { ActivatedRoute, Router } from '@angular/router';

import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-task-form',
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatButtonModule],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.scss'
})
export class TaskFormComponent {

  form!: FormGroup;
  users: User[] = [];
  taskId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.buildForm();
    this.loadUsers();

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.taskId = +id;
        this.loadTask(this.taskId);
      }
    });

  }

  buildForm(): void {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      status: ['pendiente', Validators.required],
      due_date: ['', [Validators.required, this.futureDateValidator]],
      user_id: ['', Validators.required]
    });
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe(users => {
      console.log("users: " + JSON.stringify(users))
      this.users = users;
    });
  }

  futureDateValidator(control: AbstractControl): ValidationErrors | null {
    const inputDate = new Date(control.value);
    const today = new Date();
    // Quitar horas para comparación solo de fecha
    today.setHours(0, 0, 0, 0);
    return inputDate > today ? null : { pastDate: true };
  }

  loadTask(id: number): void {
    this.taskService.getTaskById(id).subscribe(task => {
      this.form.patchValue({
        title: task.title,
        description: task.description,
        status: task.status,
        due_date: task.due_date,
        user_id: task.user_id
      });
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      const task: Task = this.form.value;
      console.log("tas Edit: " + JSON.stringify(task))

      if (this.taskId) {
        this.taskService.updateTask(this.taskId, task).subscribe(() => {
          alert('Tarea actualizada con éxito');
          this.router.navigate(['/tasks']);
        });
      } else {
        this.taskService.createTask(task).subscribe(() => {
          alert('Tarea creada con éxito');
          this.form.reset();
          this.router.navigate(['/tasks']);
        });
      }

    } else {
      this.form.markAllAsTouched();
    }
  }
}
