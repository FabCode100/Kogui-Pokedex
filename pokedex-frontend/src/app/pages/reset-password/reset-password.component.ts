import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

// dentro do método enviar()

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent {
  form: FormGroup;
  sucesso: string = '';
  erro: string = '';
  carregando: boolean = false;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  enviar() {
    if (this.form.invalid) {
      this.erro = 'Por favor, informe um email válido.';
      return;
    }

    this.carregando = true;
    this.erro = '';
    this.sucesso = '';

    this.http.post(`${environment.apiBase}/reset-password/`, this.form.value).subscribe({
      next: (res: any) => {
        this.sucesso = res?.mensagem || 'Email de reset enviado com sucesso!';
        this.carregando = false;
      },
      error: (err) => {
        this.erro = err.error?.detail || 'Ocorreu um erro ao enviar o email.';
        this.carregando = false;
      }
    });
  }
}
