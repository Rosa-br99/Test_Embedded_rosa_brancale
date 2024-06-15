const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', () => {
  const circles = document.querySelectorAll('.circle');

  circles.forEach((circle, index) => {
    circle.addEventListener('click', () => {
      const currentState = circle.classList.contains('green') ? '1' : '0'; // Stato corrente
      const newState = currentState === '1' ? '0' : '1'; // Nuovo stato
      circle.classList.toggle('green', newState === '1');
      circle.classList.toggle('red', newState === '0');
      const command = `LED${index + 1}${newState}`;
      console.log(`Circle ${index + 1} clicked, sending command: ${command}`);
      ipcRenderer.send('send-command', command);
    });
  });

  ipcRenderer.on('command-response', (event, { command, response }) => {
    console.log(`Received response: ${response} for command: ${command}`);
    const index = parseInt(command[3], 10) - 1;
    const state = command[4];
    const circle = circles[index];
    
    if (response.includes('+OK')) {
      circle.classList.toggle('green', state === '1');
      circle.classList.toggle('red', state === '0');
    }
  });
});