let device;
let server;
let service;
let characteristic;

const connectBtn = document.getElementById('connectBtn');
const voiceBtn = document.getElementById('voiceBtn');
const statusText = document.getElementById('status');
const commandText = document.getElementById('command');

connectBtn.addEventListener('click', connectToDevice);
voiceBtn.addEventListener('click', startVoiceRecognition);

async function connectToDevice() {
  try {
    device = await navigator.bluetooth.requestDevice({
      filters: [{ name: 'ESP32_Servo' }],
      optionalServices: ['0000ffe0-0000-1000-8000-00805f9b34fb']
    });
    server = await device.gatt.connect();
    service = await server.getPrimaryService('0000ffe0-0000-1000-8000-00805f9b34fb');
    characteristic = await service.getCharacteristic('0000ffe1-0000-1000-8000-00805f9b34fb');

    statusText.textContent = 'Status: Connected';
  } catch (error) {
    console.log(error);
    statusText.textContent = 'Status: Error connecting';
  }
}

function startVoiceRecognition() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-US';
  recognition.start();

  recognition.onresult = (event) => {
    const command = event.results[0][0].transcript;
    commandText.textContent = `Command: ${command}`;
    sendCommandToESP32(command);
  };

  recognition.onerror = (event) => {
    console.log(event.error);
  };
}

function sendCommandToESP32(command) {
  if (characteristic) {
    let value;
    if (command.toLowerCase().includes('left')) {
      value = 'LEFT';
    } else if (command.toLowerCase().includes('right')) {
      value = 'RIGHT';
    } else if (command.toLowerCase().includes('center')) {
      value = 'CENTER';
    } else {
      value = 'UNKNOWN';
    }
    const encoder = new TextEncoder();
    characteristic.writeValue(encoder.encode(value));
  }
}
