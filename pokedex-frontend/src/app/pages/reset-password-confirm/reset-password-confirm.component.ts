import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControlOptions } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-reset-password-confirm',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password-confirm.component.html',
  styleUrls: ['./reset-password-confirm.component.scss']
})
export class ResetPasswordConfirmComponent {
  form: FormGroup;
  sucesso: string = '';
  erro: string = '';
  carregando: boolean = false;
  uidb64: string = '';
  token: string = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute
  ) {
    // Criar o FormGroup com validadores
    const controls = {
      new_password: ['', [Validators.required, Validators.minLength(8)]],
      confirm_password: ['', [Validators.required, Validators.minLength(8)]]
    };

    const options: AbstractControlOptions = {
      validators: this.senhasDiferentes
    };

    this.form = this.fb.group(controls, options);
    this.route.params.subscribe(params => {
      this.uidb64 = params['uidb64'];
      this.token = params['token'];
    });

  }

  senhasDiferentes(group: any) {
    const senha = group.get('new_password')?.value;
    const confirm = group.get('confirm_password')?.value;
    return senha !== confirm ? { senhasDiferentes: true } : null;
  }

  enviar() {
    if (this.form.invalid) {
      this.erro = 'Por favor, preencha corretamente os campos.';
      return;
    }

    this.carregando = true;
    this.erro = '';
    this.sucesso = '';

    const payload = {
      uidb64: this.uidb64,
      token: this.token,
      new_password: this.form.value.new_password
    };

    this.http.post(`${environment.apiBase}/reset-password-confirm/`, payload).subscribe({
      next: (res: any) => {
        this.sucesso = res?.mensagem || 'Senha alterada com sucesso!';
        this.carregando = false;
      },
      error: (err) => {
        this.erro = err.error?.detail || 'Ocorreu um erro ao redefinir a senha.';
        this.carregando = false;
      }
    });
  }
}
