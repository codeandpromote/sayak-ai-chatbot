export class AppointmentPicker {
  constructor(
    private chatbotId: string,
    private onBook: (data: { visitorName: string; visitorEmail: string; startTime: string }) => void,
  ) {}

  render(): HTMLElement {
    const picker = document.createElement('div');
    picker.className = 'appointment-picker';
    picker.innerHTML = `
      <div class="appointment-title">Book an Appointment</div>
      <form class="appointment-form">
        <input type="text" name="visitorName" placeholder="Your name" required class="form-input" />
        <input type="email" name="visitorEmail" placeholder="Your email" required class="form-input" />
        <input type="date" name="date" required class="form-input" min="${new Date().toISOString().split('T')[0]}" />
        <select name="time" required class="form-input">
          <option value="">Select a time</option>
          <option value="09:00">9:00 AM</option><option value="09:30">9:30 AM</option>
          <option value="10:00">10:00 AM</option><option value="10:30">10:30 AM</option>
          <option value="11:00">11:00 AM</option><option value="11:30">11:30 AM</option>
          <option value="12:00">12:00 PM</option><option value="13:00">1:00 PM</option>
          <option value="13:30">1:30 PM</option><option value="14:00">2:00 PM</option>
          <option value="14:30">2:30 PM</option><option value="15:00">3:00 PM</option>
          <option value="15:30">3:30 PM</option><option value="16:00">4:00 PM</option>
          <option value="16:30">4:30 PM</option>
        </select>
        <button type="submit" class="form-submit">Book Appointment</button>
      </form>
    `;
    const formEl = picker.querySelector('form') as HTMLFormElement;
    formEl.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(formEl);
      this.onBook({
        visitorName: fd.get('visitorName') as string,
        visitorEmail: fd.get('visitorEmail') as string,
        startTime: new Date(`${fd.get('date')}T${fd.get('time')}:00`).toISOString(),
      });
      picker.innerHTML = '<div class="appointment-title">Appointment booked!</div>';
    });
    return picker;
  }
}
