export class LeadForm {
  constructor(private onSubmit: (data: { name: string; email: string; phone?: string }) => void) {}

  render(): HTMLElement {
    const form = document.createElement('div');
    form.className = 'lead-form';
    form.innerHTML = `
      <div class="lead-form-title">Leave your details and we'll get back to you</div>
      <form class="lead-form-fields">
        <input type="text" name="name" placeholder="Your name" required class="form-input" />
        <input type="email" name="email" placeholder="Your email" required class="form-input" />
        <input type="tel" name="phone" placeholder="Phone (optional)" class="form-input" />
        <button type="submit" class="form-submit">Submit</button>
      </form>
    `;
    const formEl = form.querySelector('form') as HTMLFormElement;
    formEl.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(formEl);
      this.onSubmit({ name: fd.get('name') as string, email: fd.get('email') as string, phone: (fd.get('phone') as string) || undefined });
      form.innerHTML = '<div class="lead-form-title">Thank you! We\'ll be in touch.</div>';
    });
    return form;
  }
}
